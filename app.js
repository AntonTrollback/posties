var Habitat = require('habitat');
var express = require('express');
var redis = require('redis-url').connect();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var mustacheExpress = require('mustache-express');
var favicon = require('serve-favicon');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

Habitat.load();
var env = new Habitat();
var app = module.exports = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('dist'));

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', 'src/html');

app.use(compression());
app.use(favicon('./favicon.ico'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

// Setup session
app.use(session({
  store: new RedisStore(),
  secret: 'hurricane',
  resave: false,
  saveUninitialized: true,
  maxAge: 7 * 24 * 60 * 60 * 1000 // one week
}));

// App settings
var production = env.get('env') === 'production';
var revision = env.get('revision');
var s3url = '//s3-' + env.get('region') + '.amazonaws.com/' + env.get('bucket') + '/';
var fonts = ['Akkurat', 'Josefin Sans', 'Dosis', 'Karla', 'Archivo Narrow', 'Inconsolata', 'Anonymous Pro', 'Text Me One', 'Lora', 'Neuton', 'Old Standard TT', 'EB Garamond', 'Arvo', 'Fredoka One', 'VT323', 'Nova Cut', 'Reenie Beanie'];
var colors = {
  background: ['#f5f5f5', '#ffffff', '#000000', '#bbf8ff', '#405559', '#512d59', '#ff033e', '#ff8f8f'],
  text: ['#000000', '#ffffff']
}

app.set('production', production);
app.set('revision', revision);
app.set('databaseUrl', env.get('databaseUrl'));
app.set('assetUrl', production ? s3url + 'assets/' + revision + '/' : '/');
app.set('analyticsCode', production ? 'UA-50858987-1' : false);
app.set('fonts', fonts);
app.set('colors', colors);
app.set('filePickerKey', 'AB0n3LvCeQhusW_h15bE5z');
app.set('defaultSiteData', {
  id: null,
  name: null,
  isAuthenticated: false,
  options: {
    boxes: true,
    text_font: 'Akkurat',
    text_color: '#141414',
    heading_font: 'Akkurat',
    background_color: '#f5f5f5',
    part_background_color: '#ffffff'
  },
  parts: [{
    id: null,
    rank: 0,
    type: 0,
    //typeText: true,
    content: {
      text: "<p>Hello</p><p class=\"focus\">I'm a text that you can edit</p><p><br></p><p>Add images and texts until you're happy.</p><p>Then publish your new website!</p><p><br></p><p>Customize your design by hitting the sliders in the top right corner.</p>"
    }
  }]
});

app.use(require('./app/router'));

// Start app
app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});