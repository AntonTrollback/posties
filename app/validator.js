var _ = require('lodash');
var validatorLib = require('validator');
var validator = {};

/**
 * Validate
 */

validator.isEmail = function(email) {
  if (!email) { return false; }
  return validatorLib.isEmail(email);
}

validator.isPassword = function(password) {
  if (!password) { return false; }
  return validatorLib.isLength(password, 2, 150);
}

validator.isName = function(name) {
  // Subdomain restrictions
  var regex = /^(?:[A-Za-z0-9][A-Za-z0-9\-]{0,60}[A-Za-z0-9]|[A-Za-z0-9])$/;

  if (!name) { return false; }
  return !_.isNull(name.trim().match(regex));
}

/**
 * Normalize
 */

validator.normalizeEmail = function(email) {
  if (!email) { return false; }
  return validatorLib.normalizeEmail(email.toLowerCase());
}

validator.simpleNormalizeName = function(name) {
  if (!name) { return false; }
  return name.toLowerCase().trim();
}

validator.normalizeName = function(name) {
  if (!name) { return false; }

  return name.trim()
             .toLowerCase()
             .replace(/[ _+]/g, '-') // replace stuff with hyphens
             .replace(/^[-]+|[-]+$/g, '') // strip trailing hyphens
             .replace(/[^a-zA-Z0-9-]/g, ''); // strip disallowed chars
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

/**
 * Misc helpers
 */

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