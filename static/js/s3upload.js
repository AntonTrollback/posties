var S3Upload = (function() {
    
    this.onFinishS3Put = function(public_url) {
      return console.log('base.onFinishS3Put()', public_url);
    };

    this.onProgress = function(percent, status) {
      return console.log('base.onProgress()', percent, status);
    };

    this.onError = function(status) {
      return console.log('base.onError()', status);
    };

    this.S3Upload = function(options) {
      onFinishS3Put = options['onFinishS3Put'];
      onProgress = options['onProgress'];
      onError = options['onError'];

      uploadFile(options['s3_file'], options['s3_object_name']);
    };

    this.createCORSRequest = function(method, url) {
      var xhr;
      xhr = new XMLHttpRequest();
      if (xhr.withCredentials !== null) {
        xhr.open(method, url, true);
      } else if (typeof XDomainRequest !== "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else {
        xhr = null;
      }
      return xhr;
    };

    this.executeOnSignedUrl = function(file, object_name, callback) {
      var xhr;
      xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/sign_upload_url' + '?s3_object_type=' + file.type + '&s3_object_name=' + object_name, true);
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
      xhr.onreadystatechange = function(e) {
        var result;
        if (this.readyState === 4 && this.status === 200) {
          try {
            result = JSON.parse(this.responseText);
          } catch (error) {
            onError('Signing server returned some ugly/empty JSON: "' + this.responseText + '"');
            return false;
          }
          return callback(decodeURIComponent(result.signed_request), result.url);
        } else if (this.readyState === 4 && this.status !== 200) {
          return onError('Could not contact request signing server. Status = ' + this.status);
        }
      };
      return xhr.send();
    };

    this.uploadToS3 = function(file, url, public_url) {
      xhr = createCORSRequest('PUT', url);
      console.log(url);
      if (!xhr) {
        onError('CORS not supported');
      } else {
        xhr.onload = function() {
          if (xhr.status === 200) {
            onProgress(100, 'Upload completed.');
            return onFinishS3Put(public_url);
          } else {
            return onError('Upload error: ' + xhr.status);
          }
        };
        xhr.onerror = function() {
          return onError('XHR error.');
        };
        xhr.upload.onprogress = function(e) {
          var percentLoaded;
          if (e.lengthComputable) {
            percentLoaded = Math.round((e.loaded / e.total) * 100);
            return onProgress(percentLoaded, percentLoaded === 100 ? 'Finalizing.' : 'Uploading.');
          }
        };
      }
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.setRequestHeader('x-amz-acl', 'public-read');
      return xhr.send(file);
    };

    this.uploadFile = function(file, object_name) {
      return executeOnSignedUrl(file, object_name, function(signedURL, publicURL) {
        return uploadToS3(file, signedURL, publicURL);
      });
    };

    return S3Upload;

})();