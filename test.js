(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['account-window.html'] = template({"1":function(depth0,helpers,partials,data) {
    return "        <div class=\"popover-body\">\n          <form class=\"popover-form\" name=\"formLogin\" method=\"post\" ng-submit=\"authService.submitLogin()\">\n            <span class=\"popover-form-title\">Sign in</span>\n            <input type=\"text\" name=\"username\" placeholder=\"Website address\" required autocapitalize=\"off\" autocorrect=\"off\">\n            <input type=\"password\" name=\"password\" placeholder=\"Password\" required autocapitalize=\"off\" autocorrect=\"off\">\n            <button class=\"button is-full\">OK</button>\n            <a class=\"popover-form-link\">Forgot password?</a>\n          </form>\n        </div>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, buffer = "";

  stack1 = ((helper = (helper = helpers.editMode || (depth0 != null ? depth0.editMode : depth0)) != null ? helper : alias1),(options={"name":"editMode","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.editMode) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helper = (helper = helpers.editMode || (depth0 != null ? depth0.editMode : depth0)) != null ? helper : alias1),(options={"name":"editMode","hash":{},"fn":this.noop,"inverse":this.program(6, data, 0),"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.editMode) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "          <div class=\"popover-body\">\n            <p class=\"popover-intro\">You are currenty editing <strong>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong></p>\n          </div>\n          <a class=\"panel-item is-first is-underlined\" href=\"/logout\">\n            <span class=\"panel-item-text is-padded\">Sign out</span>\n          </a>\n";
},"6":function(depth0,helpers,partials,data) {
    return "          <div class=\"popover-body\">\n            <p class=\"popover-intro\">This website is created with <a href=\"http://posti.es\">Posti.es</a> – a free service so simple, even your parents can use it</p>\n            <a class=\"button popover-intro-button\" href=\"/\">Create a website</a>\n          </div>\n          <a class=\"panel-item is-first\" data-go-to-panel=\"panelLogin\">\n            <span class=\"panel-item-text is-padded\">Edit this website</span>\n            <div class=\"panel-item-icon\"><svg role=\"presentation\"><use xlink:href=\"#arrow-right\"></use></svg></div>\n          </a>\n";
},"8":function(depth0,helpers,partials,data) {
    return "target=\"_blank\"";
},"10":function(depth0,helpers,partials,data) {
    return "is-first";
},"12":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.editMode || (depth0 != null ? depth0.editMode : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"editMode","hash":{},"fn":this.noop,"inverse":this.program(13, data, 0),"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.editMode) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"13":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "        <div class=\"panel\" id=\"panelLogin\">\n          <div class=\"popover-header\">\n            <button class=\"button\" data-go-to-panel=\"panelPrimaryNavigation\">\n              <svg role=\"presentation\"><use xlink:href=\"#arrow-left\"></use></svg> Back\n            </button>\n          </div>\n\n          <div class=\"popover-body\">\n            <form class=\"popover-form\" name=\"formLogin\" method=\"post\" ng-submit=\"authService.submitLogin()\">\n              <span class=\"popover-form-title\">Edit this website</span>\n              <input type=\"hidden\" name=\"username\" value=\""
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\">\n              <input type=\"password\" name=\"password\" placeholder=\"Password\" required autocapitalize=\"off\" autocorrect=\"off\">\n              <button class=\"button is-full\">OK</button>\n              <a class=\"popover-form-link\">Forgot password?</a>\n            </form>\n          </div>\n        </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, buffer = 
  "<nav class=\"popover is-nav js-window\" id=\"account\">\n  <div class=\"popover-arrow\"><svg role=\"presentation\"><use xlink:href=\"#popover-arrow\"></use></svg></div>\n  <div class=\"panels\">\n    <div class=\"panel is-active\" id=\"panelPrimaryNavigation\">\n";
  stack1 = ((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias1),(options={"name":"index","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.index) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helper = (helper = helpers.site || (depth0 != null ? depth0.site : depth0)) != null ? helper : alias1),(options={"name":"site","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.site) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n      <a href=\"http://posti.es/by/posties\" ";
  stack1 = ((helper = (helper = helpers.site || (depth0 != null ? depth0.site : depth0)) != null ? helper : alias1),(options={"name":"site","hash":{},"fn":this.noop,"inverse":this.program(8, data, 0),"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.site) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += " class=\"panel-item is-underlined ";
  stack1 = ((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias1),(options={"name":"index","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.index) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n        <span class=\"panel-item-text is-padded\">About Posti.es</span>\n      </a>\n    </div>\n\n";
  stack1 = ((helper = (helper = helpers.site || (depth0 != null ? depth0.site : depth0)) != null ? helper : alias1),(options={"name":"site","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.site) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\n</nav>\n";
},"useData":true});
templates['body.html'] = template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['with'].call(depth0,(depth0 != null ? depth0.site : depth0),{"name":"with","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials['part-loop'],depth0,{"name":"part-loop","data":data,"indent":"      ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials.header,depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "\n<div class=\"site-container\">\n\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.index : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.onSite : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n</div>";
},"usePartial":true,"useData":true});
templates['header.html'] = template({"1":function(depth0,helpers,partials,data) {
    return "    <button type=\"button\" class=\"header-action js-windowToggle\" data-target=\"#options\">\n      <span analytics-on=\"click\" analytics-event=\"Show view\" analytics-category=\"Website design settings\">\n        <svg role=\"presentation\"><use xlink:href=\"#sliders\"></use></svg>\n      </span>\n    </button>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.editMode : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "      <span class=\"header-action is-link\">"
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.site : depth0)) != null ? stack1.name : stack1), depth0)) != null ? stack1 : "")
    + "</span>\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials['options-window'],depth0,{"name":"options-window","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<header class=\"header js-header\">\n\n  <button type=\"button\" class=\"header-action js-windowToggle\" data-target=\"#account\">\n    <span analytics-on=\"click\" analytics-event=\"Toggle view\" analytics-category=\"Account settings\">\n      <svg role=\"presentation\"><use xlink:href=\"#logo\"></use></svg>\n    </span>\n  </button>\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.editMode : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.onSite : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</header>\n\n"
    + ((stack1 = this.invokePartial(partials['account-window'],depth0,{"name":"account-window","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.editMode : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n<!--<div id=\"flash\">\n  <a class=\"close\" ng-click=\"flashService.hide()\">×</a>\n  <pre>[[flashService.message]]</pre>\n</div>-->\n";
},"usePartial":true,"useData":true});
templates['layout.html'] = template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "<meta name=\"description\" content=\""
    + this.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"description","hash":{},"data":data}) : helper)))
    + "\">";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(data && data.index),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "'"
    + ((stack1 = this.lambda(depth0, depth0)) != null ? stack1 : "")
    + "'";
},"4":function(depth0,helpers,partials,data) {
    return ", ";
},"6":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "      // Google analytics\n      /* (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n      ga('create', '"
    + ((stack1 = ((helper = (helper = helpers.analyticsCode || (depth0 != null ? depth0.analyticsCode : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"analyticsCode","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "', 'auto');\n      ga('require', 'displayfeatures');\n      ga('send', 'pageview'); */\n";
},"8":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "      <script src=\""
    + ((stack1 = ((helper = (helper = helpers.assetUrl || (depth0 != null ? depth0.assetUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"assetUrl","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "posties.js\"></script>\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function";

  return "      <script src=\""
    + ((stack1 = ((helper = (helper = helpers.assetUrl || (depth0 != null ? depth0.assetUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"assetUrl","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "libs.js\"></script>\n      <script src=\""
    + ((stack1 = ((helper = (helper = helpers.assetUrl || (depth0 != null ? depth0.assetUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"assetUrl","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "index.js\"></script>\n";
},"12":function(depth0,helpers,partials,data) {
    var helper;

  return "      <script src=\"//api.filepicker.io/v1/filepicker.js\"></script>\n      <script>filepicker.setKey('"
    + this.escapeExpression(((helper = (helper = helpers.filePickerKey || (depth0 != null ? depth0.filePickerKey : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"filePickerKey","hash":{},"data":data}) : helper)))
    + "');</script>\n";
},"14":function(depth0,helpers,partials,data) {
    var stack1;

  return "      <script id=\"styles\" type=\"text/x-handlebars-template\">\n        "
    + ((stack1 = (helpers.partial || (depth0 && depth0.partial) || helpers.helperMissing).call(depth0,"styles",{"name":"partial","hash":{},"data":data})) != null ? stack1 : "")
    + "\n      </script>\n      <script id=\"part-heading\" type=\"text/x-handlebars-template\">\n      </script>\n      <script id=\"part-text\" type=\"text/x-handlebars-template\">\n      </script>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, buffer = 
  "<!DOCTYPE html>\n<html class=\"site\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>"
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</title>\n    ";
  stack1 = ((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias1),(options={"name":"description","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.description) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <link rel=\"stylesheet\" href=\""
    + ((stack1 = ((helper = (helper = helpers.assetUrl || (depth0 != null ? depth0.assetUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"assetUrl","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "posties.css\">\n  </head>\n  <body class=\"site-body\">\n\n    "
    + ((stack1 = ((helper = (helper = helpers.body || (depth0 != null ? depth0.body : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"body","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = this.invokePartial(partials.symbols,depth0,{"name":"symbols","data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "\n    <script>\n      var FONTS = ["
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.fonts : depth0),{"name":"each","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "];\n      var SITE_DATA = "
    + ((stack1 = ((helper = (helper = helpers.siteData || (depth0 != null ? depth0.siteData : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"siteData","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + ";\n\n      // Trigger svg redraw (safari issue)\n      document.addEventListener('DOMContentLoaded', function(){\n        var elms = document.getElementsByTagName('use');\n        Array.prototype.forEach.call(elms, function(el, i){\n          var href = el.getAttribute('xlink:href');\n          el.setAttribute('xlink:href', href);\n        });\n      });\n\n";
  stack1 = ((helper = (helper = helpers.analyticsCode || (depth0 != null ? depth0.analyticsCode : depth0)) != null ? helper : alias1),(options={"name":"analyticsCode","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.analyticsCode) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </script>\n\n    <script src=\""
    + ((stack1 = ((helper = (helper = helpers.assetUrl || (depth0 != null ? depth0.assetUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"assetUrl","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "libs.js\"></script>\n    <script src=\""
    + ((stack1 = ((helper = (helper = helpers.assetUrl || (depth0 != null ? depth0.assetUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"assetUrl","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "index.js\"></script>\n\n    <!--\n    <script src=\"//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js\"></script>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.production : depth0),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.program(10, data, 0),"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.editMode : depth0),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    -->\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.editMode : depth0),{"name":"if","hash":{},"fn":this.program(14, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </body>\n</html>";
},"usePartial":true,"useData":true});
templates['options-window.html'] = template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda;

  return "          <a class=\"panel-item\" style=\"font-family: '"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "'\" ng-click=\"siteOptions.text_font = '"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "'\">\n            <span class=\"panel-item-text is-larger\">"
    + this.escapeExpression(alias1(depth0, depth0))
    + "</span>\n            <div class=\"panel-item-icon is-transparent is-static\" ng-show=\"siteOptions.text_font === '"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "'\"><svg role=\"presentation\"><use xlink:href=\"#check\"></use></svg></div>\n          </a>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda;

  return "          <a class=\"panel-item\" style=\"font-family: '"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "'\" ng-click=\"siteOptions.heading_font = '"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "'\">\n            <span class=\"panel-item-text is-larger\">"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "</span>\n            <div class=\"panel-item-icon is-transparent is-static\" ng-show=\"siteOptions.heading_font === '"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "'\"><svg role=\"presentation\"><use xlink:href=\"#check\"></use></svg></div>\n          </a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, buffer = 
  "<div class=\"popover is-customize updateSettings js-window\" id=\"options\">\n  <div class=\"popover-arrow\"><svg role=\"presentation\"><use xlink:href=\"#popover-arrow\"></use></svg></div>\n  <form class=\"panels\" id=\"updateSettings\" method=\"put\" name=\"formSettings\" ng-submit=\"optionsService.submitUpdate(siteOptions)\" novalidate>\n    <div class=\"panel is-active\" id=\"panelPrimarySettings\">\n\n      <!-- Links to font panels -->\n\n      <a class=\"panel-item\" data-go-to-panel=\"panelTextFont\" analytics-on=\"click\" analytics-event=\"Change\" analytics-category=\"Website design settings\" analytics-label=\"Text font\">\n        <span class=\"panel-item-text\">Text font</span>\n        <div class=\"panel-item-preview\">\n          <span class=\"panel-item-text is-larger\" ng-model=\"siteOptions.text_font\" style=\"font-family: '[[siteOptions.text_font]]'\">\n            [[siteOptions.text_font]]\n          </span>\n        </div>\n        <div class=\"panel-item-icon\"><svg role=\"presentation\"><use xlink:href=\"#arrow-right\"></use></svg></div>\n      </a>\n\n      <a class=\"panel-item\" data-go-to-panel=\"panelHeadlineFont\" analytics-on=\"click\" analytics-event=\"Change\" analytics-category=\"Website design settings\" analytics-label=\"Headline font\">\n        <span class=\"panel-item-text\">Headline font</span>\n        <div class=\"panel-item-preview\">\n          <span class=\"panel-item-text is-larger\" ng-model=\"siteOptions.heading_font\" style=\"font-family: '[[siteOptions.heading_font]]'\">\n            [[siteOptions.heading_font]]\n          </span>\n        </div>\n        <div class=\"panel-item-icon\"><svg role=\"presentation\"><use xlink:href=\"#arrow-right\"></use></svg></div>\n      </a>\n\n      <!-- Inline show boxes -->\n\n      <label class=\"panel-item toggle-parent\" for=\"showBoxes\" analytics-on=\"click\" analytics-event=\"Change\" analytics-category=\"Website design settings\" analytics-label=\"Toggle boxes\">\n        <span class=\"panel-item-text\">Use boxes</span>\n        <span class=\"panel-item-preview\">\n          <span class=\"panel-item-toggle toggle\">\n            <input id=\"showBoxes\" type=\"checkbox\" ng-checked=\"siteOptions.boxes\" ng-model=\"siteOptions.boxes\">\n            <span class=\"toggle-handle\"></span>\n          </span>\n        </span>\n      </label>\n\n      <!-- Links to color panels -->\n\n      <a class=\"panel-item\" data-go-to-panel=\"panelBoxColor\" ng-class=\"siteOptions.boxes ? '' : 'is-disabled'\" analytics-on=\"click\" analytics-event=\"Change\" analytics-category=\"Website design settings\" analytics-label=\"Box color\">\n        <span class=\"panel-item-text\">Box color</span>\n        <span class=\"panel-item-preview\" style=\"background-color: [[siteOptions.part_background_color]]\"></span>\n        <div class=\"panel-item-icon is-transparent\"><svg role=\"presentation\"><use xlink:href=\"#arrow-right\"></use></svg></div>\n      </a>\n\n      <a class=\"panel-item\" data-go-to-panel=\"panelTextColor\" analytics-on=\"click\" analytics-event=\"Change\" analytics-category=\"Website design settings\" analytics-label=\"Text color\">\n        <span class=\"panel-item-text\">Text color</span>\n        <span class=\"panel-item-preview\" style=\"background-color: [[siteOptions.text_color]]\"></span>\n        <div class=\"panel-item-icon is-transparent\"><svg role=\"presentation\"><use xlink:href=\"#arrow-right\"></use></svg></div>\n      </a>\n\n      <a class=\"panel-item\" data-go-to-panel=\"panelBackground\" analytics-on=\"click\" analytics-event=\"Change\" analytics-category=\"Website design settings\" analytics-label=\"Background color\">\n        <span class=\"panel-item-text\">Background</span>\n        <span class=\"panel-item-preview\" style=\"background-color: [[siteOptions.background_color]]\"></span>\n        <div class=\"panel-item-icon is-transparent\"><svg role=\"presentation\"><use xlink:href=\"#arrow-right\"></use></svg></div>\n      </a>\n\n      <!-- Reset and randomize -->\n\n      <div class=\"popover-body\">\n        <button class=\"button\" ng-click=\"siteOptions = optionsService.getDefault()\"><span analytics-on=\"click\" analytics-event=\"Reset\" analytics-category=\"Website design settings\">Reset</span></button>\n        <span style=\"margin-left: 0.5em;\">or <a ng-click=\"siteOptions = optionsService.getRandom()\"><span analytics-on=\"click\" analytics-event=\"Randomize\" analytics-category=\"Website design settings\">randomize</span></a>!</span>\n        <button id=\"savesiteOptions\" class=\"button\" style=\"display: none;\">Save</button>\n      </div>\n    </div>\n\n\n    <div class=\"panel\" id=\"panelTextFont\">\n      <div class=\"popover-header\">\n        <button class=\"button\" ng-click=\"optionsService.submitUpdate(siteOptions)\" data-go-to-panel=\"panelPrimarySettings\">\n          <svg role=\"presentation\"><use xlink:href=\"#arrow-left\"></use></svg> Settings\n        </button>\n      </div>\n\n      <div class=\"popover-scroll\">\n";
  stack1 = ((helper = (helper = helpers.fonts || (depth0 != null ? depth0.fonts : depth0)) != null ? helper : alias1),(options={"name":"fonts","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.fonts) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "      </div>\n    </div>\n\n    <div class=\"panel\" id=\"panelHeadlineFont\">\n      <div class=\"popover-header\">\n        <button class=\"button\" ng-click=\"optionsService.submitUpdate(siteOptions)\" data-go-to-panel=\"panelPrimarySettings\">\n          <svg role=\"presentation\"><use xlink:href=\"#arrow-left\"></use></svg> Settings\n        </button>\n      </div>\n\n      <div class=\"popover-scroll\">\n";
  stack1 = ((helper = (helper = helpers.fonts || (depth0 != null ? depth0.fonts : depth0)) != null ? helper : alias1),(options={"name":"fonts","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.fonts) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "      </div>\n    </div>\n\n    <div class=\"panel\" id=\"panelBoxColor\">\n      <div class=\"popover-header\">\n        <button class=\"button\" ng-click=\"optionsService.submitUpdate(siteOptions)\" data-go-to-panel=\"panelPrimarySettings\">\n          <svg role=\"presentation\"><use xlink:href=\"#arrow-left\"></use></svg> Settings\n        </button>\n      </div>\n      <div class=\"popover-body\">\n        <div class=\"palette\">\n          <button class=\"palette-item\" ng-repeat=\"color in optionsService.getBackgroundPalette()\" ng-style=\"{ 'background': color }\" ng-click=\"siteOptions.part_background_color = color\"></button>\n        </div>\n        <input class=\"minicolors\" maxlength=\"7\" type=\"text\" ng-model=\"siteOptions.part_background_color\">\n        <input id=\"resultBoxColor\" class=\"minicolors-result\" type=\"hidden\">\n      </div>\n    </div>\n\n    <div class=\"panel\" id=\"panelTextColor\">\n      <div class=\"popover-header\">\n        <button class=\"button\" ng-click=\"optionsService.submitUpdate(siteOptions)\" data-go-to-panel=\"panelPrimarySettings\">\n          <svg role=\"presentation\"><use xlink:href=\"#arrow-left\"></use></svg> Settings\n        </button>\n      </div>\n      <div class=\"popover-body\">\n        <div class=\"palette\">\n          <button class=\"palette-item\" ng-repeat=\"color in optionsService.getFontPalette()\" ng-style=\"{ 'background': color }\" ng-click=\"siteOptions.text_color = color\"></button>\n        </div>\n        <input class=\"minicolors\" maxlength=\"7\" type=\"text\" ng-model=\"siteOptions.text_color\">\n        <input id=\"resultTextColor\" class=\"minicolors-result\" type=\"hidden\">\n      </div>\n    </div>\n\n    <div class=\"panel\" id=\"panelBackground\">\n      <div class=\"popover-header\">\n        <button class=\"button\" ng-click=\"optionsService.submitUpdate(siteOptions)\" data-go-to-panel=\"panelPrimarySettings\">\n          <svg role=\"presentation\"><use xlink:href=\"#arrow-left\"></use></svg> Settings\n        </button>\n      </div>\n      <div class=\"popover-body\">\n        <div class=\"palette\">\n          <button class=\"palette-item\" ng-repeat=\"color in optionsService.getBackgroundPalette()\" ng-style=\"{ 'background': color }\" ng-click=\"siteOptions.background_color = color\"></button>\n        </div>\n        <input class=\"minicolors\" maxlength=\"7\" type=\"text\" ng-model=\"siteOptions.background_color\">\n        <input id=\"resultBackground\" class=\"minicolors-result\" type=\"hidden\">\n      </div>\n    </div>\n\n  </form>\n</div>\n";
},"useData":true});
templates['part-loop.html'] = template({"1":function(depth0,helpers,partials,data) {
    return " class=\"js-styles\"";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials.styles,depth0,{"name":"styles","data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"5":function(depth0,helpers,partials,data) {
    return " is-unboxed";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "    "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.typeText : depth0),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.typeHeading : depth0),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.typeImage : depth0),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.typeVideo : depth0),{"name":"if","hash":{},"fn":this.program(14, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"8":function(depth0,helpers,partials,data) {
    var stack1;

  return "    "
    + ((stack1 = this.invokePartial(partials['part/text'],depth0,{"name":"part/text","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "    ";
},"10":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = this.invokePartial(partials['part/heading'],depth0,{"name":"part/heading","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + " ";
},"12":function(depth0,helpers,partials,data) {
    var stack1;

  return "   "
    + ((stack1 = this.invokePartial(partials['part/image'],depth0,{"name":"part/image","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "   ";
},"14":function(depth0,helpers,partials,data) {
    var stack1;

  return "   "
    + ((stack1 = this.invokePartial(partials['part/video'],depth0,{"name":"part/video","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "   ";
},"16":function(depth0,helpers,partials,data) {
    var helper;

  return "    <h1 class=\"u-hiddenVisually\">"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h1>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<style"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.editMode : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n"
    + ((stack1 = helpers['with'].call(depth0,(depth0 != null ? depth0.options : depth0),{"name":"with","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</style>\n\n<article class=\"parts"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.options : depth0)) != null ? stack1.boxes : stack1),{"name":"unless","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.parts : depth0),{"name":"each","hash":{},"fn":this.program(7, data, 0),"inverse":this.program(16, data, 0),"data":data})) != null ? stack1 : "")
    + "</article>";
},"usePartial":true,"useData":true});
templates['styles.html'] = template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "  background: "
    + ((stack1 = ((helper = (helper = helpers.part_background_color || (depth0 != null ? depth0.part_background_color : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"part_background_color","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + ";\n";
},"3":function(depth0,helpers,partials,data) {
    return "  background: transparent;\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "html {\n  background: "
    + ((stack1 = ((helper = (helper = helpers.background_color || (depth0 != null ? depth0.background_color : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"background_color","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + ";\n}\n\n.part-content-text,\n.part-content-block,\n.part-content-loading {\n  font-family: "
    + alias3(((helper = (helper = helpers.text_font || (depth0 != null ? depth0.text_font : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"text_font","hash":{},"data":data}) : helper)))
    + ";\n  color: "
    + alias3(((helper = (helper = helpers.text_color || (depth0 != null ? depth0.text_color : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"text_color","hash":{},"data":data}) : helper)))
    + ";\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.boxes : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "}";
},"useData":true});
templates['symbols.html'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<!--[if gt IE 8]><!-->\n<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"display: none\">\n\n  <!-- Arrows -->\n\n  <symbol id=\"arrow-up\" viewBox=\"0 0 28.375 27.875\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M13.354 3.901v20.951m0-20.951l8.471 8.471m-8.518-8.471l-8.471 8.471\"/>\n  </symbol>\n\n  <symbol id=\"arrow-down\" viewBox=\"0 0 28.375 27.875\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M13.308 24.852v-20.951m0 20.951l-8.472-8.471m8.518 8.471l8.472-8.471\"/>\n  </symbol>\n\n  <symbol id=\"arrow-left\" viewBox=\"0 0 28.375 27.875\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M3.417 14.353h20.95m-20.95 0l8.47-8.472m-8.47 8.52l8.47 8.473\"/>\n  </symbol>\n\n  <symbol id=\"arrow-right\" viewBox=\"0 0 28.375 27.875\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M24.078 14.4h-20.951m20.951 0l-8.471 8.472m8.471-8.519l-8.471-8.472\"/>\n  </symbol>\n\n  <symbol id=\"arrow-out\" viewBox=\"0 0 67 67\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M35.508 53.24c-.908-.395-1.068-1.155-1.065-2.031.013-3.062.006-6.124.001-9.185 0-.415-.037-.829-.061-1.32-5.667.028-11.211.089-16.594 1.576-5.975 1.652-11.075 4.576-14.136 10.234-.157.291-.576.681-.749.727-.173.048-1.904.756-1.904-2.595.071-.423.171-.845.208-1.27.583-6.851 3.807-12.279 9.167-16.495 6.73-5.291 14.639-7.741 22.966-9.089.847-.137 1.135-.383 1.122-1.234-.046-2.945-.058-5.892.018-8.836.015-.578.336-1.424.769-1.638.444-.219 1.313.022 1.806.347 8.168 5.386 16.31 10.811 24.444 16.248 1.6 1.067 3.139 2.219 4.704 3.332v.944c0 .416-.7.746-1.113 1.025-6.286 4.221-12.592 8.416-18.882 12.635-3.261 2.189-6.499 4.415-9.749 6.626h-.951z\"/>\n  </symbol>\n\n  <symbol id=\"popover-arrow\" viewBox=\"0 0 35 15\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M14.278 1.37c1.373-1.128 3.219-1.37 3.219-1.37v14.969h-17.498v-1.156s1.848-.077 4.503-2.568c2.906-2.728 7.553-8.048 9.775-9.874zm6.439 0c-1.373-1.128-3.219-1.37-3.219-1.37v14.969h17.498v-1.156s-1.848-.077-4.503-2.568c-2.906-2.728-7.553-8.048-9.775-9.874z\"/>\n  </symbol>\n\n  <!-- Content type icons -->\n\n  <symbol id=\"content-text\" viewBox=\"0 0 87 87\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M1 20v7h84.99v-7h-84.99zm0 13v7h75.801v-7h-75.801zm0 14v7h84.99v-7h-84.99zm0 14v7h55.254v-7h-55.254z\"/>\n  </symbol>\n\n  <symbol id=\"content-headline\" viewBox=\"0 0 85.25 53.25\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M35.92 50.492l-4.039-10.975h-15.471l-4.039 10.975h-11.127l19.129-49.004h8.154l19.129 49.004h-11.736zm-10.289-29.189c-.458-1.295-1.067-2.896-1.448-4.496h-.152c-.381 1.6-.915 3.277-1.372 4.496l-3.277 8.993h9.527l-3.278-8.993zm49.076 30.713c-2.057-.457-4.42-2.057-5.334-4.572-1.524 2.82-4.803 4.191-8.994 4.191-6.097 0-11.508-4.268-11.508-11.432 0-6.325 4.954-10.593 11.813-11.278l6.859-.686v-1.144c0-2.058-1.677-3.43-5.411-3.43-3.354 0-7.088 1.067-9.604 2.667l-1.98-8.459c2.82-1.829 7.545-3.048 12.117-3.048 9.145 0 15.623 4.192 15.623 12.499v11.28c0 4.039 1.524 6.173 4.191 7.164l-7.772 6.248zm-7.163-16.614l-4.192.382c-2.896.305-4.191 2.287-4.191 4.343 0 1.83 1.372 3.354 3.506 3.354 2.668 0 4.878-2.058 4.878-5.029v-3.05z\"/>\n  </symbol>\n\n  <symbol id=\"content-image\" viewBox=\"0 0 87 87\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M55.316 63.506h22.455v6h-57.076v-12.798h-12.038v-38.931h57.076v12.798h12.037v32.931h-6v-26.931h-45.076v26.931h1.776c1.585-2.943 4.973-6.975 11.606-6.857 6.56.117 11.358 4 15.239 6.857zm-34.621-12.798v-20.133h39.039v-6.798h-45.076v26.931h6.038zm42.249-1.818c2.179 0 3.945-1.766 3.945-3.945s-1.766-3.945-3.945-3.945-3.945 1.766-3.945 3.945 1.766 3.945 3.945 3.945z\"/>\n  </symbol>\n\n  <symbol id=\"content-video\" viewBox=\"0 0 87 87\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M26.876 68.211c-1.384.898-2.517.283-2.517-1.367v-46.438c0-1.65 1.133-2.266 2.517-1.368l35.391 22.952c1.384.898 1.384 2.367 0 3.265l-35.391 22.956z\"/>\n  </symbol>\n\n  <!-- Text format icons -->\n\n  <symbol id=\"format-bold\" viewBox=\"0 0 25 31.375\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M13.613 30.418h-12.781v-29.655h11.667c5.299 0 9.064 3.485 9.064 7.948 0 1.348-.744 3.579-2.186 4.602 2.278.79 4.788 4.369 4.788 7.669 0 5.391-3.997 9.436-10.552 9.436zm-2.601-22.869h-1.535v4.183h1.535c.929 0 1.951-.604 1.951-2.091s-1.023-2.092-1.951-2.092zm1.161 10.969h-2.65v4.927h2.649c1.255 0 2.649-.743 2.649-2.417s-1.393-2.51-2.648-2.51z\"/>\n  </symbol>\n\n  <symbol id=\"format-italic\" viewBox=\"0 0 25 31.375\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M2.165 30.199l.331-1.324c3.606 0 3.79-2.502 4.489-5.261l4.047-16.298c.699-2.759 1.729-5.225-1.876-5.225l.331-1.324h13.87l-.331 1.324c-3.643 0-3.789 2.465-4.488 5.225l-4.048 16.298c-.699 2.759-1.766 5.261 1.876 5.261l-.331 1.324h-13.87z\"/>\n  </symbol>\n\n  <symbol id=\"format-link\" viewBox=\"0 0 80.5 33.125\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-miterlimit=\"10\" d=\"M33.959 20.477c0 4.988-4.043 9.033-9.033 9.033h-12.343c-4.988 0-9.033-4.045-9.033-9.033v-7.527c0-4.988 4.044-9.034 9.033-9.034h12.344c4.989 0 9.033 4.045 9.033 9.034v7.527zm42.858 0c0 4.988-4.044 9.033-9.034 9.033h-12.345c-4.986 0-9.03-4.045-9.03-9.033v-7.527c0-4.988 4.044-9.034 9.03-9.034h12.346c4.99 0 9.034 4.045 9.034 9.034v7.527z\"/>\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M27.697 16.532h24.641\"/>\n  </symbol>\n\n  <symbol id=\"format-left\" viewBox=\"0 0 52.375 33.125\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-miterlimit=\"10\" d=\"M1.438 4.705h49.1m-49.1 7.919h43.792m-43.792 7.918h49.1m-49.1 7.918h31.919\"/>\n  </symbol>\n\n  <symbol id=\"format-right\" viewBox=\"0 0 52.375 33.125\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-miterlimit=\"10\" d=\"M50.859 4.605h-49.101m49.101 7.918h-43.793m43.793 7.918h-49.101m49.101 7.919h-31.92\"/>\n  </symbol>\n\n  <symbol id=\"format-center\" viewBox=\"0 0 52.375 33.125\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-miterlimit=\"10\" d=\"M1.589 4.605h49.102m-46.448 7.918h43.794m-46.448 7.918h49.102m-40.512 7.919h31.923\"/>\n  </symbol>\n\n  <!-- Misc -->\n\n  <symbol id=\"logo\" viewBox=\"0 0 63 63\">\n    <g fill=\"none\">\n      <path fill=\"currentColor\" d=\"M0 0h63.309v63.311h-63.309v-63.311z\"/>\n      <path fill=\"#fff\" d=\"M28.537 35.25v12.049h-7.152v-30.627h11.664c5.232 0 9.889 3.504 9.889 9.265 0 5.76-4.608 9.313-9.889 9.313h-4.512zm3.457-12.577h-3.457v6.864h3.457c1.92 0 3.791-1.056 3.791-3.408 0-2.304-1.871-3.456-3.791-3.456z\"/>\n    </g>\n  </symbol>\n\n  <symbol id=\"sliders\" viewBox=\"0 0 63 63\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M40.91 29.957h-29.91v3.804h29.91v1.158c0 1.917 1.553 3.468 3.47 3.468 1.915 0 3.469-1.551 3.469-3.468v-1.158h5.589v-3.804h-5.589v-1.16c0-1.915-1.554-3.468-3.469-3.468-1.917 0-3.47 1.553-3.47 3.468v1.16zm-24.809 13.529h-5.101v3.804h5.101v1.158c0 1.915 1.553 3.468 3.469 3.468s3.468-1.552 3.468-3.468v-1.158h30.4v-3.804h-30.4v-1.159c0-1.916-1.552-3.468-3.468-3.468s-3.469 1.552-3.469 3.468v1.159zm0-26.859h-5.101v3.804h5.101v1.159c0 1.915 1.553 3.468 3.469 3.468s3.468-1.553 3.468-3.468v-1.159h30.4v-3.804h-30.4v-1.158c0-1.916-1.552-3.469-3.468-3.469s-3.469 1.553-3.469 3.469v1.158z\"/>\n  </symbol>\n\n  <symbol id=\"plus\" viewBox=\"0 0 67 67\">\n    <path fill=\"currentColor\" stroke=\"none\" d=\"M26.023 26.023v-16.023h14.955v16.023h16.023v14.955h-16.023v16.023h-14.955v-16.023h-16.023v-14.955h16.023z\"/>\n  </symbol>\n\n  <symbol id=\"cross\" viewBox=\"0 0 28.375 27.875\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M3.401 3.776l20.952 20.952m-20.952 0l20.952-20.952\"/>\n  </symbol>\n\n  <symbol id=\"check\" viewBox=\"0 0 60.875 52.459\">\n    <path fill=\"none\" stroke=\"currentColor\" stroke-width=\"10\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M3.112 21.504l15.476 26.402 37.394-43.57\"/>\n  </symbol>\n\n</svg>\n<!--<![endif]-->";
},"useData":true});
})();