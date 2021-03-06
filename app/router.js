var _ = require('lodash');
var cors = require('cors');
var router = require('express').Router();
var bcrypt = require('bcrypt');
var validator = require('./validator');
var user = require('./user');
var site = require('./site');
var part = require('./part');
var config = require('./config');

/**
 * Middleware
 */

/* Detect if signed in */

var isActive = false;

router.use(function(req, res, next) {
  isActive = user.isActive(req);
  return next();
});

/* Fix cors */

router.use(cors({credentials: true, origin: true}));

/* Setup subdomain helper */

router.use(require('express-subdomain-handler')({
  baseUrl: config.domain,
  prefix: 'site',
  logger: false
}));

/* Redirect to https */

router.use(function(req, res, next) {
  if (!req.secure && config.prod) {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  return next();
});

/* Log requests */

if (!config.prod) {
  router.use(function(req, res, next) {
    var suffix = isActive ? ' (active user)' : ' '
    var log = req.method + ' ' + req.url + suffix;
    while (log.length <= 56) { log += '='; }
    console.log('\n==== ' + log);

    return next();
  });
}

/**
 * Render helpers
 */

function render (res, options) {
  var always = {
    prod: config.prod,
    domain: config.domainAndPort,
    activeUser: isActive,
    revision: config.revision,
    angularCtrl: 'StaticCtrl',
    defaultSiteDataString: JSON.stringify(site.default)
  };

  res.render('layout', _.assign(always, options));
}

function render404 (res) {
  render(res, {
    title: '404 - Posti.es',
    notFound: true,
    notOnByePage: true,
    onByePage: false
  });
}

function render505 (error, res) {
  console.trace(error);
  render(res, {
    title: 'Sorry, server error. We\'re on it!',
    serverError: true,
    notOnByePage: true,
    onByePage: false
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
    notOnByePage: true,
    onByePage: false,
    defaultSiteData: site.default,
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

  if (validator.isName(name)) {
    res.redirect(301, config.protocolPrefix + name +  '.' + config.domainAndPort);
  } else {
    res.redirect(301, config.protocolPrefix + 'www.' + config.domainAndPort + '/site/' + name);
  }
});

router.get('/by/:name/*', function(req, res) {
  res.redirect('/by/' + req.params.name);
});

router.get('/site/:name', function(req, res) {
  var name = req.params.name;

  site.getComplete(name, function (error, siteData) {
    if (error) { return render505(error, res); }
    if (!siteData) { return render404(res); }

    siteData.isAuthenticated = user.isActiveOwner(req, siteData.user_id);

    var notOnByePage = (name !== 'bye') ? true : false;

    render(res, {
      onSite: true,
      editMode: siteData.isAuthenticated,
      siteData: siteData,
      siteDataString: JSON.stringify(siteData),
      angularCtrl: 'UserCtrl',
      notOnByePage: notOnByePage,
      onByePage: !notOnByePage
    });
  })
});

router.get('/site/:name/*', function(req, res) {
  return res.redirect(config.protocolPrefix + req.get('host'));
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
 * File for Let's Encrypt
 */

router.get('/.well-known/acme-challenge/H1VLsl1X-8yRSFK1_hCEtde2SZBVB5uoemjHmtybZwA', function (req, res) {
  send(res, 'H1VLsl1X-8yRSFK1_hCEtde2SZBVB5uoemjHmtybZwA.XbQxKZF37gnB_cjPaUlNmo-Hs2B_5RTX3VdtegIVyjw');
});

/* -------------------------------------------------------------------------- */

/**
 * Pre-flight/promise requests
 */

router.options('*', cors({credentials: true, origin: true}));

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
