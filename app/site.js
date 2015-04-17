var _ = require('lodash');
var query = require('pg-query');
var app = require('./../app');
var validator = require('./validator');
var part = require('./part');
var site = {};

query.connectionParameters = app.get('databaseUrl');

/**
 * Default site data
 */

site.default = {
  id: null,
  name: null,
  isAuthenticated: false,
  options: {
    boxes: true,
    text_font: 'Akkurat',
    text_color: '#141414',
    heading_font: 'Akkurat',
    background_color: '#f5f5f5',
    part_background_color: '#ffffff'
  },
  parts: [{
    id: null,
    rank: 0,
    type: 0,
    content: {
      text: "<p>Hello</p><p class=\"focus\">I'm a text that you can edit</p><p><br></p><p>Add images and texts until you're happy.</p><p>Then publish your new website!</p><p><br></p><p>Customize your design by hitting the sliders in the top right corner.</p>"
    }
  }]
}

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
  var name = name.toLowerCase();

  // Get the site
  site.getByName(name, function(error, siteData) {
    if (error || !siteData) { return callback(error, siteData); }

    // Get all the parts
    part.getAllComplete(siteData.id, function(error, parts) {
      if (error) { return callback(error, parts); }

      siteData.parts = parts;

      // Clean up
      delete siteData.updated;
      delete siteData.created;

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
  if (input.options) {
    validator.normalizeJSON(input.options, function(error, json) {
      if (error) { return callback(error, false, null); }
      input.options = json;
    });
  };

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
    var id = validator.getFirstRowValue(siteData, 'id', error)
    var name = validator.getFirstRowValue(siteData, 'name', error)

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

/**
 * Update site options
 */

site.setOptions = function(input, callback) {
  validator.normalizeJSON(input.options, function(error, json) {
    if (error) { return callback(error, null); }
    input.options = json;
  });

  var sql = 'UPDATE sites SET options = ($1) WHERE id = ($2) RETURNING *';
  var data = [input.options, input.id];

  query(sql, data, function(error, rows) {
    var id = validator.getFirstRowValue(rows, 'id', error);
    callback(error, id ? true : false);
  });
}

module.exports = site;