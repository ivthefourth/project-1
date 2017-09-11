import state from '../state/state';

function showButton(status) {
   var container = $('#button-container');
   var text;
   var btn = $('<button class="btn center">')
      .text('Find Recreation')
      .click(state.recreation.search);
   var icon = $('<i class="material-icons pink-text text-accent3"></i>').text('warning');

   var noInterest = !state.interests.selected.length;
   var noLocation = !state.route.locationCount;
   if(status.val.firstLoad && noInterest && noLocation){
      text = 'Select some interests and choose at least one location to get started';
      btn.attr('disabled', true);
   }
   else if(status.val.firstLoad && noInterest){
      text = 'Select at least one interest to get started';
      btn.attr('disabled', true);
   }
   else if(status.val.firstLoad && noLocation){
      text = 'Select at least one location to get started';
      btn.attr('disabled', true);
   }
   else if(status.val.firstLoad){
      text = 'Click the button to get started'
      icon = null;
   }
   else if(noInterest){
      text = 'Select at least one interest to search for recreation areas';
      btn.attr('disabled', true);
   }
   else if(noLocation){
      text = 'Select at least one location to search for recreation areas';
      btn.attr('disabled', true);
   }
   else{
      text = 'New recreation areas may be available.'
      icon = null;
   }

   container.empty();
   if( status.val.shouldLoad || status.val.firstLoad || !status.val.canLoad){
      container.append($('<p>').text(text).prepend(icon), btn);
   }
   else if(status.val.loading){
      text = 'Loading recreation areas…'
      container.append($('<p>').text(text), 
         `<div class="preloader-wrapper big active">
             <div class="spinner-layer spinner-blue-only">
               <div class="circle-clipper left">
                 <div class="circle"></div>
               </div><div class="gap-patch">
                 <div class="circle"></div>
               </div><div class="circle-clipper right">
                 <div class="circle"></div>
               </div>
             </div>
           </div>`);
   }
}

state.interests.on('change', function(e){
   var loaded = state.recreation.status.loadedActivities;
   var filtered = state.recreation.status.filteredActivities;
   var shouldLoad = state.recreation.status.shouldResetLoadedActivities;
   var shouldFilter = false;
   var resetCoords = false;
   e.val.all.forEach((interest) => {
      if(!loaded[interest.id] && interest.selected){
         shouldLoad = true;
         resetCoords = true;
      }
      if(interest.selected !== filtered[interest.id]){
         shouldFilter = true;
         filtered[interest.id] = interest.selected;
      }
   });
   var canLoad = !!e.val.selected.length && !!state.route.locationCount;
   state.recreation.status.shouldResetLoadedCoords = resetCoords;
   state.recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
   if( shouldFilter){
      state.recreation.filterAll();
   }
});

//returns true if the area of A is contained in the area of B
function isContained(arrA, radA, arrB, radB){
   let allContained = true;
   for (let i = 0; i < arrA.length && allContained; i++){
      let currentContained = false;
      for( let j = 0; j < arrB.length && !currentContained; j++){
         let distance = google.maps.geometry.spherical.computeDistanceBetween(
            arrA[i], arrB[j]);
         if(distance <= radB - radA){
            currentContained = true;
         }
      }
      allContained = currentContained;
   }
   console.log(allContained ? 'IS CONTAINED' : 'NOT CONTAINED')
   return allContained;
}

state.map.directions.on('change', function(e){
   //make this constant 50 miles!
   var radius = state.recreation.searchRadius;
   var loadedSearchCoords = state.recreation.status.loadedSearchCoords;
   var newRouteCoords = e.val.getCoordsByRadius(radius);
   var shouldLoad = state.recreation.status.shouldResetLoadedCoords;
   var shouldFilter = true;
   var resetActivities = false;

   //if there is no location given
   if(newRouteCoords == null){
      //do nothing;
   }
   //if nothing has been loaded
   else if(!loadedSearchCoords.length){
      shouldLoad = true;
      resetActivities = true;
   }
   else{
      let newArea = !isContained(newRouteCoords, radius, loadedSearchCoords, 160934);
      shouldLoad = newArea || shouldLoad;
      resetActivities = newArea;
   }

   var canLoad = !!state.route.locationCount && !!state.interests.selected.length;
   state.recreation.status.shouldResetLoadedActivities = resetActivities;

   state.recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
   if( shouldFilter){
      state.recreation.filterAll();
   }
});

// //might have to wait for directions to come back and be processed...
// state.route.on('change', function(e){
//    state.recreation.status.shouldResetLoadedActivities = true;
//    var shouldLoad = !!e.val.length;
//    var canLoad = !!e.val.length && !!state.interests.selected.length;
//    state.recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
// })

$(document).ready(() => showButton(state.recreation.status.makeEvent()));
state.recreation.status.on('change', showButton);
