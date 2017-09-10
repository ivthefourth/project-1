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

	$("#clear-interests").click(function() {
	
		state.interests.selected.forEach(function(clear) {
			clear.update(false, true);
		});
		state.interests.emit('change');
		console.log(state);
	});

	// var topic = "biking";

	// var queryURL = "https://emojipedia.org/search/?q=" + topic;

	// $.ajax({
	// 		url: queryURL,
	// 		method: 'GET'
	// 		}).done(function(response) {
	// 			console.log(response);
});


