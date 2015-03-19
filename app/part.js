var _ = require('lodash');
var query = require('pg-query');
var app = require('./../app');
var validator = require('./validator');
var part = {};

query.connectionParameters = app.get('databaseUrl');

/**
 * Get part(s) from database
 */

part.getById = function(id, callback) {
  query.first('SELECT * FROM "parts" WHERE id = $1', id, callback);
}

part.getAll = function(siteId, callback) {
  query('SELECT * FROM "parts" WHERE site_id = $1', [siteId], function(error, rows) {
    callback(error, (rows && (rows.length)) ? rows : null);
  });
}

/**
 * Get all parts, fixed
 */

part.getAllComplete = function(siteId, callback) {
  part.getAll(siteId, function(error, parts) {
    if (error) { return callback(error); }

    var fixed = [];

    _(parts).forEach(function(partData) {
      // Set types
      fixed.push(part.setType(partData));

      // Clean up
      delete partData.created;
      delete partData.site_id;
      delete partData.type;
    });

    // Sort
    fixed = _.sortBy(fixed, 'rank');

    return callback(error, fixed);
  });
}

/**
 * Set part types
 */

part.setType = function(partData) {
  if (partData.type === 1) {
    partData.typeText = true;
  } else if (partData.type === 2) {
    partData.typeHeading = true;
  } else if (partData.type === 3) {
    partData.typeImage = true;
  } else if (partData.type === 4) {
    partData.typeVideo = true;
  }
  return partData;
}

/**
 * Create part
 */

part.create = function(input, callback) {
  validator.normalizeJSON(input.content, function(error, json) {
    if (error) { return callback(error, false, null); }
    input.content = json;
  });

  var sql = 'INSERT INTO parts(site_id, type, rank, content, created) values($1, $2, $3, $4, $5) RETURNING *';
  var data = [input.siteId, input.type, input.rank, input.content, new Date()];

  query(sql, data, function(error, rows) {
    var id = _.isUndefined(rows) ? null : rows[0].id;
    callback(error, id);
  });
}

part.createAll = function(parts, siteId, callback) {
  var count = 0;

  _(parts).forEach(function(input) {
    input.siteId = siteId;

    part.create(input, function(error, id) {
      if (error) {
        callback(error, false);
        return false; // break early
      }

      count++;

      if (count === parts.length) {
        callback(error, true);
      }
    });
  });
}

/**
 * Update part content
 */

part.setContent = function(input, callback) {
  validator.normalizeJSON(input.content, function(error, json) {
    if (error) { return callback(error, null); }
    input.content = json;
  });

  var sql = 'UPDATE parts SET content = ($1) WHERE id = ($2) RETURNING *';
  var data = [input.content, input.id];

  query(sql, data, function(error, rows) {
    var id = _.isUndefined(rows) ? null : rows[0].id;
    callback(error, id);
  });
}

/**
 * Update part rank order
 */

part.setRank = function(inputArray, callback) {
  var count = 0;
  _(inputArray).forEach(function(item) {
    var sql = 'UPDATE parts SET rank = ($1) WHERE id = ($2) RETURNING *';

    query(sql, [rank, id], function(error, rows) {
      if (error) {
        callback(error, false);
        return false; // break early
      }

      count++;

      if (count === inputArray.length) {
        callback(error, true);
      }
    });
  });
}

module.exports = part;