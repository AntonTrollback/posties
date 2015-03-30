postiesApp.filter('fixName', ['$sce', function($sce) {
  'use strict';

  return function(sourceId) {
    if (!sourceId) { return ''; }
    return sourceId.trim().replace(/ /g, '-');
  };
}]);

postiesApp.filter('safeYoutubeUrl', ['$sce', function($sce) {
  'use strict';

  return function(sourceId) {
    return $sce.trustAsResourceUrl('//www.youtube.com/embed/' + sourceId + '?modestbranding=1&amp;showinfo=0&amp;showsearch=0&amp;rel=0');
  };
}]);
