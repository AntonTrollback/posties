var _ = require('lodash');
var router = require('express').Router();
var app = require('./../app');
var user = require('./modules/user');
var site = require('./modules/site');
var part = require('./modules/part');

function renderPage (res, options) {
  var data = {
    assetUrl: app.get('assetUrl'),
    analyticsCode: app.get('analyticsCode'),
  }
  res.render('layout', _.assign(data, options));
}

function render404Page (res) {
  renderPage(res, {
    title: '404 - Posti.es',
    notFound: true
  });
}

function renderErrorPage (error, res) {
  console.error(error);
  renderPage(res, {
    title: 'Posti.es',
    serverError: true
  });
}

function sendEndpointError (error, res) {
  console.error(error);
  res.send({error: 'Internal error'});
}

router.use(function(req, res, next) {
  console.log('--------------------------------------------------------');
  console.log(req.method, req.url);
  next();
});

// Start page

router.get('/', function(req, res) {
  renderPage(res, {
    index: true,
    inEditMode: true,
    title: 'Posti.es',
    description: 'The posties description ...'
  });
});

// Sign out

router.get('/signout', function (req, res) {
  user.signout(req);
  res.redirect('/');
});

// Setup database

router.get('/database', function(req, res) {
  var query = require('pg-query');
  query.connectionParameters = app.get('databaseUrl');
  query('CREATE TABLE IF NOT EXISTS users(id serial primary key, email text, password text, created timestamptz)');
  //query('CREATE TABLE IF NOT EXISTS sites()');
  //query('CREATE TABLE IF NOT EXISTS parts()');

  var table = 'users';

  query('SELECT * FROM ' + table, function(error, rows, results) {
    if (error) { renderErrorPage(error, res); return; }
    renderPage(res, {
      title: 'Database dump',
      dump: JSON.stringify(rows)
    });
  });
});

// ------------------------------------------------------------------------ //

// API - Sign up

router.post('/api/user/signup', function (req, res) {
  var post = {
    email: req.body.email,
    password: req.body.password
  }

  user.create(post, function(error, valid, id) {
    if (error) { return sendEndpointError(error, res); }
    if (!valid) { return res.send({valid: false}); }
    if (!id) { return res.send({available: false}); }

    res.send({id: id});
  });
});

// API - Sign in

router.post('/api/user/signin', function (req, res) {
  user.signin(req.body.email, req.body.password, function(valid, error, data) {
    if (error) { return sendEndpointError(error, res); }
    if (!valid) { return res.send('bad input'); }

    res.send({id: id});
  });
});

// API - Check email availability

router.post('/api/user/available', function (req, res) {
  if (!user.isValidEmail(req.body.email)) {
    res.send({valid: false});
    return;
  }

  user.isAvailableEmail(req.body.email, function(error, status) {
    if (error) { return sendEndpointError(error, res); }
    res.send({available: status});
  });
});

// ------------------------------------------------------------------------ //

// 404

router.use(function (req, res, next) {
  res.status(404);

  if (req.accepts('html')) {
    render404Page(res);
    return;
  }

  if (req.accepts('json')) {
    res.send({error: 'Not found'});
    return;
  }

  res.type('txt').send('Not found');
});

module.exports = router;