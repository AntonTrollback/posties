var _ = require('lodash');
var router = require('express').Router();
var app = require('./../app');
var user = require('./user');
var site = require('./site');
var part = require('./part');

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
    production: app.get('production'),
    assetUrl: app.get('assetUrl'),
    analyticsCode: app.get('analyticsCode'),
    filePickerKey: app.get('filePickerKey'),
    angularCtrl: 'StaticCtrl',
    activeUser: isActive,
    fonts: app.get('fonts'),
    colors: app.get('colors'),
    colorsData: JSON.stringify(app.get('colors')),
    defaultSiteDataString: JSON.stringify(app.get('defaultSiteData')),
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
    title: 'Sorry, server error. We\'re on it!',
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

function sendBadInput (res) {
  send(res, {error: 'Ivalid input'});
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
    angularCtrl: 'IndexCtrl',
    title: 'Posti.es',
    description: 'Posti.es, instant one page website creator'
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

    siteData.isAuthenticated = user.isActiveOwner(req, siteData.user_id);

    render(res, {
      title: name + ' · Posti.es',
      onSite: true,
      angularCtrl: 'UserCtrl',
      siteData: siteData,
      siteDataString: JSON.stringify(siteData),
      editMode: siteData.isAuthenticated
    });
  })
});

/* -------------------------------------------------------------------------- */

/**
 * API - sign in
 */

router.post('/api/signin', function (req, res) {
  user.trySignin(req, req.body, false, function(error, id, siteToGoTo) {
    if (error) { return sendError(error, res); }
    send(res, {id: id, siteToGoTo: siteToGoTo});
  });
});

/**
 * API - sign in with website name
 */

router.post('/api/signin-name', function (req, res) {
  user.tryNameSignin(req, req.body, function(error, id, siteToGoTo) {
    if (error) { return sendError(error, res); }
    send(res, {id: id, siteToGoTo: siteToGoTo});
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
  if (_.isUndefined(req.body.email)) { return sendBadInput(res); };

  user.isValidAndAvailable(req.body, function (error, valid, available) {
    if (error) { return sendError(error, res); }
    res.send({valid: valid, available: available});
  });
});

/**
 * API - user name availability
 */

router.post('/api/available-name', function (req, res) {
  if (_.isUndefined(req.body.name)) { return sendBadInput(res); };

  site.isValidAndAvailable(req.body, function (error, valid, available) {
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
 * Update site options
 */

router.post('/api/update-options', function (req, res) {
  site.setOptions(req.body, function(error, status) {
    if (error) { return sendError(error, res); }
    send(res, {status: status});
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

/**
 * Move part
 */

router.post('/api/update-rank', function (req, res) {
  part.setRank(req.body, function(error, status) {
    if (error) { return sendError(error, res); }
    send(res, {success: status});
  });
});

/**
 * Delete part
 */

router.delete('/api/delete-part', function (req, res) {
  part.delete(req.body, function(error, status) {
    if (error) { return sendError(error, res); }
    send(res, {success: status});
  });
});

/* -------------------------------------------------------------------------- */

/**
 * Database setup
 */

router.get('/setup', function(req, res) {
  if (!app.get('production')) {
    var query = require('pg-query');
    query.connectionParameters = app.get('databaseUrl');

    query('CREATE TABLE IF NOT EXISTS users(id serial primary key, email text, password text, created timestamptz)');
    query('CREATE TABLE IF NOT EXISTS sites(id serial primary key, user_id serial, name text, options jsonb, updated timestamptz, created timestamptz)');
    query('CREATE TABLE IF NOT EXISTS parts(id serial primary key, site_id serial, type smallint, rank integer, content jsonb, created timestamptz)');

    render(res, {
      title: 'Database setup'
    });
  } else {
    res.redirect('/');
  }
});

/**
 * Database convert helper
 */

router.get('/converter', function(req, res) {
  if (!app.get('production')) {
    res.render('converter');
  } else {
    res.redirect('/');
  }
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