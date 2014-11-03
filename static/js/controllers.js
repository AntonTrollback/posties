/**
 * Index page controller
 */

postiesApp.controller('IndexCtrl', function(
	$scope, $http, $timeout, $analytics, config,
	SettingsService, AuthService, FlashService) {

	$scope.settingsService = SettingsService;
	$scope.flashService = FlashService;
	$scope.authService = AuthService;

	// Setup default user stuff and post
	$scope.user = {
		username: false,
		isAuthenticated: false
	};

	$scope.userSettings = $scope.settingsService.getDefault();

	$scope.posts = [{
		id: 0,
		type: 0,
		sortrank: 0,
		content: "<p>Hello</p><p class=\"focus\">I'm a text that you can edit</p><p><br></p><p>Add images and texts until you're happy.</p><p>Then publish your new website!</p><p><br></p><p>Customize your design by hitting the sliders in the top right corner.</p>",
		template: 'postText.html'
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
			settings: $scope.userSettings,
			posts: []
		};

		data.settings.username = $scope.user.username;

		// Remove invalid video posts and not yet uploaded images
		for (var i in $scope.posts) {
			if (($scope.posts[i].type === 3 && !$scope.posts[i].isValidVideo) ||
					($scope.posts[i].type === 2 && !$scope.posts[i].isUploaded)) {
				continue;
			} else {
				// Remove unnecessary data
				var post = angular.copy($scope.posts[i]);
				delete post['template'];
				delete post['isUploaded'];
				delete post['uploadProgress'];
				delete post['helpText'];
				data.posts.push(post);
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
	$scope, $http, $timeout, $filter, $analytics, config,
	FontService, AuthService, FlashService, SettingsService) {

	$scope.flashService = FlashService;
	$scope.fontService = FontService;
	$scope.settingsService = SettingsService;
	$scope.authService = AuthService;

	$scope.posts = [];

	// First visit
	if (localStorage.getItem(config.keySettings + 'Welcome')) {
		$analytics.eventTrack('Success', {  category: 'Sign up' });
		$('.welcome').show();
		localStorage.removeItem(config.keySettings + 'Welcome');
	}

	// Get design and user data
	var websiteData = WEBSITE_DATA;

	$scope.user = {
		username: websiteData.user.username,
		isAuthenticated: websiteData.user.is_authenticated,
	};

	$scope.userSettings = websiteData.settings;

	// Load fonts used on website
	$scope.fontService.load([websiteData.settings.typefaceparagraph, websiteData.settings.typefaceheadline]);

	// Render posts
	for (i = 0; i < websiteData.posts.length; i++) {
		var post = websiteData.posts[i];

		switch (post.type) {
			case 0:
				post.template = 'postText.html';
				break;
			case 1:
				post.template = 'postHeadline.html';
				break;
			case 2:
				post.template = 'postImage.html';
				post.isUploaded = true;
				break;
			case 3:
				post.template = 'postVideo.html';
				post.isValidVideo = true;
				break;
		}
		$scope.posts.push(post);
	}
});


/**
 * Error page controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('PageErrorCtrl', function() {

});


/**
 * Editor controller
 * -----------------------------------------------------------------------------
 */

postiesApp.controller('EditorCtrl', function(
	$scope, $http, $timeout, $filter, $analytics, config, FlashService) {
	var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

	/**
	 * Add posts
	 */

	$scope.addPost = function($event, $data) {
		// Send tracking data
		$analytics.eventTrack('Add', {
			category: 'Content boxes',
			label: $event.target.getAttribute('data-analytics-label')
		});

		// Setup generic post data
		var post = {
			type: parseInt($event.target.getAttribute('data-type')),
			sortrank: $scope.posts.length,
			template: $event.target.getAttribute('data-template')
		}

		// Hide add post buttons
		$scope.showPostTypes = false;

		// Setup post types
		switch (post.type) {
			case 0:
				$scope.setupTextBasedPost(post);
				break;
			case 1:
				$scope.setupTextBasedPost(post);
				break;
			case 2:
				// Note: image is already selected
				$scope.setupImage(post, $event.target, $data[0]);
				break;
			case 3:
				$scope.setupVideo(post);
				break;
		}
	}

	/**
	 * Setup text based posts (show and save)
	 */

	$scope.setupTextBasedPost = function(post) {
		post.content = '';
		$scope.posts.push(post);

		// Send to backend
		$scope.send($scope.posts[post.sortrank], 'postText', function(response) {
			$scope.posts[post.sortrank].id = response.data;
		});

		$scope.focusPostEditor(post.sortrank);
	}

	/**
	 * Setup post image (upload, show, and send to backend)
	 */

	$scope.setupImage = function(post, input, file) {
		if (!file) {
			return;
		}

		post.isUploaded = false;
		post.template = 'postImageUploading.html';

		post.uploadProgress = 0;
		$scope.posts.push(post);

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
				post.key = blob.url;
				post.isUploaded = true;

				// Change to loading from uploading
				post.template = 'postImageLoading.html';
			});

			$scope.send($scope.posts[post.sortrank], 'postImage', function(response) {
				$scope.posts[post.sortrank].id = response.data;
			});
		};

		var storeError = function(FPError) {
			console.log(FPError.toString());
		};

		var storeProgress = function(progress) {
			$scope.$apply(function() {
				if (progress < 95) {
					post.uploadProgress = progress + '%';
					return;
				}

				// Always stuck at 95% for a while. Let's make it look a bit better
				if (progress = 95) {
					$timeout(function() { post.uploadProgress = '98%'; }, 300);
					$timeout(function() { post.uploadProgress = '100%'; }, 600);
					$timeout(function() { post.uploadProgress = 'Loading'; }, 900);
				}
			});
		};

		// Upload image
		filepicker.store(input, storeOptions, storeSuccess, storeError, storeProgress);
	};

	/**
	 * Image loaded (and converted) event
	 */

	$scope.imageLoaded = function(post) {
		post.template = 'postImage.html';
	};

	/**
	 * Setup post video (show)
	 */

	$scope.setupVideo = function(post) {
		post.helpText = 'Paste your YouTube link here';
		post.template = 'postVideoInput.html';
		$scope.posts.push(post);
		$scope.focusPostEditor(post.sortrank);
	};

	/**
	 * Validate video (and send to backend)
	 */

	$scope.validateVideo = function($event, post) {
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
				post.key = videoSrc;
				post.template = 'postVideo.html';

				$scope.send($scope.posts[post.sortrank], 'postVideo', function(response) {
					$scope.posts[post.sortrank].id = response.data;
				});
			});
		});
	};

	/**
	 * Move post
	 */

	$scope.movePost = function(currentIndex, newIndex) {
		posties.util.swapItems($scope.posts, currentIndex, newIndex);
		var data = [];

		for (i = 0; i < $scope.posts.length; i++) {
			var post = $scope.posts[i];
			if (post.id) { // the posts save event might not have returned yet
				data.push({id: post.id, sortrank: i});
			}
		}

		$scope.send(data, 'postrank');
	};

	/**
	 * Delete post
	 */

	$scope.deletePost = function(currentIndex, post) {
		$scope.posts.splice(currentIndex, 1);

		// The posts save event might not have returned yet.
		// Todo: The video type could be unsaved (not yet pasted), this causes
		// a bug: "un-pasted" video posts will not save the updated position
		// when moving up and down
		if (!post.id) {
			return;
		}

		$scope.send({ id: post.id }, 'posts', false, 'delete');
	};

	/**
	 * Update posts
	 */

	$scope.updateTextBasedPost = function($event, post) {
		setTimeout(function() {
			var content = Autolinker.link(post.content, {
				truncate: false,
				stripPrefix: true
			});

			$scope.send({ id: post.id, content: content }, 'postText', false, 'put');
		}, 250);
	};

	/**
	 * Focus post editor
	 */

	$scope.focusPostEditor = function(postIndex) {
		if (!iOS) {
			$timeout(function() {
				var $el = $('.post').eq(postIndex).find('.post-editor');
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

	// Focus first post
	$scope.focusPostEditor(0);
});