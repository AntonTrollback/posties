import os
from flask import Flask
from flask import render_template, session, abort, redirect, request
from datetime import datetime
import json
import time
import random, string
import rethinkdb as r

application = Flask(__name__, static_folder='static')
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

###############
#  API CALLS  #
###############
@application.route('/api/createPost', methods=['GET', 'POST'])
def api_post():
	jsonPost = request.json
	print "PRINTING REQUEST"
	print request.json
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