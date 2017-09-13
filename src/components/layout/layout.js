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

});


