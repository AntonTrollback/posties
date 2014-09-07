var posties = {};

posties.util = (function() {
    
    var getQueryParamByName = function(parameterName) {
        var qs = (function(a) {
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i) {
                var p=a[i].split('=');
                if (p.length != 2) continue;
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }

            return b;
        })(window.location.search.substr(1).split('&'));

        return qs[parameterName];
    };

    var swapItems = function(arr, a, b) {
        arr[a] = arr.splice(b, 1, arr[a])[0];
        return arr;
    };

    var getBase64Image = function(img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to guess the
        // original format, but be aware the using "image/jpg" will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");

        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    };

    var uploadToS3 = function(jsonPost) {
        var s3upload = new S3Upload({
            s3_object_name: jsonPost.key,
            s3_file: jsonPost.file,
            onProgress: function(percent, message) {
                console.log('Upload progress: ' + percent + '% ' + message);
            },
            onFinishS3Put: function(url) {
                console.log('Upload completed. Uploaded to: ' + url);
                if(redirectUser) {
                    forwardToUserPage();    
                }
            },
            onError: function(status) {
                console.log('Upload error: ' + status);
            }
        });
    };

    return {
        getQueryParamByName : getQueryParamByName,
        swapItems : swapItems,
        getBase64Image : getBase64Image,
        uploadToS3 : uploadToS3
    };
}());