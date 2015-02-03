var pg = require('pg');

module.exports = function(app, settings) {
  var database = {};
  var connectionStr = settings.databaseUrl;

  var queries = {
    createUser: 'insert into users(document) values($1) returning *'
  }

  database.createUser = function(user, callback) {
    pg.connect(connectionStr, function(err, client, done) {
      if (err) {
        callback('Could not get a client from pool: ' + JSON.stringify(err));
        return false;
      }

      client.query( {name: 'create_user', text: queries.createUser, values: [JSON.stringify(user)]}, function(err, result) {
        if (err) {
          done();
          callback('Could not insert user into database: ' + JSON.stringify(err));
          return false;
        }

        done();
        callback(null, result.rows[0].document);
        return;
      });
    });
  }

  return database;
}