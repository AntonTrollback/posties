import os
from flask import Flask
from flask import render_template, session, abort, redirect, request, url_for
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

conn = r.connect(host='localhost', 
	port=28015,
	auth_key='',
	db='posties')

application.config['SECRET_KEY'] = '123456790'

login_manager = login.LoginManager()
login_manager.init_app(application)
login_manager.login_view = '/login'

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

@application.route('/login', methods=['GET','POST'])
def login():
	if request.method == 'GET':
		return render_template('login.html')
	
	email = request.form['email']
	password = request.form['password']

	user = list(r.table(TABLE_NAME_USERS).filter(
		(r.row['email'] == email) &
		(r.row['password'] == password)).run(conn))

	if not user:
		return redirect(url_for('login'))

	user = User(user[0]['id'], user[0]['email'], user[0]['username'])
	login_user(user)

	return redirect(url_for('index'))

@application.route('/by/<username>', methods=['GET'])
def get_posts_by_username(username = None):
	posts = list(
		r.table(TABLE_NAME_POSTS).filter(
		(r.row['username'] == username))
	.run(conn))

	return render_template('postsByUser.html', posts = posts)

@application.route('/userNotFound', methods=['GET'])
def user_not_found():
	return render_template('errorUserNotFound.html')

@application.route('/logout', methods=['GET'])
def logout():
	logout_user()
	return redirect(url_for('index'))

###############
#  API CALLS  #
###############
@application.route('/api/createUser', methods=['GET', 'POST'])
def api_create_user():
	jsonPost = request.json
	email = jsonPost['email']
	username = jsonPost['username']
	password = jsonPost['password']

	result = r.table(TABLE_NAME_USERS).insert({ 
		'email' : email,
		'username' : username,
		'password' : password, 
		'created' : r.now()}).run(conn)

	#For assertion, lookup user based on generated ID
	generated_id = result['generated_keys'][0]
	user = r.table(TABLE_NAME_USERS).get(generated_id).run(conn)

	if user:
		user = User(user['id'], user['email'], user['username'])
		login_user(user)
		return json.dumps(user)
	else:
		abort(401)

@application.route('/api/createPostText', methods=['GET', 'POST'])
@login_required
def api_create_post_text():
	jsonPost = request.json
	content = jsonPost['content']
	username = current_user.username

	result = r.table(TABLE_NAME_POSTS).insert({ 
		'content' : content, 
		'username' : username,
		'created' : r.now()}).run(conn)

	jsonPost['id'] = result['generated_keys'][0]

	return json.dumps(jsonPost)

#STATUS CODE HANDLERS
@application.errorhandler(404)
def not_found(error):
	return redirect(url_for('user_not_found'))

@application.errorhandler(401)
def resource_exists(error):
    response = {"error" : "you need to log in to post"}
    return json.dumps(response)

@application.errorhandler(400)
def resource_exists(error):
    response = {"error" : "resource doesn't exist"}
    return json.dumps(response)

#NON VIEW METHODS
def date_handler(obj):
	return obj.isoformat() if hasattr(obj, 'isoformat') else obj

if __name__ == '__main__':
    application.run(host = '0.0.0.0', debug = True)