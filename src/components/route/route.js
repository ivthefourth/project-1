import './route.css';
import state from '../state/state';

var stopcount = 0;

newInputField();

var options = {
  componentRestrictions: {country: 'us'}
};

// Applied autofill code to the new input fields
function autofill(input){
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	autocomplete.addListener('place_changed', function () {getAddress(autocomplete);});
}

// Return values to state object
function getAddress(autocomplete) {
	var place = autocomplete.getPlace();
	state.route.add(place);
	console.log(place.geometry.location.lat());
	console.log(place.geometry.location.lng());
	$("#destinations").append("<div id='newbuttons'>");
	$("#newbuttons").append("<a class='btn-floating btn-small waves-effect waves-light red' id='route-addBtn'><i class='material-icons'>add</i></a>");
	$("#newbuttons").append("<p id='route-newLocationText'>Add a New Stop</p>");
	$("#route-addBtn").click(newInputField);
}

// Get the HTML input element for the autocompelte search box and create the autocomplete object
// Translates address to lat/long coordinates for using on the map
function newInputField() {
	$("#newbuttons").remove();
	var inputfield = $("<input>");
	$("#destinations").append(inputfield);
	inputfield.addClass("destination-input");
	inputfield.attr("id", "stopnumber" + stopcount);
	if (stopcount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
	}
	autofill(inputfield[0]);
	stopcount++;
}

// create event listener for path in state object.
// what is path?
//    an array of location objects
// need to fill state -> path with the name and address of

// for returning users (where path is filled), pre-fill previous route options to the input fields
