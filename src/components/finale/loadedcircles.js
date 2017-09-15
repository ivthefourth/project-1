import state from '../state/state';
import map from '../map/mapconstant';

$(document).ready(function(){
   var circles = [];
   var shown = false;
   $('.brand-logo').click(function(){
      if( shown){
         circles.forEach((c) => {
            c.setMap(null);
         })
         circles = [];
      }
      else{
         state.recreation.status.loadedSearchCoords.forEach((coord) => {
            let circle = new google.maps.Circle({
               center: coord,
               radius: 160934,
               fillColor: 'red',
               fillOpacity: 0.33,
               strokeColor: 'red',
               strokeOpacity: 0,
               map: map
            });
            circles.push(circle);
         });
      }
      shown = !shown;
   })
})