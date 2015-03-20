var posties = {};

posties.util = (function() {
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

  var getArrayIndexBy = function(arr, name, value) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][name] == value) {
        return i;
      }
    }
  };

  // Get the YouTube video ID from a URL. Supports multiple YouTube URL types, such as embed and watch.
  // Will return false if the url parameter isn't a valid YouTube url
  var getYouTubeVideoID = function(url) {
    var params = '?modestbranding=1&amp;showinfo=0&amp;showsearch=0&amp;rel=0';
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if(match&&match[7].length==11) {
      return match[7] + params;
    } else {
      return false;
    }
  };

  return {
    swapItems : swapItems,
    getBase64Image : getBase64Image,
    getArrayIndexBy : getArrayIndexBy,
    getYouTubeVideoID : getYouTubeVideoID
  };
}());
