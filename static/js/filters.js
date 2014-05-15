var postiesApp = angular.module('posties', [], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

postiesApp.filter('getById', function () {
    return function (input, id) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (+input[i].id == +id) {
                var item = input[i];
                item['iteration'] = i;

                return item;
            }
        }
        return null;
    }
});