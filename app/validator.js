var _ = require('lodash');
var validatorLib = require('validator');
var validator = {};

/**
 * Validate
 */

validator.isEmail = function(email) {
  if (!email) { return false; }
  var email = validatorLib.normalizeEmail(email);
  return validatorLib.isEmail(email);
}

validator.isPassword = function(password) {
  if (!password) { return false; }
  return validatorLib.isLength(password, 2, 150);
}

validator.isName = function(name) {
  if (!name) { return false; }
  var regex = /^[a-zA-Z0-9_-]{1,150}$/;
  var validLength = validatorLib.isLength(name, 1, 150);
  var validChars = !_.isNull(name.match(regex));
  return validLength && validChars;
}

/**
 * Normalize
 */

validator.normalizeEmail = function(email) {
  if (!email) { return false; }
  return validatorLib.normalizeEmail(email);
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

validator.getFirstRowValue = function(rows, key, error) {
  if (error || !key || !rows) { return null; }
  try {
    if (_.isArray(rows)) {
      return rows[0][key];
    } else {
      return rows[key];
    }
  } catch (ex) {
    console.log('Could not get key: ' + key)
    console.trace(ex)
    return null;
  }
}

module.exports = validator;