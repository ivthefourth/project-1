import './layout.css';
import state from '../state/state';

$(document).ready(function() {
    $('select').material_select();
    
	
    function addChip() {
		for (let i = 0; i < state.interests.all.length; i++) {
			
			let newChip = $('<div class="chip center"></div>');
			$("#unselected-interests").append(newChip.text(state.interests.all[i].name));
			
			$(newChip).click(function() {
				state.interests.all[i].toggle();
			});
// =========================
			// if (localStorage.getItem('interests') !== null) {
			// 	state.interests.emit('change');
			
			// if (localStorage.getItem('interests') !== null) {
			// 	let interestsArray = JSON.parse(localStorage.getItem('interests'));
				

			// 	if (interestsArray[state.interests.all[i].id] === true ) {
			// 		state.interests.all[i].selected = true;
			// 	}
			// }
// ==========================
		state.interests.all[i].on('change', function(e) {
			
			if(e.val) {
				newChip.addClass("selected");
				$("#selected-interests").append(newChip);
			} else {
			 	newChip.removeClass('selected');
			 	$("#unselected-interests").prepend(newChip);
			}

		});
		}
	}

	addChip();

	state.interests.on('change', function(e) {
		var interests = {};

		e.val.selected.forEach(function(interest) {
			interests[interest.id] = true;
		});
		localStorage.setItem('interests', JSON.stringify(interests));
	});

	$("#clear-interests").click(function() {
	
		state.interests.selected.forEach(function(clear) {
			clear.update(false, true);
		});
		state.interests.emit('change');
	});

	state.route.on('change', function(e) {
		var places_id = {};
		var latitudeObj = {};
		var longitudeObj = {};
		var formattedNameObj = {};
		var nameObj = {};

		let i = 0;

		e.val.forEach(function(f) {
			places_id[i] = f.data.place_id;
			latitudeObj[i] = f.data.geometry.location.lat();
			longitudeObj[i] = f.data.geometry.location.lng();
			formattedNameObj[i] = f.data.formatted_address;
			nameObj[i] = f.data.name;
			i++;
		});
		localStorage.setItem('places_id', JSON.stringify(places_id));
		localStorage.setItem('latitude', JSON.stringify(latitudeObj));
		localStorage.setItem('longitude', JSON.stringify(longitudeObj));
		localStorage.setItem('formattedName', JSON.stringify(formattedNameObj));
		localStorage.setItem('name', JSON.stringify(nameObj));

	});
	$(".destination-input").on('focus', function() {
		if ($("#interests-header").hasClass('active')) {
			$("#interests-header").click();
		}
	});
});


