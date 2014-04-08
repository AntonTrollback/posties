$(document).ready(function() {

	function initPublishButton() {
		$('#body').on('click', '#btnPublishContainer button', function(event) {
			event.preventDefault();

			createPostText();
		})
	}

	function initTogglers() {
		$('body').on('click', '.toggler', function(event) {
			event.preventDefault();

			$($(this).attr('href')).fadeToggle();
		});

		$(document).keydown(function(e) {
			if (e.keyCode == 27) { 
				$('.modal').fadeOut();
			}
		});
	}

	function initModuleCreatePostText() {
		var contentText = $('#postText');
		if(contentText.length) {
			if($('.page.index').length) {
				$('#createPostText').fadeIn(function() {
					$('#postTypes').fadeIn(function() {
						$('#btnPublishContainer').fadeIn();
					});
				});
			}
		}
	}

	function initModuleCreateUser() {
		$('#createUser').submit(function(event) {
			event.preventDefault();

			var form = $(this);
			var jsonPost = JSON.stringify({ 
				'email' : $('#email').val().toLowerCase(),
				'username' : $('#username').val().toLowerCase(),
				'password' : $('#password').val(),
				'postText' : $('#postText').val().linkify()
			});
			
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: form.attr('method'),
				url: form.attr('action'),
				data: jsonPost,
				success: function(jsonResponse) {
					window.location = "/by/" + jsonResponse.username;
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
			var jsonPost = JSON.stringify({ 'content' : $('#postText').val().linkify() });
			
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: form.attr('method'),
				url: form.attr('action'),
				data: jsonPost,
				success: function(jsonResponse) {

					if(posties.util.isPage('postsByUser')) {
						var tmpPostText = $('#tmpPostText').html();
						Mustache.parse(tmpPostText);
						var html = Mustache.render(tmpPostText, { post : jsonResponse });
						
						$.when($('#createPostText, #btnPublishContainer').fadeOut()).done(function() {
							$('#posts').prepend($(html).fadeIn());
						});
					} else if(posties.util.isPage('index')) {
						window.location = "/by/" + jsonResponse.username;
					}
					
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});
		} else {
			$('.modal.createUser').fadeIn();
		}
	}

	function initGetPosts() {
		$('#posts').on('click', '.delete', function(event) {
			event.preventDefault();

			var jsonPost = JSON.stringify({ 'id' : $(event.target).data('id') });

			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: 'delete',
				url: '/api/posts',
				data: jsonPost,
				success: function(jsonResponse) {
					$(event.target).parents('li:eq(0)').fadeOut();
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});
		});
	}

	function initPageIndex() {
		if(posties.util.isPage('index')) {
			initModuleCreatePostText();
			initModuleCreateUser();
		}
	}

	function initPagePostsByUser() {
		if(posties.util.isPage('postsByUser')) {
			initModuleCreatePostText();
			initGetPosts();

			$('.add.postText').click(function() {
				$('#createPostText, #btnPublishContainer').fadeIn();
			})
		}
	}

	function initPageErrorUserNotFound() {
		if(posties.util.isPage('userNotFound')) {
			initModuleCreatePostText();
		}
	}

	/* GLOBAL MODULES */
	initPublishButton();
	initTogglers();

	/* PAGES */
	initPageIndex();
	initPagePostsByUser();
	initPageErrorUserNotFound();
});