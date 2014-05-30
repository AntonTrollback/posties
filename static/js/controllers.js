postiesApp.controller('PageIndexCtrl', function($scope, $filter, $http) {

	$scope.posts = [];
	$scope.isUserAuthenticated = angular.element('head').hasClass('authenticated');

	$scope.addPost = function($event) {

		var post = {
			'id' : Math.round(Math.random() * 1000),
			'sortrank' : $scope.posts.length + 1,
			'content' : $event.target.getAttribute('data-content'),
			'type' : $event.target.getAttribute('data-type'),
			'template' : $event.target.getAttribute('data-template')
		}

		$scope.posts.push(post);
		$scope.showPostTypes = false;
	};

	$scope.movePost = function($event) {

		var thisPost = $event.target.parentNode.parentNode.parentNode;
		var post = $filter('getById')($scope.posts, thisPost.getAttribute('data-id'));

		var index = 0;
		if($event.target.className === 'up') {
			index = post['iteration'] - 1;
		} else if($event.target.className === 'down') {
			index = post['iteration'] + 1;
		}

		swapItems($scope.posts, post['iteration'], index);
	}

	$scope.publish = function() {
		if(!$scope.isUserAuthenticated) {
			angular.element('.modal.createUser').toggle();
		}
	}

	$scope.submitCreateUser = function() {
		if($scope.userForm.$valid) {
			var formCreateUser = $('#createUser');

			var posts = [];
			
			var numberOfPosts = $('#posts > li').length;
			$('.postText, .postHeadline').each(function(index) { 
				var content = $(this).text().linkify();
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
				headers: {
					'Content-Type': 'application/json;charset=UTF-8'
				}
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
});