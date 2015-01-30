var _ = require('lodash')
var Habitat = require('habitat');
var express = require('express');
var session = require('express-session');
var mustacheExpress = require('mustache-express');
var compression = require('compression');
var bodyParser = require('body-parser')

// Setup environment

Habitat.load();
var env = new Habitat();

// Setup express

var app = express();
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/dist'));

// Setup sessions

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// to support JSON-encoded and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Enable resource compression

app.use(compression());

// Configure mustache

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/ui/html');

// App options

var production = env.get('env') === 'production';
var revision = env.get('revision');
var assetUrl = production ? '//s3.eu-central-1.amazonaws.com/posties-master/assets/' + revision + '/' : '/';
var analyticsCode = production ? 'UA-50858987-1' : false;

// -------------------------------------------------------------------------- //

// Check if the user is authenticated

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

function renderPage(res, options) {
  var data = {
    assetUrl: assetUrl,
    analyticsCode: analyticsCode,
    title: 'Posti.es',
    description: 'Posti.es description ...',
    content: 'hello world',
  }

  res.render('layout', _.assign(data, options));
}

// Start page

app.get('/', function(req, res) {
  renderPage(res, {
    content: 'Index'
  });
});

// User edit page

app.get('/edit', checkAuth, function (req, res) {
  renderPage(res, {
    title: req.session.website_name,
    content: 'Edit page: ' + req.session.website_name
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
    renderPage(res, {
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

// Start app

app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});