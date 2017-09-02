import './layout.css';
import state from '../state/state';

export default function(){ 
   $('body').append( $('<h2 class="layout">').text('layout') );
}

$(document).ready(function() {
    // makes the select options work
    $('select').material_select();

    // makes the modal work, and adds options


	$('.modal').modal({
  		dismissible: true, // Modal can be dismissed by clicking outside of the modal
    	opacity: .5, // Opacity of modal background
    	inDuration: 300, // Transition in duration
    	outDuration: 200, // Transition out duration
    	startingTop: '4%', // Starting top style attribute
    	endingTop: '10%', // Ending top style attribute
    	ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
      	console.log(modal, trigger);
   	},
   
  	}
	);
      
    
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