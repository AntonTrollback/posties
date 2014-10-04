postiesApp.controller('PageIndexCtrl', function($scope, $http, $timeout, $upload, $sanitize,
	config, SettingsService, LoaderService, FlashService, Fonts) {

	$scope.posts = [];
	$scope.userHasUploadedImage = false;

	$scope.settingsService = SettingsService;
	$scope.userSettings = $scope.settingsService.getSettings();
	$scope.loader = LoaderService.getLoader();
	$scope.flash = FlashService.getFlash();
	$scope.fonts = Fonts.getFonts();

	$scope.fonts.load([$scope.userSettings.typefaceparagraph, $scope.userSettings.typefaceheadline]);

	var firstRun = true;
	$scope.$watchCollection('userSettings', function() {
		if(!firstRun) {
			SettingsService.submitUpdateSettings($scope.userSettings);
		}
		firstRun = false;
	});

	$scope.addPost = function($event) {
		var post = {
			id : Math.round(Math.random() * 1000),
			sortrank : $scope.posts.length,
			content : $event.target.getAttribute('data-content'),
			type : parseInt($event.target.getAttribute('data-type')),
			template : $event.target.getAttribute('data-template'),
			helpText : $event.target.getAttribute('data-helptext')
		};

		$scope.posts.push(post);
		$timeout(function() {
			$('.post:last-child pre').focus();
		}, 100);

		$scope.showPostTypes = false;
	};

	$scope.savePostImage = function($files) {
		var imageType = /image.*/;

		for (var i = 0; i < $files.length; i++) {
			var file = $files[i];

			if(file.type.match(imageType)) {
				var imagePost = {
					type : 2,
					sortrank : $scope.posts.length,
					template : 'postImage.html',
					file : file,
					isUploaded : false,
					uploadProgress : 0
				};

				$scope.posts.push(imagePost);

				var reader = new FileReader();
				reader.onprogress = function(e) {
					if(e.lengthComputable) {
						imagePost.uploadProgress = event.total;
					}
				};

				reader.onload = function(e) {
					$scope.$apply(function() {
						imagePost.isUploaded = true;
						imagePost.key = reader.result,
						$scope.userHasUploadedImage = true;
						$scope.showPostTypes = false;
					});
				}

				reader.readAsDataURL(file);
			}
	    }
	};

	$scope.savePostVideo = function($event, post) {
		$event.target.innerHTML = $event.target.innerHTML.replace(post.helpText, "");
		var videoURL = posties.util.getYouTubeVideoID($sanitize($event.originalEvent.clipboardData.getData('text/plain')));
		if(videoURL) {
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

		for(i = 0; i < $scope.posts.length; i++) {
			$scope.posts[i].sortrank = i;
		}
	};

	$scope.deletePost = function(currentIndex, post) {
		$scope.posts.splice(currentIndex, 1);
	};

	$scope.validateUserEmail = function($event) {
		if (typeof $scope.formCreateUser.email.$viewValue === 'undefined') {
			return;
		}

		if($scope.formCreateUser.email.$viewValue && $scope.formCreateUser.email.$invalid) {
			$scope.flash.showMessage("Uups. That's not a valid email");
			return;
		} else {
			delete $scope.formCreateUser.email.error;
		}

		$http({
			url: '/api/users/email',
			method: 'get',
			params: { email : $scope.user.email }
		}).then(function(response) {
			if(response.data.user) {
				$scope.formCreateUser.email.$invalid = true;
				$scope.flash.showMessage("The email address is already taken!");
			} else {
				$scope.formCreateUser.email.$invalid = false;
				delete $scope.formCreateUser.email.error;
			}
		}, function(response) {
			console.log(response);
		});
	};

	$scope.validateUserUsername = function($event) {
		if (typeof $scope.formCreateUser.username.$viewValue === 'undefined') {
			return;
		}

		console.log($scope.formCreateUser.username.$viewValue)

		if($scope.formCreateUser.username.$viewValue && $scope.formCreateUser.username.$invalid) {
			$scope.flash.showMessage('The username needs to be between 3 and 20 characters');
			return;
		} else {
			delete $scope.formCreateUser.username.error;
		}

		$http({
			url: '/api/users',
			method: 'get',
			params: { username : $scope.user.username }
		}).then(function(response) {
			if(response.data.user) {
				$scope.formCreateUser.username.$invalid = true;
				$scope.flash.showMessage('The username is already taken!');
			} else {
				$scope.formCreateUser.username.$invalid = false;
				delete $scope.formCreateUser.username.error;
			}
		}, function(response) {
			console.log(response);
		});
	};

	$scope.validateUserPassword = function($event) {
		if (typeof $scope.formCreateUser.password.$viewValue === 'undefined') {
			return;
		}

		if($scope.formCreateUser.password.$viewValue && $scope.formCreateUser.password.$invalid) {
			$scope.flash.showMessage('Your password needs to be between 5 and 20 characters long');

			return;
		} else {
			delete $scope.formCreateUser.password.error;
		}
	};

	$scope.submitCreateUser = function() {
		var redirectUser = false;

		if($scope.formCreateUser.$valid) {
			var $button =
			$('#formCreateUser button[type="submit"]').attr('disabled', true).text('Loading…');

			var jsonPost = {
				email : $scope.user.email,
				username : $scope.user.username,
				password : $scope.user.password,
				posts : $scope.posts,
				settings : $scope.userSettings
			};

			jsonPost.settings['username'] = $scope.user.username;

			$http({
				url: '/api/users',
				method: 'post',
				data: jsonPost,
				headers: config.headerJSON
			}).then(function(response) {
				if($scope.userHasUploadedImage) {
					$scope.loader.show();

					for(i = 0; i < response.data.posts.length; i++) {
						var jsonPost = response.data.posts[i];

						if(i + 1 == response.data.posts.length) {
							redirectUser = true;
						}

						if(jsonPost.type == 2) {
							var file = $scope.posts[i].file;

							var loadingImage = loadImage(
								file,
								function(resizedImage) {
									resizedImage.toBlob(function(blob) {
										var s3upload = new S3Upload({
											s3_object_name: jsonPost.key,
											s3_file: blob,
											onProgress: function(percent, message) {
												console.log('Upload progress: ' + percent + '% ' + message);
											},
											onFinishS3Put: function(url) {
												console.log('Upload completed. Uploaded to: ' + url);
												if(redirectUser) {
													forwardToUserPage();
												}
											},
											onError: function(status) {
												console.log('Upload error: ' + status);
											}
										});
									}, file.type);
								}, { maxWidth: 600, canvas: true }
							);
						}
					}
				} else {
					forwardToUserPage();
				}

			}, function(response) {
				console.log(response);
			});

			function forwardToUserPage() {
				$scope.loader.hide();
				localStorage.setItem(config.keySettings + 'Welcome', true);
				window.location = "/by/" + $scope.user.username;
			}
		} else {
			console.log("form is invalid");
		}
	};

	//Angular doesn't do ng-change on contenteditable, using jQuery
	$('#posts').on('propertychange, input', 'pre', function(el) {
		$(this).data('changed', true);
	});

	(function() {
	   var post = {
			id : 0,
			sortrank : 0,
			content : "Hello \nI'm a text that you can edit \n\n Add images and texts until you're happy. \n Then publish your new website! \n\n Customize your design by hitting the sliders in the top right corner.",
			type : 0,
			template : 'postText.html'
		};

		$scope.posts.push(post);

		$timeout(function() {
			$('.post:last-child pre').focus();
		}, 100);

	})();

});

postiesApp.controller('PageLoginCtrl', function($scope, AuthService, FlashService) {

	$scope.flash = FlashService.getFlash();

	$scope.submitLogin = function() {
		var jsonPost = JSON.stringify({
			'email' : $scope.user.email,
			'password' : $scope.user.password
		});

		AuthService.login(jsonPost).then(function(response) {
			if(response.status == 200) {
				window.location = "/by/" + response.data.username;
			} else {
				$scope.flash.showPermanentMessage(response.data.error);
			}
		});
	};

});

postiesApp.controller('PagePostsByUserCtrl', function($scope, $http, $timeout, $upload, $sanitize, $filter,
	config, UserService, SettingsService,
	LoaderService, FlashService, Fonts) {

	$scope.posts = [];
	$scope.userOwnsPage = $('body').hasClass('userOwnsPage');
	$scope.settingsService = SettingsService;
	$scope.loader = LoaderService.getLoader();
	$scope.flash = FlashService.getFlash();
	$scope.fonts = Fonts.getFonts();

	var firstRun = true;
	$scope.$watchCollection('userSettings', function() {
		if(!firstRun) {
			SettingsService.submitUpdateSettings($scope.userSettings);
		}
		firstRun = false;
	});

	if(localStorage.getItem(config.keySettings + 'Welcome')) {
		$scope.flash.showPermanentMessage('Welcome to your new Posties page! \n Your address is ' + window.location.host + window.location.pathname);
		localStorage.removeItem(config.keySettings + 'Welcome');
	}
	localStorage.removeItem(config.keySettings);

	var urlPathName = location.pathname;
	var username = urlPathName.substr(urlPathName.lastIndexOf('/') + 1, urlPathName.length);

	//Fetch user posts
	UserService.getUserWithPosts(username).then(function(data) {
		$scope.userSettings = data.settings;

		// Load fonts
		$scope.fonts.load([data.settings.typefaceparagraph, data.settings.typefaceheadline]);

		$scope.user = { 'username' : data.username, 'isAuthenticated' : data.is_authenticated };

		for(i = 0; i < data.posts.length; i++) {
			var post = data.posts[i];

			if(post.type == 0) {
				post.template = 'postText.html';
			} else if(post.type == 1) {
				post.template = 'postHeadline.html';
			} else if(post.type == 2) {
				post.template = 'postImage.html';
				post.isUploaded = true;
				post.key = config.S3URL + post.key;
			} else if(post.type == 3) {
				post.template = 'postVideo.html';
				post.isValidVideo = true;
			}

			$scope.posts.push(post);
		}
	});

	$scope.addPost = function($event) {
		var jsonPost = {
			type : $event.target.getAttribute('data-type'),
			content : '',
			sortrank : $scope.posts.length
		};

		$http({
			url: '/api/postText',
			method: 'post',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			var post = response.data;
			post.helpText = $event.target.getAttribute('data-helptext')

			if(post.type == 0) {
				post.template = 'postText.html';
			} else if(post.type == 1) {
				post.template = 'postHeadline.html';
			} else if(post.type == 2) {
				post.template = 'postImage.html';
			} else if(post.type == 3) {
				post.template = 'postVideo.html';
			}

			$scope.posts.push(post);
			$timeout(function() {
				$('.post:last-child pre').focus();
			}, 100);
		}, function(response) {
			console.log(response);
		});

		$scope.showPostTypes = false;
	};

	$scope.savePost = function($event, post) {
		var postTextContent = post.content;

		postTextContent = Autolinker.link(postTextContent, { truncate: false, stripPrefix: false });

		if(postTextContent.length) {
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
				$($event.target).data('changed', false);
				$scope.flash.showMessage('saved...');
			}, function(response) {
				console.log(response);
			});
		}
	};

	$scope.savePostImage = function($files) {
		for(var i = 0; i < $files.length; i++) {
			var file = $files[i];

			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    			return v.toString(16);
			});

			var filename = guid + "." + file.name.split('.').pop();

			var jsonPost = {
				type : 2,
				sortrank : $scope.posts.length,
				filename : filename,
				isUploaded : false,
				template : 'postImage.html'
			};

			$http({
				url: '/api/postImage',
				method: 'post',
				data: jsonPost,
				headers: config.headerJSON
			}).then(function(response) {
				var jsonPost = response.data;
				jsonPost['file'] = file;

				var loadingImage = loadImage(
					file,
					function(resizedImage) {
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
					}, { maxWidth: 600, canvas: true }
				);

			}, function(response) {
				console.log(response);
			});
		}
	};

	$scope.savePostVideo = function($event, post) {
		$event.target.innerHTML = $event.target.innerHTML.replace(post.helpText, "");
		var videoURL = posties.util.getYouTubeVideoID($sanitize($event.originalEvent.clipboardData.getData('text/plain')));

		if(videoURL) {
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
		for(i = 0; i < $scope.posts.length; i++) {
			var post = $scope.posts[i];
			jsonPost.push({ id : post.id, sortrank : i });
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
});

postiesApp.controller('PageErrorCtrl', function() {});
