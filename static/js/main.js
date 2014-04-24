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

			if($(this).attr('href')) {
				$($(this).attr('href')).fadeToggle();
			} else {
				var target = $($(this).data('target'));

				if(target.hasClass('colorPicker')) {
					$('.colorPicker').hide();
				}

				target.fadeToggle();
			}
		});

		$(document).keydown(function(e) {
			if (e.keyCode == 27) { 
				$('.modal').fadeOut();
			}
		});
	}

	function initColorPickers() {
		$('.colorPicker').on('click', 'a', function(event) {
			$(this).parents('fieldset:eq(0)').find('input:eq(0)')
				.attr('data-color', $(this).data('color'))
				.css('background', $(this).data('color'));

			$(this).parents('.colorPicker').hide();
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
		var formCreateUser = $('#createUser');
		var inputUsername = formCreateUser.find('.username:eq(0)'); 

		inputUsername.keyup(function() {
			formCreateUser.find('.url span').text($(this).val());
		});

		formCreateUser.submit(function(event) {
			event.preventDefault();
			var jsonPost = JSON.stringify({ 
				'email' : $('#createUser .email:eq(0)').val(),
				'username' : $('#createUser .username:eq(0)').val(),
				'password' : $('#createUser .password:eq(0)').val(),
				'postText' : $('#postText').val().linkify()
			});
			
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: formCreateUser.attr('method'),
				url: formCreateUser.attr('action'),
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

	function initModuleUpdateSettings() {
		var formUpdateSettings = $('#updateSettings');

		//GET user settings
		$('#modalMenu').on('click', '.toggler.settings', function() {
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: 'get',
				url: '/api/settings',
				success: function(jsonResponse) {
					formUpdateSettings.find('#postTextColor').attr('data-color', jsonResponse.posttextcolor)
					.css('background', jsonResponse.posttextcolor);

					formUpdateSettings.find('#postBackgroundColor').attr('data-color', jsonResponse.postbackgroundcolor)
					.css('background', jsonResponse.postbackgroundcolor);

					formUpdateSettings.find('#pageBackgroundColor').attr('data-color', jsonResponse.pagebackgroundcolor)
					.css('background', jsonResponse.pagebackgroundcolor);

					var selectTypeface = formUpdateSettings.find('#typeface');

					selectTypeface.css('font-family', jsonResponse.typeface);

					selectTypeface.find('option').each(function() {
						if($(this).val() == jsonResponse.typeface) {
							$(this).attr('selected', true);
							return false; //break 'each' loop
						}
					});

					selectTypeface.change(function() {
						$(this).css('font-family', $(this).find(':selected').text());
					});
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});
		});

		//PUT user settings
		formUpdateSettings.submit(function(event) {
			event.preventDefault();

			var jsonPost = JSON.stringify({ 
				'postTextColor' : $('#postTextColor').data('color').toLowerCase(),
				'postBackgroundColor' : $('#postBackgroundColor').data('color').toLowerCase(),
				'pageBackgroundColor' : $('#pageBackgroundColor').data('color').toLowerCase(),
				'typeface' : $('#typeface option:selected').text()
			});

			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: formUpdateSettings.attr('method'),
				url: formUpdateSettings.attr('action'),
				data: jsonPost,
				success: function(jsonResponse) {
					$('.modal').fadeOut();
					location.reload();
				},
				error: function(jsonResponse) {
					console.log(jsonResponse);
				}
			});
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
		if(posties.util.isPage('errorUserNotFound')) {
			initModuleCreatePostText();
		}
	}

	/* GLOBAL MODULES */
	initPublishButton();
	initTogglers();
	initColorPickers();
	initModuleCreatePostText();
	initModuleUpdateSettings();

	/* PAGES */
	initPageIndex();
	initPagePostsByUser();
	initPageErrorUserNotFound();
});