var _ = require('lodash');
var router = require('express').Router();
var app = require('./../app');
var user = require('./modules/user');
var site = require('./modules/site');
var part = require('./modules/part');

/**
 * Prepair requests
 */

var isActive; // Logged in

router.use(function(req, res, next) {
  isActive = user.isActive(req);
  return next();
});

router.use(function(req, res, next) {
  var suffix = isActive ? ' (active user)' : ' '
  var log = req.method + ' ' + req.url + suffix;
  while (log.length <= 56) { log += '='; }
  console.log('\n==== ' + log);
  return next();
});

/**
 * Render helpers
 */

function render (res, options) {
  res.render('layout', _.assign({
    assetUrl: app.get('assetUrl'),
    analyticsCode: app.get('analyticsCode'),
    activeUser: isActive
  }, options));
}

function render404 (res) {
  render(res, {
    title: '404 - Posti.es',
    notFound: true
  });
}

function render505 (error, res) {
  console.trace(error);
  render(res, {
    title: 'Posti.es',
    serverError: true
  });
}

function send (res, data) {
  res.send(data);
}

function sendError (error, res) {
  console.trace(error);
  send(res, {error: 'Internal error'});
}

/**
 * Remove "www" from requests
 */

app.get('/*', function (req, res, next){
  var protocol = 'http' + (req.connection.encrypted ? 's' : '') + '://';
  var host = req.headers.host;
  var href;

  if (!/^www\./i.test(host)) {
    return next();
  }

  host = host.replace(/^www\./i, '');
  href = protocol + host + req.url;
  res.statusCode = 301;
  res.setHeader('Location', href);
  res.write('Redirecting to ' + host + req.url + '');
  res.end();
});

/**
 * Startpage
 */

router.get('/', function(req, res) {
  render(res, {
    index: true,
    editMode: true,
    title: 'Posti.es',
    description: 'The posties description ...'
  });
});

/**
 * Signout
 */

router.get('/signout', function (req, res) {
  user.signout(req);
  res.redirect('/');
});

/**
 * Sites
 */

router.get('/by/:name', function(req, res) {
  var name = req.params.name;

  site.getComplete(name, function (error, siteData) {
    if (error) { return render505(error, res); }
    if (!siteData) { return render404(res); }

    render(res, {
      title: name + ' · Posti.es',
      userSite: siteData,
      editMode: user.isActiveOwner(req, siteData.user_id)
    });
  })
});

/* -------------------------------------------------------------------------- */

/**
 * API - sign in
 */

router.post('/api/signin', function (req, res) {
  user.trySignin(req, req.body, false, function(error, id) {
    if (error) { return sendError(error, res); }
    send(res, {id: id});
  });
});

/**
 * API - sign out
 */

router.get('/api/signout', function (req, res) {
  user.signout(req);
  send(res, {signout: true});
});

/**
 * API - email availability
 */

router.post('/api/available-email', function (req, res) {
  user.isValidAndAvailable(req.body.email, function (error, valid, available) {
    if (error) { return sendError(error, res); }
    res.send({valid: valid, available: available});
  });
});

/**
 * API - register and publish
 */

router.post('/api/publish-with-user', function (req, res) {
  user.createWithSiteAndParts(req, req.body, function (error, result) {
    if (error) { return sendError(error, res); }
    res.send(result);
  });
});

/**
 * Add part
 */

router.post('/api/add-part', function (req, res) {
  part.create(req.body, function(error, id) {
    if (error) { return sendError(error, res); }
    send(res, {id: id});
  });
});

/**
 * Update part
 */

router.post('/api/update-part', function (req, res) {
  part.setContent(req.body, function(error, id) {
    if (error) { return sendError(error, res); }
    send(res, {id: id});
  });
});

/* -------------------------------------------------------------------------- */

/**
 * Database setup
 */

router.get('/database', function(req, res) {
  var query = require('pg-query');
  query.connectionParameters = app.get('databaseUrl');

  query('CREATE TABLE IF NOT EXISTS users(id serial primary key, email text, password text, created timestamptz)');
  query('CREATE TABLE IF NOT EXISTS sites(id serial primary key, user_id serial, name text, options jsonb, updated timestamptz, created timestamptz)');
  query('CREATE TABLE IF NOT EXISTS parts(id serial primary key, site_id serial, type smallint, rank integer, content jsonb, created timestamptz)');

  render(res, {
    title: 'Database setup'
  });
});

router.get('/database/:table', function(req, res) {
  var query = require('pg-query');
  query.connectionParameters = app.get('databaseUrl');

  query('SELECT * FROM ' + req.params.table, function(error, rows, results) {
    if (error) { render505(error, res); return; }

    render(res, {
      title: 'Database dump',
      dump: JSON.stringify(rows)
    });
  });
});

/**
 * 404 responses
 */

router.use(function (req, res, next) {
  res.status(404);

  if (req.accepts('html')) {
    return render404(res);
  } else if (req.accepts('json')) {
    return send(res, {error: 'Not found'});
  }

  res.type('txt').send('Not found');
});

module.exports = router;