import './map.css';
import state from '../state/state';
import map from './mapconstant';

const directionsService = new google.maps.DirectionsService();
const directionsDisplay = new google.maps.DirectionsRenderer();


directionsDisplay.setMap(map);

let routeMarkers = [];

state.route.on('change', function(e){
   //remove all markers
   routeMarkers.forEach((m) => {
      m.setMap(null);
   });
   routeMarkers = [];

   // //add new markers
   if(state.route.locationCount === 1){
      directionsDisplay.set('directions', null);
      if(state.route.path[0].data.geometry){
         map.fitBounds(e.val[0].data.geometry.viewport);
         addMarker(e.val[0].data.geometry.location, 'route');
         //update route with one location
         state.map.directions.update(e.val[0].data.geometry.location);
      }
      else if(state.route.path[0].data.RecAreaName){
         let coords = new google.maps.LatLng({
            lat: e.val[0].data.RecAreaLatitude,
            lng: e.val[0].data.RecAreaLongitude
         });
         state.map.directions.update(coords);
         map.setCenter(coords);
         map.setZoom(8);
         addMarker(coords, 'route');
      }
      else{
         let coords = new google.maps.LatLng({
            lat: e.val[0].data.lat,
            lng: e.val[0].data.lng
         });
         console.log(e.val[0]);
         state.map.directions.update(coords);
         map.setCenter(coords);
         map.setZoom(8);
         addMarker(coords, 'route');
      }
   }
   else if(state.route.locationCount){
      if(state.route.shouldZoomMap){
         directionsDisplay.set('preserveViewport', false);
      }
      else{
         directionsDisplay.set('preserveViewport', true);
      }
      //get directions
      let request = {
         origin: state.route.origin,
         destination: state.route.destination,
         travelMode: 'DRIVING'
      }
      if(state.route.waypoints)
         request.waypoints = state.route.waypoints;
      directionsService.route(request, function(result, status) {
         if (status == 'OK') {
            state.map.directions.update(result.routes[0]);
            directionsDisplay.setDirections(result);
            console.log(result)
         }
         //else show some error toast?
         state.route.shouldZoomMap = true;
      });
   }
   else{
      state.map.directions.update(null);
   }
})

let recAreaMarkers = [];

state.recreation.filtered.on('change', function(e){
   let markerMap = {};
   let newMarkers = [];
   e.val.forEach((r) => {
      if(!r.marker){
         r.addMarker();
         r.marker.setMap(map);
      }
      else if(!r.markerDisplayed){
         r.marker.setMap(map);
      }
      r.markerDisplayed = true;
      markerMap[r.id] = true;
      newMarkers.push(r);
   });

   //remove filtered out markers
   recAreaMarkers.forEach((r) => {
      if(!markerMap[r.id]){
         r.marker.setMap(null);
         r.markerDisplayed = false;
      }
   });
   recAreaMarkers = newMarkers;
});



function addMarker(location, type, area) {
   let kwargs = {
      position: location,
      map: map
   }
   if(type === 'route'){
      kwargs.label = 'A';
   }
   let marker = new google.maps.Marker(kwargs);
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

map.addListener('idle', function(){
   state.recreation.filterAll();
})

$(document).ready(function(){
   var slider = $('#radius-slider');
   var circles = [];
   slider.on('mousedown focus', function(){
      //set radius from slider val
      state.recreation.searchRadius = slider.val() * 1609.34;
      let rad = state.recreation.searchRadius;
      var coords = state.map.directions.getCoordsByRadius(rad);
      if(coords){
         coords.forEach((c) => {
            let circle = new google.maps.Circle({
               center: c,
               radius: rad,
               fillColor: 'blue',
               fillOpacity: 0.33,
               strokeColor: 'red',
               strokeOpacity: 0,
               map: map
            });
            circles.push(circle);
         });
      }
   });
   slider.on('mouseup focusout', function(){
      circles.forEach((c) => {
         c.setMap(null);
      })
      circles = [];
      state.recreation.filterAll();
   });
   slider.on('input', function(){
      circles.forEach((c) => {
         c.setMap(null);
      })
      circles = [];
      state.recreation.searchRadius = slider.val() * 1609.34;
      let rad = state.recreation.searchRadius;
      var coords = state.map.directions.getCoordsByRadius(rad);
      if(coords){
         coords.forEach((c) => {
            let circle = new google.maps.Circle({
               center: c,
               radius: rad,
               fillColor: 'blue',
               fillOpacity: 0.33,
               strokeColor: 'red',
               strokeOpacity: 0,
               map: map
            });
            circles.push(circle);
         });
      }
   });
})

