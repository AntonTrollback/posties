$(document).ready(function() {

	var isUserLoggedIn = false;

	function initModuleCreateText() {
		var contentText = $('#contentText');
		contentText.html(posties.util.trimText(contentText.html()));
		contentText.fadeIn();
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

	function initModals() {
		$(document).keydown(function(e) {
			if (e.keyCode == 27) { 
				$('.modal').fadeOut();
			}
		});
	}

	$('#createPost').submit(function(event) {
		event.preventDefault();

		if(isUserLoggedIn) {
			var form = $(this);
			var jsonPost = JSON.stringify({ 'contentText' : posties.util.trimText($('#contentText').html())});
			
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
	});

	initModuleCreateText();
	initModuleCreateUser();
	initModals();
});