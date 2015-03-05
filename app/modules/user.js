var _ = require('lodash');
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
  var email = validator.normalizeEmail(email);
  return validator.isEmail(email);
}

user.isValidPassword = function(password) {
  return validator.isLength(password, 2, 150);
}

user.isValid = function(userObj) {
  return user.isValidEmail(userObj.email) && user.isValidPassword(userObj.password);
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
 * Check if signed in
 */

user.isSignedin = function(req) {
  return _.isUndefined(req.session) ? false : req.session.user_id;
}

/**
 * Check if signed in site owner
 */

user.isSignedinUserSiteOwner = function(req, siteOwnerId) {
  return req.session.user_id === siteOwnerId;
}

/**
 * Create user
 */

user.tryCreate = function(req, userObj, callback) {
  if (!user.isValid(userObj)) {
    // error, valid, id
    return callback(null, false, null);
  }

  user.emailAvailability(userObj.email, function(error, available) {
    if (error || !available) {
      return callback(error, false, null);
    }

    user.create(req, userObj, callback);
  });
}

user.create = function(req, userObj, callback) {
  var sql = 'INSERT INTO users(email, password, created) values($1, $2, $3) RETURNING *';
  var email = validator.normalizeEmail(userObj.email);
  var data = [email, userObj.password, new Date()]

  query(sql, data, function(error, rows) {
    var id = _.isUndefined(rows) ? null : rows[0].id;

    user.signin(req, id);
    callback(error, true, id);
  });
}

/**
 * Signin user
 */

user.trySignin = function(req, userObj, callback) {
  if (!user.isValid(userObj)) {
    return callback(null, null);
  }

  if (user.isSignedin(req)) {
    user.signout(req);
  }

  user.getByEmail(userObj.email, function(error, row) {
    if (error || !row || (row.password !== userObj.password)) {
      return callback(error, null);
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