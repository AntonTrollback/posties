var fs = require('fs');
var mime = require('mime');
var aws = require('aws-sdk');
var Habitat = require('habitat');
var revision = process.argv[2];

Habitat.load();
var env = new Habitat();

aws.config.update({
  accessKeyId: env.get('accessKeyId'),
  secretAccessKey: env.get('secretAccessKey'),
  region: env.get('region')
});

var s3 = new aws.S3({signatureVersion: 'v4'});
var distDir = __dirname + '/../dist/';
var s3dir = 'assets/' + revision + '/';
var fileList = getFileList(distDir);

console.log('Uploading to ' + env.get('bucket') + '/' + s3dir);

fileList.forEach(function (name) {
  upload(name);
});

function upload (name) {
  var mimeType = mime.lookup(distDir + name);

  var params = {
    ACL: 'public-read',
    Bucket: env.get('bucket'),
    Key: s3dir + name,
    ContentType: mime.lookup(distDir + name),
    Body: fs.readFileSync(distDir + name, 'utf8'),
    CacheControl: 'public, max-age=31377926' // a year
  };

  s3.putObject(params, function(error, resp) {
    if (error) {
      console.log('Failed to upload ' + name);
      console.trace(error);
    } else {
      console.log('- ' + name + ' (' + mimeType + ')');
    }
  });
}

function getFileList(path) {
  var fileInfo;
  var fileList = [];
  var filesFound = fs.readdirSync(path);

  filesFound.forEach(function(item) {
    fileInfo = fs.lstatSync(path + item);

    if (fileInfo.isFile()) {
      fileList.push(item);
    }
  });

  return fileList;
}