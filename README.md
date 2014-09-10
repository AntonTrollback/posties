== Ajax create user ==
curl -X POST -H "Content-Type: application/json" -d '{ "email" : "test@gmail.com", "username" : "johndoe", "password" : "secret" }' http://localhost:5000/api/createUser

== Ajax create post ==
curl -X POST -H "Content-Type: application/json" -d '{ "contentText" : "hello" }' http://localhost:5000/api/createPost

== Ajax get user ==
curl -X GET -H "Content-Type: application/json" -d '{ "username" : "nima" }' http://localhost:5000/api/users

== Ajax get signed S3 URL ==
curl -X GET -H "Content-Type: application/json" -d '{ "filename" : "test.png", "mimetype" : "image/png" }' http://localhost:5000/api/sign_upload_url

== Rethink Database Setup ==
r.dbCreate('posties');
r.db('posties').tableCreate('users');
r.db('posties').tableCreate('posts');
r.db('posties').tableCreate('users_settings');
r.db('posties').table('posts').indexCreate('sortrank');

== Rethink Database Clean == 
r.db('posties').table('users').delete();
r.db('posties').table('posts').delete();
r.db('posties').table('users_settings').delete();


== S3 Policy FOR IAM USER POSTIES ==
{
	"Version": "2012-10-17",
	"Id": "S3-Account-Permissions",
	"Statement": [
		{
			"Sid": "1",
			"Effect": "Allow",
			"Principal": {
				"AWS": [
					"arn:aws:iam::134930756575:user/posties"
				]
			},
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::posties-images",
				"arn:aws:s3:::posties-images/*"
			]
		}
	]
}

== CORS Configuration ==
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>