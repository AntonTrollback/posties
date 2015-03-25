postiesApp.service('optionsService', function($http, config, FontService) {
  'use strict';

  // We hold the most recent settings object from the DB, so that we can check
  // incoming objects for equality - determining if a DB update is needed
  if (typeof DEFAULT_SITE_DATA === "undefined") {
    return;
  }

  this.currentOptions = {};
  this.defaultOptions = DEFAULT_SITE_DATA.options;
  this.isOpen = false;

  this.submitUpdate = function(options) {
    if (!SITE_DATA || !SITE_DATA.isAuthenticated) {
      return;
    }

    if (!angular.equals(this.currentOptions, options)) {
      // Make a deep copy of the settings object, otherwise the
      // equality check will always pass
      this.currentOptions = $.extend(true, {}, options);

      var promise = $http({
        url: '/api/update-options',
        method: 'post',
        data: {
          id: SITE_DATA.id,
          options: options
        },
        headers: config.headerJSON
      }).then(function(resp) {
        return this.currentOptions;
      }, function(resp) {
        console.log(resp);
      });

      return promise;
    }
  };

  this.submitUpdateAndClose = function(options) {
    this.submitUpdate(options);
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
      heading_font: getRandomTypeface(),
      text_font: getRandomTypeface(),
      boxes: Math.random() < 0.5,
      part_background_color: getRandomHex(),
      background_color: getRandomHex(),
      text_color: getRandomHex()
    };
  };

  this.getDefault = function($event) {
    return this.defaultOptions;
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

  function getRandomTypeface() {
    return FontService.fontList[Math.floor(Math.random() * FontService.fontList.length)];
  }

  return this;
});

postiesApp.service('AuthService', function($http, config, FlashService) {
  'use strict';

  this.user = false;

  this.submitSignin = function() {
    var that = this;
    $('.popover-form .button').attr('disabled', true).text('Loading…');

    var data = {
      email: $('[name="email"]').val(),
      password: $('[name="password"]').val()
    };

    this.login(data, '/api/signin').then(that.signinSuccess);
  };

  this.submitSiteSignin = function() {
    var that = this;
    $('.popover-form .button').attr('disabled', true).text('Loading…');

    var data = {
      name: $('[name="name"]').val(),
      password: $('[name="password"]').val()
    };

    this.login(data, '/api/signin-name').then(that.signinSuccess);
  };

  this.signinSuccess = function(resp) {
    console.log(resp.data);
    if (resp.data.siteToGoTo && resp.data.id) {
      window.location = "/by/" + resp.data.siteToGoTo;
    } else {
      FlashService.showMessage("Password or Email seem to be incorrect");
      $('.popover-form .button').attr('disabled', false).text('OK');
    }
  };

  this.login = function(data, endpoint) {
    return $http({
      url: endpoint,
      method: 'post',
      data: data,
      headers: config.headerJSON
    }).then(function(resp) {
      return resp;
    }, function(error) {
      return error;
    });
  };

  return this;
});

postiesApp.service('FlashService', function($timeout) {
  'use strict';

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
  'use strict';

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
    fonts.forEach(function(item) {
      if (fonts[item] !== 'Akkurat' && fonts[item] !== 'sans-serif') {
        cleanFonts.push(fonts[item] + '::latin');
      }
    });

    // Remove duplicates
    var uniqueFonts = cleanFonts.filter(function(item, pos) {
      return cleanFonts.indexOf(item) === pos;
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