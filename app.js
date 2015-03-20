var Habitat = require('habitat');
var express = require('express');
var session = require('express-session');
var mustacheExpress = require('mustache-express');
var favicon = require('serve-favicon');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');

Habitat.load();
var env = new Habitat();

var app = module.exports = express();
app.set('port', process.env.PORT || 5000);

app.use(express.static('dist'));

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', 'src/html');

app.use(favicon('./favicon.ico'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(compression());

app.use(session({
  secret: 'hurricane',
  resave: false,
  saveUninitialized: true
}));

// App settings
var production = env.get('env') === 'production';
var revision = env.get('revision');
var s3url = '//s3.' + env.get('region') + '.amazonaws.com/' + env.get('bucket') + '/assets/' + revision + '/';
var fonts = ['Akkurat', 'Josefin Sans', 'Dosis', 'Karla', 'Archivo Narrow', 'Inconsolata', 'Anonymous Pro', 'Text Me One', 'Lora', 'Neuton', 'Old Standard TT', 'EB Garamond', 'Arvo', 'Fredoka One', 'VT323', 'Nova Cut', 'Reenie Beanie'];

app.set('production', production);
app.set('revision', revision);
app.set('databaseUrl', env.get('databaseUrl'));
app.set('assetUrl', production ? s3url : '/');
app.set('analyticsCode', production ? 'UA-50858987-1' : false);
app.set('fonts', fonts);
app.set('filePickerKey', 'AB0n3LvCeQhusW_h15bE5z');

app.use(require('./app/router'));

// Start app
app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});