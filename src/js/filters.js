postiesApp.filter('safeYoutubeUrl', ['$sce', function($sce) {
  return function(sourceId) {
    return $sce.trustAsResourceUrl('//www.youtube.com/embed/' + sourceId + '?modestbranding=1&amp;showinfo=0&amp;showsearch=0&amp;rel=0');
  };
}]);

postiesApp.filter('fixName', ['$sce', function($sce) {
    console.log(config.headerJSON)
    if (!sourceId) { return '' };
    return sourceId.trim().replace(/ /g, '-');
  };
}]);

postiesApp.filter('fixImageUrl', ['$sce', function($sce) {
  return function(sourceId) {
    if (sourceId.indexOf('filepicker') > -1) {
      return sourceId + '/convert?cache=true&w=740&fit=max&rotate=exif&compress=true&quality=100';
    } else {
      return 'https://s3-eu-west-1.amazonaws.com/posties-images/' + sourceId;
    }
  };
}]);
