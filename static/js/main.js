$(document).ready(function() {

	function initModuleCreatePostText() {
		var contentText = $('#postText');
		if(contentText.length) {
			contentText.html(posties.util.trimText(contentText.html()));

			if($('.page.index').length) {
				$('#createPostText').fadeIn();
			}
		}
	}

	function initPublishButton() {
		$('#publish').click(function(event) {
			event.preventDefault();

			createPostText();
		})
	}

	function initModuleCreateUser() {
		$('#createUser').submit(function(event) {
			event.preventDefault();

			var form = $(this);
			var jsonPost = JSON.stringify({ 
				'email' : $('#email').val(),
				'username' : $('#username').val(),
				'password' : $('#password').val()
			});
			
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: form.attr('method'),
				url: form.attr('action'),
				data: jsonPost,
				success: function(jsonResponse) {
					console.log(jsonResponse);
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});

			$('.modal').fadeOut();
		});
	}

	function createPostText() {
		if(posties.util.isUserLoggedIn()) {
			var form = $('#createPostText');
			var jsonPost = JSON.stringify({ 'content' : posties.util.trimText($('#postText').html())});
			
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: form.attr('method'),
				url: form.attr('action'),
				data: jsonPost,
				success: function(jsonResponse) {
					console.log(jsonResponse);
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});
		} else {
			$('.modal.createUser').fadeIn();
		}
	}

	function initPosts() {
		$('#posts .delete').click(function(event) {
			event.preventDefault();

			var jsonPost = JSON.stringify({ 'id' : $(event.target).data('id') });

			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: 'post',
				url: '/api/delete',
				data: jsonPost,
				success: function(jsonResponse) {
					console.log(jsonResponse);
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});
		});
	}

	function initAddPostTypes() {
		$('.add.postText').click(function() {
			console.log("add post text")
			$('#createPostText').fadeIn();
		})
	}

	function initModals() {
		$(document).keydown(function(e) {
			if (e.keyCode == 27) { 
				$('.modal').fadeOut();
			}
		});
	}

	initModuleCreatePostText();
	initModuleCreateUser();
	initPublishButton();
	initAddPostTypes();
	initPosts();
	initModals();
});