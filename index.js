var express = require('express');
var mustacheExpress = require('mustache-express');
var app = express();
var fs = require('fs');
var compression = require('compression');
var Habitat = require('habitat');
var cssnext = require('cssnext');

// Setup environment
Habitat.load();
var env = new Habitat('posties');

console.log(env.get('env'))

app.set('port', (process.env.PORT || env.get('port') || 5000));

// Enable resource compression
app.use(compression());

// Configure mustache
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/ui/html');

// Setup static file directory
app.use(express.static(__dirname + '/public'));

/**
 * Parse CSS
 */

var styleInput = fs.readFileSync(__dirname + '/ui/css/index.css', 'utf8');
var styleOutput = cssnext(styleInput);

fs.writeFileSync(__dirname + '/public/index.css', styleOutput);

/**
 * Requests
 */

app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});

app.get('/', function(req, res) {
  res.render('layout', {
    title: 'Posti.es',
    description: 'Posti.es description ...',
    content: 'hello world'
  });
});