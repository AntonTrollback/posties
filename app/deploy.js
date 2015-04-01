var fs = require('fs');
var mime = require('mime');
var aws = require('aws-sdk');
var Habitat = require('habitat').load();

var env = new Habitat();
var revision = process.argv[2];

var bucket = 'posties-stuff';
var region = 'eu-west-1';
var accessKeyId = env.get('accessKeyId');
var secretAccessKey = env.get('secretAccessKey');

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

var s3 = new aws.S3({signatureVersion: 'v4'});
var distDir = __dirname + '/../src/dist/';
var s3dir = 'assets/' + revision + '/';
var fileList = getFileList(distDir);

console.log('Uploading to ' + bucket + '/' + s3dir);

fileList.forEach(function (name) {
  upload(name);
});

function upload (name) {
  var mimeType = mime.lookup(distDir + name);

  var params = {
    ACL: 'public-read',
    Bucket: bucket,
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