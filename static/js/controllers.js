postiesApp.controller('PageIndexCtrl', function($scope, $filter) {

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
			console.log("form is valid");

			var formCreateUser = $('#createUser');

			var jsonPost = JSON.stringify({ 
				'email' : formCreateUser.find('.email:eq(0)').val(),
				'username' : formCreateUser.find('.username:eq(0)').val(),
				'password' : formCreateUser.find('.password:eq(0)').val(),
				'postText' : $('#postText').val().linkify()
			});

			console.log(jsonPost);
			/*
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: formCreateUser.attr('method'),
				url: formCreateUser.attr('action'),
				data: jsonPost,
				success: function(jsonResponse) {
					window.location = "/by/" + jsonResponse.username + "?intro=true";
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});*/
		} else {
			console.log("form is invalid");
		}

		console.log($scope.user);
	}
});