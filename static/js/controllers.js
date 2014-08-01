postiesApp.controller('PageIndexCtrl', function($scope, $http, $timeout, SettingsService, config) {

	$scope.posts = [];
	$scope.isStartPage = true;
	$scope.user = {};

	$scope.settingsService = SettingsService;
	$scope.userSettings = $scope.settingsService.getSettings();

	$scope.addPost = function($event) {
		var post = {
			id : Math.round(Math.random() * 1000),
			sortrank : $scope.posts.length + 1,
			content : $event.target.getAttribute('data-content'),
			type : $event.target.getAttribute('data-type'),
			template : $event.target.getAttribute('data-template')
		}

		$scope.posts.unshift(post);
		$scope.showPostTypes = false;
		$timeout(function() {
			$('#posts li:first-child pre:eq(0)').focus();
		}, 100);
	};

	$scope.savePost = function($event, post) {
		if($($event.target).data('changed')) {
			$('#flashSaved').fadeIn().delay(500).fadeOut();
			$($event.target).data('changed', false);
		}
	};

	$scope.movePost = function(currentIndex, newIndex) {
		swapItems($scope.posts, currentIndex, newIndex);

		for(i = 0; i < $scope.posts.length; i++) {
			$scope.posts[i].sortrank = $scope.posts.length - i;
		}
	}

	$scope.deletePost = function(currentIndex, post) {
		$scope.posts.splice(currentIndex, 1);
	}

	$scope.validateUserEmail = function($event) {
		if($scope.formCreateUser.email.$invalid) {
			$scope.formCreateUser.email.error = 'Email needs to be between 5 and 20 characters';

			return;
		}
		$http({
			url: '/api/users/email',
			method: 'get',
			params: { email : $scope.user.email }
		}).then(function(response) {
			if(response.data.user) {
				console.log("user email exists");
			} else {
				console.log("user email doesn't exist");
			}
		}, function(response) {
			console.log(response);
		});
	};

	$scope.validateUserUsername = function($event) {
		if($scope.formCreateUser.username.$invalid) {
			$scope.formCreateUser.username.error = 'Username needs to be between 5 and 20 characters';

			return;
		}
		$http({
			url: '/api/users',
			method: 'get',
			params: { username : $scope.user.username }
		}).then(function(response) {
			if(response.data.user) {
				console.log("user username exists");
			} else {
				console.log("user username doesn't exist");
			}
		}, function(response) {
			console.log(response);
		});
	};

	$scope.submitCreateUser = function() {
		if($scope.formCreateUser.$valid) {
			var posts = [];

			for(i = 0; i < $scope.posts.length; i++) {
				var post = $scope.posts[i];

				//Exclude images from initial posts
				if(post.type != 2) {
					posts.push(post);
				}
			}
			
			var jsonPost = { 
				email : $scope.user.email,
				username : $scope.user.username,
				password : $scope.user.password,
				posts : posts,
				settings : $scope.userSettings
			};

			$http({
				url: '/api/users',
				method: 'post',
				data: jsonPost,
				headers: config.headerJSON
			}).then(function(response) {
				console.log(response);
				window.location = "/by/" + response.data.username + "?intro=true";
			}, function(response) {
				console.log(response);
			});

		} else {
			console.log("form is invalid");
		}
	}

	//Angular doesn't do ng-change on contenteditable, using jQuery
	$('#posts').on('propertychange, input', 'pre', function(el) {
		$(this).data('changed', true);
	});
});

postiesApp.controller('PageLoginCtrl', function($scope, $http, SettingsService, AuthService, config) {

	$scope.submitLogin = function() {
		var jsonPost = JSON.stringify({ 
			'email' : $scope.user.email,
			'password' : $scope.user.password
		});

		AuthService.login(jsonPost).then(function(response) {
			if(response.status == 200) {
				window.location = "/by/" + response.data.username;
			} else {
				$scope.formLogin.error = response.data.error;
			}
		});
	}

});

postiesApp.controller('PagePostsByUserCtrl', function($scope, $http, $timeout, SettingsService, config, $upload) {

	$scope.posts = [];
	$scope.userOwnsPage = $('body').hasClass('userOwnsPage');
	$scope.settingsService = SettingsService;
	
	/*$scope.settingsService.getSettings().then(function(data) {
		$scope.settings = data;
	});*/

	var urlPathName = location.pathname;
	var username = urlPathName.substr(urlPathName.lastIndexOf('/') + 1, urlPathName.length);

	//Fetch user posts
	$http({
		url: '/api/user',
		method: 'get',
		params: { 'username' : username },
		headers: config.headerJSON
	}).then(function(response) {
		$scope.userSettings = response.data.settings;
		$scope.user = { 'username' : response.data.username, 'isAuthenticated' : response.data.is_authenticated };

		for(i = 0; i < response.data.posts.length; i++) {
			var post = response.data.posts[i];

			if(post.type == 0) {
				post.template = 'postText.html';
			} else if(post.type == 1) {
				post.template = 'postHeadline.html';
			} else if(post.type == 2) {
				post.template = 'postImage.html';
			}

			$scope.posts.push(post);
		}
	}, function(response) {
		console.log(response);
	});

	$scope.addPost = function($event) {
		var jsonPost = {
			type : $event.target.getAttribute('data-type'),
			content : '',
			sortRank : $scope.posts.length
		};

		$http({
			url: '/api/postText',
			method: 'post',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			var post = response.data;
			
			if(post.type == 0) {
				post.template = 'postText.html';
			} else if(post.type == 1) {
				post.template = 'postHeadline.html';
			} else if(post.type == 2) {
				post.template = 'postImage.html';
			}

			$scope.posts.unshift(post);
			$timeout(function() {
				$('#posts li:first-child pre:eq(0)').focus();
			}, 100);
		}, function(response) {
			console.log(response);
		});

		$scope.showPostTypes = false;
	};

	$scope.savePostImage = function($files) {
		var jsonPost = {
			type : 2,
			sortRank : $scope.posts.length
		};

		for (var i = 0; i < $files.length; i++) {
			var file = $files[i];
			$scope.upload = $upload.upload({
				url: '/api/postImage',
				method: 'post',
				//withCredentials: true,
				data: jsonPost,
				file: file,
			}).progress(function(evt) {
				console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
			}).success(function(data, status, headers, config) {
				data.template = 'postImage.html';
				$scope.posts.unshift(data);
			}).error(function(response) {
				console.log(response);
			});
	    }
	};

	$scope.savePost = function($event, $index, post) {
		//Fix for Angulars non-handling of ng-model/two way data binding for contenteditable
		postTextContent = angular.element($event)[0].currentTarget.innerHTML;

		if(postTextContent.length && $($event.target).data('changed')) {
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
				$('#flashSaved').fadeIn().delay(500).fadeOut();
				$($event.target).data('changed', false);
			}, function(response) {
				console.log(response);
			});
		}
	};

	$scope.movePost = function(currentIndex, newIndex) {
		swapItems($scope.posts, currentIndex, newIndex);

		var jsonPost = [];
		for(i = 0; i < $scope.posts.length; i++) {
			var post = $scope.posts[i];
			jsonPost.push({ id : post.id, sortrank : $scope.posts.length - i });
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

	//Angular doesn't do ng-change on contenteditable, using jQuery
	$('#posts').on('propertychange, input', 'pre', function(el) {
		$(this).data('changed', true);
	});
});