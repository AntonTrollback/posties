var Habitat = require('habitat');
var express = require('express');
var session = require('express-session');
var mustacheExpress = require('mustache-express');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Setup environment
Habitat.load();
var env = new Habitat();

// Setup express
var app = express();
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/dist'));

// Setup mustache template engine
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/src/html');

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// Parse application/json
app.use(bodyParser.json());
// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// Override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'));
// Enable resource compression
app.use(compression());

// Setup sessions
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// App settings
var production = env.get('env') === 'production';
var revision = env.get('revision');
var settings = {
  databaseUrl: env.get('databaseUrl'),
  production: production,
  revision: revision,
  assetUrl: production ? '//s3.eu-central-1.amazonaws.com/posties-master/assets/' + revision + '/' : '/',
  analyticsCode: production ? 'UA-50858987-1' : false
};

require(__dirname + '/app/routes.js')(app, settings);

// Start app
app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});