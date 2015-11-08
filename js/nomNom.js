//Class
var Row = function(elementsPerRow) {
	this.elementsPerRow = elementsPerRow;
}

//Methods
Row.prototype.populateHtml = function() {
	var honeyCombHtml = '<div class="row">';
	for (i = 0; i < this.elementsPerRow; i++) {
		if ($('.row').length == 2 && i == 3) {
			honeyCombHtml += '<div class="hex" id="show-more">';
			honeyCombHtml += '<div class="corner-1"></div>';
			honeyCombHtml += '<div class="corner-2"></div><p style="line-height:86px;">SHOW MORE</p>';
			honeyCombHtml += '</div>';
		}
		else {
			honeyCombHtml += '<div class="hex cell" style="background-image: url(http://www.queness.com/resources/html/css3-hexagon/images/2.jpg);">';
			honeyCombHtml += '<div class="corner-1"></div>';
			honeyCombHtml += '<div class="corner-2"></div>';
			honeyCombHtml += '</div>';
		}
	}	
	honeyCombHtml += '</div>';
	$('#honeyComb').append(honeyCombHtml);
}

//TODO: Would like to extend the "elements per row" to be dynamic based on browser/device width.. this is currently static for desktop.
var rows = [new Row(3), new Row(4), new Row(4)]
var startCell = 0;

//singleton for retrieving foursquare data (name, address, image, likes)
var fourSquare = {
	config : {
		foodSpots : [],
	},
	init : function() {
		fourSquare.pingFourSquare();
	},
	orderResultsByRank : function() {
		fourSquare.config.foodSpots.sort(function(a,b){
			return b.likes-a.likes
		});
		populateTheCells(0);
	},
	pingFourSquare : function() {
		var httpRequest = 'https://api.foursquare.com/v2/venues/search?client_id=5TN04INYIF1T2C2QIO24I1YV2R41KTDN0YAYIRKRANEPUAPS&client_secret=0MO2N2SNHPNYF21LGYQSTYB3USPDXXEIJXV40UFLQDF4IHAJ&v=20130815&near=' + zipCode + '&categoryId=4d4b7105d754a06374d81259&limit=31&radius=200';
		$.ajax({
			xhrFields: {
				withCredentials: false
			},
			crossDomain: true,
			type: "GET",
			url: httpRequest,
			dataType: "json",
			success: function(json) {
				$(json.response.venues).each(function(i){
					console.log(this.name);
					fourSquare.config.foodSpots[i] = {};
					fourSquare.config.foodSpots[i].name = this.name;
					fourSquare.config.foodSpots[i].address = this.location.formattedAddress[0];
					fourSquare.getNumberOfLikes(this.id, i);
					fourSquare.getImagePath(this.id, i);
				});
			},
			error: function(json) {
				console.log("Error pinging FourSquare");
			}
		}).done(function(){
			setTimeout(function(){fourSquare.orderResultsByRank()},2000);
		});	
	},
	getNumberOfLikes : function(resultsId,index) {
		var httpRequest = 'https://api.foursquare.com/v2/venues/' + resultsId + '/likes?client_id=5TN04INYIF1T2C2QIO24I1YV2R41KTDN0YAYIRKRANEPUAPS&client_secret=0MO2N2SNHPNYF21LGYQSTYB3USPDXXEIJXV40UFLQDF4IHAJ&v=20130815';
		console.log(resultsId);
		$.ajax({
			xhrFields: {
				withCredentials: false
			},
			crossDomain: true,
			type: "GET",
			url: httpRequest,
			dataType: "json",
			success: function(json) {
				fourSquare.config.foodSpots[index].likes = json.response.likes.count
			},
			error: function(json) {
				console.log("Error getting Likes");
			}
		});	
	},
	getImagePath : function(resultsId,index) {
		var httpRequest = 'https://api.foursquare.com/v2/venues/' + resultsId +'/photos?client_id=5TN04INYIF1T2C2QIO24I1YV2R41KTDN0YAYIRKRANEPUAPS&client_secret=0MO2N2SNHPNYF21LGYQSTYB3USPDXXEIJXV40UFLQDF4IHAJ&v=20130815';
		$.ajax({
			xhrFields: {
				withCredentials: false
			},
			crossDomain: true,
			type: "GET",
			url: httpRequest,
			dataType: "json",
			success: function(json) {
				fourSquare.config.foodSpots[index].img
				if (json.response.photos.count === 0)
						fourSquare.config.foodSpots[index].img = '../img/noimage.png';
				else
					fourSquare.config.foodSpots[index].img = json.response.photos.items[0].prefix + '200x200' + json.response.photos.items[0].suffix;
			},
			error: function(json) {
				console.log("Error getting Images");
			}
		});	
	}	
}

var showMore = {
	init : function() {
		$('#show-more').on('click',function(){
			startCell = startCell + 10;
			showMore.loadNewData();
		});
	},
	loadNewData : function() {
		populateTheCells(startCell);
	}
}


var zipEntry = {
	init : function() {
		zipEntry.bindEnter();
	},
	bindEnter : function() {
		$(document).keypress(function(e){
			if (e.which == 13){
				zipEntry.entered();
			}
		});
	},
	entered : function() {
		zipCode = Number($('#zip-code').val());
		fourSquare.init();
	}
}

function populateTheCells(startCell){
	$('.cell').each(function(i){
			var j = startCell + i;
			//populate the cells with the background image and name/address data
			$(this).css('background-image', 'url(' + fourSquare.config.foodSpots[j].img + ')');
			
			//building the mouseover layer
			$(this).find('.flip-side').remove();
			$(this).find('.corner-2').after('<div class="flip-side"><span class="title">' + fourSquare.config.foodSpots[j].name + '</span><hr /><span class="address">' + fourSquare.config.foodSpots[j].address + '</span></div>');

			//account for cells without images
			$(this).removeClass('display-flip-side');
			if (fourSquare.config.foodSpots[j].img == "../img/noimage.png")
				$(this).addClass('display-flip-side');
			
			//add mouseover binds to cells with images
			else {
				$(this).on('mouseover',function(){
					$(this).addClass('display-flip-side');
				});
				$(this).on('mouseout',function(){
					$(this).removeClass('display-flip-side');
				});
			}
	});
};



//on document ready
$(function() {
	//build the html for the rows
	$(rows).each(function(i){
		rows[i].populateHtml();
	});
	
	showMore.init();
	zipEntry.init();

	//Wait for the Zip Code before pinging Four Square
	function checkForZip(){
		if (zipCodeFlag && zipCode != "undefined") {
			console.log("checking for resturants in the " + zipCode + " area");
			fourSquare.init();
		} else {
			setTimeout(function(){checkForZip()},1000)
		};
	};
	checkForZip();

});