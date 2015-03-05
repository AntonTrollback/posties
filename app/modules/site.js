var _ = require('lodash');
var app = require('./../../app');
var query = require('pg-query');
var validator = require('validator');
var site = {};

/**
 * Get site from database
 */

query.connectionParameters = app.get('databaseUrl');

site.getById = function(id, callback) {
  query.first('SELECT * FROM "sites" WHERE id = $1', id, callback);
}

site.getByUserId = function(id, callback) {
  query.first('SELECT * FROM "sites" WHERE user_id = $1', id, callback);
}

site.getByName = function(name, callback) {
  query.first('SELECT * FROM "sites" WHERE name = $1', name, callback);
}

/**
 * Validate site input
 */

site.isValidName = function(name) {
  var regex = /^[a-z0-9_-]{1,150}$/;
  var validLength = validator.isLength(name, 1, 150);
  var validChars = !_.isNull(name.match(regex));
  return validLength && validChars;
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
 * Create site
 */

site.tryCreate = function(siteObj, callback) {
  if (!site.isValidName(siteObj.name)) {
    // error, valid, name
    return callback(null, false, null);
  }

  site.nameAvailability(siteObj.name, function(error, available) {
    if (error || !available) {
      return callback(error, false, null);
    }

    site.create(siteObj, callback);
  });
}

site.create = function(siteObj, callback) {
  var sql = 'INSERT INTO sites(owner_id, name, options, updated, created) values($1, $2, $3, $4, $5) RETURNING *';
  var date = new Date();
  var data = [siteObj.ownerId, siteObj.name, siteObj.options, date, date];

  query(sql, data, function(error, rows) {
    var name = _.isUndefined(rows) ? null : rows[0].name;
    callback(error, true, name);
  });
}

module.exports = site;