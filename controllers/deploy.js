var fs = require('fs');
var mime = require('mime');
var aws = require('aws-sdk');
var Habitat = require('habitat');

// Setup s3

Habitat.load();
var env = new Habitat();

aws.config.update({
  accessKeyId: env.get('accessKeyId'),
  secretAccessKey: env.get('secretAccessKey'),
  region: env.get('region')
});

var s3 = new aws.S3({signatureVersion: 'v4'});

// Upload

var fileList = getFileList(distDir);
var distDir = __dirname + '/../dist/';
var s3dir = 'assets/';

fileList.forEach(function (file) {
  upload(file);
});

function upload (name) {
  var params = {
    ACL: 'public-read',
    Bucket: env.get('bucket'),
    Key: s3dir + name,
    ContentType: mime.lookup(distDir + name),
    Body: fs.readFileSync(distDir + name, 'utf8');
    CacheControl: 'public, max-age=31377926' // a year
  };

  s3.putObject(params, function(error, response) {
    if (error) {
      console.log('Failed to upload ' + name + ' to ' + s3dir);
      console.log(error);
    } else {
      console.log('Uploaded ' + name + ' to ' + s3dir);
    }
  });
}

// Helper

function getFileList(path) {
  var fileInfo;
  var fileList = [];
  var filesFound = fs.readdirSync(path);

  for (var i = 0; i < filesFound.length; i++) {
    fileInfo = fs.lstatSync(path + filesFound[i]);

    if (fileInfo.isFile()) {
      fileList.push(filesFound[i]);
    }
  }

  return fileList;
}