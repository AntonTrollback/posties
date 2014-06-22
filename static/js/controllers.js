postiesApp.controller('PageIndexCtrl', function($scope, $http, SettingsService, config) {

	$scope.posts = [];
	$scope.isUserAuthenticated = angular.element('head').hasClass('authenticated');
	$scope.isStartPage = true;

	$scope.settingsService = SettingsService;
	$scope.settings;

	$scope.settingsService.getSettings().then(function(d) {
		$scope.settings = d;
	});

	$scope.addPost = function($event) {
		var post = {
			'id' : Math.round(Math.random() * 1000),
			'sortrank' : $scope.posts.length + 1,
			'content' : $event.target.getAttribute('data-content'),
			'type' : $event.target.getAttribute('data-type'),
			'template' : $event.target.getAttribute('data-template')
		}

		$scope.posts.unshift(post);
		$scope.showPostTypes = false;
	};

	$scope.savePost = function($event, post) {
		if($($event.target).data('changed')) {
			$('#flashSaved').fadeIn().delay(500).fadeOut();
			$($event.target).data('changed', false);
		}
	};

	$scope.movePost = function(currentIndex, newIndex) {
		swapItems($scope.posts, currentIndex, newIndex);
	}

	$scope.deletePost = function(currentIndex, post) {
		$scope.posts.splice(currentIndex, 1);
	}

	$scope.publish = function() {
		if(!$scope.isUserAuthenticated) {
			angular.element('.modal.createUser').toggle();
		}
	}

	$scope.submitCreateUser = function() {
		if($scope.userForm.$valid) {
			var formCreateUser = $('#formCreateUser');

			var posts = [];
			
			var numberOfPosts = $('#posts > li').length;
			$('.postText, .postHeadline').each(function(index) { 
				var content = $(this).text();
				var type = $(this).hasClass('postText') ? 0 : 1;

				posts.push({ 'content' : content, 'sortrank' : numberOfPosts - index, 'type' : type });
			});

			var jsonPost = JSON.stringify({ 
				'email' : formCreateUser.find('.email:eq(0)').val(),
				'username' : formCreateUser.find('.username:eq(0)').val(),
				'password' : formCreateUser.find('.password:eq(0)').val(),
				'posts' : posts
			});

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

postiesApp.controller('PagePostsByUserCtrl', function($scope, $http, SettingsService, config) {

	$scope.posts = [];
	
	$scope.settingsService = SettingsService;
	
	/*$scope.settingsService.getSettings().then(function(data) {
		$scope.settings = data;
	});*/

	$scope.submitUpdateSettings = function() {
		console.log($scope);
	}

	var urlPathName = location.pathname;
	var username = urlPathName.substr(urlPathName.lastIndexOf('/') + 1, urlPathName.length);

	//Fetch user posts
	$http({
		url: '/api/users',
		method: 'get',
		params: { 'username' : username },
		headers: config.headerJSON
	}).then(function(response) {
		$scope.userSettings = response.data.settings;
		$scope.user = { 'username' : response.data.username, 'isAuthenticated' : response.data.is_authenticated };

		for(i = 0; i < response.data.posts.length; i++) {
			var post = response.data.posts[i];

			if(post.type == 0) {
				post['template'] = 'postText.html';
			} else if(post.type == 1) {
				post['template'] = 'postHeadline.html';
			} else if(post.type == 2) {
				post['template'] = 'postImage.html';
			}

			$scope.posts.push(post);
		}
	}, function(response) {
		console.log(response);
	});

	$scope.addPost = function($event) {
		var postType = $event.target.getAttribute('data-type');

		$http({
			url: '/api/postText',
			method: 'post',
			data: { 'content' : '', 'type' : postType },
			headers: config.headerJSON
		}).then(function(response) {
			var post = response.data;
			
			if(post.type == 0) {
				post['template'] = 'postText.html';
			} else if(post.type == 1) {
				post['template'] = 'postHeadline.html';
			} else if(post.type == 2) {
				post['template'] = 'postImage.html';
			}

			$scope.posts.unshift(post);
		}, function(response) {
			console.log(response);
		});

		$scope.showPostTypes = false;
	};

	$scope.savePost = function($event, $index, post) {
		//Fix for Angulars non-handling of ng-model/two way data binding for contenteditable
		postTextContent = angular.element($event)[0].currentTarget.innerHTML;

		if(postTextContent.length && $($event.target).data('changed')) {
			var jsonPost = JSON.stringify({ 
				'content' : postTextContent,
				'id' : post.id
			});

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
		var isUpRanked = currentIndex > newIndex;
		var movedPost = $scope.posts[currentIndex];
		var affectedSiblingPost = isUpRanked ? $scope.posts[currentIndex - 1] : $scope.posts[currentIndex + 1];

		jsonPost = JSON.stringify({
			'movedPostID' : movedPost.id,
			'movedPostRank' : isUpRanked ? movedPost.sortrank + 1 : movedPost.sortrank - 1,
			'affectedSiblingPostID' : affectedSiblingPost.id,
			'affectedSiblingPostRank' : isUpRanked ? affectedSiblingPost.sortrank - 1 : affectedSiblingPost.sortrank + 1,
		});

		$http({
			url: '/api/postrank',
			method: 'post',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			swapItems($scope.posts, currentIndex, newIndex);
		}, function(response) {
			console.log(response);
		});
	}

	$scope.deletePost = function(currentIndex, post) {
		var jsonPost = JSON.stringify({ 'id' : post.id });

		$http({
			url: '/api/posts',
			method: 'delete',
			data: jsonPost,
			headers: config.headerJSON
		}).then(function(response) {
			$scope.posts.splice(currentIndex, 1);
		}, function(response) {
			console.log(response);
		});
	}

	//Angular doesn't do ng-change on contenteditable, using jQuery
	$('#posts').on('propertychange, input', 'pre', function(el) {
		$(this).data('changed', true);
	});
});