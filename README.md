## Setup
- Setup the python app (todo: add steps)
- Setup the EB/AWS Tools (see below)
- Install [node.js](http://nodejs.org/)
- In repo dir, run `npm run setup`

## Develop
- Build front-end files: `npm run build`
- Rebuild when files change: `npm run watch`

## Deploy
- Run `npm run deploy`

### How the deploy script works
The `npm run deploy` command triggers a chain of CLI commands. In short:
 1. Build the font end folder
 2. Minify and uglify CSS and Javascript
 3. Upload the build folder to Amazon S3
 4. Set the environment varable in `config.json` to `prod`
 5. Add revision number to `config.json`
 6. Git commit the `config.json` changes
 7. Push to AWS
 8. Remove the git commit that just got created
 9. Revert `config.json` (remove revision number and set the environment varable to `dev`)

## Setting up EB/AWS Tools on your computer
- Download AWSDevTools from Amazon
- CD to your posties repo in the command line
- Run the command `sudo [PATH_TO_ELASTIC_BEANSTALK]/elasticbeanstalk-cli/AWSDevTools/[Linux or Windows]/AWSDevTools-RepositorySetup.sh`
- If there's an error in the above step, make sure you create a ~/.bash_profile` and add the following two lines:
  - `export LC_ALL=en_US.UTF-8`
  - `export LANG=en_US.UTF-8`
- Then run the command `git aws.config`
- Enter AWS Access Key, AWS Secret Key, AWS Region, and enter the existing name of your AWS Application and AWS Environment.
- Now you can `git add`, `git commit` as usual, and use `git aws.push` to push to your EB environment
- Now get the correct pem files from Nima
- Copy the pem files to the folder `~/.ssh/` (create the folder if it doesn't exist)

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
