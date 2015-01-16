var fs = require('fs');
var Habitat = require('habitat');
var express = require('express');
var mustacheExpress = require('mustache-express');
var compression = require('compression');
var _ = require('lodash');
var cssnext = require('cssnext');

// Setup environment
Habitat.load();
var env = new Habitat();

// Setup express
var app = express();
var root = __dirname;
app.set('port', process.env.PORT || 5000);
app.use(express.static(root + '/public'));

// Enable resource compression
app.use(compression());

// Configure mustache
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', root + '/ui/html');

/**
 * Parse CSS
 */

var input = fs.readFileSync(root + '/ui/css/index.css', 'utf8');
var output = cssnext(input);

fs.writeFileSync(root + '/public/index.css', output);

/**
 * Requests
 */

app.listen(app.get('port'), function() {
  console.log('Running at localhost:' + app.get('port'));
});

app.get('/', function(req, res) {
  res.render('layout', {
    production: env.get('env') === 'production',
    title: 'Posti.es',
    description: 'Posti.es description ...',
    content: 'hello world'
  });
});