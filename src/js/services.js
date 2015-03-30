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
      if (item !== 'Akkurat' && item !== 'sans-serif') {
        cleanFonts.push(item + '::latin');
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