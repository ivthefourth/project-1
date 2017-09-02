import './route.css';
import state from '../state/state';

var startingPlace = $("<input>");
$("#destinations").append(startingPlace);
startingPlace.addClass("destination-input");
startingPlace.attr("placeholder", "Starting Location: ");
startingPlace.attr("id", "starting-place");

// Get the HTML input element for the autocompelte search box and create the autocomplete object
var startingGeocoder;
function initialize() {
	var startingInput = $("#starting-place")[0];
	var startingAutocomplete = new google.maps.places.Autocomplete(startingInput);
	startingGeocoder = new google.maps.Geocoder();
}

google.maps.event.addDomListener(window, 'load', initialize);


//id="destinations"
//<input type="text" id="starting-place" class="Autocomplete" placeholder="Starting Place:">
//<input type="text" id="place-a" class= "Autocomplete" placeholder="Point A:">
//<a class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>

// create event listener for path in state object.
// what is path?
//    an array of location objects
// need to fill state -> path with the name and address of 

// for new users (path is empty), add starting point and point a to the input options
// limit default search section to united states

// for returning users (where path is filled), pre-fill previous route options to the input fields
// 

// c

// 

// 

// 

// 

// 
