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

if(!String.linkify) {
  String.prototype.linkify = function() {
    // http://, https://, ftp://
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Email addresses
    var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

    return this
        .replace(/(<([^>]+)>)/ig, "") //Replace all HTML tags
        .replace(urlPattern, '<a href="$&">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
  };
}