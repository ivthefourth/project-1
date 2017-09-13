import './route.css';
import state from '../state/state';

$(function() {
  $( ".sortable" ).sortable({
    revert: true, 
    stop: function() {
      var children = inputSection.children();
      var checker = 0;
      var stateLocation;
      var listLocation;
      for (let i = 0; i < children.length; i++) {
      	listLocation = children[i].dataset.number;
      	if (listLocation != checker){
	      	if (listLocation > checker+1){
						stateLocation = state.route.path[listLocation].data;
						state.route.remove(listLocation, true);
						state.route.insert(stateLocation, i);
	      	} else if (listLocation == checker+1){
	      		checker++;
	      	} else if (listLocation < checker-1){
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

var options = {
  componentRestrictions: {country: 'us'}
};

var inputSection = $("<div>");
var buttonSection = $("<div>");

inputSection.attr("class", "sortable");

$("#destinations").append(inputSection);
$("#destinations").append(buttonSection);

newInputField();

state.route.on("change", function (e){
	var path = e.val;
	inputSection.empty();
	buttonSection.empty();
	if (path.length == 0) {
		newInputField();
	} else {
		for (let i = 0; i < e.val.length; i++) {
			let location = e.val[i];
			let newInput;
			var inputContainer = $("<div>");
			inputContainer.attr("class", "row inputContainer ui-state-default");
			inputContainer.attr("data-number", i);
			if (location.type == "place") {
				newInput = $("<input>").val(location.data.name + ' (' + location.data.formatted_address + ')');
			}
			else {
				newInput = $("<input>").val(location.data.RecAreaName);
			}
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
			closeInputDiv.click(function(){
				if (location.type === "recarea"){
			 		state.route.path[i].data.setInRoute(false);
				}
			 	state.route.remove(i);
			});
			newInput.focusout(function(){
			 	if (newInput.val() == ""){
			 		if (location.type === "recarea"){
			 			state.route.path[i].data.setInRoute(false);
					}
			 		state.route.remove(i);
			 	}
			});
			newInput.keypress(function (e) {
				if (e.which === 13 && newInput.val() == ""){
			 		if (location.type === "recarea"){
			 			state.route.path[i].data.setInRoute(false);
					}
					state.route.remove(i);
				}
			});
			inputSection.append(inputContainer);
			autofill(newInput[0], false, i);
		} 
		buttonSection.append("<div id='newbuttons'>");
		$("#newbuttons").append("<a class='btn-floating btn-small waves-effect waves-light' id='route-addBtn'><i class='material-icons'>add</i></a>");
		$("#newbuttons").append("<p id='route-newLocationText'>Add a New Stop</p>");
		$("#route-addBtn").click(newInputField);
	}
});

// Applied autofill code to the new input fields and sends input to state object
function autofill(input, add, index){
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	autocomplete.addListener('place_changed', function (){
		var place = autocomplete.getPlace();
		if (place.place_id){
			if (add){
				state.route.add(place);
			}
			else {
				state.route.remove(index, true);
				state.route.insert(place, index);
			}
		} else {
			if (place.name != ""){
				Materialize.toast('Select from the drop-down menu.', 4000, "rounded trevortoast");
			}
		}
	});
}

// Get the HTML input element for the autocompelte search box and create the autocomplete object
function newInputField() {
	$("#newbuttons").remove();
	var inputfield = $("<input>");
	buttonSection.append(inputfield);
	inputfield.addClass("destination-input");
	if (state.route.locationCount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
		inputfield.focus();
	}
	autofill(inputfield[0], true);
}

// transform a box into a dragable input field - call invert function
// error handling