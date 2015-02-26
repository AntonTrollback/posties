var _ = require('lodash');
var pg = require('pg');
var app = require('./../../app');
var query = require('pg-query');
var validator = require('validator');
var mod = {};

/**
 * Get user from database
 */

query.connectionParameters = app.get('databaseUrl');

mod.getById = function(id, callback) {
  query.first('SELECT * FROM "users" WHERE id = $1', id, callback);
}

mod.getByEmail = function(email, callback) {
  query.first('SELECT * FROM "users" WHERE email = $1', email, callback);
}

/**
 * Validate user input
 */

mod.isValidEmail = function(email) {
  return validator.isEmail(email);
}

mod.isValidPassword = function(password) {
  return validator.isLength(password, 2, 150);
}

mod.isValidUser = function(user) {
  return mod.isValidEmail(user.email) && mod.isValidPassword(user.password);
}

/**
 * Check email availability
 */

mod.emailAvailability = function(email, callback) {
  mod.getByEmail(email, function(error, row) {
    callback(error, !row);
  });
}

/**
 * Check if signedin
 */

mod.isSignedin = function(req) {
  return _.isUndefined(req.session) ? false : req.session.user_id;
}

/**
 * Create user
 */

mod.tryCreate = function(req, user, callback) {
  if (!mod.isValidUser(user)) {
    // error, valid, id
    callback(null, false, null);
    return;
  }

  mod.emailAvailability(user.email, function(error, available) {
    if (error || !available) {
      callback(error, false, null);
      return;
    }

    mod.create(req, user, callback);
  });
}

mod.create = function(req, user, callback) {
  var sql = 'INSERT INTO users(email, password, created) values($1, $2, $3) RETURNING *';
  var data = [user.email, user.password, new Date()]

  query(sql, data, function(error, rows) {
    var id = _.isUndefined(rows[0].id) ? null : rows[0].id;

    mod.signin(req, id);
    callback(error, true, id);
  });
}

/**
 * Signin user
 */

mod.trySignin = function(req, user, callback) {
  if (!mod.isValidUser(user)) {
    callback(null, null);
    return;
  }

  if (mod.isSignedin(req)) {
    mod.signout(req);
  }

  mod.getByEmail(user.email, function(error, row) {
    if (error || !row || (row.password !== user.password)) {
      callback(error, true, null);
      return;
    }

    mod.signin(req, row.id);
    callback(null, row.id);
  });
}

mod.signin = function(req, id) {
  // Create session
  req.session.user_id = id;
}

/**
 * Signout user
 */

mod.signout = function(req) {
  delete req.session.user_id;
}

module.exports = mod;