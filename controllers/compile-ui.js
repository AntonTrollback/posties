var fs = require('fs');
var cssnext = require('cssnext');
var compress = process.argv[2] === 'compress';
var distDir = __dirname + '/../dist';

// Empty dist folder
deleteFolderRecursive(distDir);
fs.mkdirSync(distDir);

// Compile CSS
var CSSinput = fs.readFileSync(__dirname + '/../ui/css/index.css', 'utf8');
var CSSoutput = cssnext(CSSinput, {compress: compress});
fs.writeFileSync(distDir + '/index.css', CSSoutput);

console.log('√ CSS');

// Compile JS
// ...
// console.log('√ JS');

// Copy images and fonts
// ...
// console.log('√ Copy files');

if (compress) {
  console.log('√ Compress');
}

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