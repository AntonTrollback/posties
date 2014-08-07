var posties = {};

posties.util = (function() {
    
    var getQueryParamByName = function(parameterName) {
        var qs = (function(a) {
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i)
            {
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

    return {
        getQueryParamByName : getQueryParamByName,
        swapItems : swapItems
    };
}());