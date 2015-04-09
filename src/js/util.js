posties.util = (function() {
  'use strict';

  return {
    swapItems: function(arr, a, b) {
      arr[a] = arr.splice(b, 1, arr[a])[0];
      return arr;
    },

    stripTags: function(html) {
      return String(html).replace(/<[^>]+>/gm, '');
    },

    getYouTubeVideoID: function(input) {
      var params = '?modestbranding=1&amp;showinfo=0&amp;showsearch=0&amp;rel=0';
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

      var url = this.stripTags(input);
      var match = url.match(regExp);

      if (match && match[2].length == 11) {
        return match[2];
      }

      return false;
    }
  }
}());