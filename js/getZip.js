var zipCode;
var zipCodeFlag = false;
function fail(err) {
	console.log('err', err);
	zipCodeFlag = true;
}
if(navigator.geolocation) {
	var fallback = setTimeout(function() { fail('timed out'); }, 10000);
	navigator.geolocation.getCurrentPosition(
		function (pos) {
			clearTimeout(fallback);
			var point = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
			new google.maps.Geocoder().geocode({'latLng': point}, function (res, status) {
				if(status === google.maps.GeocoderStatus.OK && typeof res[0] !== 'undefined') {
					var zip = res[0].formatted_address.match(/,\s\w{2}\s(\d{5})/);
					if(zip) {
						zipCode = (zip[1]);
						zipCodeFlag = true;
					} else fail('Failed to parse');
				} else {
					fail('Failed to reverse');
				}
			});
		}, function(err) {
			fail(err.message);
		}
	);
} else {
	console.log('Geolocation unsupported');
	//$("#zip").html('Geolocation unsupported!');
}
