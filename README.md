**Setup the UI**
- Install [node.js](http://nodejs.org/)
- run `sudo npm install` in the repo dir

**Develop the UI**
- Build the `static/build` folder by running: `npm run build`
- Watch for changes and build automatically by running: `npm run watch`

**Notes**
== Ajax create user ==
`curl -X POST -H "Content-Type: application/json" -d '{ "email" : "test@gmail.com", "username" : "johndoe", "password" : "secret" }' http://localhost:5000/api/createUser`

== Ajax create post ==
`curl -X POST -H "Content-Type: application/json" -d '{ "contentText" : "hello" }' http://localhost:5000/api/createPost`

== Ajax get user ==
`curl -X GET -H "Content-Type: application/json" -d '{ "username" : "nima" }' http://localhost:5000/api/users`