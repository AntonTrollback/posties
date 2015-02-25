var _ = require('lodash');
var pg = require('pg');
var app = require('./../../app');
var query = require('pg-query');
var site = {};

query.connectionParameters = app.get('databaseUrl');


site.get = function(id) {

}

site.getByName = function(name) {

}

site.create = function(name, parts, designSettings) {

}

site.delete = function(id) {

}

site.updateDesign = function(id, designSettings) {

}

site.checkNameAvailability = function(name) {

}

module.exports = site;