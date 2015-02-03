module.exports = function(app, settings) {

  var utils = require(__dirname + '/../app/utils.js')(app, settings);
  var database = require(__dirname + '/../app/database.js')(app, settings);

  // Start page

  app.get('/', function(req, res) {
    utils.renderPage(res, {
      content: 'Index'
    });
  });

  // User edit page

  app.get('/edit', utils.checkAuth, function (req, res) {
    utils.renderPage(res, {
      title: req.session.website_name,
      content: 'Edit page: ' + req.session.website_name
    });
  });

  app.post('/create_user', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (email && password) {
      database.createUser(user, function(error, data) {
        if (error) {
          console.log(error);
          res.send('Uups, DB problem');
          return;
        } else {
          res.send('Success! User created');
        }
      });
    } else {
      res.send('Bad input');
    }
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