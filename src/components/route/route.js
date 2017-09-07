import './route.css';
import state from '../state/state';

var stopcount = 0;

var options = {
  componentRestrictions: {country: 'us'}
};

newInputField();

state.route.on("change", function (e){
	var path = e.val;
	$("#destinations").empty();
	if (path.length == 0) {
		newInputField();
	} else {
		for (let i = 0; i < e.val.length; i++) {
			var location = e.val[i];
			let newInput = $("<input>").val(location.data.name + ' (' + location.data.formatted_address + ')');
			newInput.focusout(function(){
				if (newInput.val() == ""){
					state.route.remove(i);
				}
			});
			$("#destinations").append(newInput);
			autofill(newInput[0], false, i);
			$("#destinations").append("<br>");
		} 
	}
	$("#destinations").append("<div id='newbuttons'>");
	$("#newbuttons").append("<a class='btn-floating btn-small waves-effect waves-light red' id='route-addBtn'><i class='material-icons'>add</i></a>");
	$("#newbuttons").append("<p id='route-newLocationText'>Add a New Stop</p>");
	$("#route-addBtn").click(newInputField);
});

// Applied autofill code to the new input fields and sends input to state object
function autofill(input, add, index){
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	autocomplete.addListener('place_changed', function (){
		var place = autocomplete.getPlace();
		if (add){
			state.route.add(place);
		}
		else {
			state.route.remove(index);
			state.route.insert(place, index);
		}
	});
}

// Get the HTML input element for the autocompelte search box and create the autocomplete object
// Translates address to lat/long coordinates for using on the map
function newInputField() {
	$("#newbuttons").remove();	
	var inputfield = $("<input>");
	$("#destinations").append(inputfield);
	inputfield.addClass("destination-input");
	if (stopcount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
	}
	autofill(inputfield[0], true);
	stopcount++;
}

// create event listener for path in state object.
// what is path?
//    an array of location objects
// need to fill state -> path with the name and address of 

// for returning users (where path is filled), pre-fill previous route options to the input fields