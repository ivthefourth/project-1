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

function loadStorage(){
   var interests = JSON.parse(localStorage.getItem('interests')) || {};
   state.interests.all.forEach((a) => {
      if(interests[a.id]){
         a.update(true, true);
      }
   });
   state.interests.emit('change');

   var route = JSON.parse(localStorage.getItem('route')) || [];
   route.forEach((l) => {
      state.route.add(l, true);
   });
   state.route.emit('change');

   let requestCount = 0
   var bookmarked = JSON.parse(localStorage.getItem('bookmarked')) || [];
   var callback = function(response){
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
      recApiById(b, callback);
   });
}

window.loadStorage = loadStorage;
