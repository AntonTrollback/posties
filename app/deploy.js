var fs = require('fs');
var mime = require('mime');
var aws = require('aws-sdk');

var configFile = fs.readFileSync('s3config.json', 'utf8');
var config = configFile ? JSON.parse(configFile) : false;

if (!config) {
  return console.log('The S3 config file is missing');
}

aws.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region
});

var s3 = new aws.S3({signatureVersion: 'v4'});
var distDir = __dirname + '/../src/dist/';
var s3dir = 'assets/' + process.argv[2] + '/';
var fileList = getFileList(distDir);

console.log('Uploading to ' + config.bucket + '/' + s3dir);

fileList.forEach(function (name) {
  upload(name);
});

function upload (name) {
  var mimeType = mime.lookup(distDir + name);

  var params = {
    ACL: 'public-read',
    Bucket: config.bucket,
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