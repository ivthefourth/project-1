import './route.css';
import state from '../state/state';

var tooltip = $(
	'<span class= "route-tooltip" data-tooltip="Select from the drop-down menu." data-position="right">'
);
tooltip.tooltip({delay: 50});

// Function to manage the sorting of Google Places locations.
// Using jquery.ui for sorting function.
$(function() {
  $( ".sortable" ).sortable({
    revert: true, 
    handle: '.moveInputDiv',
    stop: function() {
      var children = inputSection.children();
      var checker = 0;
      var stateLocation;
      var listLocation;
      // Logic created to determine where the original destination was located, where it was moved, and to update the location in State.
      for (let i = 0; i < children.length; i++) {
      	listLocation = children[i].dataset.number;
      	if (listLocation != checker){
	      	if (listLocation > checker+1){
						tooltip.mouseleave();
						tooltip.detach();
						stateLocation = state.route.path[listLocation].data;
						state.route.remove(listLocation, true);
						state.route.insert(stateLocation, i);
	      	} else if (listLocation == checker+1){
	      		checker++;
	      	} else if (listLocation < checker-1){
					tooltip.mouseleave();
					tooltip.detach();
	    			stateLocation = state.route.path[listLocation].data;
	    			state.route.remove(listLocation, true);
					state.route.insert(stateLocation, i);
	      	}
	      }
      	checker++;
      }
    }
  });
});

// Options object that will be fed into the Google Places API call.
var options = {
  componentRestrictions: {country: 'us'}
};

// Variables for the new sections within the #destinations container for the sorting and for the button/new inputs.
var inputSection = $("<div>");
var buttonSection = $('<div class="route-btn-container">');

// Applies the "sortable" class to the inputSection area so only that section can be sorted.
inputSection.attr("class", "sortable");

// Appending the new divs to the #destination section.
$("#destinations").append(inputSection);
$("#destinations").append(buttonSection);

// On page load, calls the newInputField function to load a "Starting Location" input field.
newInputField();

// Function to update the state object when something within the object is changed.
state.route.on("change", function (e){
	var path = e.val;
	// Resets the input and button Section divs to avoid duplications.
	inputSection.empty();
	buttonSection.empty();
	// If all destinations have been removed, calls the newInputField function to re-add "Starting Location" input field.
	if (path.length == 0) {
		newInputField();
	} else {
		// Populates the destinations section with the locations stored in the state object.
		for (let i = 0; i < e.val.length; i++) {
			let location = e.val[i];
			let newInput;
			var inputContainer = $("<div>");
			// Adds ui-state-default class to allow input boxes to be sortable via jquery.ui.
			inputContainer.attr("class", "row inputContainer ui-state-default");
			// Stores data number in the inputContainer for manipulation in the sortable function.
			inputContainer.attr("data-number", i);
			// Creates a clean view of Google Address from the Places name and address stored in the state object.
			if (location.type == "place") {
				newInput = $("<input>").val(location.data.name + ' (' + location.data.formatted_address + ')');
			}
			// Creates a clean view of the Google Address from the recreation list in case that is the field type stored in the state object.
			else {
				newInput = $("<input>").val(location.data.RecAreaName);
			}
			// Adds and appends all classes, buttons, and functions inside the inputContainer.
			newInput.attr("class", "col s10 m10 l10 route-choice");
			let closeInput = "<i class='material-icons close-icon'>close</i>";
			let moveInput = "<i class='material-icons move-icon'>dehaze</i>";
			let closeInputDiv = $("<div class='col s1 m1 l1 closeInputDiv'>");
			let moveInputDiv = $("<div class='col s1 m1 l1 moveInputDiv'>");
			moveInputDiv.append(moveInput);
			inputContainer.append(moveInputDiv);
			inputContainer.append(newInput);
			closeInputDiv.append(closeInput);
			inputContainer.append(closeInputDiv);
			// Function to remove the inputContainer if the close (X) button is pressed.			
			closeInputDiv.click(function(){
				if (location.type === "recarea"){
			 		state.route.path[i].data.setInRoute(false);
				}
				tooltip.mouseleave();
				tooltip.detach();
			 	state.route.remove(i);
			});
			// Function to remove the inputContainer if the user focuses out of the input while it is blank.			
			newInput.focusout(function(){
			 	if (newInput.val() == ""){
			 		if (location.type === "recarea"){
			 			state.route.path[i].data.setInRoute(false);
					}
					tooltip.mouseleave();
					tooltip.detach();
			 		state.route.remove(i);
			 	}
			});
			// Function to remove the inputContainer if enter is pressed while the input is blank.
			newInput.keypress(function (e) {
				if (e.which === 13 && newInput.val() == ""){
			 		if (location.type === "recarea"){
			 			state.route.path[i].data.setInRoute(false);
					}
					tooltip.mouseleave();
					tooltip.detach();
					state.route.remove(i);
				}
			});
			// Adds the completed inputContainer to the inputSection.
			inputSection.append(inputContainer);
			// Sends the newInput, inputContainer, bulian value, and state position to the autofill function.
			autofill(newInput[0], inputContainer, false, i);
		} 
		// Creates and appends buttons to the buttonSection when a completed input is filled in.
		buttonSection.append("<div id='newbuttons'>");
		$("#newbuttons").append("<a class='btn-floating btn-small waves-effect waves-light' id='route-addBtn'><i class='material-icons'>add</i></a>");
		$("#newbuttons").append("<p id='route-newLocationText'>Add a New Stop</p>");
		$("#route-addBtn").click(newInputField);
	}
});

// Applied autofill code to the new input fields and sends input to state object.
// Takes the newInput, inputContainer, bulian value, and state postion as variable in the autofill function.
// Tooltips included for user error handling.
function autofill(input, container, add, index){
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	// Google Places function - uses "autocomplete" placeholder defined in line above.
	autocomplete.addListener('place_changed', function (){
		var place = autocomplete.getPlace();
		if (place.place_id){
			if (add){
				tooltip.mouseleave();
				tooltip.detach();
				state.route.add(place);
			}
			else {
				tooltip.mouseleave();
				tooltip.detach();
				state.route.remove(index, true);
				state.route.insert(place, index);
			}
		} else {
			if (place.name != ""){
				container.append(tooltip);
				tooltip.mouseenter();
			}
		}
	});
}

// Get the HTML input element for the autocomplete search box and create the autocomplete object.
function newInputField() {
	$("#newbuttons").remove();
	var inputfield = $("<input>");
	buttonSection.append(inputfield);
	inputfield.addClass("destination-input");
	// Changes the placeholder value within the new input field based on the length of the state object.
	if (state.route.locationCount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
		inputfield.focus();
	}
	autofill(inputfield[0], buttonSection, true);
}