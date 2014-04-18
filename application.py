import os
from flask import Flask
from flask import render_template, session, abort, redirect, request, url_for, jsonify
from flask.ext import login
from flask.ext.login import login_user, logout_user, current_user
from flask.ext.login import login_required
from datetime import datetime
from user import User
import json
import time
import random, string
import rethinkdb as r

application = Flask(__name__, static_folder='static')
application.config['SECRET_KEY'] = 'secretmonkey123'
TABLE_NAME_POSTS = 'posts'
TABLE_NAME_USERS = 'users'
TABLE_NAME_USERS_SETTINGS = 'users_settings'
WHITELIST_COLORS = ['#db2727', '#80db27', '#2773db', '#f5f5f5', '#141414', '#ffffff']

#conn = r.connect(host='ec2-54-194-20-136.eu-west-1.compute.amazonaws.com', 
#	port=28015,
#	auth_key='SteveJobs007Amazon',
#	db='posties')

conn = r.connect(host='localhost',
	port=28015,
	auth_key='',
	db='posties')

application.config['SECRET_KEY'] = '123456790'

login_manager = login.LoginManager()
login_manager.init_app(application)
#login_manager.login_view = '/api/login'

@login_manager.user_loader
def load_user(id):
	user = r.table(TABLE_NAME_USERS).get(id).run(conn)
	return User(user['id'], user['email'], user['username'])

###############
#  WEB VIEWS  #
###############
@application.route('/', methods=['GET'])
def index():
	return render_template('index.html')

@application.route('/by/<username>', methods=['GET'])
def get_posts_by_username(username = None):
	users_result = r.table(TABLE_NAME_USERS).filter(
		(r.row['username'] == username)).run(conn)

	user = None

	for user_obj in users_result:
		user = user_obj

	if not user:
		abort(404)

	posts = list(
		r.table(TABLE_NAME_POSTS).filter(
		(r.row['username'] == username))
		.order_by(r.desc('created'))
		.run(conn))

	settings = list(
		r.table(TABLE_NAME_USERS_SETTINGS).filter(
		(r.row['username'] == username))
		.run(conn))

	user['settings'] = settings[0]

	if current_user.is_authenticated():
		user_owns_page = username == current_user.username
	else:
		user_owns_page = False

	return render_template('postsByUser.html', posts = posts, user_owns_page = user_owns_page, user = user)

@application.route('/logout', methods=['GET'])
def logout():
	logout_user()
	return redirect(url_for('index'))

###############
#  API CALLS  #
###############
@application.route('/api/login', methods=['POST'])
def api_login():
	email = request.form['email']
	password = request.form['password']

	user = list(r.table(TABLE_NAME_USERS).filter(
		(r.row['email'] == email) &
		(r.row['password'] == password)).run(conn))

	if not user:
		return render_template('errorInvalidLogin.html')

	user = User(user[0]['id'], user[0]['email'], user[0]['username'])
	login_user(user)

	return redirect(url_for('get_posts_by_username', username = user.username))

@application.route('/api/users', methods=['POST'])
def api_create_user():
	jsonData = request.json
	email = jsonData['email'].lower()
	username = jsonData['username'].lower()
	password = jsonData['password']
	postText = jsonData['postText']

	result = r.table(TABLE_NAME_USERS).insert({ 
		'email' : email,
		'username' : username,
		'password' : password, 
		'created' : r.now()}).run(conn)

	#For assertion, lookup user based on generated ID
	generated_id = result['generated_keys'][0]
	user = r.table(TABLE_NAME_USERS).get(generated_id).run(conn)

	#User was created, create initial post content and settings
	if user:
		user = User(user['id'], user['email'], user['username'])
		login_user(user)

		result = r.table(TABLE_NAME_POSTS).insert({ 
			'content' : postText, 
			'username' : username,
			'created' : r.now()}).run(conn)

		result = r.table(TABLE_NAME_USERS_SETTINGS).insert({
			'username' : username,
			'typeface' : False,
			'posttextcolor' : '#181818',
			'postbackgroundcolor' : '#ffffff',
			'pagebackgroundcolor' : '#f5f5f5', 
			'pagehaspostshadows' : True,
			'created' : r.now()}).run(conn)

		jsonData['id'] = generated_id
		return jsonify(jsonData)
	else:
		abort(401)

@application.route('/api/postText', methods=['POST'])
@login_required
def api_post_text():
	jsonData = request.json
	content = jsonData['content']
	jsonData['username'] = current_user.username

	result = r.table(TABLE_NAME_POSTS).insert({ 
		'content' : content, 
		'username' : current_user.username,
		'created' : r.now()}).run(conn)

	jsonData['id'] = result['generated_keys'][0]

	return jsonify(jsonData)

@application.route('/api/settings', methods=['PUT'])
@login_required
def api_update_settings():
	jsonData = request.json
	post_text_color = jsonData['postTextColor']
	post_background_color = jsonData['postBackgroundColor']
	page_background_color = jsonData['pageBackgroundColor']
	typeface = jsonData['typeface']

	if post_text_color in WHITELIST_COLORS and post_background_color in WHITELIST_COLORS and page_background_color in WHITELIST_COLORS:

		result = r.table(TABLE_NAME_USERS_SETTINGS).filter(
			r.row['username'] == current_user.username).update({
				'typeface' : typeface,
				'posttextcolor' : post_text_color,
				'postbackgroundcolor' : post_background_color,
				'pagebackgroundcolor' : page_background_color,
				'created' : r.now()}).run(conn)

		return jsonify(result)
	else:
		abort(401)

@application.route('/api/settings', methods=['GET'])
@login_required
def api_get_settings():
	settings = list(
		r.table(TABLE_NAME_USERS_SETTINGS).filter(
		(r.row['username'] == current_user.username))
		.run(conn))

	return jsonify(settings[0])	

@application.route('/api/posts', methods=['DELETE'])
@login_required
def api_delete():
	jsonData = request.json
	id = jsonData['id']

	post_to_delete = r.table(TABLE_NAME_POSTS).get(id).run(conn);

	if post_to_delete['username'] == current_user.username:
		post_to_delete = r.table(TABLE_NAME_POSTS).get(id).delete().run(conn)
		return json.dumps(post_to_delete)
	else:
		abort(401)

#STATUS CODE HANDLERS AND ERROR PAGES
@application.route('/userNotFound', methods=['GET'])
def error_user_not_found():
	return render_template('errorUserNotFound.html')

@application.route('/errorInvalidLogin', methods=['GET'])
def error_invalid_login():
	return render_template('errorInvalidLogin.html')	

@application.errorhandler(404)
def not_found(error):
	return redirect(url_for('error_user_not_found'))

@application.errorhandler(403)
def not_found(error):
	return redirect(url_for('error_invalid_login'))

@application.errorhandler(401)
def unauthorized(error):
    response = {"error" : "permission denied"}
    return json.dumps(response)

#NON VIEW METHODS
def date_handler(obj):
	return obj.isoformat() if hasattr(obj, 'isoformat') else obj

if __name__ == '__main__':
    application.run(host = '0.0.0.0', debug = True)