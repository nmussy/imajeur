$(document).one('ready', function () {
	$('#connectForm').one('submit', submitConnect);
});

function submitConnect() {
	$.ajax({
		url: '../php/connexion',
		data: $('#connectForm').serializeArray(),
		success: function (data) {
			console.log(data);
			data = JSON.parse(data);
			if(data.success) {
				
			} else {
				$('#connectForm').one('submit', submitConnect);
				$('#errorField').html('Votre mot de passe ou email est incorrect').fadeIn();
				setTimeout(function() {
					$('#errorField').fadeOut().empty();
				}, 5000);
			}
		}
	});
}