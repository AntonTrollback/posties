var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var handlebars = require('express-handlebars');
var compression = require('compression');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var config = require('./app/config');

var app = module.exports = express();

app.set('views', 'src/html');
app.set('view engine', 'html');

app.use(express.static('src'));
app.use(compression());
app.use(favicon('./favicon.ico'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

/**
 * Setup Handlebars view engine
 */

var hb = handlebars.create({
  extname: '.html',
  layoutsDir: 'src/html',
  partialsDir: 'src/html',
  defaultLayout: 'layout'
});

app.engine('html', hb.engine);

/**
 * Setup sessions
 */

var days = 30;
var store = new RedisStore({
  client: require('redis-url').connect(config.redisUrl)
});

app.use(session({
  store: store,
  secret: 'hurricane',
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: config.prod,
    domain: config.domainAndPort,
    maxAge: days * 24 * 60 * 60 * 1000
  }
}));

/**
 * Start app
 */

app.use(require('./app/router'));

app.listen(config.port, function() {
  console.log('Running at ' + config.domainAndPort);
});