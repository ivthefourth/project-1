import './layout.css';
import state from '../state/state';

$(document).ready(function() {
    $('select').material_select();
    
	
    function addChip() {
		for (let i = 0; i < state.interests.all.length; i++) {
			
			let newChip = $('<div class="chip"></div>');
			$("#unselected-interests").append(newChip.text(state.interests.all[i].name));
			
			$(newChip).click(function() {
				state.interests.all[i].toggle();
			});

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
		console.log(e.val.selected);

		e.val.selected.forEach(function(interest) {
			interests[interest.id] = true;
		});
		console.log(interests);
		localStorage.setItem('interests', JSON.stringify(interests));
	});

	// $("#clear-interests").click(function() {
	
	// 	state.interests.all.forEach(function(clear) {
	// 		clear.selected = false;
	// 	});
	// 	state.interests.emit('change');
	// 	console.log(state);
	// });
});


