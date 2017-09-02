import './layout.css';
import state from '../state/state';

$(document).ready(function() {
    $('select').material_select();
    
	for (let i = 0; i < state.interests.all.length; i++) {
		let newChip = $('<div class="chip"><a href=""></a></div>');
		$("#interests").append(newChip.text(state.interests.all[i].name));
		$(newChip).click(function() {
			state.interests.all[i].toggle();
		});
	state.interests.all[i].on('change', function(e) {
		console.log(e);
		if(e.val) {
			newChip.addClass("selected");
		} else newChip.removeClass('selected');
	});
	}
  });