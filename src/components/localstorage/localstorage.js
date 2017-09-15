import state from '../state/state';
import {recApiById} from '../recreation/constants';

//interests
state.interests.on('change', function(e) {
   var interests = {};

   e.val.selected.forEach(function(interest) {
      interests[interest.id] = true;
   });
   localStorage.setItem('interests', JSON.stringify(interests));
   localStorage.setItem('has-stored', 'true');
});

//route
state.route.on('change', function(e){
   var locations = e.val.map((l) => {
      if(l.type === 'place'){
         return{
            type: 'place',
            place_id: l.data.place_id,
            name: l.data.name,
            formatted_address:l.data.formatted_address,
            lat: l.data.lat || l.data.geometry.location.lat(),
            lng: l.data.lng || l.data.geometry.location.lng()
         };
      }
      else{
         return{
            type: 'recarea',
            id: l.data.id,
            RecAreaName: l.data.RecAreaName,
            RecAreaLatitude: l.data.RecAreaLatitude,
            RecAreaLongitude: l.data.RecAreaLongitude
         };
      }
   });
   localStorage.setItem('route', JSON.stringify(locations));
   localStorage.setItem('has-stored', 'true');
})

//bookmarks
state.recreation.bookmarked.on('change', function(e){
   var bookmarked = e.val.map((r) => {
         return r.id;
   });
   localStorage.setItem('bookmarked', JSON.stringify(bookmarked));
   localStorage.setItem('has-stored', 'true');
})

function resetStorage(){
   hasLoaded = true;
   localStorage.setItem('has-stored', null);
   localStorage.setItem('bookmarked', null);
   localStorage.setItem('route', null);
   localStorage.setItem('interests', null);
   $('#storage-modal').modal('close');
}

function loadStorage(){
   if(hasLoaded) return;
   var interests = JSON.parse(localStorage.getItem('interests')) || {};
   state.interests.all.forEach((a) => {
      if(interests[a.id]){
         a.update(true, true);
      }
   });
   state.interests.emit('change');

   var route = JSON.parse(localStorage.getItem('route')) || [];
   var routeArr = [];
   let requestCount = 0;
   var routeCallback = function(index, response){
      requestCount -= 1;
      if(response.RecAreaID){
         state.recreation.all.addData(response);
         let area = state.recreation.all.RECDATA.find((r) => {
            return r.id == response.RecAreaID;
         });
         area.setInRoute(true);
         routeArr[index] = state.route.getLocationObject(area);
      }
      if(requestCount === 0){
         state.route.setData(routeArr);
      }
   }
   route.forEach((location, index) => {
      if(location.type === 'place'){
         routeArr[index] = state.route.getLocationObject(location);
      }
      else{
         requestCount += 1;
         recApiById(location.id, routeCallback.bind(null, index));
      }
   });
   if(requestCount === 0){
         state.route.setData(routeArr);
   }
}

function getBookmarks(){
   if(hasLoaded) return;
   hasLoaded = true;
   $('#storage-modal').modal('close');
   let requestCount = 0;
   var bookmarked = JSON.parse(localStorage.getItem('bookmarked')) || [];
   var bookmarkCallback = function(response){
      requestCount -= 1;
      if(response.RecAreaID){
         state.recreation.all.addData(response);
         state.recreation.addBookmark(state.recreation.all.RECDATA.find((r) => {
            return r.id == response.RecAreaID;
         }));
      }
      if(requestCount === 0){
         //need to wait for directions to load
         state.recreation.filterAll();
      }
   }
   bookmarked.forEach((b) => {
      requestCount += 1;
      recApiById(b, bookmarkCallback);
   });
}

//make sure this is set false if they choose not to load storage!
var hasStorage = localStorage.getItem('has-stored') === 'true';
var hasLoaded = false;
if( hasStorage){
   state.map.directions.on('change', getBookmarks);
}

window.loadStorage = loadStorage;

$(document).ready(function(){
   $('#storage-modal').modal({
      dismissible: false,
      inDuration: 300,
      startingTop: '40%', // Starting top style attribute
      endingTop: '10%'
   });
   if(hasStorage){
      $('#storage-modal').modal('open');
      $('#new-session').click(resetStorage);
      $('#continue-session').click(loadStorage);
   }
});
