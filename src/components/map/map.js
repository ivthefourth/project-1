import './map.css';
import state from '../state/state';

const map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 39.7642548, lng: -104.9951937},
  zoom: 5
});

let routeMarkers = [];
let recAreaMarkers = [];

state.route.on('change', function(e){
   //remove all markers
   routeMarkers.forEach((m) => {
      m.setMap(null);
   });
   routeMarkers = [];

   //add new markers
   if(e.val.length === 1){
      map.fitBounds(e.val[0].data.geometry.viewport);
      //addMarker(e.val[0].data.geometry.location);
   }
   else if(e.val.length){
      // e.val.forEach((l) => {
      //    addMarker(l.data.geometry.location);
      // })
   }
})


state.recreation.filtered.on('change', function(e){
   console.log(e);
   let bounds = new google.maps.LatLngBounds();
   //remove all markers
   recAreaMarkers.forEach((m) => {
      m.setMap(null);
   });
   recAreaMarkers = [];

   e.val.forEach((r) => {
      let latLng = {
         lat: r.RecAreaLatitude,
         lng: r.RecAreaLongitude
      };
      addMarker(latLng, 'rec', r);
      bounds.extend(latLng);
   });
   if( e.val.length){
      map.fitBounds(bounds);
   }
})



function addMarker(location, type, area) {
   let marker = new google.maps.Marker({
      position: location,
      map: map
   });
   if(area){
      let info = new google.maps.InfoWindow({content: makePreview(area)});
      marker.addListener('mouseover', (e) => {
         info.open(map, marker);
      });
      marker.addListener('mouseout', (e) => {
         info.close();
      });
      marker.addListener('click', area.showDetails);
   }
   if( type === 'rec'){
      recAreaMarkers.push(marker);
   }
   else if(type === 'route'){
      routeMarkers.push(marker);
   }
   else{
      throw new Error('marker type must be either "rec" or "route"');
   }
}

function makePreview(recArea){
   return `
   <strong>${recArea.RecAreaName}</strong>
   `
}
