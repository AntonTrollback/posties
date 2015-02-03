var fs = require('fs');
var cssnext = require('cssnext');

var distDir = __dirname + '/../dist';
var compress = process.argv[2] === 'compress';

// Empty dist folder

deleteFolderRecursive(distDir);
fs.mkdirSync(distDir);

// Compile CSS

var CSSinput = fs.readFileSync(__dirname + '/../src/css/index.css', 'utf8');
var CSSoutput = cssnext(CSSinput, {compress: compress});
fs.writeFileSync(distDir + '/index.css', CSSoutput);

console.log('√ CSS');

// Compile JS
// console.log('√ JS');

// Copy images and fonts
// console.log('√ Copy files');

if (compress) {
  console.log('√ Compress');
}

// Helper

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file,index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};