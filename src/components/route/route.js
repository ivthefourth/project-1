import './route.css';
import state from '../state/state';

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
			var inputContainer = $("<div>");
			inputContainer.attr("class", "row inputContainer");
			let newInput = $("<input>").val(location.data.name + ' (' + location.data.formatted_address + ')');
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
			 	state.route.remove(i);
			});
			newInput.focusout(function(){
			 	if (newInput.val() == ""){
			 		state.route.remove(i);
			 	}
			});
			newInput.keypress(function (e) {
 				var key = e.which;
				if (newInput.val() == ""){
					state.route.remove(i);
				}
			});
			$("#destinations").append(inputContainer);
			autofill(newInput[0], false, i);
			//$("#destinations").append("<br>");
		} 
		$("#destinations").append("<div id='newbuttons'>");
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
function newInputField() {
	$("#newbuttons").remove();
	var inputfield = $("<input>");
	$("#destinations").append(inputfield);
	inputfield.addClass("destination-input");
	if (state.route.locationCount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
	}
	autofill(inputfield[0], true);
}

// transform a box into a dragable input field - call invert function
// error handling