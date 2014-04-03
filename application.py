import os
from flask import Flask
from flask import render_template, session, abort, redirect, request, url_for
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

	current_user = list(r.table(TABLE_NAME_USERS).filter(
		(r.row['email'] == email) &
		(r.row['password'] == password)).run(conn))

	if not current_user:
		return redirect(url_for('login'))

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

	jsonPost['id'] = result['generated_keys'][0]

	return json.dumps(jsonPost)

@application.route('/api/createContentText', methods=['GET', 'POST'])
def api_create_content_text():
	jsonPost = request.json
	contentText = jsonPost['contentText']

	result = r.table(TABLE_NAME_POSTS).insert({ 
		'contentText' : contentText, 
		'created' : r.now()}).run(conn)

	jsonPost['id'] = result['generated_keys'][0]

	return json.dumps(jsonPost)

#STATUS CODE HANDLERS
@application.errorhandler(404)
def not_found(error):
    response = {"error" : "page not found"}
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