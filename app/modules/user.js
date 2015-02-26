var _ = require('lodash');
var pg = require('pg');
var app = require('./../../app');
var query = require('pg-query');
var validator = require('validator');
var user = {};

/**
 * Get user from database
 */

query.connectionParameters = app.get('databaseUrl');

user.getById = function(id, callback) {
  query.first('SELECT * FROM "users" WHERE id = $1', id, callback);
}

user.getByEmail = function(email, callback) {
  query.first('SELECT * FROM "users" WHERE email = $1', email, callback);
}

/**
 * Validate user input
 */

user.isValidEmail = function(email) {
  return validator.isEmail(email);
}

user.isValidPassword = function(password) {
  return validator.isLength(password, 2, 150);
}

user.isValidUser = function(data) {
  return user.isValidEmail(data.email) && user.isValidPassword(data.password);
}

/**
 * Check email availability
 */

user.emailAvailability = function(email, callback) {
  user.getByEmail(email, function(error, row) {
    callback(error, !row);
  });
}

/**
 * Check if signedin
 */

user.isSignedin = function(req) {
  return _.isUndefined(req.session) ? false : req.session.user_id;
}

/**
 * Create user
 */

user.tryCreate = function(req, data, callback) {
  if (!user.isValidUser(data)) {
    // error, valid, id
    callback(null, false, null);
    return;
  }

  user.emailAvailability(data.email, function(error, available) {
    if (error || !available) {
      callback(error, false, null);
      return;
    }

    user.create(req, data, callback);
  });
}

user.create = function(req, data, callback) {
  var sql = 'INSERT INTO users(email, password, created) values($1, $2, $3) RETURNING *';
  var data = [data.email, data.password, new Date()]

  query(sql, data, function(error, rows) {
    var id = _.isUndefined(rows[0].id) ? null : rows[0].id;

    user.signin(req, id);
    callback(error, true, id);
  });
}

/**
 * Signin user
 */

user.trySignin = function(req, data, callback) {
  if (!user.isValidUser(data)) {
    callback(null, null);
    return;
  }

  if (user.isSignedin(req)) {
    user.signout(req);
  }

  user.getByEmail(data.email, function(error, row) {
    if (error || !row || (row.password !== data.password)) {
      callback(error, true, null);
      return;
    }

    user.signin(req, row.id);
    callback(null, row.id);
  });
}

user.signin = function(req, id) {
  // Create session
  req.session.user_id = id;
}

/**
 * Signout user
 */

user.signout = function(req) {
  delete req.session.user_id;
}

module.exports = user;