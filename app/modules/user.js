var _ = require('lodash');
var pg = require('pg');
var app = require('./../../app');
var query = require('pg-query');
var user = {};

query.connectionParameters = app.get('databaseUrl');

user.get = function(id) {
  query.first('SELECT * FROM "users" WHERE id = $1', id, callback);
}

user.getByEmail = function(email, callback) {
  query('SELECT * FROM "users" WHERE email = $1', [email], function(error, rows, result) {
    callback(error, _.isUndefined(rows[0]) ? null : rows[0]);
  });
}

user.create = function(post, callback) {
  if (!user.isValid(post)) {
    callback(null, false, null);
    return;
  }

  user.isAvailableEmail(post.email, function(error, available) {
    if (error || !available) {
      callback(error, true, available);
      return;
    }

    var data = [
      post.email,
      post.password,
      new Date()
    ];

    var sql = 'INSERT INTO users(email, password, created) values($1, $2, $3) RETURNING *';

    query(sql, data, function(error, rows, result) {
      callback(error, true, _.isUndefined(rows[0].id) ? null : rows[0].id);
    });
  });
}

user.isValidEmail = function(email) {
  if (!_.isString(email)) { return false; }
  if (email.length < 1 || email.length > 150) { return false; }
  return true;
}

user.isValidPassword = function(password) {
  if (!_.isString(password)) { return false; }
  if (password.length < 1 || password.length > 150) { return false; }
  return true;
}

user.isValid = function(data) {
  if (user.isValidEmail(data.email) && user.isValidPassword(data.password)) {
    return true;
  }

  return false;
}

user.delete = function(id) {

}

user.authIsOwner = function(session, siteName) {

}

user.signin = function(email, password) {

}

user.signout = function(req) {
  delete req.session.user_id;
}

user.isAvailableEmail = function(email, callback) {
  return user.getByEmail(email, function(error, rows, result) {
    var available = true;

    if (rows) {
      available = false;
    }

    if (_.isFunction(callback)) {
      callback(error, available);
      console.log('callback')
      return;
    }

    console.log(available)
    return available;
  });
}

user.changePassword = function(id, oldPass, newPass) {

}

module.exports = user;