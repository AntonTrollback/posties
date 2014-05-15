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

if(!String.linkify) {
  String.prototype.linkify = function() {

    var htmlTagsPattern = /(<([^>]+)>)/ig;

    // http://, https://, ftp://
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Email addresses
    var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

    var newlinePattern = /<br\s*[\/]?>/gi;

    return this
        .replace(newlinePattern, "\n")
        .replace(htmlTagsPattern, "")
        .replace(urlPattern, '<a href="$&">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
  };
}

var swapItems = function(arr, a, b){
    arr[a] = arr.splice(b, 1, arr[a])[0];
    return arr;
}