var _ = require('lodash');
var pg = require('pg');
var app = require('./../../app');
var query = require('pg-query');
var part = {};

query.connectionParameters = app.get('databaseUrl');

part.get = function(id) {

}

part.create = function(name, parts, designSettings) {

}

part.edit = function(id) {

}

part.delete = function(id) {

}

part.reorder = function(id, newOrder) {

}

module.exports = part;