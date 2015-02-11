var pg = require('pg');
var query = require('pg-query');

module.exports = function(app, settings) {
  var database = {};
  query.connectionParameters = settings.databaseUrl;

  /*
  var createUsersQuery = 'CREATE TABLE IF NOT EXISTS users(id text, email text, password text, created timestamptz)';
  query(createUsersQuery, function(error, rows, result) {
    console.log(error, rows, result);
  });
  */

  // Dump database

  database.dumpDatabase = function(callback) {
    query('select * from users', function(error, rows, result) {
      callback(error, rows);
    });
  }

  // Create user

  database.createUser = function(user, callback) {
    var data = [
      user.email,
      user.password
    ];

    query('insert into users(email, password) values($1, $2) returning *', data, function(error, rows, result) {
      callback(error, rows.email);
    });
  }

  return database;
}