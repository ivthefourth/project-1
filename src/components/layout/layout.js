import './layout.css';
import state from '../state/state';

$(document).ready(function() {
    $('select').material_select();
    
	for (let i = 0; i < state.interests.all.length; i++) {
		let newChip = $('<div class="chip"></div>');
		$("#interests").append(newChip.text(state.interests.all[i].name));
		$(newChip).click(function() {
			state.interests.all[i].toggle();
		});
	state.interests.all[i].on('change', function(e) {
		console.log(e);
		if(e.val) {
			newChip.addClass("selected");
			$("#selected-interests").append(newChip);
		} else {
		 	newChip.removeClass('selected');
		 	$("#unselected-interests").prepend(newChip);
		}

	});
	}

	var selectedInterestsArray = [];

	$(".chip").click(function(){
		console.log($(this).html());
		selectedInterestsArray.push($(this).html());
		console.log(selectedInterestsArray);
		localStorage.setItem('selectedInterestsArray', selectedInterestsArray);
	});
});