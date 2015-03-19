/**
 * Index page controller
 */

postiesApp.controller('IndexCtrl', function(
  $scope, $http, $timeout, $analytics, config,
  optionsService, AuthService, FlashService) {

  $scope.optionsService = optionsService;
  $scope.flashService = FlashService;
  $scope.authService = AuthService;

  // Setup default user stuff
  $scope.user = {
    username: false,
    isAuthenticated: false
  };

  $scope.siteOptions = $scope.optionsService.getDefault();

  $scope.parts = [{
    id: 0,
    type: 0,
    sortrank: 0,
    content: "<p>Hello</p><p class=\"focus\">I'm a text that you can edit</p><p><br></p><p>Add images and texts until you're happy.</p><p>Then publish your new website!</p><p><br></p><p>Customize your design by hitting the sliders in the top right corner.</p>",
    template: 'partText.html'
  }];

  /**
   * Create user
   */

  $scope.validateUserForm = function() {
    // Reset error messages
    var errors = [];
    $scope.formCreateUser.username.error = "";
    $scope.formCreateUser.email.error = "";
    $scope.formCreateUser.password.error = "";

    // Validate email
    if ($scope.formCreateUser.email.$invalid) {
      errors.push('email');
      if ($scope.formCreateUser.email.$error.required) {
        $scope.formCreateUser.email.error = "You're missing an email address";
      } else {
        $scope.formCreateUser.email.error = "We both know that's not a valid email";
      }
    }

    // Validate password
    if ($scope.formCreateUser.password.$invalid) {
      errors.push('password');
      $scope.formCreateUser.password.error = "Don't forget the password";
    }

    // Validate username
    if ($scope.formCreateUser.username.$invalid) {
      errors.push('username');
      if ($scope.formCreateUser.username.$error.pattern) {
        $scope.formCreateUser.username.error = "Sorry, no spaces or weird characters";
      } else {
        $scope.formCreateUser.username.error = "Don't forget the username";
      }
    } else {
      // Check if already used
      $scope.checkUsername(function(response) {
        if (response.data !== 'no match') {
          errors.push('username');
          $scope.formCreateUser.username.error = "Sorry, that website address is already taken";
        }

        // Try submit
        if (errors.length || $scope.formCreateUser.$invalid) {
          console.log('Form is invalid')
          return;
        } else {
          $scope.submitCreateUser();
        }
      });
    }
  };

  $scope.checkUsername = function(callback) {
    $http({
      url: '/api/users',
      method: 'get',
      params: {
        username: $scope.user.username
      }
    }).then(callback, function(response) {
      console.log(response);
    });
  };

  $scope.submitCreateUser = function() {
    $scope.formCreateUser.loading = true;
    $scope.formCreateUser.loadingText = 'Loading…';

    var data = {
      email: $scope.user.email.toLowerCase(),
      username: $scope.user.username,
      password: $scope.user.password,
      settings: $scope.siteOptions,
      parts: []
    };

    data.settings.username = $scope.user.username;

    // Remove invalid video parts and not yet uploaded images
    for (var i in $scope.parts) {
      if (($scope.parts[i].type === 3 && !$scope.parts[i].isValidVideo) ||
          ($scope.parts[i].type === 2 && !$scope.parts[i].isUploaded)) {
        continue;
      } else {
        // Remove unnecessary data
        var part = angular.copy($scope.parts[i]);
        delete part['template'];
        delete part['isUploaded'];
        delete part['uploadProgress'];
        delete part['helpText'];
        data.parts.push(part);
      }
    }

    $http({
      url: '/api/users',
      method: 'post',
      data: data,
      headers: config.headerJSON
    }).then(function(response) {
      localStorage.setItem(config.keySettings + 'Welcome', true);
      window.location = "/by/" + $scope.user.username.toLowerCase();
    });
  };
});

/**
 * User page controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('UserCtrl', function(
  $scope, $http, $timeout, $filter, $analytics, $sce, config,
  FontService, AuthService, FlashService, optionsService) {

  $scope.flashService = FlashService;
  $scope.fontService = FontService;
  $scope.optionsService = optionsService;
  $scope.authService = AuthService;

  // First visit
  if (localStorage.getItem(config.keySettings + 'Welcome')) {
    $analytics.eventTrack('Success', { category: 'Sign up' });
    $('.welcome').show();
    localStorage.removeItem(config.keySettings + 'Welcome');
  }

  // Site data with parts and design options
  var siteData = SITE_DATA;

  /*
  $scope.user = {
    username: siteData.name,
    isAuthenticated: siteData.isAuthenticated,
  };
  */

  $scope.siteOptions = siteData.options;

  // Load fonts used on website
  $scope.fontService.load([siteData.options.text_font, siteData.options.heading_font]);

  // Setup and render parts
  $scope.parts = [];

  for (i = 0; i < siteData.parts.length; i++) {
    var part = siteData.parts[i];

    switch (part.type) {
      case 0:
        part.html = $sce.trustAsHtml(part.content);
        part.template = 'partText.html';
        break;
      case 1:
        part.html = $sce.trustAsHtml(part.content);
        part.template = 'partHeadline.html';
        break;
      case 2:
        part.template = 'partImage.html';
        part.isUploaded = true;
        break;
      case 3:
        part.template = 'partVideo.html';
        part.isValidVideo = true;
        break;
    }
    $scope.parts.push(part);
  }
});

/**
 * Not found page controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('NotFoundCtrl', function() {

});

/**
 * Error page controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('ServerErrorCtrl', function() {

});


/**
 * Editor controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('EditorCtrl', function(
  $scope, $http, $timeout, $filter, $analytics, config, FlashService) {
  var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

  /**
   * Add parts
   */

  $scope.addPart = function($event, $data) {
    // Send tracking data
    $analytics.eventTrack('Add', {
      category: 'Content boxes',
      label: $event.target.getAttribute('data-analytics-label')
    });

    // Setup generic part data
    var part = {
      type: parseInt($event.target.getAttribute('data-type')),
      sortrank: $scope.parts.length,
      template: $event.target.getAttribute('data-template')
    }

    // Hide add part buttons
    $scope.showPartTypes = false;

    // Setup part types
    switch (part.type) {
      case 0:
        $scope.setupTextBasedPart(part);
        break;
      case 1:
        $scope.setupTextBasedPart(part);
        break;
      case 2:
        // Note: image is already selected
        $scope.setupImage(part, $event.target, $data[0]);
        break;
      case 3:
        $scope.setupVideo(part);
        break;
    }
  }

  /**
   * Setup text based parts (show and save)
   */

  $scope.setupTextBasedPart = function(part) {
    part.content = '';
    $scope.parts.push(part);

    // Send to backend
    $scope.send($scope.parts[part.sortrank], 'partText', function(response) {
      $scope.parts[part.sortrank].id = response.data;
    });

    $scope.focusPartEditor(part.sortrank);
  }

  /**
   * Setup part image (upload, show, and send to backend)
   */

  $scope.setupImage = function(part, input, file) {
    if (!file) {
      return;
    }

    part.isUploaded = false;
    part.template = 'partImageUploading.html';

    part.uploadProgress = 0;
    $scope.parts.push(part);

    // Validate image
    if (!file.type.match(/image.*/)) {
      alert("Not sure that's an image")
      return;
    }

    var storeOptions = {
      mimetypes: ['image/*'],
      location: 'S3',
      path: '/images/',
      access: 'public',
    };

    var storeSuccess = function(blob) {
      $scope.$apply(function() {
        part.key = blob.url;
        part.isUploaded = true;

        // Change to loading from uploading
        part.template = 'partImageLoading.html';
      });

      $scope.send($scope.parts[part.sortrank], 'partImage', function(response) {
        $scope.parts[part.sortrank].id = response.data;
      });
    };

    var storeError = function(FPError) {
      console.log(FPError.toString());
    };

    var storeProgress = function(progress) {
      $scope.$apply(function() {
        if (progress < 95) {
          part.uploadProgress = progress + '%';
          return;
        }

        // Always stuck at 95% for a while. Let's make it look a bit better
        if (progress = 95) {
          $timeout(function() { part.uploadProgress = '98%'; }, 300);
          $timeout(function() { part.uploadProgress = '100%'; }, 600);
          $timeout(function() { part.uploadProgress = 'Loading'; }, 900);
        }
      });
    };

    // Upload image
    filepicker.store(input, storeOptions, storeSuccess, storeError, storeProgress);
  };

  /**
   * Image loaded (and converted) event
   */

  $scope.imageLoaded = function(part) {
    part.template = 'partImage.html';
  };

  /**
   * Setup part video (show)
   */

  $scope.setupVideo = function(part) {
    part.helpText = 'Paste your YouTube link here';
    part.template = 'partVideoInput.html';
    $scope.parts.push(part);
    $scope.focusPartEditor(part.sortrank);
  };

  /**
   * Validate video (and send to backend)
   */

  $scope.validateVideo = function($event, part) {
    var clipboardData = $event.clipboardData.items[0];

    clipboardData.getAsString(function(data) {
      var videoSrc = posties.util.getYouTubeVideoID(data);

      if (!videoSrc) {
        $scope.$apply(function() {
          $scope.flashService.showMessage("Sorry, doesn't look like a Youtube link");
        });
        return;
      }

      $scope.$apply(function() {
        part.key = videoSrc;
        part.template = 'partVideo.html';

        $scope.send($scope.parts[part.sortrank], 'partVideo', function(response) {
          $scope.parts[part.sortrank].id = response.data;
        });
      });
    });
  };

  /**
   * Move part
   */

  $scope.movePart = function(currentIndex, newIndex) {
    posties.util.swapItems($scope.parts, currentIndex, newIndex);
    var data = [];

    for (i = 0; i < $scope.parts.length; i++) {
      var part = $scope.parts[i];
      if (part.id) { // the parts save event might not have returned yet
        data.push({id: part.id, sortrank: i});
      }
    }

    $scope.send(data, 'partrank');
  };

  /**
   * Delete part
   */

  $scope.deletePart = function(currentIndex, part) {
    $scope.parts.splice(currentIndex, 1);

    // The parts save event might not have returned yet.
    // Todo: The video type could be unsaved (not yet pasted), this causes
    // a bug: "un-pasted" video parts will not save the updated position
    // when moving up and down
    if (!part.id) {
      return;
    }

    $scope.send({ id: part.id }, 'parts', false, 'delete');
  };

  /**
   * Update parts
   */

  $scope.updateTextBasedPart = function($event, part) {
    setTimeout(function() {
      var content = Autolinker.link(part.content, {
        truncate: false,
        stripPrefix: true
      });

      $scope.send({ id: part.id, content: content }, 'partText', false, 'put');
    }, 250);
  };

  /**
   * Focus part editor
   */

  $scope.focusPartEditor = function(partIndex) {
    if (!iOS) {
      $timeout(function() {
        var $el = $('.part').eq(partIndex).find('.part-editor');
        var $focusEl = $el.find('.focus');
        $el.focus();

        // Find options span.focus element and move carret to that position
        if ($focusEl.length) {
          window.getSelection().collapse($focusEl.get(0), 1);
        }
      }, 10);
    }
  }

  /**
   * Send to backend
   */

  $scope.send = function(data, endpoint, callback, method) {
    if (!$scope.user.isAuthenticated) {
      return;
    }

    // Remove unnecessary data
    var data = angular.copy(data);
    delete data['template'];
    delete data['isUploaded'];
    delete data['uploadProgress'];
    delete data['helpText'];

    if (!method) {
      method = 'post';
    }

    console.log("Send '" + method + "' to 'api/" + endpoint + "' with:", data);

    $http({
      url: '/api/' + endpoint,
      method: method,
      data: data,
      headers: config.headerJSON
    }).then(function(response) {
      if (callback) {
        callback(response);
      }
    }, function(response) {
      console.log(response);
    });
  }

  // Focus first part
  $scope.focusPartEditor(0);
});