postiesApp.controller('PageIndexCtrl', function(
	$scope, $http, $timeout, $upload, $sanitize, $analytics, config,
	SettingsService, AuthService, FlashService, Fonts) {

	$scope.posts = [];
	$scope.userHasUploadedImage = false;
	var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

	$scope.settingsService = SettingsService;
	$scope.flash = FlashService.getFlash();
	$scope.fonts = Fonts.getFonts();

	$scope.userSettings = $scope.settingsService.getSettings();

	// Initial font load
	$scope.fonts.load([
		$scope.userSettings.typefaceparagraph,
		$scope.userSettings.typefaceheadline
	]);

	$scope.addPost = function($event) {
		$analytics.eventTrack('Add', {
			category: 'Content boxes',
			label: $event.target.getAttribute('data-analytics-label')
		});

		var post = {
			id: Math.round(Math.random() * 1000),
			sortrank: $scope.posts.length,
			content: $event.target.getAttribute('data-content'),
			type: parseInt($event.target.getAttribute('data-type')),
			template: $event.target.getAttribute('data-template'),
			helpText: $event.target.getAttribute('data-helptext')
		};

		$scope.posts.push(post);
		if (!iOS) {
			$timeout(function() {
				$('.post:last-child .post-editor').focus();
			}, 100);
		}

		$scope.showPostTypes = false;
	};

	$scope.savePostImage = function($files) {
		var imageType = /image.*/;

		for (var i = 0; i < $files.length; i++) {
			var file = $files[i];

			if (file.type.match(imageType)) {
				var imagePost = {
					type: 2,
					sortrank: $scope.posts.length,
					template: 'postImage.html',
					file: file,
					isUploaded: false,
					uploadProgress: 0
				};

				$scope.posts.push(imagePost);

				var reader = new FileReader();
				reader.onprogress = function(e) {
					if (e.lengthComputable) {
						imagePost.uploadProgress = event.total;
					}
				};

				reader.onload = function(e) {
					$scope.$apply(function() {
						imagePost.isUploaded = true;
						imagePost.key = reader.result;
						$scope.userHasUploadedImage = true;
						$scope.showPostTypes = false;
					});
				};

				reader.readAsDataURL(file);
			}
		}
	};

	$scope.savePostVideo = function($event, post) {
		var clipboardData = $event.originalEvent.clipboardData.getData('text/plain');
		var videoURL = posties.util.getYouTubeVideoID($sanitize(clipboardData));

		if (videoURL) {
			post.key = videoURL;
			post.isValidVideo = true;
			$scope.flash.showMessage('saved...');
		} else {
			$scope.flash.showMessage('sorry that wasn\'t a valid YouTube address...');
			return;
		}
	};

	$scope.movePost = function(currentIndex, newIndex) {
		posties.util.swapItems($scope.posts, currentIndex, newIndex);

		for (i = 0; i < $scope.posts.length; i++) {
			$scope.posts[i].sortrank = i;
		}
	};

	$scope.deletePost = function(currentIndex, post) {
		$scope.posts.splice(currentIndex, 1);
	};

	$scope.validateUserForm = function($event) {
		$scope.formCreateUser.username.error = "";
		$scope.formCreateUser.email.error = "";
		$scope.formCreateUser.password.error = "";

		if ($scope.formCreateUser.email.$invalid) {
			if ($scope.formCreateUser.email.$error.required) {
				$scope.formCreateUser.email.error = "You're missing an email address";
			} else {
				$scope.formCreateUser.email.error = "We both know that's not a valid email";
			}
		}

		if ($scope.formCreateUser.password.$invalid) {
			$scope.formCreateUser.password.error = "Don't forget the password";
		}

		if ($scope.formCreateUser.username.$invalid) {
			if ($scope.formCreateUser.username.$error.pattern) {
				$scope.formCreateUser.username.error = "Sorry, no spaces or weird characters";
			} else {
				$scope.formCreateUser.username.error = "Don't forget the username";
			}
		} else {
			$scope.checkUsername();
		}
	};

	$scope.checkUsername = function() {
		$http({
			url: '/api/users',
			method: 'get',
			params: {
				username: $scope.user.username
			}
		}).then(function(response) {
			if (typeof response.data.username === 'undefined') {
				$scope.submitCreateUser();
			} else {
				$scope.formCreateUser.username.error = "Sorry, that website address is already taken";
			}
		}, function(response) {
			console.log(response);
		});
	};

	$scope.submitCreateUser = function() {
		if ($scope.formCreateUser.$invalid) {
			console.log("form is invalid");
			return;
		}

		$scope.formCreateUser.loading = true;
		$scope.formCreateUser.loadingText = 'Loading…';
		var posts = [];

		// Remove empty video posts
		for (var i in $scope.posts) {
			if ($scope.posts[i].type == 3 && !$scope.posts[i].key) {
				console.log('not a valid video');
			} else {
				posts.push($scope.posts[i]);
			}
		}

		$scope.posts = posts;

		var jsonPost = {
			email: $scope.user.email.toLowerCase(),
			username: $scope.user.username,
			password: $scope.user.password,
			posts: $scope.posts,
			settings: $scope.userSettings
		};

		jsonPost.settings.username = $scope.user.username;

		$http({
			url: '/api/users',
			method: 'post',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			if ($scope.userHasUploadedImage) {
				$scope.formCreateUser.loadingText = 'Uploading images…';

				var imagesToUpload = 0;
				var uploadedImages = 0;

				for (i = 0; i < response.data.posts.length; i++) {
					if (response.data.posts[i].type == 2) {
						imagesToUpload++;

						(function(post, file) {
							var loadingImage = loadImage(file, function(resizedImage) {
								resizedImage.toBlob(function(blob) {
									var s3upload = new S3Upload({
										s3_object_name: post.key,
										s3_file: blob,
										onProgress: function(percent, message) {
											console.log('Uploading images…', percent, message);
										},
										onFinishS3Put: function(url) {
											console.log('Upload completed. Uploaded to: ' + url);
											uploadedImages++;

											if (uploadedImages >= imagesToUpload) {
												forwardToUserPage();
											}
										},
										onError: function(status) {
											forwardToUserPage();
										}
									});
								}, file.type);
							}, {
								maxWidth: 600,
								canvas: true
							});
						})(response.data.posts[i], $scope.posts[i].file);
					}
				}
			} else {
				forwardToUserPage();
			}
		}, function(response) {
			console.log(response);
		});

		function forwardToUserPage() {
			localStorage.setItem(config.keySettings + 'Welcome', true);
			window.location = "/by/" + $scope.user.username.toLowerCase();
		}
	};

	$scope.submitLogin = function() {
		$('.popover-form .button').attr('disabled', true).text('Loading…');
		var jsonPost = {
			'username': $scope.login.username,
			'password': $scope.login.password
		};

		AuthService.login(jsonPost).then(function(response) {
			if (typeof response.data.username !== 'undefined') {
				window.location = "/by/" + response.data.username;
			} else {
				$scope.flash.showMessage("Your password is incorrect");
				$('.popover-form .button').attr('disabled', false).text('OK');
			}
		});
	};

	// Init
	(function() {
		var post = {
			id: 0,
			sortrank: 0,
			content: "<p>Hello</p><p>I'm a text that you can edit</p><p><br></p><p>Add images and texts until you're happy.</p><p>Then publish your new website!</p><p><br></p><p>Customize your design by hitting the sliders in the top right corner.</p>",
			type: 0,
			template: 'postText.html'
		};

		$scope.posts.push(post);

		if (!iOS) {
			$timeout(function() {
				$('.post:last-child .post-editor').focus();
			}, 100);
		}
	})();
});

postiesApp.controller('PagePostsByUserCtrl', function(
	$scope, $http, $timeout, $upload, $sanitize, $filter, $analytics, config,
	Fonts, AuthService, UserService, FlashService, SettingsService) {

	$scope.settingsService = SettingsService;
	var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

	$scope.posts = [];

	$scope.flash = FlashService.getFlash();
	$scope.fonts = Fonts.getFonts();

	// Display welcome message
	if (localStorage.getItem(config.keySettings + 'Welcome')) {
		$analytics.eventTrack('Success', {  category: 'Sign up' });
		$('.welcome').show();
		localStorage.removeItem(config.keySettings + 'Welcome');
	}

	var urlPathName = location.pathname;
	var username = urlPathName.substr(urlPathName.lastIndexOf('/') + 1, urlPathName.length);

	// Fetch user posts
	UserService.getUserWithPosts(username).then(function(response) {
		var user = response.data;
		$scope.userSettings = user.settings;

		// Load fonts
		$scope.fonts.load([user.settings.typefaceparagraph, user.settings.typefaceheadline]);

		$scope.user = {
			'username': user.username,
			'isAuthenticated': user.is_authenticated
		};

		for (i = 0; i < user.posts.length; i++) {
			var post = user.posts[i];

			if (post.type === 0) {
				post.template = 'postText.html';
			} else if (post.type == 1) {
				post.template = 'postHeadline.html';
			} else if (post.type == 2) {
				post.template = 'postImage.html';
				post.isUploaded = true;
				post.key = config.S3URL + post.key;
			} else if (post.type == 3) {
				post.template = 'postVideo.html';
				post.isValidVideo = true;
			}

			$scope.posts.push(post);
		}
	});

	$scope.addPost = function($event) {
		$analytics.eventTrack('Add', {
			category: 'Content boxes',
			label: $event.target.getAttribute('data-analytics-label')
		});

		var jsonPost = {
			type: $event.target.getAttribute('data-type'),
			content: '',
			sortrank: $scope.posts.length
		};

		$http({
			url: '/api/postText',
			method: 'post',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			var post = response.data;
			post.helpText = $event.target.getAttribute('data-helptext');

			if (post.type === 0) {
				post.template = 'postText.html';
			} else if (post.type == 1) {
				post.template = 'postHeadline.html';
			} else if (post.type == 2) {
				post.template = 'postImage.html';
			} else if (post.type == 3) {
				post.template = 'postVideo.html';
			}

			$scope.posts.push(post);
			if (!iOS) {
				$timeout(function() {
					$('.post:last-child .post-editor').focus();
				}, 100);
			}
		}, function(response) {
			console.log(response);
		});

		$scope.showPostTypes = false;
	};

	$scope.savePost = function($event, post) {
		var postTextContent = post.content;

		postTextContent = Autolinker.link(postTextContent, {
			truncate: false,
			stripPrefix: false
		});

		if (postTextContent.length) {
			var jsonPost = {
				content: postTextContent,
				id: post.id
			};

			$http({
				url: '/api/postText',
				method: 'put',
				data: jsonPost,
				headers: config.headerJSON
			}).then(function(response) {
				$scope.flash.showMessage('saved...');
			}, function(response) {
				console.log(response);
			});
		}
	};

	$scope.savePostImage = function($files) {
		for (var i = 0; i < $files.length; i++) {
			var file = $files[i];

			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0,
					v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});

			var filename = guid + "." + file.name.split('.').pop();

			var jsonPost = {
				type: 2,
				sortrank: $scope.posts.length,
				filename: filename,
				isUploaded: false,
				template: 'postImage.html'
			};

			$http({
				url: '/api/postImage',
				method: 'post',
				data: jsonPost,
				headers: config.headerJSON
			}).then(function(response) {
				var jsonPost = response.data;
				jsonPost.file = file;

				var loadingImage = loadImage(file, function(resizedImage) {
						resizedImage.toBlob(function(blob) {
							$scope.posts.push(jsonPost);
							var s3upload = new S3Upload({
								s3_object_name: filename,
								s3_file: blob,
								onProgress: function(percent, message) {
									$scope.$apply(function() {
										jsonPost.uploadProgress = percent;
									});
								},
								onFinishS3Put: function(url) {
									jsonPost.key = config.S3URL + jsonPost.key;
									jsonPost.isUploaded = true;

									$scope.$apply(function() {
										$scope.showPostTypes = false;
									});
								},
								onError: function(status) {
									console.log('Upload error: ' + status);
								}
							});

						}, file.type);
					}, {
						maxWidth: 600,
						canvas: true
					}
				);

			}, function(response) {
				console.log(response);
			});
		}
	};

	$scope.savePostVideo = function($event, post) {
		var clipboardData = $event.originalEvent.clipboardData.getData('text/plain');
		var videoURL = posties.util.getYouTubeVideoID($sanitize(clipboardData));

		if (videoURL) {
			$event.target.innerHTML = videoURL;

			var jsonPost = {
				key: videoURL,
				id: post.id
			};

			$http({
				url: '/api/postVideo',
				method: 'put',
				data: jsonPost,
				headers: config.headerJSON
			}).then(function(response) {
				$($event.target).data('changed', false);
				$scope.flash.showMessage('saved...');
				post.isValidVideo = true;
				post.key = videoURL;
			}, function(response) {
				console.log(response);
			});
		} else {
			$scope.flash.showMessage('sorry that wasn\'t a valid YouTube address...');
			return;
		}
	};

	$scope.movePost = function(currentIndex, newIndex) {
		posties.util.swapItems($scope.posts, currentIndex, newIndex);

		var jsonPost = [];
		for (i = 0; i < $scope.posts.length; i++) {
			var post = $scope.posts[i];
			jsonPost.push({
				id: post.id,
				sortrank: i
			});
		}

		$http({
			url: '/api/postrank',
			method: 'post',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			console.log(response);
		}, function(response) {
			console.log(response);
		});
	};

	$scope.deletePost = function(currentIndex, post) {
		$http({
			url: '/api/posts',
			method: 'delete',
			data: post,
			headers: config.headerJSON
		}).then(function(response) {
			$scope.posts.splice(currentIndex, 1);
		}, function(response) {
			console.log(response);
		});
	};

	$scope.submitLogin = function() {
		var jsonPost = {
			'username': USERNAME,
			'password': $scope.login.password
		};

		AuthService.login(jsonPost).then(function(response) {
			if (typeof response.data.username !== 'undefined') {
				window.location = "/by/" + response.data.username;
			} else {
				$scope.flash.showMessage("Your password is incorrect");
			}
		});
	};
});


postiesApp.controller('PageErrorCtrl', function() {

});
