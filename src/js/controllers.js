/**
 * Index page controller
 */



postiesApp.controller('IndexCtrl', function(
  $scope, $http, $timeout, $analytics, $sce, $filter, config,
  optionsService, AuthService, FlashService) {
  'use strict';

  $scope.optionsService = optionsService;
  $scope.flashService = FlashService;
  $scope.authService = AuthService;

  // Get default data

  $scope.site = DEFAULT_SITE_DATA;
  $scope.options = $scope.site.options;
  $scope.parts = $scope.site.parts;
  $scope.user = {email: '', password: ''};

  // Setup default part(s)

  var part = $scope.site.parts[0];
  part.content.html = $sce.trustAsHtml(part.content.text);
  part.template = 'text.html';
  $scope.site.parts[0] = part;

  /**
   * Publish website
   */

  $scope.togglePublish = function() {
    $scope.publish.visible = !$scope.publish.visible;
  };

  $scope.validName = function() {
    if (!$scope.publish.name.$dirty) { return; }

    // Quick validate
    $scope.site.name = $filter('fixName')($scope.site.name);
    var name = $scope.site.name;
    var valid = (!name || name.length < 1 || name.length > 150) ? false : true;

    if (!valid) {
      $scope.publish.nameValid = valid;
      $scope.publish.nameInvalid = !valid;
      $scope.publish.nameInvalidHelp = false;
      $scope.publish.nameInUseHelp = false;
      $scope.publish.prevName = $scope.site.name;
      return;
    }

    // Stop if value hasn't changed
    if ($scope.publish.prevName === $scope.site.name) { return; }
    $scope.publish.prevName = $scope.site.name;

    $scope.post('/api/available-name', {name: name}, function(data) {
      // Reset help messages
      $scope.publish.nameInvalidHelp = false;
      $scope.publish.nameInUseHelp = false;

      // Display backend validation
      if (!data.valid) {
        $scope.publish.nameInvalidHelp = true;
        valid = false;
      } else if (!data.available) {
        $scope.publish.nameInUseHelp = true;
        valid = false;
      }

      $scope.publish.nameValid = valid;
      $scope.publish.nameInvalid = !valid;
    });
  };

  $scope.validEmail = function() {
    if (!$scope.publish.email.$dirty) { return; }

    // Quick validate
    if ($scope.user.email) { $scope.user.email.trim(); }
    var email = $scope.user.email;
    var valid = (!email || email.length < 1 || email.length > 150) ? false : true;

    if (!valid) {
      $scope.publish.emailValid = valid;
      $scope.publish.emailInvalid = !valid;
      $scope.publish.emailInvalidHelp = false;
      $scope.publish.emailInUseHelp = false;
      $scope.publish.prevEmail = $scope.user.email;
      return;
    }

    // Stop if value hasn't changed
    if ($scope.publish.prevEmail === $scope.user.email) { return; }
    $scope.publish.prevEmail = $scope.user.email;

    $scope.post('/api/available-email', {email: email}, function(data) {
      // Reset help messages
      $scope.publish.emailInvalidHelp = false;
      $scope.publish.emailInUseHelp = false;

      // Display backend validation
      if (!data.valid) {
        $scope.publish.emailInvalidHelp = true;
        valid = false;
      } else if (!data.available) {
        $scope.publish.emailInUseHelp = true;
      }

      $scope.publish.emailValid = valid;
      $scope.publish.emailInvalid = !valid;
    });
  };

  $scope.validPassword = function() {
    if (!$scope.publish.password.$dirty) { return; }

    var password = $scope.user.password;
    var valid = (!password || password.length < 1 || password.length > 150) ? false : true;
    $scope.publish.passwordValid = valid;
  };

  $scope.tryPublish = function() {
    $analytics.eventTrack('Try publish', {  category: 'Sign up' });

    $scope.publish.passwordWrong = false;

    if (!$scope.publish.name.$viewValue) {
      return $scope.focusPublishInput('name');
    }
    if (!$scope.publish.email.$viewValue) {
      return $scope.focusPublishInput('email');
    }
    if (!$scope.publish.password.$viewValue) {
      return $scope.focusPublishInput('password');
    }
    if (!$scope.publish.nameValid) { return; }
    if (!$scope.publish.emailValid) { return; }
    if (!$scope.publish.passwordValid) { return; }

    var data = {
      user: $scope.user,
      site: $scope.site,
      parts: $scope.getFixedParts()
    };

    $scope.publish.loading = true;

    $scope.post('/api/publish-with-user', data, function(data) {
      if (data.success) {
        $scope.publishSuccess(data);
      } else {
        $scope.publish.loading = false;
        $scope.publishFail(data);
      }
    });
  };

  $scope.focusPublishInput = function(name) {
    $('[name="publish"] [name="' + name + '"]').focus();
  };

  $scope.publishSuccess = function(data) {
    localStorage.setItem(config.keySettings + 'Welcome', true);
    window.location = "/by/" + data.name.toLowerCase();
  };

  $scope.publishFail = function(data) {
    if ((data.validUser && data.validSite) && (!data.availableEmail && data.availableName)) {
      $scope.publish.passwordWrong = true;
    } else {
      alert('Something went wrong... Sorry! Please check that you filled out the form correctly');
    }
  };

  $scope.getFixedParts = function() {
    var parts = [];
    var i = 0;

    $scope.site.parts.forEach(function(part) {
      var invalidVideo = part.type === 3 && !part.isValidVideo;
      var invalidImage = part.type === 2 && !part.isUploaded;

      if (!invalidVideo || !invalidImage) {
        var fixedPart = angular.copy(part);
        // Remove unnecessary data
        delete part.template;
        delete part.isUploaded;
        delete part.progress;
        parts.push(fixedPart);
      }
    });
    return parts;
  };

  $scope.post = function(endpoint, data, callback) {
    $http({
      url: endpoint,
      method: 'post',
      data: data,
      headers: config.headerJSON
    }).then(function(resp) {
      if (resp.data.error) {
        return $scope.flashService.showMessage("Sorry, something went wrong. Posti.es is not working correctly at the moment");
      }
      callback(resp.data);
    }, function(resp) {
      console.log(resp);
      $scope.flashService.showMessage("Sorry, something went wrong. Posti.es is not working correctly at the moment");
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
  'use strict';

  $scope.flashService = FlashService;
  $scope.fontService = FontService;
  $scope.optionsService = optionsService;
  $scope.authService = AuthService;

  $scope.site = SITE_DATA;
  $scope.options = $scope.site.options;

  // First visit

  if (localStorage.getItem(config.keySettings + 'Welcome')) {
    $analytics.eventTrack('Success', {  category: 'Sign up' });
    localStorage.removeItem(config.keySettings + 'Welcome');
    $('.welcome').show();
  }

  // Load fonts used on website
  $scope.fontService.load([$scope.options.text_font, $scope.options.heading_font]);

  // Setup/render parts

  $scope.parts = [];
  var i = 0;

  $scope.site.parts.forEach(function(part) {
    switch (part.type) {
      case 0:
        part.prevText = part.content.text;
        part.content.html = $sce.trustAsHtml(part.content.text);
        part.template = 'text.html';
        break;
      case 1:
        part.prevText = part.content.text;
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
  });
});


/**
 * Editor controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('EditorCtrl', function(
  $scope, $http, $timeout, $filter, $analytics, config, FlashService) {
  'use strict';

  $scope.flashService = FlashService;
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
    };

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
  };

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
  };

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
        if (progress === 95) {
          $timeout(function() { part.progress = '98%'; }, 300);
          $timeout(function() { part.progress = '100%'; }, 600);
          $timeout(function() { part.progress = 'Loading'; }, 900);
        }
      });
    };

    filepicker.setKey(FILEPICKER_KEY);
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

    $scope.parts.forEach(function (part, i) {
      if (part.id) { data.push({id: part.id, rank: i}); }
    });

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
    $timeout(function() {
      if (!$scope.site.isAuthenticated) { return; }
      if (!$scope.site.isAuthenticated || part.prevText === part.content.text) {
        return;
      }

      part.prevText = part.content.text;

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
  };

  /**
   * Save to backend
   */

  $scope.trySave = function(rawData, endpoint, callback, method) {
    if (!$scope.site.isAuthenticated) {
      return;
    }

    // Remove unnecessary data
    var data = angular.copy(rawData);
    delete data.template;
    delete data.isUploaded;
    delete data.progress;

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
      if (resp.data.error) {
        return $scope.flashService.showMessage("Sorry, something went wrong. Posti.es is not working correctly at the moment");
      }
      if (callback) {
        callback(resp);
      }
    }, function(resp) {
      console.log(resp);
      $scope.flashService.showMessage("Sorry, something went wrong. Posti.es is not working correctly at the moment");
    });
  };

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
  'use strict';

});