import os
import base64
import time, json, string, random, os, base64, hmac, urllib
import rethinkdb as r

from flask import Flask
from flask import Response, render_template, session, abort, redirect, request, url_for, jsonify, make_response
from flask.ext import login
from flask.ext.login import login_user, logout_user, current_user, login_required
from werkzeug.utils import secure_filename
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from hashlib import sha1

from user import User

CONFIG = json.load(open('config.json'))
ENV = CONFIG["environment"]
DB_CONFIG = CONFIG["database"][ENV]
PRODUCTION = True if ENV == 'prod' else False
REVISION = CONFIG["revision"]
print('Running in ' + ENV + ' mode.')

TABLE_POSTS = 'posts'
TABLE_USERS = 'users'
TABLE_USERS_SETTINGS = 'users_settings'
WHITELIST_TYPEFACES = ['Akkurat', 'Reenie Beanie', 'Josefin Sans', 'Open Sans', 'Rokkitt', 'Fredoka One', 'Libre Baskerville', 'EB Garamond', 'Geo', 'VT323', 'Text Me One', 'Nova Cut', 'Cherry Swash', 'Italiana', 'Inconsolata', 'Abril Fatface']
AWS_ACCESS_KEY = CONFIG["aws"]["access_key"].encode('utf-8')
AWS_SECRET_KEY = CONFIG["aws"]["secret_key"].encode('utf-8')
AWS_S3_BUCKET = CONFIG["s3"]["bucket"]

conn = r.connect(host=DB_CONFIG["host"].encode('utf-8'), port=DB_CONFIG["port"].encode('utf-8'), auth_key=DB_CONFIG["key"].encode('utf-8'), db=DB_CONFIG["db"].encode('utf-8'))
application = Flask(__name__, static_folder='static/build')
application.config['SECRET_KEY'] = CONFIG["flask"]["key"].encode('utf-8')

login_manager = login.LoginManager()
login_manager.init_app(application)

@login_manager.user_loader
def load_user(id):
	user = r.table(TABLE_USERS).get(id).run(conn)
	if user:
		return User(user['id'], user['email'], user['username'])
	else:
		logout_user()

###############
#	WEB VIEWS #
###############
@application.route('/', methods=['GET'])
def index():
	if current_user and current_user.is_authenticated():
		return redirect("/by/" + current_user.username, code=302)
	else:
		return render_template(
			'index.html',
			is_start_page = True,
			fonts = WHITELIST_TYPEFACES,
			in_production = PRODUCTION
		)

@application.route('/login', methods=['GET', 'POST'])
def login():
	if request.method == 'GET':
		return render_template('login.html', in_production = PRODUCTION, fonts = False)
	elif request.method == 'POST':
		jsonData = request.json
		email = jsonData['email'].lower()
		password = jsonData['password']

		users = r.table(TABLE_USERS).filter(
			(r.row['email'] == email) &
			(r.row['password'] == password)).run(conn)

		for user in users:
			login_user(User(user['id'], user['email'], user['username']))
			return jsonify(user)

		return make_response(jsonify( { 'error': 'The e-mail address doesn\'t exist' } ), 400)

@application.route('/by/<username>', methods=['GET'])
def get_posts_by_username(username = None):
	users = r.table(TABLE_USERS).filter(
		(r.row['username'] == username)).run(conn)

	user_owns_page = False

	if current_user and current_user.is_authenticated():
		user_owns_page = username == current_user.username

	for user in users:
		return render_template(
			'postsByUser.html',
			user_owns_page = user_owns_page,
			fonts = WHITELIST_TYPEFACES,
			in_production = PRODUCTION
		)

	abort(404)

@application.route('/logout', methods=['GET'])
def logout():
	logout_user()
	return redirect(url_for('index'))

###############
#	API CALLS #
###############
@application.route('/api/users', methods=['GET'])
def api_get_user():
	username = request.args.get('username')
	users = list(r.table(TABLE_USERS).filter(
		(r.row['username'] == username)).run(conn))

	if not len(users):
		return jsonify({})
	else:
		user = users[0]

	user['is_authenticated'] = current_user.is_authenticated()

	posts = list(
		r.table(TABLE_POSTS).filter(
		(r.row['username'] == username))
		.order_by(r.asc('sortrank'))
		.run(conn))

	settings = list(
		r.table(TABLE_USERS_SETTINGS).filter(
		(r.row['username'] == username))
		.run(conn))

	settings = settings[0] if len(settings) else {}

	user['posts'] = posts
	user['settings'] = settings
	
	return jsonify(user)

@application.route('/api/users/email', methods=['GET'])
def api_get_user_by_email():
	email = request.args.get('email')
	users = list(r.table(TABLE_USERS).filter(
		(r.row['email'] == email)).run(conn))

	return jsonify({ 'user' : users[0] }) if len(users) else jsonify("")

@application.route('/api/users', methods=['POST'])
def api_create_user():
	jsonData = request.json
	email = jsonData['email'].lower()
	username = jsonData['username'].lower()
	password = jsonData['password']
	posts = jsonData['posts']
	settings = jsonData['settings']

	result = r.table(TABLE_USERS).insert({
		'email' : email,
		'username' : username,
		'password' : password,
		'created' : r.now()}).run(conn)

	#For assertion, lookup user based on generated ID
	generated_id = result['generated_keys'][0]
	user = r.table(TABLE_USERS).get(generated_id).run(conn)

	#User was created, create initial post content and settings
	if user:
		user = User(user['id'], user['email'], user['username'])
		login_user(user)

		# we store the returned data for assurance, and for using the generated filenames
		result = {}
		result['posts'] = []
		result['settings'] = {}

		# create all posts
		for post in posts:
			#create all posts that are paragraphs or headlines
			if post['type'] == 0 or post['type'] == 1:
				post = r.table(TABLE_POSTS).insert({
					'content' : post['content'],
					'username' : username,
					'sortrank' : post['sortrank'],
					'type' : post['type'],
					'created' : r.now()}).run(conn, return_changes = True)

				result['posts'].append(post['changes'][0]['new_val'])

			#create all posts that are images
			elif post['type'] == 2:
				post = r.table(TABLE_POSTS).insert({
					'username' : username,
					'sortrank' : post['sortrank'],
					'type' : post['type'],
					'key' : generate_safe_filename(username, post['file']['name']),
					'created' : r.now()}).run(conn, return_changes = True)

				result['posts'].append(post['changes'][0]['new_val'])

			#create all posts that are YouTube videos
			elif post['type'] == 3:
				post = r.table(TABLE_POSTS).insert({
					'username' : username,
					'sortrank' : post['sortrank'],
					'type' : post['type'],
					'key' : post['key'],
					'created' : r.now()}).run(conn, return_changes = True)

				result['posts'].append(post['changes'][0]['new_val'])

		settings = r.table(TABLE_USERS_SETTINGS).insert({
			'username' : username,
			'typefaceparagraph' : settings['typefaceparagraph'],
			'typefaceheadline' : settings['typefaceheadline'],
			'posttextcolor' : settings['posttextcolor'],
			'showboxes' : settings['showboxes'],
			'postbackgroundcolor' : settings['postbackgroundcolor'],
			'pagebackgroundcolor' : settings['pagebackgroundcolor'],
			'created' : r.now()}).run(conn, return_changes = True)

		result['settings'] = settings['changes'][0]['new_val']

		return jsonify(result)
	else:
		abort(401)

@application.route('/api/postText', methods=['POST', 'PUT'])
@login_required
def api_post_text():
	jsonData = request.json
	content = jsonData['content']

	if request.method == 'POST':
		result = r.table(TABLE_POSTS).insert({
			'content' : content,
			'username' : current_user.username,
			'sortrank' : jsonData['sortrank'],
			'type' : int(jsonData['type']),
			'created' : r.now()}).run(conn, return_changes = True)
	elif request.method == 'PUT':
		result = r.table(TABLE_POSTS).get(jsonData['id']).update({
			'content' : content
		}).run(conn, return_changes = True);

	return jsonify(result['changes'][0]['new_val'])

@application.route('/api/postVideo', methods=['POST', 'PUT'])
@login_required
def api_post_video():
	jsonData = request.json
	key = jsonData['key']

	if request.method == 'POST':
		result = r.table(TABLE_POSTS).insert({
			'key' : key,
			'username' : current_user.username,
			'sortrank' : jsonData['sortrank'],
			'type' : int(jsonData['type']),
			'created' : r.now()}).run(conn, return_changes = True)
	elif request.method == 'PUT':
		result = r.table(TABLE_POSTS).get(jsonData['id']).update({
			'key' : key
		}).run(conn, return_changes = True);

	return jsonify(result['changes'][0]['new_val'])

@application.route('/api/sign_upload_url', methods=['GET'])
def sign_s3():
	# Collect information on the file from the GET parameters of the request:
	object_name = urllib.quote_plus(request.args.get('s3_object_name'))
	mime_type = request.args.get('s3_object_type')

	# Set the expiry time of the signature (in seconds) and declare the permissions of the file to be uploaded
	expires = int(time.time() + 20)
	amz_headers = "x-amz-acl:public-read"

	# Generate the PUT request that JavaScript will use:
	put_request = "PUT\n\n%s\n%d\n%s\n/%s/%s" % (mime_type, expires, amz_headers, AWS_S3_BUCKET, object_name)

	# Generate the signature with which the request can be signed:
	signature = base64.encodestring(hmac.new(AWS_SECRET_KEY, put_request, sha1).digest())

	# Remove surrounding whitespace and quote special characters:
	# Escape the signature twice, other wise Amazon might throw errors
	signature = urllib.quote_plus(signature.strip())
	signature = urllib.quote_plus(signature.strip())

	# Build the URL of the file in anticipation of its imminent upload:
	url = 'https://%s.s3.amazonaws.com/%s' % (AWS_S3_BUCKET, object_name)

	content = json.dumps({
		'signed_request': '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature),
		'url': url
	})

	print content

	# Return the signed request and the anticipated URL back to the browser in JSON format:
	return Response(content, mimetype='text/plain; charset=x-user-defined')

@application.route('/api/postImage', methods=['POST'])
@login_required
def api_post_image():
	jsonData = request.json

	post = r.table(TABLE_POSTS).insert({
		'username' : current_user.username,
		'sortrank' : jsonData['sortrank'],
		'type' : int(jsonData['type']),
		'key' : jsonData['filename'],
		'created' : r.now()}).run(conn, return_changes = True)

	result = post['changes'][0]['new_val']
	result['template'] = jsonData['template']

	return jsonify(result)

@application.route('/api/postrank', methods=['POST'])
@login_required
def api_post_rank():
	jsonData = request.json

	for post in jsonData:
		r.table(TABLE_POSTS).get(post['id']).update({
			'sortrank' : post['sortrank']
		}).run(conn);

	return jsonify("")

@application.route('/api/settings', methods=['PUT'])
@login_required
def api_update_settings():
	jsonData = request.json
	post_text_color = jsonData['posttextcolor']
	show_boxes = jsonData['showboxes']
	post_background_color = jsonData['postbackgroundcolor']
	page_background_color = jsonData['pagebackgroundcolor']
	typeface_paragraph = jsonData['typefaceparagraph']
	typeface_headline = jsonData['typefaceheadline']

	if (len(post_text_color) is 7
	and len(post_background_color) is 7
	and len(page_background_color) is 7
	and typeface_paragraph in WHITELIST_TYPEFACES
	and typeface_headline in WHITELIST_TYPEFACES):
		result = r.table(TABLE_USERS_SETTINGS).filter(
			r.row['username'] == current_user.username).update({
				'typefaceparagraph' : typeface_paragraph,
				'typefaceheadline' : typeface_headline,
				'posttextcolor' : post_text_color,
				'showboxes' : show_boxes,
				'postbackgroundcolor' : post_background_color,
				'pagebackgroundcolor' : page_background_color,
				'created' : r.now()}).run(conn, return_changes = True)

		print result['changes']
		result = result['changes'][0]['new_val']

		return jsonify(result)
	else:
		abort(401)

@application.route('/api/settings', methods=['GET'])
@login_required
def api_get_settings():
	settings = list(
		r.table(TABLE_USERS_SETTINGS).filter(
		(r.row['username'] == current_user.username))
		.run(conn))

	return jsonify(settings[0])

@application.route('/api/posts', methods=['DELETE'])
@login_required
def api_delete_post():
	jsonData = request.json
	id = jsonData['id']

	post_to_delete = r.table(TABLE_POSTS).get(id).run(conn);

	if post_to_delete['username'] == current_user.username:
		post_to_delete = r.table(TABLE_POSTS).get(id).delete().run(conn)
		return json.dumps(post_to_delete)
	else:
		abort(401)

#STATUS CODE HANDLERS AND ERROR PAGES
@application.errorhandler(404)
def not_found(error):
	return render_template('errorPageNotFound.html', in_production = PRODUCTION, fonts = False)

@application.errorhandler(401)
def unauthorized(error):
	response = {"error" : "permission denied"}
	return json.dumps(response)

# UTILS
@application.context_processor
def utility_processor():
	def asset_url_for(file, extension, add_revision=True):

		if PRODUCTION:
			url = 'https://s3-eu-west-1.amazonaws.com/' + CONFIG["s3"]["bucket"] + '/assets/'
			if add_revision:
				return url + file + '.' + REVISION + '.' + extension
			else:
				return url + file + '.' + extension
		else:
			return '/build/' + file + '.' + extension
	return dict(asset_url_for=asset_url_for)

#NON VIEW METHODS
def date_handler(obj):
	return obj.isoformat() if hasattr(obj, 'isoformat') else obj

def generate_safe_filename(username, filename):
	fileExtension = '.'
	try:
		fileExtension = fileExtension + os.path.splitext(filename)[1][1:].strip()
	except Error:
		fileExtension = ''
	filename = secure_filename(filename)
	return username + ''.join(random.choice(string.digits) for i in range(6)) + fileExtension

if __name__ == '__main__':
	application.run(host = '0.0.0.0', port = 5000, debug = not PRODUCTION)
