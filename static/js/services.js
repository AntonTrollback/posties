var postiesApp = angular.module('posties', ['ngSanitize', 'angularFileUpload', 'angular-medium-editor'], function ($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

postiesApp.constant('config', {
  headerJSON: { 'Content-Type': 'application/json;charset=UTF-8' },
  S3URL : 'https://s3-eu-west-1.amazonaws.com/posties-images/',
  keySettings: 'postiesKeySettings'
});

postiesApp.service('SettingsService', function($http, config, Fonts) {

  	var fonts = Fonts.getFonts();

	this.isOpen = false;

	//We hold the most recent settings object from the DB, so that we can check incoming
	//objects for equality - determining if a DB update is needed
	this.currentSettings = {};

	this.getSettings = function() {
		if($('html').hasClass('pagePostsByUser') && $('body').hasClass('authenticated')) {
			var promise = $http({
				url: '/api/settings',
				method: 'get',
				headers: config.headerJSON
			}).then(function(response) {
				this.currentSettings = response.data;
				return this.currentSettings;
			}, function(response) {
				console.log(response);
			});

			return promise;
		} else {
			return this.getDefaultSettings();
		}
	};

    this.submitUpdateSettings = function(userSettings) {
    	if($('html').hasClass('pagePostsByUser') && $('body').hasClass('authenticated')) {
    		if(!angular.equals(this.currentSettings, userSettings)) {

    			//Make a deep copy of the settings object, otherwise the equality check will always pass
    			this.currentSettings = jQuery.extend(true, {}, userSettings);

    			var promise = $http({
	  				url: '/api/settings',
	  				method: 'put',
	  				data: userSettings,
	  				headers: config.headerJSON
	  			}).then(function(response) {

	  				return this.currentSettings;
	  			}, function(response) {
	  				console.log(response);
	  			});

	        	return promise;
    		}
    	}
    };

    this.submitUpdateSettingsAndClose = function(userSettings) {
    	this.submitUpdateSettings(userSettings);
    	this.close();
    };

    this.open = function() {
      	fonts.loadAll();

		this.isOpen = true;
    };

    this.close = function() {
      	this.isOpen = false;
	};

	this.getRandomSettings = function() {
		return {
			created: new Date(),
			id: 0,
			pagebackgroundcolor: getRandomHex(),
			postbackgroundcolor: getRandomHex(),
			posttextcolor: getRandomHex(),
			showboxes : Math.random() < 0.5,
			typefaceheadline: setRandomTypeface('#panelHeadlineFont'),
			typefaceparagraph: setRandomTypeface('#panelTextFont')
		};
	};

	this.getDefaultSettings = function($event) {
		return {
			created: new Date(),
			id: 0,
			pagebackgroundcolor: "#f5f5f5",
			postbackgroundcolor: "#ffffff",
			posttextcolor: "#141414",
			showboxes: true,
			typefaceheadline: "Akkurat",
			typefaceparagraph: "Akkurat"
		};
	};

	this.getBackgroundPalette = function() {
		return ['#e5fff5', '#bbf8ff', '#405559', '#512d59', '#ff033e', '#ffffff', '#fbff05', '#ff8f8f'];
	};

	this.getFontPalette = function() {
	    return ['#000000', '#ffffff'];
	};

	function getRandomHex() {
		return '#'+(function lol(m,s,c){return s[m.floor(m.random() * s.length)] + (c && lol(m,s,c-1));})(Math,'0123456789ABCDEF', 4);
	}

  	function setRandomTypeface(id) {
    	var $options = $(id).find('[type="radio"]');
    	random = ~~(Math.random() * $options.length);
    	$options.eq(random).prop('checked', true).closest('.panel-item').click();

    	return $options.eq(random).val();
  	}

});

postiesApp.service('UserService', function($http, config) {

	this.getUserWithPosts = function(username) {
		var promise = $http({
			url: '/api/user',
			method: 'get',
			params: { 'username' : username.toLowerCase() },
			headers: config.headerJSON
		}).then(function(response) {
			this.data = response.data;
			return response.data;
		}, function(response) {
			console.log(response);
		});

		return promise;
	};

});

postiesApp.service('AuthService', function($http, config) {

	this.user = false;

	this.login = function(jsonPost) {
		return $http({
			url: '/login',
			method: 'post',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			return response;
		}, function(error) {
			return error;
		});
	};

	this.isLoggedIn = function() {
		return this.user !== false;
	};

	this.currentUserInSession = function() {

  };
});

postiesApp.service('FlashService', function($timeout) {

	var flash = {
		message : undefined,
		element : $('#flash')
	};

	flash.showMessage = function(message) {
		flash.message = message;
		flash.element.fadeIn(function() {
			$(this).delay(1000).fadeOut();
		});
	};

	flash.showPermanentMessage = function(message) {
		flash.message = message;
		flash.element.fadeIn();
	};

	flash.hide = function() {
		flash.element.fadeOut();
	};

	this.getFlash = function() {
		return flash;
	};

});


postiesApp.service('Fonts', function($http, config) {
  var fonts = {
    fontList: FONTS,
    fontListLoaded: false
  };

  WebFontConfig = {};

  fonts.loadAll = function() {
    if (fonts.fontListLoaded) {
      return;
    }

    fonts.load(fonts.fontList);
    fonts.fontListLoaded = true;
  };

  fonts.load = function(fonts) {
    var cleanFonts = [];

    // Remove Akkurat, should already be loaded
    for(var item in fonts) {
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

  this.getFonts = function() {
    return fonts;
  };
});
