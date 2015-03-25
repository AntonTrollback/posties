posties.util = (function() {
  'use strict';

  var swapItems = function(arr, a, b) {
    arr[a] = arr.splice(b, 1, arr[a])[0];
    return arr;
  };

  // Get the YouTube video ID from a URL. Supports multiple YouTube URL types, such as embed and watch.
  // Will return false if the url parameter isn't a valid YouTube url
  var getYouTubeVideoID = function(url) {
    var params = '?modestbranding=1&amp;showinfo=0&amp;showsearch=0&amp;rel=0';
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[7].length === 11) {
      return match[7] + params;
    } else {
      return false;
    }
  };

  return {
    swapItems : swapItems,
    getYouTubeVideoID : getYouTubeVideoID
  };
}());