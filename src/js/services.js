var dependencies = ['ngSanitize', 'angular-medium-editor', 'angulartics', 'angulartics.google.analytics'];

var postiesApp = angular.module('posties', dependencies, function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}).config(function ($analyticsProvider) {
  $analyticsProvider.firstPageview(true); // Records pages that don't use $state or $route
  $analyticsProvider.withAutoBase(true);  // Records full path
});

postiesApp.constant('config', {
  headerJSON: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  S3URL: 'https://s3-eu-west-1.amazonaws.com/posties-images/',
  keySettings: 'postiesKeySettings'
});


postiesApp.service('optionsService', function($http, config, FontService) {
  // We hold the most recent settings object from the DB, so that we can check
  // incoming objects for equality - determining if a DB update is needed
  this.currentOptions = {};
  this.isOpen = false;

  this.submitUpdate = function(siteOptions) {
    if (!SITE_DATA) {
      return;
    } else {
      if (!SITE_DATA.isAuthenticated) {
        return;
      };
    }

    if (!angular.equals(this.currentOptions, siteOptions)) {
      // Make a deep copy of the settings object, otherwise the equality check will always pass
      this.currentOptions = jQuery.extend(true, {}, siteOptions);

      var promise = $http({
        url: '/api/settings',
        method: 'put',
        data: siteOptions,
        headers: config.headerJSON
      }).then(function(response) {
        return this.currentOptions;
      }, function(response) {
        console.log(response);
      });

      return promise;
    }
  };

  this.submitUpdateAndClose = function(siteOptions) {
    this.submitUpdate(siteOptions);
    this.close();
  };

  this.open = function() {
    FontService.loadAll();
    this.isOpen = true;
  };

  this.close = function() {
    this.isOpen = false;
  };

  this.getRandom = function() {
    return {
      boxes: Math.random() < 0.5,
      background_color: getRandomHex(),
      part_background_color: getRandomHex(),
      text_color: getRandomHex(),
      text_font: getRandomFont(),
      heading_font: getRandomFont()
    };
  };

  this.getDefault = function($event) {
    return {
      boxes: true,
      background_color: "#f5f5f5",
      part_background_color: "#ffffff",
      text_color: "#141414",
      text_font: "Akkurat",
      heading_font: "Akkurat"
    }
  };

  this.getBackgroundPalette = function() {
    return ['#f5f5f5', '#ffffff', '#000000', '#bbf8ff', '#405559', '#512d59', '#ff033e', '#ff8f8f'];
  };

  this.getFontPalette = function() {
    return ['#000000', '#ffffff'];
  };

  function getRandomHex() {
    return '#' + (function lol(m, s, c) {
      return s[m.floor(m.random() * s.length)] + (c && lol(m, s, c - 1));
    })(Math, '0123456789ABCDEF', 4);
  }

  function getRandomFont() {
    return FontService.fontList[Math.floor(Math.random() * FontService.fontList.length)];
  }

  return this;
});

postiesApp.service('AuthService', function($http, config, FlashService) {
  this.user = false;

  this.submitLogin = function() {
    $('.popover-form .button').attr('disabled', true).text('Loading…');

    var data = {
      'email': $('[name=email]').val(),
      'password': $('[name=password]').val()
    };

    this.login(data).then(function(response) {
      if (typeof response.data.username !== 'undefined') {
        window.location = "/by/" + response.data.username;
      } else {
        FlashService.showMessage("Nope. Password seem to be incorrect");
        $('.popover-form .button').attr('disabled', false).text('OK');
      }
    });
  };

  this.login = function(data) {
    return $http({
      url: '/api/signin',
      method: 'post',
      data: data,
      headers: config.headerJSON
    }).then(function(response) {
      return response;
    }, function(error) {
      return error;
    });
  };

  return this;
});

postiesApp.service('FlashService', function($timeout) {
  this.message = undefined;
  this.element = $('#flash');

  this.showMessage = function(message) {
    this.message = message;
    this.element.fadeIn(function() {
      $(this).delay(1000).fadeOut();
    });
  };

  this.showPermanentMessage = function(message) {
    this.message = message;
    this.element.fadeIn();
  };

  this.hide = function() {
    this.element.fadeOut();
  };

  this.hideWelcome = function() {
    $('.welcome').hide();
  };

  return this;
});

postiesApp.service('FontService', function($http, config) {
  this.fontList = FONTS;
  this.fontListLoaded = false;

  // Required by the typekit font loader
  WebFontConfig = {};

  this.loadAll = function() {
    if (this.fontListLoaded) {
      return;
    }

    this.load(this.fontList);
    this.fontListLoaded = true;
  };

  this.load = function(fonts) {
    var cleanFonts = [];

    // Remove Akkurat, should already be loaded
    for (var item in fonts) {
      if (fonts[item] !== 'Akkurat' && fonts[item] !== 'sans-serif') {
        cleanFonts.push(fonts[item] + '::latin');
      }
    }

    // Remove duplicates
    var uniqueFonts = cleanFonts.filter(function(item, pos) {
      return cleanFonts.indexOf(item) == pos;
    });

    if (uniqueFonts.length === 0) {
      return;
    }

    // Prevent crash if no network connection
    if (typeof WebFont !== "undefined") {
      // Load the fonts
      WebFont.load({
        google: {
          families: uniqueFonts
        }
      });
    }
  };

  return this;
});
