postiesApp.filter('fixName', ['$sce', function($sce) {
  'use strict';

  return function(sourceId) {
    if (!sourceId) { return ''; }
    return sourceId.trim()
                   .toLowerCase()
                   .replace(/[ _+]/g, '-') // replace stuff with hyphens
                   .replace(/^[-]+|[-]+$/g, '') // strip trailing hyphens
                   .replace(/[^a-zA-Z0-9-]/g, ''); // strip disallowed chars
  };
}]);

postiesApp.filter('safeYoutubeUrl', ['$sce', function($sce) {
  'use strict';

  return function(sourceId) {
    return $sce.trustAsResourceUrl('//www.youtube.com/embed/' + sourceId + '?modestbranding=1&amp;showinfo=0&amp;showsearch=0&amp;rel=0');
  };
}]);
