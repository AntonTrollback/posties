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
    if (resp.data.siteToGoTo && resp.data.id) {
      if (window.location.hostname === 'localhost') {
        window.location = 'http://' + resp.data.siteToGoTo + '.localhost:5000';
      } else {
        window.location = 'http://' + resp.data.siteToGoTo + '.posti.es';
      }
    } else {
      FlashService.showMessage("Sorry, incorrect password");
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

  this.loaded = false;

  this.getFonts = function() {
    return ['Akkurat', 'Josefin Sans', 'Dosis', 'Karla', 'Archivo Narrow', 'Inconsolata', 'Anonymous Pro', 'Text Me One', 'Lora', 'Neuton', 'Old Standard TT', 'EB Garamond', 'Arvo', 'Fredoka One', 'VT323', 'Nova Cut', 'Reenie Beanie'];
  };

  this.loadAll = function() {
    if (this.loaded) {
      return;
    }

    this.load(this.getFonts());
    this.loaded = true;
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