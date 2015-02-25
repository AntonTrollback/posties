var pg = require('pg');
var query = require('pg-query');
query.connectionParameters = settings.databaseUrl;

module.exports = function(app, settings) {
  var database = {};
  query.connectionParameters = settings.databaseUrl;

  // Setup tables
  query('CREATE TABLE IF NOT EXISTS users(id serial primary key, email text, password text, created timestamptz)');

  // Dump database

  database.dumpDatabase = function(callback) {
    query('SELECT * FROM users', function(error, rows, result) {
      callback(error, rows);
    });
  }

  // Create user

  database.createUser = function(user, callback) {
    var data = [
      user.email,
      user.password,
      new Date()
    ];

    var sql = 'INSET INTO users(email, password, created) values($1, $2, $3) RETURNING *';
    query(sql, data, function(error, rows, result) {
      callback(error, rows.email);
    });
  }

  // Get user by email

  database.getUserByEmail = function(email, callback) {
    query.first('SELECT * FROM "users" WHERE email = $1', email, callback);
  }

  return database;
}