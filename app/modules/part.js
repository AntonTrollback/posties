var _ = require('lodash');
var app = require('./../../app');
var query = require('pg-query');
var part = {};

/**
 * Get part from database
 */

query.connectionParameters = app.get('databaseUrl');

part.getById = function(id, callback) {
  query.first('SELECT * FROM "parts" WHERE id = $1', id, callback);
}

part.getAllBySiteId = function(id, callback) {
  query.first('SELECT * FROM "parts" WHERE user_id = $1', id, callback);
  // Todo: map musctache vars for each type
}

/**
 * Create part
 *
 * Types:
 * - 1 text
 * - 2 heading
 * - 3 image
 * - 4 video
 */

part.create = function(partObj, callback) {
  if (_.isString(partObj.content)) {
    try {
      partObj.content = JSON.parse(partObj.content);
    } catch(error) {
      callback(error, null);
    }
  }

  var sql = 'INSERT INTO parts(site_id, type, rank, content, created) values($1, $2, $3, $4, $5) RETURNING *';
  var date = new Date();
  var data = [partObj.siteId, partObj.type, partObj.rank, partObj.content, date];

  query(sql, data, function(error, rows) {
    var id = _.isUndefined(rows) ? null : rows[0].id;
    callback(error, id);
  });
}

/**
 * Update part content
 */

part.setContent = function(partObj, callback) {

}

/**
 * Update part rank order
 */

part.setRank = function(partObj, callback) {

}

module.exports = part;