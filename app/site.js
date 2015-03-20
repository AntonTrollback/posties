var _ = require('lodash');
var query = require('pg-query');
var app = require('./../app');
var validator = require('./validator');
var part = require('./part');
var site = {};

query.connectionParameters = app.get('databaseUrl');

/**
 * Get site from database
 */

site.getByUserId = function(id, callback) {
  query.first('SELECT * FROM "sites" WHERE user_id = $1', id, callback);
}

site.getByName = function(name, callback) {
  query.first('SELECT * FROM "sites" WHERE name = $1', name, callback);
}

/**
 * Get site with parts
 */

site.getComplete = function(name, callback) {
  // Get the site
  site.getByName(name, function(error, siteData) {
    if (error || !siteData) { return callback(error, siteData); }

    // Get all the parts
    part.getAllComplete(siteData.id, function(error, parts) {
      if (error) { return callback(error, parts); }

      siteData.parts = parts;
      return callback(error, siteData);
    });
  });
}

/**
 * Check name availability
 */

site.nameAvailability = function(name, callback) {
  site.getByName(name, function(error, row) {
    callback(error, !row);
  });
}

/**
 * Validate input
 */

site.isValidAndAvailable = function(input, callback) {
  validator.normalizeJSON(input.options, function(error, json) {
    if (error) { return callback(error, false, null); }
    input.options = json;
  });

  if (!validator.isName(input.name)) {
    return callback(null, false, null);
  }

  // check availability
  site.getByName(input.name, function(error, siteData) {
    callback(error, true, !siteData);
  });
}

/**
 * Create site
 */

site.create = function(siteInput, partsInput, callback) {
  var sql = 'INSERT INTO sites(user_id, name, options, updated, created) values($1, $2, $3, $4, $5) RETURNING *';
  var date = new Date();
  var data = [siteInput.userId, siteInput.name, siteInput.options, date, date];

  query(sql, data, function(error, siteData) {
    var id = _.isUndefined(siteData) ? null : siteData[0].id;
    var name = _.isUndefined(siteData) ? null : siteData[0].name;

    if (partsInput.length > 0) {
      part.createAll(partsInput, id, function(error, success) {
        if (error || !success) { return callback(error, null, null); }
        callback(error, id, name);
      });
    } else {
      callback(error, id, name);
    }
  });
}

module.exports = site;