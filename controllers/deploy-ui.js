var fs = require('fs');
var mime = require('mime');
var aws = require('aws-sdk');
var Habitat = require('habitat');

var srcDir = __dirname + '/../dist/';
var targetDir = 'assets/';

// Get aws keys and bucket info from .env file
Habitat.load();
var env = new Habitat();

aws.config.update({
  accessKeyId: env.get('accessKeyId'),
  secretAccessKey: env.get('secretAccessKey'),
  region: env.get('region')
});

// Version 4 is needed for region eu-central-1 (Frankfurt)
var s3 = new aws.S3({signatureVersion: 'v4'});

// Upload files
getFileList(srcDir).forEach(function(fileName) {
  uploadFile(fileName);
});

function uploadFile (fileName) {
  var options = {
    ACL: 'public-read',
    Bucket: env.get('bucket'),
    Key: targetDir + fileName,
    Body: fs.readFileSync(srcDir + fileName),
    ContentType: mime.lookup(srcDir + fileName),
    CacheControl: 'public, max-age=31377926' // a year
  };

  s3.putObject(options, function(error, response) {
    if (error) {
      console.log('Failed to upload ' + fileName + ' to ' + targetDir);
      console.log(error);
    } else {
      console.log('Uploaded ' + fileName + ' to ' + targetDir);
    }
  });
}

function getFileList(path) {
  var fileInfo;
  var filesFound;
  var fileList = [];
  filesFound = fs.readdirSync(path);

  for (var i = 0; i < filesFound.length; i++) {
    fileInfo = fs.lstatSync(path + filesFound[i]);
    if (fileInfo.isFile()) fileList.push(filesFound[i]);
  }

  return fileList;
}