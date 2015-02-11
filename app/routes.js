var _ = require('lodash');

module.exports = function(app, settings) {

  var utils = require(__dirname + '/../app/utils.js')(app, settings);
  var database = require(__dirname + '/../app/database.js')(app, settings);

  // Start page

  app.get('/', function(req, res) {
    utils.renderPage(res, {
      index: true,
      inEditMode: true,
      title: 'Posti.es',
      description: 'The posties description ...'
    });
  });

  // Dump database

  app.get('/database', function(req, res) {
    database.dumpDatabase(function(error, data) {
      if (error) { utils.renderErrorPage(res, error); return; }

      utils.renderPage(res, {
        title: 'Database dump',
        dump: JSON.stringify(data)
      });
    });
  });

  // Sign up

  app.post('/signup', function (req, res) {
    var user = {
      email: req.body.email,
      password: req.body.password
    }

    if (!utils.validUserSignupData(user)) {
      res.send('Bad input');
      return;
    }

    database.createUser(user, function(error, data) {
      if (error) { utils.sendEndpointError(res, error); return; }
      res.send(data);
    });
  });

  // Sign in

  app.post('/signin', function (req, res) {
    var post = req.body;

    if (post.email === 'anton' && post.password === 'pw') {
      req.session.user_id = 'someid12341234';
      req.session.website_name = 'antons sajt';
      res.redirect('/edit');
    } else {
      res.send('Bad user/pass');
    }
  });

  // Sign out

  app.get('/signout', function (req, res) {
    delete req.session.user_id;
    res.redirect('/');
  });

  // 404 page

  app.use(function(req, res, next){
    res.status(404);

    if (req.accepts('html')) {
      utils.renderPage(res, {
        title: '404 - Posti.es',
        content: '404'
      });
    } else if (req.accepts('json')) {
      res.send({
        error: 'Not found'
      });
    } else {
      res.type('txt').send('Not found');
    }
  });
};