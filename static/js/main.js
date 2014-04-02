$(document).ready(function() {

	function initModuleTextContent() {
		var contentText = $('#contentText');
		contentText.html(posties.util.trimText(contentText.html()));
		contentText.fadeIn();
	}

	$('#createPost').submit(function(event) {
		event.preventDefault();

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

	})

	initModuleTextContent();
});