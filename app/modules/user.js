var _ = require('lodash');
var app = require('./../../app');
var query = require('pg-query');
var validator = require('./validator');
var site = require('./site');
var user = {};

query.connectionParameters = app.get('databaseUrl');

/**
 * Get user from database
 */

user.getById = function(id, callback) {
  query.first('SELECT * FROM "users" WHERE id = $1', id, callback);
}

user.getByEmail = function(email, callback) {
  query.first('SELECT * FROM "users" WHERE email = $1', email, callback);
}

/**
 * Validate user input
 */

user.isValidAndAvailable = function(input, callback) {
  var valid, email;

  if (_.isObject(input)) {
    email = input.email;
    valid = validator.isEmail(email) && validator.isPassword(input.password);
  } else {
    email = input;
    valid = !validator.isEmail(email);
  }

  if (!valid) {
    return callback(null, false, null);
  }

  // check availability
  user.getByEmail(email, function(error, userData) {
    callback(error, true, !userData, userData);
  });
}

/**
 * Create user and signs in
 */

user.create = function(req, input, callback) {
  var sql = 'INSERT INTO users(email, password, created) values($1, $2, $3) RETURNING *';
  var email = validator.normalizeEmail(input.email);
  var data = [email, input.password, new Date()]

  query(sql, data, function(error, rows) {
    var id = _.isUndefined(rows) ? null : rows[0].id;
    user.signin(req, id);
    callback(error, id);
  });
}

/**
 * Signin user
 */

user.trySignin = function(req, input, userData, callback) {
  var email = input.email;
  var password = input.password;

  if (!validator.isEmail(email)) {
    return callback(null, null);
  }

  if (userData) {
    // Already got user from database
    if (userData.password !== password) {
      return callback(null, null);
    }

    user.signin(req, userData.id);
    callback(null, userData.id);
  } else {
    // Got user from database
    user.getByEmail(email, function(error, userData) {
      if (error || !userData || (userData.password !== password)) {
        return callback(error, null);
      }

      user.signin(req, userData.id);
      callback(error, userData.id);
    });
  }
}

user.signin = function(req, id) {
  req.session.user_id = id;
}

/**
 * Signout user
 */

user.signout = function(req) {
  delete req.session.user_id;
}

/**
 * Check if signed in
 */

user.isActive = function(req) {
  if (_.isUndefined(req.session)) {
    return false;
  }

  return req.session.user_id ? true : false;
}

/**
 * Check if active user is site owner
 */

user.isActiveOwner = function(req, siteUserId) {
  if (user.isActive(req)) {
    return req.session.user_id === siteUserId;
  } else {
    return false;
  }
}

/**
 * Create with site and parts
 */

function handleSiteCreation(error, input, result, userId, callback) {
  if (error || !userId) { return callback(error, result); }
  input.site.userId = userId;

  site.create(input.site, input.parts, function(error, id, name) {
    result.name = name;
    callback(error, result);
  });
}

user.createWithSiteAndParts = function(req, input, callback) {
  var result = {};

  // Check if user is valid and available
  user.isValidAndAvailable(input.user, function(error, validUser, availableEmail, userData) {
    result.validUser = validUser;
    result.availableEmail = availableEmail;
    if (error || !validUser) { return callback(error, result); }

    // Check if site is valid and available
    site.isValidAndAvailable(input.site, function(error, validSite, availableName) {
      result.validSite = validSite;
      result.availableName = availableName;
      if (error || !validSite || !availableName) { return callback(error, result); }

      // Signin or Signup
      if (availableEmail) {
        user.create(req, input.user, function(error, userId) {
          handleSiteCreation(error, input, result, userId, callback);
        });
      } else {
        user.trySignin(req, input.user, userData, function(error, userId) {
          handleSiteCreation(error, input, result, userId, callback);
        });
      }
    });
  });
}

module.exports = user;