## User interface code

**Setup**
- Install [node.js](http://nodejs.org/)
- run `sudo npm install` and `bower install` in repo dir

**Develop**
- Build the `static/build` folder by running: `npm run build`
- Build when files change: `npm run watch`

## Ajax
**Create user**
```
curl -X POST -H "Content-Type: application/json" -d '{ "email" : "test@gmail.com", "username" : "johndoe", "password" : "secret" }' http://localhost:5000/api/createUser
```

**Create post**
```
curl -X POST -H "Content-Type: application/json" -d '{ "contentText" : "hello" }' http://localhost:5000/api/createPost
```

**Get user**
```
curl -X GET -H "Content-Type: application/json" -d '{ "username" : "nima" }' http://localhost:5000/api/users
```

**get signed S3 URL**
```
curl -X GET -H "Content-Type: application/json" -d '{ "filename" : "test.png", "mimetype" : "image/png" }' http://localhost:5000/api/sign_upload_url
```
## Database
**Rethink Database Setup**
```
r.dbCreate('posties');
r.db('posties').tableCreate('users');
r.db('posties').tableCreate('posts');
r.db('posties').tableCreate('users_settings');
r.db('posties').table('posts').indexCreate('sortrank');
```

**Rethink Database Clean**
```
r.db('posties').table('users').delete();
r.db('posties').table('posts').delete();
r.db('posties').table('users_settings').delete();
```

## Setting up EB / AWS Tools on your computer
- Download AWSDevTools from Amazon
- CD to your posties repo in the command line
- Run the command `sudo [PATH_TO_ELASTIC_BEANSTALK]/elasticbeanstalk-cli/AWSDevTools/[Linux or Windows]/AWSDevTools-RepositorySetup.sh`
- If there's an error in the above step, make sure you create a ~/.bash_profile` and add the following two lines:
  - `export LC_ALL=en_US.UTF-8`
  - `export LANG=en_US.UTF-8`
- Then run the command `git aws.config`
- Enter AWS Access Key, AWS Secret Key, AWS Region, and enter the existing name of your AWS Application and AWS Environment.
- Now you can git add, git commit as usual, and use git aws.push to push to your EB environment
- Now get the correct pem files from Nima
- Copy the pem files to the folder `~/.ssh/` (create the folder if it doesn't exist)

## S3 Policy FOR IAM USER POSTIES
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::posties-images"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": ["arn:aws:s3:::posties-images/*"]
    }
  ]
}
```

## CORS Configuration
```
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
```
