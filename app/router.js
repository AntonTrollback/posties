var _ = require('lodash');
var router = require('express').Router();
var app = require('./../app');
var user = require('./modules/user');
var site = require('./modules/site');
var part = require('./modules/part');

/**
 * Prepair requests
 */

var isSignedin;

router.use(function(req, res, next) {
  isSignedin = user.isSignedin(req);
  return next();
});

router.use(function(req, res, next) {
  var suffix = isSignedin ? ' (active user)' : ' '
  var log = req.method + ' ' + req.url + suffix;
  while (log.length <= 56) { log += '='; }
  console.log('\n==== ' + log);
  return next();
});

/**
 * Render helpers
 */

function renderPage (res, options) {
  var data = {
    assetUrl: app.get('assetUrl'),
    analyticsCode: app.get('analyticsCode'),
    activeUser: isSignedin
  }

  res.render('layout', _.assign(data, options));
}

function render404Page (res) {
  renderPage(res, {
    title: '404 - Posti.es',
    notFound: true
  });
}

function render505Page (error, res) {
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
  renderPage(res, {
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

// ------------------------------------------------------------------------ //

/**
 * API - register
 */

router.post('/api/register', function (req, res) {
  var input = {
    email: req.body.email,
    password: req.body.password
  }

  user.tryCreate(req, input, function(error, valid, id) {
    if (error) { return sendEndpointError(error, res); }
    if (valid && id) {
      return res.send({valid: valid, id: id});
    }

    res.send({valid: false, id: null});
  });
});

/**
 * API - sign in
 */

router.post('/api/signin', function (req, res) {
  var post = {
    email: req.body.email,
    password: req.body.password
  }

  user.trySignin(req, post, function(error, id) {
    if (error) { return sendEndpointError(error, res); }
    if (id) {
      return res.send({id: id});
    }

    res.send({id: null});
  });
});

/**
 * API - email availability
 */

router.post('/api/available-email', function (req, res) {
  var email = req.body.email;
  var result = {
    valid: true,
    available: null
  }

  if (!user.isValidEmail(email)) {
    result.valid = false;
    return res.send(result);
  }

  user.emailAvailability(email, function(error, status) {
    if (error) { return sendEndpointError(error, res); }
    result.available = status;
    res.send(result);
  });
});

/**
 * API - register and publish
 */

function handleSiteCreate (error, ownerId, input, result, res) {
  if (error) { return sendEndpointError(error, res); }

  // Make sure user was created or signed in
  if (ownerId) {
    input.site.ownerId = ownerId;
  } else {
    return res.send(result);
  }

  // Publish. Done
  site.create(input.site, function(error, name) {
    if (error) { return sendEndpointError(error, res); }
    if (name) { result.name = name; }
    res.send(result);
  });
}

router.post('/api/publish-with-user', function (req, res) {
  var input = {
    user: {
      email: req.body.email,
      password: req.body.password
    },
    site: {
      ownerId: null,
      name: req.body.name,
      options: {}
    }
  }

  var result = {
    validUser: user.isValid(input.user),
    validSite: site.isValidName(input.site.name),
    availableEmail: null,
    availableName: null,
    name: null
  }

  // Cancle if input is invalid
  if (!result.validUser || !result.validSite) {
    return res.send(result);
  }

  // Check if email is available
  user.emailAvailability(input.user.email, function(error, availableEmail) {
    if (error) { return sendEndpointError(error, res); }
    result.availableEmail = availableEmail;

    // Check if site name is available
    site.nameAvailability(input.site.name, function(error, availableName) {
      if (error) { return sendEndpointError(error, res); }
      result.availableName = availableName;

      // Cancle if site name isn't available
      if (!availableName) {
        return res.send(result);
      }
      // Signin or Signup
      if (availableEmail) {
        user.create(req, input.user, function(error, valid, ownerId) {
          handleSiteCreate(error, ownerId, input, result, res);
        });
      } else {
        user.trySignin(req, input.user, function(error, ownerId) {
          handleSiteCreate(error, ownerId, input, result, res);
        });
      }
    });
  });
});

/**
 * Sites
 */

router.get('/by/:name', function(req, res) {
  var name = req.params.name;

  site.getByName(name, function(error, row) {
    if (error) {
      render505Page(error, res);
    }

    if (!row) {
      render404Page(res);
    }

    console.log(row)

    renderPage(res, {
      title: name + ' · Posti.es',
      editMode: isSignedin ? user.isSignedinUserSiteOwner(req, row.owner_id) : false
      //parts: part.getBySiteId(row.id)
    });
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
  query('CREATE TABLE IF NOT EXISTS sites(id serial primary key, owner_id serial, name text, options jsonb, updated timestamptz, created timestamptz)');
  query('CREATE TABLE IF NOT EXISTS parts(id serial primary key, site_id serial, type smallint, rank integer, content jsonb, created timestamptz)');

  renderPage(res, {
    title: 'Database setup'
  });
});

router.get('/database/:table', function(req, res) {
  var query = require('pg-query');
  query.connectionParameters = app.get('databaseUrl');

  query('SELECT * FROM ' + req.params.table, function(error, rows, results) {
    if (error) { render505Page(error, res); return; }

    renderPage(res, {
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
    return render404Page(res);
  }

  if (req.accepts('json')) {
    return res.send({error: 'Not found'});
  }

  res.type('txt').send('Not found');
});

module.exports = router;