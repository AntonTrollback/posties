var _ = require('lodash');
var query = require('pg-query');
var app = require('./../app');
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
  if (input.password) {
    var valid = validator.isEmail(input.email) && validator.isPassword(input.password);
  } else {
    var valid = validator.isEmail(input.email);
  }

  if (!valid) {
    return callback(null, false, null);
  }

  // check availability
  user.getByEmail(input.email, function(error, userData) {
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
    var id = validator.getFirstRowValue(rows, 'id', error);
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
    return callback(null, null, null);
  }

  if (userData) {
    // Already got user from database

    if (userData.password !== password) {
      return callback(null, null, null);
    }

    user.signin(req, userData.id);
    callback(null, userData.id, null);
  } else {
    // Get user from database
    user.getByEmail(email, function(error, userData) {
      if (error || !userData || (userData.password !== password)) {
        return callback(error, null, null);
      }

      site.getByUserId(userData.id, function(error, siteData) {
        if (error || !siteData) {
          return callback(error, null, null);
        }

        user.signin(req, userData.id);
        callback(error, userData.id, siteData.name);
      });
    });
  }
}

/**
 * Signin user with site name
 */

user.tryNameSignin = function(req, input, callback) {
  site.getByName(input.name, function(error, siteData) {
    var userId = validator.getFirstRowValue(siteData, 'user_id', error);
    var name = validator.getFirstRowValue(siteData, 'name', error);

    user.getById(userId, function(error, userData) {
      input.email = validator.getFirstRowValue(userData, 'email', error);

      user.trySignin(req, input, userData, function(error, userId) {

        callback(error, userId, name);
      });
    });
  });
}

user.signin = function(req, id) {
  req.session.user_id = id;
}

/**
 * Signout user
 */

user.signout = function(req) {
  req.session.destroy(function(error) {
    if (error) { console.trace(error); }
  })
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
    result.success = true;
    callback(error, result);
  });
}

user.createWithSiteAndParts = function(req, input, callback) {
  var result = {};
  result.success = false;

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