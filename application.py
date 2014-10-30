import os
import base64
import time, json, string, random, os, base64, hmac, urllib
import rethinkdb as r

from flask import Flask
from flask import Response, render_template, session, abort, redirect, request, url_for, jsonify, make_response
from flask.ext import login
from flask.ext.login import login_user, logout_user, current_user, login_required
from werkzeug.utils import secure_filename
from hashlib import sha1
from user import User

# Get environment status and revision numbers
CONFIG = json.load(open('config.json'))
ENV = CONFIG["environment"]
DB_CONFIG = CONFIG["database"][ENV]
PRODUCTION = True if ENV == 'prod' else False
REVISION = CONFIG["revision"]
print('Running in ' + ENV + ' mode.')

TABLE_POSTS = 'posts'
TABLE_USERS = 'users'
TABLE_USERS_SETTINGS = 'users_settings'
WHITELIST_TYPEFACES = ['Akkurat', 'Inconsolata', 'EB Garamond', 'Josefin Sans', 'Rokkitt', 'Reenie Beanie', 'Open Sans', 'Fredoka One', 'Libre Baskerville', 'Geo', 'VT323', 'Text Me One', 'Nova Cut', 'Cherry Swash', 'Italiana', 'Abril Fatface']
AWS_ACCESS_KEY = CONFIG["aws"]["access_key"].encode('utf-8')
AWS_SECRET_KEY = CONFIG["aws"]["secret_key"].encode('utf-8')
AWS_S3_BUCKET = CONFIG["s3"]["bucket"]

# Setup Rethinkdb and Flask
conn = r.connect(host=DB_CONFIG["host"].encode('utf-8'), port=DB_CONFIG["port"].encode('utf-8'), auth_key=DB_CONFIG["key"].encode('utf-8'), db=DB_CONFIG["db"].encode('utf-8'))
application = Flask(__name__, static_folder='static/build')
application.config['SECRET_KEY'] = CONFIG["flask"]["key"].encode('utf-8')
application.config['in_production'] = PRODUCTION

# Setup Flask login manager
login_manager = login.LoginManager()
login_manager.init_app(application)

@login_manager.user_loader
def load_user(id):
	user = r.table(TABLE_USERS).get(id).run(conn)
	if user:
		return User(user['id'], user['email'], user['username'])
	else:
		logout_user()


# Web views
################################################################################

@application.route('/', methods=['GET'])
def index():
	if current_user and current_user.is_authenticated():
		# Redirect to user page if logged in
		return redirect("/by/" + current_user.username, code=302)
	else:
		return render_template(
			'layout.html',
			is_start_page = True,
			angular_controller = "PageIndexCtrl",
			fonts = WHITELIST_TYPEFACES
		)


@application.route('/by/<username>', methods=['GET'])
def get_posts_by_username(username = None):
	user_owns_page = False

	if current_user and current_user.is_authenticated():
		user_owns_page = username == current_user.username

	return render_template('layout.html',
			user_owns_page = user_owns_page,
			username = username,
			angular_controller = "PagePostsByUserCtrl",
			fonts = WHITELIST_TYPEFACES
		)

	abort(404)


@application.route('/login', methods=['POST'])
def login():
	jsonData = request.json
	username = jsonData['username'].lower()
	password = jsonData['password']

	users = list(r.table(TABLE_USERS).filter({'username' : username,  'password' : password }).run(conn))

	if not len(users):
		return jsonify({})
	else:
		user = users[0]
		login_user(User(user['id'], user['email'], user['username']))
		return jsonify(user)

# Logout
@application.route('/logout', methods=['GET'])
def logout():
	logout_user()
	return redirect(url_for('index'))


#	API calls
################################################################################

@application.route('/api/users', methods=['GET'])
def api_get_user():
	username = request.args.get('username')

	users = list(r.table(TABLE_USERS).filter({ 'username' : username }).
		eq_join('username', r.table(TABLE_USERS_SETTINGS), index='username').merge(
		lambda user: {
			'posts': r.table(TABLE_POSTS).get_all(username, index='username').order_by(r.asc('sortrank')).coerce_to('array')
		}).run(conn))

	if not len(users):
		return jsonify({})
	else:
		user = users[0]

	user['settings'] = user.pop('right')
	user['user'] = user.pop('left')
	user['user']['is_authenticated'] = current_user.is_authenticated()
	user.pop('password', None)

	return jsonify(user)


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

	# For assertion, lookup user based on generated ID
	generated_id = result['generated_keys'][0]
	user = r.table(TABLE_USERS).get(generated_id).run(conn)

	# User was created, create initial post content and settings
	if user:
		user = User(user['id'], user['email'], user['username'])
		login_user(user)

		# We store the returned data for assurance, and for using the generated filenames
		result = {}
		result['posts'] = []
		result['settings'] = {}

		# Create all posts
		for post in posts:
			# Create all posts that are paragraphs or headlines
			if post['type'] == 0 or post['type'] == 1:
				post = r.table(TABLE_POSTS).insert({
					'content' : post['content'],
					'username' : username,
					'sortrank' : post['sortrank'],
					'type' : post['type'],
					'created' : r.now()}).run(conn, return_changes = True)

				result['posts'].append(post['changes'][0]['new_val'])

			# Create all posts that are images or video
			else:
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


@application.route('/api/postImage', methods=['POST'])
@login_required
def api_post_image():
	jsonData = request.json

	post = r.table(TABLE_POSTS).insert({
		'username' : current_user.username,
		'sortrank' : jsonData['sortrank'],
		'type' : int(jsonData['type']),
		'key' : jsonData['key'],
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
			{'username' : current_user.username }).update({
				'typefaceparagraph' : typeface_paragraph,
				'typefaceheadline' : typeface_headline,
				'posttextcolor' : post_text_color,
				'showboxes' : show_boxes,
				'postbackgroundcolor' : post_background_color,
				'pagebackgroundcolor' : page_background_color,
				'created' : r.now()}).run(conn, return_changes = True)

		result = result['changes'][0]['new_val']

		return jsonify(result)
	else:
		abort(401)


@application.route('/api/settings', methods=['GET'])
@login_required
def api_get_settings():
	settings = list(r.table(TABLE_USERS_SETTINGS).filter({ 'username' : current_user.username}).run(conn))

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


@application.route('/api/sign_upload_url', methods=['GET'])
def sign_s3():
	# Collect information on the file from the GET parameters of the request:
	object_name = urllib.quote_plus(request.args.get('s3_object_name'))
	mime_type = request.args.get('s3_object_type')

	# Set the expiry time of the signature (in seconds) and declare the permissions of the file to be uploaded
	expires = int(time.time() + 100)
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

	# Return the signed request and the anticipated URL back to the browser in JSON format:
	return Response(content, mimetype='text/plain; charset=x-user-defined')


# Status code handlers and error pages
################################################################################

@application.errorhandler(404)
def not_found(error):
	return redirect("/", code=302)

@application.errorhandler(401)
def unauthorized(error):
	response = {"error" : "permission denied"}
	return json.dumps(response)


# Utilities
################################################################################

def date_handler(obj):
	return obj.isoformat() if hasattr(obj, 'isoformat') else obj

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


# Start the app
if __name__ == '__main__':
	application.run(host = '0.0.0.0', port = 5000, debug = not PRODUCTION)
