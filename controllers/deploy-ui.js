var _ = require('lodash');
var fs = require('fs');
var mime = require('mime');
var zlib = require('zlib');
var aws = require('aws-sdk');
var Habitat = require('habitat');

var distDir = __dirname + '/../dist/';
var s3dir = 'assets/';

// Setup aws with keys and bucket info from .env file

Habitat.load();
var env = new Habitat();

aws.config.update({
  accessKeyId: env.get('accessKeyId'),
  secretAccessKey: env.get('secretAccessKey'),
  region: env.get('region')
});

// Version 4 is needed for region eu-central-1 (Frankfurt)
var s3 = new aws.S3({signatureVersion: 'v4'});

// Get list of files to upload

var fileList = getFileList(distDir);

// Gzip

var gzipTargets = ['js', 'css', 'html', 'json', 'svg', 'ico', 'eot', 'otf', 'ttf'];
var gzipped = [];

fileList.forEach(function(name) {
  var extension = name.split('.').pop();

  if (_.indexOf(gzipTargets, extension) === -1) {
    return;
  }

  gzipped.push(name);

  var content = fs.readFileSync(distDir + name);

  zlib.gzip(content, function(err, compressed) {
    fs.writeFileSync(distDir + name + '.gz', compressed);
    fs.unlinkSync(distDir + name);
    fs.renameSync(distDir + name + '.gz', distDir + name);
  });

  gzipped.push(name);
});

// Upload

fileList.forEach(function (file) {
  prepair(file);
});

function prepair (name) {
  fs.readFile(distDir + name, "utf8", function (err, data) {
    var options = {
      ACL: 'public-read',
      Bucket: env.get('bucket'),
      Key: s3dir + name,
      Body: data,
      ContentType: mime.lookup(distDir + name),
      CacheControl: 'public, max-age=31377926' // a year
    };

    if (_.indexOf(gzipped, name) > -1) {
      options['ContentEncoding'] = 'gzip';
    }

    upload(options, name)
  });
}

function upload (options, name) {
  s3.putObject(options, function(error, response) {
    if (error) {
      console.log('Failed to upload ' + name + ' to ' + s3dir);
      console.log(error);
    } else {
      console.log('Uploaded ' + name + ' to ' + s3dir);
    }
  });
}

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