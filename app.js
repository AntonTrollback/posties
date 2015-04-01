var Habitat = require('habitat').load();
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var handlebars = require('express-handlebars');
var favicon = require('serve-favicon');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var env = new Habitat();
var app = module.exports = express();

app.set('port', env.get('port'));
app.set('databaseUrl', env.get('databaseUrl'));
app.set('redisUrl', env.get('rediscloudUrl'));
app.set('production', env.get('env') === 'production');
app.set('revision', env.get('revision'));
app.set('views', 'src/html');
app.set('view engine', 'html');

app.use(express.static('src'));
app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(favicon('./favicon.ico'));

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
app.enable('view cache');

/**
 * Setup sessions
 */

app.use(session({
  store: new RedisStore({
    client: require('redis-url').connect(app.get('redisUrl'))
  }),
  secret: 'hurricane',
  resave: false,
  saveUninitialized: true,
  maxAge: 7 * 24 * 60 * 60 * 1000 // one week
}));

/**
 * Start app
 */

app.use(require('./app/router'));

app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});