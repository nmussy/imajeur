$(document).ready(function () {
	fetchImajeuries();
});

function fetchImajeuries() {
	$.ajax({
		url: '../php/fetchImajeuries.php',
		data: {IMAJEUR_id: $('#userBlock').data('imajeur-id')},
		success: function(data) {
			console.log(data);
			data = JSON.parse(data);
			$.each(data, function(index, imajeurie) {
				$('#imajeuries').append(
		          '<div class="imajeurie" data-imajeurie-id="' + imajeurie.id + '">'+
		            '<span class="imajeurie-thumb"><img class="imajeurie-thumb-img" src="' + imajeurie.thumb + '" alt="tumb" /></span>'+
		            '<span class="imajeurie-title">' + imajeurie.title + '</span>'+
		          '</div>'
				);
			});
		}
	});
}