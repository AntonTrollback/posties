var _ = require('lodash');
var validatorLib = require('validator');
var validator = {};

/**
 * Validate
 */

validator.isEmail = function(email) {
  var email = validatorLib.normalizeEmail(email);
  return validatorLib.isEmail(email);
}

validator.isPassword = function(password) {
  return validatorLib.isLength(password, 2, 150);
}

validator.isName = function(name) {
  var regex = /^[a-z0-9_-]{1,150}$/;
  var validLength = validatorLib.isLength(name, 1, 150);
  var validChars = !_.isNull(name.match(regex));
  return validLength && validChars;
}

/**
 * Normalize
 */

validator.normalizeEmail = function(email) {
  return validatorLib.normalizeEmail(email)
}

validator.normalizeJSON = function(json, callback) {
  if (!_.isString(json)) {
    return callback(null, json);
  }

  try {
    return callback(null, JSON.parse(json));
  } catch(error) {
    return callback(error, null);
  }
}

module.exports = validator;