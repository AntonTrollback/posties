postiesApp.filter('getById', function () {
    return function (input, id) {
        var i = 0, len = input.length;
        for(; i < len; i++) {
            if(+input[i].id == +id) {
                var item = input[i];
                item['index'] = i;

                return item;
            }
        }
        
        return null;
    }
});
postiesApp.filter('safeYoutubeUrl', ['$sce',
  function($sce) {
    return function(sourceId) {
      return $sce.trustAsResourceUrl('//www.youtube.com/embed/' + sourceId);
    }
}]);