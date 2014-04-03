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
        return $('body:eq(0)').hasClass('authenticated');
    }

    return {
        trimText : trimText,
        isUserLoggedIn : isUserLoggedIn
    };
}());