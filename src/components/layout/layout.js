import './layout.css';
import state from '../state/state';

export default function(){ 
   $('body').append( $('<h2 class="layout">').text('layout') );
}

$(document).ready(function() {
    $('select').material_select();
	for (var i = 0; i < interestList.length; i++) {
		$("#interests").append(state.interestList[i]);
	}
  });