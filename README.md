== Ajax create user ==
curl -X POST -H "Content-Type: application/json" -d '{ "email" : "test@gmail.com", "username" : "johndoe", "password" : "secret" }' http://localhost:5000/api/createUser

== Ajax create post ==
curl -X POST -H "Content-Type: application/json" -d '{ "contentText" : "hello" }' http://localhost:5000/api/createPost
