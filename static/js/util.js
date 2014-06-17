var posties = {};

posties.util = (function() {
    
    var trimText = function(str) {
        return str.trim()
                   .replace(/<br(\s*)\/*>/ig, '\n') // replace single line-breaks
                   .replace(/<[p|div]\s/ig, '\n$0') // add a line break before all div and p tags
                   .replace(/\t/g, '') // remove tabs
                   .replace(/(<([^>]+)>)/ig, "") //remove remaining HTML tags;
    };

    var isUserLoggedIn = function() {
        return $('head:eq(0)').hasClass('authenticated');
    }

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
    }

    var isPage = function(pageClass) {
      return $('body.' + pageClass).length;
    }

    return {
        trimText : trimText,
        isUserLoggedIn : isUserLoggedIn,
        getQueryParamByName : getQueryParamByName, 
        isPage : isPage
    };
}());

var swapItems = function(arr, a, b){
    arr[a] = arr.splice(b, 1, arr[a])[0];
    return arr;
}
Array.prototype.swapItems = function(a, b){
    this[a] = this.splice(b, 1, this[a])[0];
    return this;
}