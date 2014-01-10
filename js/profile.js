$(document).ready(function () {
	fetchImajes();
});

function fetchImajes() {
	$.ajax({
		url: '../php/fetchImajes.php'
	});
}