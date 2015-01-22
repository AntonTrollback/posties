var Habitat = require('habitat');
var express = require('express');
var mustacheExpress = require('mustache-express');
var compression = require('compression');

// Setup environment

Habitat.load();
var env = new Habitat();

var production = env.get('env') === 'production';
var revision = env.get('revision');

// Setup express

var app = express();
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/dist'));

// Enable resource compression

app.use(compression());

// Configure mustache

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/ui/html');


// Start page

app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});

app.get('/', function(req, res) {
  res.render('layout', {
    production: production,
    productionAssetUrl: '//s3.eu-central-1.amazonaws.com/posties-master/assets/' + revision,
    title: 'Posti.es',
    description: 'Posti.es description ...',
    content: 'hello world'
  });
});