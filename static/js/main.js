$(document).ready(function() {

	function initPublishButton() {
		$('#body').on('click', '#btnPublishContainer button', function(event) {
			event.preventDefault();

			if($('#createPostText').is(':visible')) {
				createPostText();
			} else if($('#createPostImage').is(':visible')) {
				createPostImage();
			} else if($('#createPostHeadline').is(':visible')) {
				createPostHeadline();
			}
		});
	}

	function initAddPostButton() {
		var btnAddPost = $('#addPost');
		var postTypes = $('#postTypes');

		btnAddPost.click(function(event) {
			event.preventDefault();

			postTypes.show();
			$(this).hide();
		});

		postTypes.mouseleave(function() {
			$(this).hide();
			btnAddPost.show();
		});
	}

	function initFlash() {
		$('#flash').on('click', '.close', function() {
			$('#flash').fadeOut();
		});
	}

	function initTogglers() {
		$('body').on('click', '.toggler', function(event) {
			event.preventDefault();

			if($(this).attr('href')) {
				$($(this).attr('href')).fadeToggle();
			} else {
				var target = $($(this).data('target'));

				target.fadeToggle();
			}
		});

		$(document).keydown(function(e) {
			if (e.keyCode == 27) { 
				$('.modal').fadeOut();
			}
		});

		$('body').on('click', '.close', function(event) {
			$(event.target).closest('.modal').fadeOut();
		});
	}

	function initColorPickers() {
		$('.colorpicker').colpick({ 
			layout : 'hex', 
			onSubmit: function(hsb, hex, rgb, el) {
				$(el).parents('fieldset:eq(0)').find('input:eq(0)')
				.attr('data-color', '#' + hex)
				.css('background', '#' + hex);

				$(el).colpickHide();
			}
		});
	}

	function initModuleCreatePostText() {
		var contentText = $('#postText');
		if(contentText.length) {
			if($('.page.index').length) {
				$('#createPostText').fadeIn(function() {
					$('#btnPublishContainer').fadeIn();
				});
			}
		}
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

	function createPostHeadline() {
		if(posties.util.isUserLoggedIn()) {
			var form = $('#createPostHeadline');
			var jsonPost = JSON.stringify({ 'content' : $('#postHeadline').val().linkify() });
			
			$.ajax({
				contentType: 'application/json;charset=UTF-8',
				type: form.attr('method'),
				url: form.attr('action'),
				data: jsonPost,
				success: function(jsonResponse) {

					if(posties.util.isPage('postsByUser')) {
						var tmpPostHeadline = $('#tmpPostHeadline').html();
						Mustache.parse(tmpPostHeadline);
						var html = Mustache.render(tmpPostHeadline, { post : jsonResponse });
						
						$.when($('#createPostHeadline, #btnPublishContainer').fadeOut()).done(function() {
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

	function initModuleCreatePostHeadline() {
		$('.add.postHeadline').click(function() {
			$('#createPostHeadline').show();
			$('#btnPublishContainer').fadeIn();
		});
	}

	function initModuleCreatePostImage() {
		$('.add.postImage').click(function() {
			$('#createPostImage input').click();
			$('#postTypes').hide();
			$('#btnPublishContainer').fadeIn();
		})
	}

	function createPostImage() {
		if(posties.util.isUserLoggedIn()) {
			var form = $('#createPostImage');

			form.submit();
		} else {
			$('.modal.createUser').fadeIn();
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
					window.location = "/by/" + jsonResponse.username + "?intro=true";
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
		$('#menu').on('click', '.toggler.settings', function() {
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

		$('#posts').on('click', '.sorter a', function(event) {
			event.preventDefault();

			var thisPost = $(this).parents('li:eq(0)');
			var prevPost = thisPost.prev();
			var nextPost = thisPost.next()

			//See if there's a prev and next to re-order by
			var hasPrev = prevPost.length !== 0;
			var hasNext = nextPost.length !== 0;

			var jsonPost = false;

			if($(this).hasClass('up') && hasPrev) {
				jsonPost = JSON.stringify({
					'upRankedID' : thisPost.data('id'),
					'upRankedValue' : thisPost.data('rank'),
					'downRankedID' : prevPost.data('id'),
					'downRankedValue' : prevPost.data('rank'),
				});
			} else if($(this).hasClass('down') && hasNext) {
				jsonPost = JSON.stringify({
					'upRankedID' : nextPost.data('id'),
					'upRankedValue' : nextPost.data('rank'),
					'downRankedID' : thisPost.data('id'),
					'downRankedValue' : thisPost.data('rank'),
				});
			}

			if(jsonPost) {
				$.ajax({
					contentType: 'application/json;charset=UTF-8',
					type: 'post',
					url: '/api/postrank',
					data: jsonPost,
					success: function(jsonResponse) {
						location.reload();
					},
					error: function(jsonResponse) {
						console.log(jsonResponse);
					}
				});
			}
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

			if(posties.util.getQueryParamByName('intro')) {
				var tmpFlashUserCreated = $('#tmpFlashUserCreated').html();
				Mustache.parse(tmpFlashUserCreated);
				var html = Mustache.render(tmpFlashUserCreated);
				$('#flash').append(html).fadeIn();
			}

			$('.add.postText').click(function() {
				$('#createPostText, #btnPublishContainer').fadeIn();
				$('#postTypes').hide();
				$('#addPost').show();
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
	initAddPostButton();
	initFlash();
	initTogglers();
	initColorPickers();
	initModuleCreatePostText();
	initModuleCreatePostHeadline();
	initModuleCreatePostImage();
	initModuleUpdateSettings();

	/* PAGES */
	initPageIndex();
	initPagePostsByUser();
	initPageErrorUserNotFound();
});