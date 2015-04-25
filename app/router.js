var _ = require('lodash');
var router = require('express').Router();
var bcrypt = require('bcrypt');
var app = require('./../app');
var validator = require('./validator');
var user = require('./user');
var site = require('./site');
var part = require('./part');

/**
 * Middleware
 */

/* Detect if signed in */

var isActive;

router.use(require('express-subdomain-handler')({ baseUrl: app.get('domain'), prefix: 'site', logger: false}));

router.use(function(req, res, next) {
  isActive = user.isActive(req);
  return next();
});

/* Log request */

router.use(function(req, res, next) {
  if (!app.get('production')) {
    var suffix = isActive ? ' (active user)' : ' '
    var log = req.method + ' ' + req.url + suffix;
    while (log.length <= 56) { log += '='; }
    console.log('\n==== ' + log);
  }
  return next();
});

/**
 * Render helpers
 */

function render (res, options) {
  var always = {
    production: app.get('production'),
    activeUser: isActive,
    revision: app.get('revision'),
    angularCtrl: 'StaticCtrl',
    defaultSiteDataString: JSON.stringify(site.default)
  };

  res.render('layout', _.assign(always, options));
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
 * Startpage
 */

router.get('/', function(req, res) {
  render(res, {
    index: true,
    editMode: true,
    angularCtrl: 'IndexCtrl'
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
  var name = req.params.name.trim();
  var port = app.get('production') ? '' : ':' + app.get('port');

  if (validator.isName(name)) {
    res.redirect('http://' + app.get('domain') + port + '/site/' + name);
  } else {
    res.redirect('http://' + name +  '.' + app.get('domain') + port);
  }
});

router.get('/site/:name', function(req, res) {
  var name = req.params.name;

  site.getComplete(name, function (error, siteData) {
    if (error) { return render505(error, res); }
    if (!siteData) { return render404(res); }

    siteData.isAuthenticated = user.isActiveOwner(req, siteData.user_id);

    render(res, {
      onSite: true,
      editMode: siteData.isAuthenticated,
      siteData: siteData,
      siteDataString: JSON.stringify(siteData),
      angularCtrl: 'UserCtrl'
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

/**
 * Dev tool
 */

router.get('/fixpasswordsplsdontuse', function(req, res) {  
  var query = require('pg-query');
  query.connectionParameters = app.get('databaseUrl');

  query('SELECT * FROM users', function(error, rows) {
    rows.forEach(function (user) {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(user.password, salt);

      query('UPDATE users SET password = ($1) WHERE id = ($2)', [hash, user.id]);     
    });
  });

  render(res, {
    title: 'fixpasswords'
  });

});

/* -------------------------------------------------------------------------- */

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
