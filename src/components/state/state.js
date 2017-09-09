import {retrieveSingleRecArea} from '../recreation/recAreaDetails';
import {recApiQuery, interestList} from '../recreation/constants';
import map from '../map/mapconstant';

class EventObject{
   constructor(eventsArr){
      let events = this.events = {};
      eventsArr.forEach(function(e){
         //this array will contain callback functions
         events[e] = [];
      });
   }

   //set event listener
   on(event, callback){
      if(this.events[event] == undefined){
         throw new Error(`"${event}" event does not exist on ${this}`)
      }
      else if(typeof callback !== 'function'){
         throw new Error(`Second argument to "${this}.on()" must be a function.`)
      }
      else{
         this.events[event].push(callback);
      }
   }

   //trigger event listeners for given event
   emit(event, prevEvent = {}){
      if(this.events[event] == undefined){
         throw new Error(`"${event}" event does not exist on ${this}`)
      }
      else if(!prevEvent.stopPropagation){
         let callbacks = this.events[event];
         let e = this.makeEvent(event);
         //execute all callbacks
         callbacks.forEach(function(c){
            c(e);
         })
      }
   }

   //provides event object for event listeners; should be overwritten by inheritor
   makeEvent(){
      console.warn(`No makeEvent method set on ${this}`);
   }
}

/*************\    
   Interests    
\*************/
class Interest extends EventObject{
   constructor(interest){
      super(['change']);
      this.name = interest.ActivityName;
      this.id = interest.ActivityID;
      this.iconId = interest.Emoji

      this.selected = false;

      this.eventShouldPropagate = true;

      this.makeEvent = this.makeEvent.bind(this);
      this.toggle = this.toggle.bind(this);
   }
   //toggles selected property
   toggle(){
      this.selected = !this.selected;
      this.emit('change');
   }
   update(selected, stopPropagation){
      this.selected = selected;
      if(stopPropagation)
         this.eventShouldPropagate = false;
      this.emit('change');
      this.eventShouldPropagate = true;
   }
   toString(){
      return "Interest";
   }
   makeEvent(){
      return {
         val: this.selected, 
         stopPropagation: !this.eventShouldPropagate
      };
   }
}

class Interests extends EventObject{
   //list is list of interests, to be provided by recreation module 
   constructor(list){
      super(['change']);
      this.all = list.map(function(i){
         let interest = new Interest(i);
         interest.on('change', this.emit.bind(this, 'change'));
         return interest;
      }.bind(this));

      this.makeEvent = this.makeEvent.bind(this);
   }
   get selected(){
      return this.all.filter(function(i){
         return i.selected;
      });
   }
   toString(){
      return "state.interests";
   }
   makeEvent(){
      return {
         val: {
            all: this.all,
            selected: this.selected
         }
      };
   }
}

/*************\    
     Route    
\*************/
class Location{
   constructor(object){
      if( object instanceof RecArea){
          this.type = 'recarea';
      }
      else if(object.hasOwnProperty('place_id')){
         //google places place... somehow test for google place and 
         //throw error if neither 
         this.type = 'place';
      }
      //maybe remove after dev
      else{
         throw new Error('Provided location is not a PlaceResult or RecArea');
      }
      this.data = object;
   }
}

class Route extends EventObject{
   constructor(){
      super(['change']);
      this.path = [];
   }
   get locationCount(){
      return this.path.length;
   }

   get origin(){
      return this.convertLocationForGoogle(this.path[0]);
   }
   get waypoints(){
      if( this.locationCount < 3){
         return null;
      }
      else{
         return this.path.slice(1, this.locationCount - 1).map((l) => {
            return {
               location: this.convertLocationForGoogle(l),
               stopover: true
            };
         });
      }
   }
   get destination(){
      if( this.locationCount < 2){
         return null;
      }
      else{
         return this.convertLocationForGoogle(
            this.path[this.locationCount - 1]
         );
      }
   }

   convertLocationForGoogle(location){
      if(!location){
         return null;
      }
      else if(location.type === 'place'){
         return {placeId: location.data.place_id};
      }
      else if(location.type === 'recarea'){
         return {
            lat: location.data.RecAreaLatitude,
            lng: location.data.RecAreaLongitude
         }
      }
   }

   add(location){
      if (!(location instanceof Location)){
         location = new Location(location);
      }
      this.path.push(location);
      this.emit('change');
   }
   insert(location, index){
      if (!(location instanceof Location)){
         location = new Location(location);
      }
      this.path.splice(index, 0, location);
      this.emit('change');
   }
   remove(index, dontEmit){
      this.path.splice(index, 1);
      if( !dontEmit)
         this.emit('change');
   }
   invert(){
      if( this.locationCount !== 2){
         throw new Error(
            'Can only invert route if route.path contains exactly two locations'
         );
      }
      else{
         this.path.push(this.path.shift());
         this.emit('change');
      }
   }

   addRecArea(area){
      ;
      this.emit('change');
   }
   removeRecArea(id){
      ;
      this.emit('change');
   }

   //will "highlight" location at given index of path on the map
   highlight(index){
      ;
   }

   makeEvent(){
      return {val: this.path}
   }

   toString(){
      return 'state.route';
   }
}

/*************\    
      Map    
\*************/
class Directions extends EventObject{
   constructor(){
      super(['change']);
      this.legs = [];
      //array of coordinates along directions route
      this.routeCoords = [];
      //array of coordinates that will be used for rec api calls
      this.searchCoords = [];
      this.origin = null;
   }

   update(route){
      if(route == null){
         this.legs = [];
         this.routeCoords = [];
         this.searchCoords = [];
         this.origin = null;
      }
      else if(!route.legs){
         this.legs = [];
         this.routeCoords = [route];
         this.searchCoords = [route];
         this.origin = route;
      }
      else{
         // this.legs = route.legs.map((leg) => {
         //    return {
         //       //store distance in miles (convert from meters)
         //       distance: leg.distance.value * 0.000621371,
         //       start: leg.start_location,
         //       end: leg.end_location
         //    }
         // });
         this.origin = route.legs[0].start_location;
         this.routeCoords = route.overview_path;

         //route coordinates separated by 100 miles
         this.searchCoords = this.getCoordsByRadius(160934);
         let dist = google.maps.geometry.spherical.computeDistanceBetween(
            this.searchCoords[this.searchCoords.length - 1],
            this.routeCoords[this.routeCoords.length - 1]
         );
         if(dist > 80467.2){
            this.searchCoords.push(this.routeCoords[this.routeCoords.length - 1]);
         }
      }
      this.emit('change');
   }

   getCoordsByRadius(radius){
      if(!this.routeCoords.length) return null;

      return this.routeCoords.reduce((arr, coord) => {
         let distance = google.maps.geometry.spherical.computeDistanceBetween(
            coord, arr[arr.length - 1]); 
         if(distance > radius){
            return arr.concat([coord]);
         }
         else{
            return arr;
         }
      }, [this.origin]);
   }

   makeEvent(){
      return {val: this};
   }
}

class Map{
   constructor(){
      this.directions = new Directions();
   }
   toString(){
      return 'state.map';
   }
}

/**************\    
   Recreation    
\**************/
const requiredProps = [
   'RecAreaName',
   'RECAREAADDRESS',
   'FACILITY',
   'OrgRecAreaID',
   'GEOJSON',
   'LastUpdatedDate',
   'EVENT',
   'ORGANIZATION',
   'RecAreaEmail',
   'RecAreaReservationURL',
   'RecAreaLongitude',
   'RecAreaID',
   'RecAreaPhone',
   'MEDIA',
   'LINK',
   'RecAreaDescription',
   'RecAreaMapURL',
   'RecAreaLatitude',
   'StayLimit',
   'RecAreaFeeDescription',
   'RecAreaDirections',
   'Keywords',
   'ACTIVITY'
];

class RecArea extends EventObject{
   constructor(area){
      super(['bookmarked', 'inroute']);
      this.id = area.RecAreaID;
      this.activities = area.ACTIVITY.map(function(a){ 
         return a.ActivityID; 
      });
      requiredProps.forEach(function(prop){
         this[prop] = area[prop];
      }.bind(this));

      this.bookmarked = false;
      this.inRoute = false;
      this.focused = false;

      this.showDetails = this.showDetails.bind(this);
   }
   showDetails(){
      retrieveSingleRecArea(this);//need from elizabeth; use import and export 
   }

   //WARNING: should only set one event listener per RecArea
   //that updates all of a certain element with data matching
   //the RecArea to avoid memory leaks and issues with removed elements 
   setBookmarked(/*boolean*/ value){
      this.bookmarked = value;
      this.emit('bookmarked');
   }
   setInRoute(/*boolean*/ value){
      this.inRoute = value;
      this.emit('inroute');
   }
   //setFocus > change

   makeEvent(event){
      console.warn(event);
   }
   toString(){
      return 'RecArea';
   }
}

class RecAreaCollection extends EventObject{
   constructor(name){
      super(['change']);
      this.name = name;

      //array of "RecArea"s 
      this.RECDATA = [];

      //hash map like storage of which rec areas are currently 
      //in this collection (by id)
      this.idMap = {};
   }

   addData(recdata){
      let change = false;
      if( !(recdata instanceof Array)){
         recdata = [recdata];
      }
      recdata.forEach(function(area){
         if(!this.idMap[area.id]){
            change = true;
            this.RECDATA.push(area);
            this.idMap[area.id] = true;
         }
      }.bind(this));
      if(change){
         this.emit('change');
      }
   }
   setData(recdata){
      this.idMap = {};
      this.RECDATA = [];
      if( !(recdata instanceof Array)){
         recdata = [recdata];
      }
      recdata.forEach(function(area){
         this.RECDATA.push(area);
         this.idMap[area.id] = true;
      }.bind(this));
      this.emit('change');
   }
   //change to allow an array or something?
   remove(area){
      if(this.idMap[area.id]){
         this.RECDATA.splice(this.RECDATA.indexOf(area), 1);
         delete this.idMap[area.id];
         this.emit('change');
      }
   }

   makeEvent(){
      return {val: this.RECDATA}
   }
   toString(){
      return `state.recreation.${this.name}`;
   }
}

class RecStatus extends EventObject{
   constructor(){
      super(['change', 'percent']);
      this.loading = false;
      this.percentLoaded = 100;
      this.shouldLoad = false;
      this.canLoad = false;
      this.firstLoad = true;

      this.loadedActivities = {};
      this.filteredActivities = {};

      this.loadedSearchCoords = [];
      //if the route changes, this should be true.
      this.shouldResetLoadedActivities = false;
      this.shouldResetLoadedCoords = false;
   }
   update({loading, percentLoaded, shouldLoad, canLoad, firstLoad} = {}){
      let change = false;
      if(loading !== undefined && loading !== this.loading){
         this.loading = loading;
         change = true;
      }
      if(shouldLoad !== undefined && shouldLoad !== this.shouldLoad){
         this.shouldLoad = shouldLoad;
         change = true;
      }
      if(canLoad !== undefined && canLoad !== this.canLoad){
         this.canLoad = canLoad;
         change = true;
      }
      if(firstLoad !== undefined && firstLoad !== this.firstLoad){
         this.firstLoad = firstLoad;
         change = true;
      }
      if(change){
         this.emit('change');
      }
      if(percentLoaded !== undefined && percentLoaded !== this.percentLoaded){
         this.percentLoaded = percentLoaded;
         this.emit('percent');
      }
   }

   makeEvent(){
      return {val: {
         loading: this.loading,
         percentLoaded: this.percentLoaded,
         shouldLoad: this.shouldLoad,
         firstLoad: this.firstLoad,
         canLoad: this.canLoad
      }};
   }

   toString(){
      return 'state.recreation.status';
   }
}

class Recreation{
   constructor(){
      this.all = new RecAreaCollection('all');
      this.filtered = new RecAreaCollection('filtered');
      this.bookmarked = new RecAreaCollection('bookmarked');
      this.inRoute = new RecAreaCollection('inRoute');

      //searchRadius in meters
      this.searchRadius = 80467.2;

      this.apiCall = recApiQuery;

      this.status = new RecStatus;
      this.search = this.search.bind(this);
      this.filterAll = this.filterAll.bind(this);
   }
   addRecAreas(recdata){
      var data = recdata.reduce(function(arr, area){
         let temp = [];
         if( !this.all.idMap[area.RecAreaID] ){
            temp.push(new RecArea(area));
         }
         return arr.concat(temp);
      }.bind(this), []);
      this.all.addData(data);
   }

   addBookmark(area){
      if(!this.bookmarked.idMap[area.id]){
         area.setBookmarked(true);
         this.bookmarked.addData(area);
      }
   }
   removeBookmark(area){
      if(this.bookmarked.idMap[area.id]){
         area.setBookmarked(false);
         this.bookmarked.remove(area);
      }
   }
   addToRoute(area){
      if(!this.inRoute.idMap[area.id]){
         area.setInRoute(true);
         this.inRoute.addData(area);
         //do stuff with route here
      }
   }
   removeFromRoute(area){
      if(this.inRoute.idMap[area.id]){
         area.setInRoute(false);
         this.inRoute.remove(area);
         //do stuff with route here
      }
   }

   //sends api request(s) 
   search(){
      var requestCount = 0;
      if(this.status.shouldResetLoadedActivities){
         this.status.loadedActivities = {};
         this.status.shouldResetLoadedActivities = false;
         //clear this.all???
      }
      if(this.status.shouldResetLoadedCoords){
         this.status.shouldResetLoadedCoords = false;
         //clear this.all???
      }
      this.status.loadedSearchCoords = state.map.directions.searchCoords;

      var loaded = this.status.loadedActivities;
      var interests = state.interests.selected.reduce((idString, interest) => {
         //if we've already loaded recareas with this activity, don't add to activities
         if(loaded[interest.id]){
            return idString;
         }
         //otherwise, we will load it and keep track
         else{
            loaded[interest.id] = true;
            this.status.filteredActivities[interest.id] = true;
         }

         if( idString.length)
            return idString + ',' + interest.id;
         else
            return idString + interest.id;
      }, '');


      var callback = function(response){
         this.addRecAreas(response.RECDATA);
         requestCount -= 1;
         if(requestCount === 0 ){
            this.status.update({loading: false});
            this.filterAll();
         }
      }.bind(this);

      //temporary... eventually change to along route
      state.map.directions.searchCoords.forEach((l) => {
         requestCount += 1;
         this.apiCall(
            l.lat(),
            l.lng(),
            100,
            interests,
            callback
         );
      });

      this.status.update({shouldLoad: false, loading: true, firstLoad: false});
   }

   filterAll(){
      var data;
      if(!state.interests.selected.length){
         data = [];
         console.log('NO INTERESTS');
      }
      else if(!state.route.locationCount){
         data = [];
         console.log('NO LOCATION');
      }
      else{
         data = this.all.RECDATA;
      }
      this.filtered.setData(data.filter((area) => {
         var hasActivity = false;
         for( let i = 0; i < area.activities.length; i++){
            let activity = area.activities[i];
            if(state.recreation.status.filteredActivities[activity]){
               hasActivity = true;
               break;
            }
         }
         if(!hasActivity) return false;

         return true;
      }));
   }

   toString(){
      return 'state.recreation';
   }
}

/*************\    
 Overall State
\*************/
class State extends EventObject{
   constructor(){
      super(['ready']);
      this.recreation = new Recreation();
      this.route = new Route();
      this.interests = new Interests(interestList);
      this.map = new Map();
   }
   
   //refactor this, use export and import from a separate file (not recreation.js)
   // setInterests(list){
   //    this.interests = new Interests(list);
   // }
   toString(){
      return 'state';
   }
   makeEvent(){
      return {val: null};
   }
}

const state = new State;

/* TEMPORARY, REMOVE LATER */
window.state = state;

export default state;


//State Diagram


// state = {
//    setInterests: function(){},
//    INTERESTS: {
//       all: [{
//          name: 'string',
//          id: 'number',
//          iconId: 'string',
//          selected: 'boolean',
//          toggle: function(){},
//          on: function(eventString, callback){},
//          events: {
//             change: [ function(e){}, function(e){} ],
//          },
//          emit: function(eventString);// trigger event listeners for given event
//       }, 
//       {...}, 
//       {...}],
//       //returns an array of only selected interests (use getter)
//       selected: [{...}, {...}],
//       on: function(eventString, callback){},
//       events: {
//          change: [ function(){}, function(){} ],
//       }
//       emit: function(eventString);
//       //might need to store activity ids we are including 
//    },
//    ROUTE: {
//       addLocation: function(location, after){},
//       deleteLocation: function(location){}, //maybe location.delete()??
//       moveLocation: function(location, after), //maybe location.move()??
//       ,//potentially invert direction
//       ,//set options (e.g. avoid, search radius, transport type)
//       ,//route array > has events
//       ,// options object > has events 
//    },
//    MAP: {
//       ,//
//    },
//    RECREATION: {
//       addBookmark> adds bookmark and sets its bookmark property 
//       addToRoute > similar to above
//       ,//filteredSuggestions >has events
//       ,//bookmarks
//       ,//bookmark function
//       ,//inRoute
//       ,//add to route function
//       ,//status
//       ,//setLeg/location (A to B; just A; B to C??)
//    },
//    on: function(eventString, callback){},
//    events: {
//       ready: [ function(){}, function(){} ],
//    }
//    emit: function(eventString),
//    //(checks local storage and updates data appropriately)
//    init: function(){},
// }
