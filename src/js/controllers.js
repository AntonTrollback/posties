/**
 * Index page controller
 */

postiesApp.controller('IndexCtrl', function(
  $scope, $http, $timeout, $analytics, $sce, config,
  optionsService, AuthService, FlashService) {

  $scope.optionsService = optionsService;
  $scope.flashService = FlashService;
  $scope.authService = AuthService;

  $scope.site = DEFAULT_SITE_DATA;
  $scope.options = $scope.site.options;

  // Setup/render default part
  $scope.parts = $scope.site.parts;
  var part = $scope.site.parts[0];
  part.content.html = $sce.trustAsHtml(part.content.text);
  part.template = 'text.html';
  $scope.site.parts[0] = part;

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
      $scope.checkUsername(function(resp) {
        if (resp.data !== 'no match') {
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
    }).then(callback, function(resp) {
      console.log(resp);
    });
  };

  $scope.submitCreateUser = function() {
    $scope.formCreateUser.loading = true;
    $scope.formCreateUser.loadingText = 'Loading…';

    var data = {
      email: $scope.user.email.toLowerCase(),
      username: $scope.user.username,
      password: $scope.user.password,
      settings: $scope.options,
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
        delete part['progress'];
        data.parts.push(part);
      }
    }

    $http({
      url: '/api/users',
      method: 'post',
      data: data,
      headers: config.headerJSON
    }).then(function(resp) {
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

  $scope.site = SITE_DATA;
  $scope.options = $scope.site.options;

  // First visit

  if (localStorage.getItem(config.keySettings + 'Welcome')) {
    $analytics.eventTrack('Success', {  category: 'Sign up' });
    $('.welcome').show();
    localStorage.removeItem(config.keySettings + 'Welcome');
  }

  // Load fonts used on website

  $scope.fontService.load([$scope.options.text_font, $scope.options.heading_font]);

  // Setup/render parts

  $scope.parts = [];

  for (i = 0; i < $scope.site.parts.length; i++) {
    var part = $scope.site.parts[i];

    switch (part.type) {
      case 0:
        part.content.html = $sce.trustAsHtml(part.content.text);
        part.template = 'text.html';
        break;
      case 1:
        part.content.html = $sce.trustAsHtml(part.content.text);
        part.template = 'heading.html';
        break;
      case 2:
        part.isUploaded = true;
        part.template = 'image.html';
        break;
      case 3:
        part.isValidVideo = true;
        part.template = 'video.html';
        break;
    }

    $scope.parts.push(part);
  }
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

    // Hide "add part" actions
    $scope.showPartTypes = false;

    // Setup generic part data
    var part = {
      siteId: $scope.site.id,
      type: parseInt($event.target.getAttribute('data-type')),
      rank: $scope.parts.length,
      content: {},
      template: $event.target.getAttribute('data-template')
    }

    // Setup part types
    switch (part.type) {
      case 0:
        $scope.setupTextBasedPart(part);
        break;
      case 1:
        $scope.setupTextBasedPart(part);
        break;
      case 2:
        var input = $event.target, file = $data[0];
        $scope.setupImage(part, input, file);
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
    part.content.text = '';

    $scope.parts.push(part);

    $scope.trySave($scope.parts[part.rank], '/api/add-part', function(resp) {
      $scope.parts[part.rank].id = resp.data.id;
    });

    $scope.focusPart(part.rank);
  }

  /**
   * Setup part image (upload, show, and save to backend)
   */

  $scope.setupImage = function(part, input, file) {
    if (!file || !file.type.match(/image.*/)) {
      alert("Not sure that's an image");
      return;
    }

    part.isUploaded = false;
    part.template = 'image-uploading.html';
    part.progress = 0;

    $scope.parts.push(part);

    var uploadOptions = {
      mimetypes: ['image/*'],
      location: 'S3',
      path: '/images/',
      access: 'public',
    };

    var uploadSuccess = function(blob) {
      $scope.$apply(function() {
        part.content.key = blob.url;
        part.isUploaded = true;

        // Change to loading from uploading
        part.template = 'image-loading.html';
      });

      $scope.trySave($scope.parts[part.rank], '/api/add-part', function(resp) {
        $scope.parts[part.rank].id = resp.data.id;
      });
    };

    var uploadError = function(FPError) {
      console.log(FPError.toString());
    };

    var uploadProgress = function(progress) {
      $scope.$apply(function() {
        if (progress < 95) {
          part.progress = progress + '%';
          return;
        }

        // Always stuck at 95% for a while. Let's make it look a bit better
        if (progress = 95) {
          $timeout(function() { part.progress = '98%'; }, 300);
          $timeout(function() { part.progress = '100%'; }, 600);
          $timeout(function() { part.progress = 'Loading'; }, 900);
        }
      });
    };

    // Upload image
    filepicker.store(input, uploadOptions, uploadSuccess, uploadError, uploadProgress);
  };

  /**
   * Image loaded (and converted) event
   */

  $scope.imageLoaded = function(part) {
    part.template = 'image.html';
  };

  /**
   * Setup part video (show)
   */

  $scope.setupVideo = function(part) {
    part.template = 'video-input.html';
    $scope.parts.push(part);
    $scope.focusPart(part.rank);
  };

  /**
   * Validate video (and save to backend) event
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
        part.content.key = videoSrc;
        part.template = 'video.html';

        $scope.trySave($scope.parts[part.rank], '/api/add-part', function(resp) {
          $scope.parts[part.rank].id = resp.data.id;
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
        data.push({id: part.id, rank: i});
      }
    }

    $scope.trySave(data, '/api/update-rank');
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

    $scope.trySave({ id: part.id }, '/api/delete-part', false, 'delete');
  };

  /**
   * Update parts
   */

  $scope.updateTextBasedPart = function($event, part) {
    setTimeout(function() {
      var text = Autolinker.link(part.content.text, {
        truncate: false,
        stripPrefix: true
      });

      $scope.trySave({id: part.id, content: {text: text}}, '/api/update-part');
    }, 250);
  };

  /**
   * Focus part editor
   */

  $scope.focusPart = function(partIndex) {
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
   * Save to backend
   */

  $scope.trySave = function(data, endpoint, callback, method) {
    if (!$scope.site.isAuthenticated) {
      return;
    }

    // Remove unnecessary data
    var data = angular.copy(data);
    delete data['template'];
    delete data['isUploaded'];
    delete data['progress'];

    if (!method) {
      method = 'post';
    }

    console.log("Send '" + method + "' to '" + endpoint + "' with:", data);

    $http({
      url: endpoint,
      method: method,
      data: data,
      headers: config.headerJSON
    }).then(function(resp) {
      if (callback) {
        callback(resp);
      }
    }, function(resp) {
      console.log(resp);
    });
  }

  // Focus first part
  $scope.focusPart(0);
});


/**
 * User page controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('StaticCtrl', function(
  $scope, $http, $timeout, $analytics, $sce, config,
  optionsService, AuthService, FlashService) {

});