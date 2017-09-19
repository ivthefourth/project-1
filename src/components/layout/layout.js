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


	$("#clear-interests").click(function() {
	
		state.interests.selected.forEach(function(clear) {
			clear.update(false, true);
		});
		state.interests.emit('change');
	});
	
	$(".destination-input").on('focus', function() {
 		if ($("#interests-header").hasClass('active')) {
 			$("#interests-header").click();
 		}
 	});

	$('#tutorial-modal').modal({
	  inDuration: 300,
	  startingTop: '40%', // Starting top style attribute
	  endingTop: '10%'
	});

});




