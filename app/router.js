var _ = require('lodash');
var router = require('express').Router();
var app = require('./../app');
var user = require('./modules/user');
var site = require('./modules/site');
var part = require('./modules/part');

/**
 * Response helpers
 */

var isSignedin;

function renderPage (req, res, options) {
  var data = {
    assetUrl: app.get('assetUrl'),
    analyticsCode: app.get('analyticsCode'),
    activeUser: isSignedin
  }

  res.render('layout', _.assign(data, options));
}

function render404Page (req, res) {
  renderPage(req, res, {
    title: '404 - Posti.es',
    notFound: true
  });
}

function renderErrorPage (error, req, res) {
  console.error(error);
  renderPage(req, res, {
    title: 'Posti.es',
    serverError: true
  });
}

function sendEndpointError (error, res) {
  console.error(error);
  res.send({error: 'Internal error'});
}

/**
 * Logging
 */

router.use(function(req, res, next) {
  isSignedin = user.isSignedin(req);
  next();
});

router.use(function(req, res, next) {
  var log = req.method + ' ' + req.url + (isSignedin ? ' (active user) ' : ' ');
  while (log.length <= 56) { log += '='; }
  console.log('\n==== ' + log);
  next();
});

/**
 * Startpage
 */

router.get('/', function(req, res) {
  renderPage(req, res, {
    index: true,
    inEditMode: true,
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

// ------------------------------------------------------------------------ //

/**
 * API signup
 */

router.post('/api/signup', function (req, res) {
  var input = {
    email: req.body.email,
    password: req.body.password
  }

  user.tryCreate(req, input, function(error, valid, id) {
    if (error) { sendEndpointError(error, res); return; }
    if (valid && id) {
      res.send({valid: valid, id: id});
      return;
    }

    res.send({valid: false, id: null});
  });
});

/**
 * API signin
 */

router.post('/api/signin', function (req, res) {
  var post = {
    email: req.body.email,
    password: req.body.password
  }

  user.trySignin(req, post, function(error, id) {
    if (error) { sendEndpointError(error, res); return; }
    if (id) {
      res.send({id: id});
      return;
    }

    res.send({id: null});
  });
});

/**
 * API email availability test
 */

router.post('/api/available-email', function (req, res) {
  var email = req.body.email;
  var resp = {
    valid: true,
    available: null
  }

  if (!user.isValidEmail(email)) {
    resp.valid = false;
    res.send(resp);
    return;
  }

  user.emailAvailability(email, function(error, status) {
    if (error) { return sendEndpointError(error, res); }
    resp.available = status;
    res.send(resp);
  });
});

// ------------------------------------------------------------------------ //

/**
 * Database setup
 */

router.get('/database', function(req, res) {
  var query = require('pg-query');
  query.connectionParameters = app.get('databaseUrl');
  query('CREATE TABLE IF NOT EXISTS users(id serial primary key, email text, password text, created timestamptz)');
  //query('CREATE TABLE IF NOT EXISTS sites()');
  //query('CREATE TABLE IF NOT EXISTS parts()');

  var table = 'users';

  query('SELECT * FROM ' + table, function(error, rows, results) {
    if (error) { renderErrorPage(error, req, res); return; }
    renderPage(req, res, {
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
    render404Page(req, res);
    return;
  }

  if (req.accepts('json')) {
    res.send({error: 'Not found'});
    return;
  }

  res.type('txt').send('Not found');
});

module.exports = router;