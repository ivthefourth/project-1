/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_recAreaDetails__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recreation_constants__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__map_mapconstant__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__map_distance__ = __webpack_require__(11);





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
      if( object.hasOwnProperty('RecAreaName')){
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
      this.shouldZoomMap = true;
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

   add(location, dontEmit){
      if (!(location instanceof Location)){
         location = new Location(location);
      }
      this.path.push(location);
      if( !dontEmit)
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
   setData(arr){
      this.path = arr;
      this.emit('change');
   }

   getLocationObject(location){
      return new Location(location);
   }

   addRecArea(area){
      this.shouldZoomMap = false;
      var areaLocation = new Location(area);
      if( this.locationCount === 0){
         this.add(areaLocation);
      }
      if( this.locationCount <= 1){  
         let origin = this.convertLocationForGoogle(areaLocation);
         let destinations = [this.convertLocationForGoogle(this.path[0])]
         var callback = function(response, status){
            if(status === 'OK'){
               if(response.rows[0].elements[0].status === 'ZERO_RESULTS'){
                  area.setInRoute(false);
                  Materialize.toast(
                     'Could not add recreation area to route. Try adding it manually.'
                  , 4000);
               }
               else{
                  this.add(areaLocation);
               }
            }
            else{
               area.setInRoute(false);
            }
         }.bind(this);
         __WEBPACK_IMPORTED_MODULE_3__map_distance__["a" /* default */].getDistanceMatrix({
            origins: [origin],
            destinations: destinations,
            travelMode: 'DRIVING'
         }, callback);
      }
      else if( this.locationCount === 2){
         if(this.path[1].type === 'place'){
            let origin = this.convertLocationForGoogle(areaLocation);
            let destinations = [this.convertLocationForGoogle(this.path[0])]
            var callback = function(response, status){
               if(status === 'OK'){
                  if(response.rows[0].elements[0].status === 'ZERO_RESULTS'){
                     area.setInRoute(false);
                     Materialize.toast(
                        'Could not add recreation area to route. Try adding it manually.'
                     , 4000);
                  }
                  else{
                     this.insert(areaLocation, 1);
                  }
               }
               else{
                  area.setInRoute(false);
               }
            }.bind(this);
            __WEBPACK_IMPORTED_MODULE_3__map_distance__["a" /* default */].getDistanceMatrix({
               origins: [origin],
               destinations: destinations,
               travelMode: 'DRIVING'
            }, callback);
         }
         else{
            //but what if path[0] is a recreation area??
            let origin = this.convertLocationForGoogle(this.path[0]);
            let destinations = [
               this.convertLocationForGoogle(this.path[1]),
               this.convertLocationForGoogle(areaLocation)
            ]
            var callback = function(response, status){
               if(status === 'OK'){
                  if(response.rows[0].elements[1].status === 'ZERO_RESULTS'){
                     area.setInRoute(false);
                     Materialize.toast(
                        'Could not add recreation area to route. Try adding it manually.'
                     , 4000);
                     return;
                  }
                  if(
                     response.rows[0].elements[0].distance.value >
                     response.rows[0].elements[1].distance.value
                  ){
                     this.insert(areaLocation, 1);
                  }
                  else{
                     this.add(areaLocation);
                  }
               }
               else{
                  area.setInRoute(false);
               }
            }.bind(this);
            __WEBPACK_IMPORTED_MODULE_3__map_distance__["a" /* default */].getDistanceMatrix({
               origins: [origin],
               destinations: destinations,
               travelMode: 'DRIVING'
            }, callback);
         }
      }
      else{
         let destinations = this.path.map((l) => {
            return this.convertLocationForGoogle(l);
         })
         let origin = this.convertLocationForGoogle(areaLocation);
         var callback = function(response, status){
            if(status === 'OK'){
               let arr = response.rows[0].elements;
               let closestIndex = 1;
               if(arr[1].status === 'ZERO_RESULTS'){
                  area.setInRoute(false);
                  Materialize.toast(
                     'Could not add recreation area to route. Try adding it manually.'
                  , 4000)
                  return;
               }
               //find route point this recarea is closest to
               let smallestDistance = arr[1].distance.value;
               for(let i = 1; i < arr.length; i++){
                  if( arr[i].distance.value < smallestDistance){
                     closestIndex = i;
                  }
               }
               //if it's closest to the starting location, 
               //insert it right after the starting location
               if(closestIndex === 1){
                  this.insert(areaLocation, 1);
               }
               //otherwise, if it's not closest to the final location...
               else if(closestIndex !== arr.length - 1){
                  //insert it by the location it's closest to
                  //B is closest to R, A is right before B, C is right after B
                  let aToB = response.rows[closestIndex].elements[closestIndex - 1].distance.value;
                  let aToR = arr[closestIndex - 1].distance.value;
                  let rToB = smallestDistance;
                  let bToC = response.rows[closestIndex].elements[closestIndex + 1].distance.value;
                  let bToR = rToB;
                  let rToC = arr[closestIndex + 1].distance.value;
                  if( 
                     aToR + rToB + bToC < aToB + bToR + rToC
                  ){
                     this.insert(areaLocation, closestIndex - 1);
                  }
                  else{
                     this.insert(areaLocation, closestIndex);
                  }
               }
               //otherwise, if it's closest to the last location
               else{
                  //if the last location is a recarea, see if this area
                  //should be between the last and second to last locations
                  //or after the last 
                  if( this.path[this.locationCount - 1].type === 'recarea'){
                     //if the distance between this area and the second to last 
                     //location is less than the distance between the second
                     //to last location and the last location
                     if(
                        arr[arr.length - 2].distance.value < 
                        response.rows[response.rows.length - 2].elements[arr.length - 1].distance.value
                     ){
                        this.insert(areaLocation, closestIndex);
                     }
                     else{
                        this.add(areaLocation);
                     }
                  }
                  //otherwise, insert it before the final destination
                  else{
                     this.insert(areaLocation, this.locationCount - 1);
                  }

               }
            }
            else{
               status === 'MAX_ELEMENTS_EXCEEDED' && Materialize.toast(
                  'Too many locations in route. Try adding it manually.'
               , 4000);
               area.setInRoute(false);
            }
         }.bind(this);
         __WEBPACK_IMPORTED_MODULE_3__map_distance__["a" /* default */].getDistanceMatrix({
            origins: [origin, ...destinations],
            destinations: [origin, ...destinations],
            travelMode: 'DRIVING'
         }, callback);
      }
   }
   removeRecArea(area){
      this.shouldZoomMap = false;
      for(let i = 0; i < this.path.length; i++){
         if(this.path[i].data === area){
            this.remove(i);
            break;
         }
      };
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
      //array of coordinates along directions route
      this.routeCoords = [];
      //array of coordinates that will be used for rec api calls
      this.searchCoords = [];
      this.origin = null;
   }

   update(route){
      if(route == null){
         this.routeCoords = [];
         this.searchCoords = [];
         this.origin = null;
      }
      else if(!route.legs){
         this.routeCoords = [route];
         this.searchCoords = [route];
         this.origin = route;
      }
      else{
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

      this.marker = null;
      this.markerDisplayed = false;
      this.markerHighlighted = false;

      this.showDetails = this.showDetails.bind(this);
      this.highlightMarker = this.highlightMarker.bind(this)
      this.unHighlightMarker = this.unHighlightMarker.bind(this)
   }
   showDetails(){
      Object(__WEBPACK_IMPORTED_MODULE_0__recreation_recAreaDetails__["a" /* retrieveSingleRecArea */])(this);//need from elizabeth; use import and export 
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
      if(this.marker){
         this.marker.setVisible(!value);
      }
      this.emit('inroute');
   }
   //setFocus > change

   highlightMarker(){
      if(this.marker && !this.markerHighlighted){
         this.marker.setAnimation(google.maps.Animation.BOUNCE);
         this.markerHighlighted = true;
         if(this.inRoute){
            this.marker.setVisible(true);
         }
      }
   }
   unHighlightMarker(){
      if(this.marker && this.markerHighlighted){
         this.marker.setAnimation(null);
         this.markerHighlighted = false;
         if(this.inRoute){
            this.marker.setVisible(false);
         }
      }
   }

   addMarker(){
      let latLng = {
         lat: this.RecAreaLatitude,
         lng: this.RecAreaLongitude
      };
      this.marker = new google.maps.Marker({
         position: latLng,
         map: __WEBPACK_IMPORTED_MODULE_2__map_mapconstant__["a" /* default */]
      });
      let info = new google.maps.InfoWindow({
         content: this.makeMapPreview()
      });
      this.marker.addListener('mouseover', (e) => {
         info.open(__WEBPACK_IMPORTED_MODULE_2__map_mapconstant__["a" /* default */], this.marker);
      });
      this.marker.addListener('mouseout', (e) => {
         info.close();
      });
      this.marker.addListener('click', this.showDetails);
   }

   makeMapPreview(){
      return `
      <strong>${this.RecAreaName}</strong>
      `
   }

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
         if( !(recdata instanceof RecArea) ){
            recdata = new RecArea(recdata);
         }
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
      //this.inRoute = new RecAreaCollection('inRoute');

      //searchRadius in meters
      this.searchRadius = 80467.2;

      this.apiCall = __WEBPACK_IMPORTED_MODULE_1__recreation_constants__["c" /* recApiQuery */];

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
      if(!area.inRoute){
         area.setInRoute(true);
         state.route.addRecArea(area);
      }
      //else could show toast saying it's already in route 
   }
   removeFromRoute(area){
      if(area.inRoute){
         area.setInRoute(false);
         state.route.removeRecArea(area);
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
            this.filterAll(true);
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

   filterAll(fitMap){
      const mapBounds = __WEBPACK_IMPORTED_MODULE_2__map_mapconstant__["a" /* default */].getBounds();
      let markerBounds = new google.maps.LatLngBounds();
      markerBounds.extend(mapBounds.getNorthEast());
      markerBounds.extend(mapBounds.getSouthWest());
      var data;
      if(!state.interests.selected.length){
         data = [];
      }
      else if(!state.route.locationCount){
         data = [];
      }
      else{
         data = this.all.RECDATA;
      }
      const filterCoords = state.map.directions.getCoordsByRadius(this.searchRadius);
      data = data.filter((area) => {
         var coord = new google.maps.LatLng({
            lat: area.RecAreaLatitude,
            lng: area.RecAreaLongitude
         });

         //if it's not a new load, filter based on map viewport
         if(!fitMap && !mapBounds.contains(coord)) {
            return false;
         }

         //filter based on proximity to route
         var isAlongRoute = false;
         for(let i = 0; i < filterCoords.length; i++){
            let distance = google.maps.geometry.spherical.computeDistanceBetween(
               filterCoords[i], coord);
            if( distance < this.searchRadius){
               isAlongRoute = true;
               break;
            }
         }
         if(!isAlongRoute) {
            return false;
         }


         //filter based on selected activities
         var hasActivity = false;
         for( let i = 0; i < area.activities.length; i++){
            let activity = area.activities[i];
            if(state.recreation.status.filteredActivities[activity]){
               hasActivity = true;
               break;
            }
         }
         if(!hasActivity) {
            return false;
         }

         markerBounds.extend(coord);
         return true;
      })

      this.filtered.setData(data);

      //if the filter is due to new load, and there are points,
      //and the bounds to contain these points are larger than the 
      //current viewport, change the map viewport to show everything
      if(fitMap && data.length){
         if( markerBounds.equals(mapBounds) )
            __WEBPACK_IMPORTED_MODULE_2__map_mapconstant__["a" /* default */].fitBounds(markerBounds, 0);
         else
            __WEBPACK_IMPORTED_MODULE_2__map_mapconstant__["a" /* default */].fitBounds(markerBounds);
      }
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
      this.interests = new Interests(__WEBPACK_IMPORTED_MODULE_1__recreation_constants__["a" /* interestList */]);
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


/* harmony default export */ __webpack_exports__["a"] = (state);




/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(10);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 39.7642548, lng: -104.9951937},
  zoom: 5
});

/* harmony default export */ __webpack_exports__["a"] = (map);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./recreation.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./recreation.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = retrieveSingleRecArea;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_css__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__recreation_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);
/* Retrieve the data for a recreation area 
*  Display the data to a modal on the web page */




var bookMarkItem;
var unsetBookMark;
var addRecToRoute;

// display the data in a modal box
function retrieveSingleRecArea(recarea) {
    $('#modal1-content').empty();
    // retrieve the data using recAreaId

    // The recreation Area Title
    var recNameText = $("<div id='recNameModal'>").text(recarea.RecAreaName);

    //The published phone number of the area
    var recPhoneText = $("<div id='recPhoneModal'>").text(recarea.RecAreaPhone);

    var recAreaEmail = $("<div id='recEmailModal'>").text(recarea.RecAreaEmail);

    // Check and see if the link array is empty or not 
    if (recarea.LINK[0] != null) {
        var recAreaLinkTitle = recarea.LINK[0].Title;
        var recAreaUrl = recarea.LINK[0].URL;
        var recAreaLink = $("<a />", {
            href: recAreaUrl,
            text: recAreaLinkTitle,
            target: "_blank",
            id: "recUrlModal"});
    }

            function telephoneCheck(strPhone){
              // Check that the value we get is a phone number
                var isPhone = new RegExp(/^\+?1?\s*?\(?\d{3}|\w{3}(?:\)|[-|\s])?\s*?\d{3}|\w{3}[-|\s]?\d{4}|\w{4}$/);
                return isPhone.test(strPhone);
            }

    // Append the details of the recarea to the modal
    // Checks whether a phone number matches a pattern before appending to the modal
    if (telephoneCheck(recarea.RecAreaPhone) == true){    
        $('#modal1-content').append(recNameText,recPhoneText,recAreaEmail,recAreaLink);
    } else
        $('#modal1-content').append(recNameText,recAreaEmail,recAreaLink);

    // RecAreaDescription

    $('#modal1-content').append(`<strong><div id='descModal'>Description:</strong> ${recarea.RecAreaDescription}`);

    // Append the Activities to the modal
    $('#modal1-content').append("<strong><div id='activityModalHead' class='collection-header'>Activities</div>");
    recarea.ACTIVITY.forEach(function(activity){
        $('#modal1-content').append("<ul>");
        $('#modal1-content').append("<li id='activityTypeModal'>" + activity.ActivityName);
    })

    // RECAREAADDRESS
    recarea.RECAREAADDRESS.forEach(function(address){
        $('#modal1-content').append("<strong><div id='addressHeadModal'>Address");
        $('#modal1-content').append("<div class='addressModal'>" + address.RecAreaStreetAddress1);
        $('#modal1-content').append("<div class='addressModal'>" + address.RecAreaStreetAddress2);
        $('#modal1-content').append(`<div class='addressModal'> ${address.City}, ${address.AddressStateCode} ${address.PostalCode}`);
    })


    // Set/Unset the bookmark item
    bookMarkItem = function(){
        if (recarea.bookmarked === false) {
          __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.addBookmark(recarea);
        } else {
            $('#book-mark-btn').text("Unbookmark");           
            __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.removeBookmark(recarea);
        }
    }

        if (recarea.bookmarked === false) {
            $("#book-mark-btn").text("Bookmark");
        } else {
            $('#book-mark-btn').text("Unbookmark");         
        }

   // Need to add a button that adds the recarea to route

    addRecToRoute = function() {
        if(recarea.inRoute === false) {
            __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.addToRoute(recarea);
        } else {
            $('#addToRouteBtn').text("Remove from Route");
            __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.removeFromRoute(recarea);
        }
    }

        if (recarea.inRoute === false) {
            $('#addToRouteBtn').text("Add to Route");
        } else {
            $('#addToRouteBtn').text("Remove from Route");
        }

    // Last step is to open the modal after everything is appended
        $('#modal1').modal('open');

}


$(document).ready(function(){

    $('#modal1').modal({
        inDuration: 300,
        startingTop: '40%', // Starting top style attribute
        endingTop: '10%'
    });

    $('#book-mark-btn').click(function(){
         bookMarkItem();
    });

    // Create button to add a route to the modal footer

        var addToRouteButton = $("<a />", {
            href: "#!",
            text: "Add to Route",
            class: "modal-action modal-close waves-effect btn btn-flat right",
            style: "margin: 6px",
            id: "addToRouteBtn"});

        $('#rec-area-detail-modal-footer').append(addToRouteButton);

    $('#addToRouteBtn').click(function(){
        addRecToRoute();
    })
 
 });



/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return interestList; });
/* harmony export (immutable) */ __webpack_exports__["c"] = recApiQuery;
/* harmony export (immutable) */ __webpack_exports__["b"] = recApiById;
var interestList = [
    {"ActivityName": "BIKING",
     "ActivityID": 5,
     "Emoji": "🚴"
    },
    {"ActivityName": "CLIMBING",
     "ActivityID": 7,
     "Emoji": "A"
    },
    {"ActivityName": "CAMPING",
     "ActivityID": 9,
     "Emoji": "A"
     },
     {"ActivityName": "HIKING",
      "ActivityID": 14,
      "Emoji": "A"
    },
    {"ActivityName": "PICNICKING",
      "ActivityID": 20,
      "Emoji": "A"
     },
     {"ActivityName": "RECREATIONAL VEHICLES",
      "ActivityID": 23,
      "Emoji": "A"
     },
     {"ActivityName": "VISITOR CENTER",
      "ActivityID": 24,
      "Emoji": "A"
    },
    {"ActivityName": "WATER SPORTS",
     "ActivityID": 25,
     "Emoji": "A"
    },
    {"ActivityName": "WILDLIFE VIEWING",
     "ActivityID": 26,
     "Emoji": "A"
    },
    {"ActivityName": "HORSEBACK RIDING",
     "ActivityID": 15,
     "Emoji": "A"
    }

]


function recApiQuery(latitudeVal,longitudeVal,radiusVal,activityVal,callback) {

    var recQueryURL = "https://ridb.recreation.gov/api/v1/recareas.json?apikey=2C1B2AC69E1945DE815B69BBCC9C7B19&full&latitude="
    + latitudeVal + "&longitude=" + longitudeVal + "&radius=" + radiusVal + "&activity=" + activityVal;

        $.ajax({
            url: recQueryURL,
            method: "GET"
        })
        .done(callback);
}

function recApiById(id, callback) {

    var recQueryURL = "https://ridb.recreation.gov/api/v1/recareas/" + id + ".json?apikey=2C1B2AC69E1945DE815B69BBCC9C7B19&full"

        $.ajax({
            url: recQueryURL,
            method: "GET"
        })
        .done(callback);
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_recreation_recreation__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_recreation_loadButton__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_interests_interests__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_layout_layout__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_map_map__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_route_route__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_localstorage_localstorage__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_finale_finale__ = __webpack_require__(27);










/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_css__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__recreation_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__displayRecAreaSuggestions__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recAreaDetails__ = __webpack_require__(5);






/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".recreation{\n   background: red;\n}\n\n.suggestionSummary {\n    font-size: 1em;\n    margin-top: 5%;\n}\n\n.suggestionSummary:hover {\n    background-color:rgba(0, 0, 0, 0.1);\n\n}\n\n#recNameModal {\n    font-size: 25px;\n    text-align: center;\n}\n\n#activityTypeModal {\n    margin-left: 5%;\n    line-height: 5%;\n}\n\n#activityModalHead, #descModal, #addressHeadModal {\n    margin-left: 5%;\n    margin-top: 2%;    \n}\n\n#recPhoneModal, #recEmailModal, #recUrlModal {\n    margin-left: 5%;\n    text-align: center;\n}\n\n.addressModal {\n    margin-left: 5%;\n\n}\n\n#noneFound {\n    text-align: center;\n    font-size: 1em;\n    margin-top: 5%;\n}", ""]);

// exports


/***/ }),
/* 10 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var service = new google.maps.DistanceMatrixService();
/* harmony default export */ __webpack_exports__["a"] = (service);


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export displayRecAreaSummary */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state_state__ = __webpack_require__(0);



    function displayRecAreaSummary(recdata, filteredType) {
        $(filteredType).empty();

       function telephoneCheck(strPhone){
            // Check that the value we get is a phone number
            var isPhone = new RegExp(/^\+?1?\s*?\(?\d{3}|\w{3}(?:\)|[-|\s])?\s*?\d{3}|\w{3}[-|\s]?\d{4}|\w{4}$/);
            return isPhone.test(strPhone);
        }

        for (var i = 0; i <recdata.val.length; i++) {

            var recValAlias = recdata.val[i];

            var sugDivClass = $("<ul class='suggestionSummary card' id='areaId-" + recValAlias.id + "'>");

            var recNameText = $("<strong><li card-title>").text(recValAlias.RecAreaName);

            var recPhoneText = $("<li card-content>").text(recValAlias.RecAreaPhone);


            if (telephoneCheck(recValAlias.RecAreaPhone) == true){
                sugDivClass.append(recNameText, recPhoneText);
            } else
                sugDivClass.append(recNameText);

            //Get both the Title and URL values and create a link tag out of them
            // We're only grabbing the first instance of the LINK array
            if (recValAlias.LINK[0] != null) {
                var recAreaLinkTitle = recValAlias.LINK[0].Title;
                var recAreaUrl = recValAlias.LINK[0].URL;
                var recAreaLink = $("<a />", {
                    href: recAreaUrl,
                    text: recAreaLinkTitle,
                    target: "_blank"});

                var recAreaLinkP = $("<li card-content>").append(recAreaLink);
                
                sugDivClass.append(recAreaLinkP);
            } else 
                sugDivClass.append("<li card-content>");

            $(filteredType).append(sugDivClass);

            sugDivClass.click(recValAlias.showDetails);
            
            sugDivClass.hover(recValAlias.highlightMarker, recValAlias.unHighlightMarker);

       }

    if (recdata.val.length === 0){   
         if (filteredType === "#filtered"){
            $(filteredType).append("<div id='noneFound'>No recreation areas found.</div>");
         } else if (filteredType === "#bookmarked") {
            $(filteredType).append("<div style='text-align:center; margin:5%;' id='no-bookmark'>Nothing bookmarked.</div>");
        }
     }
    }


$(document).ready(function(){
        $("#bookmarked").append("<div style='text-align:center; margin:5%;' id='no-bookmark'>Nothing bookmarked.</div>");
});

__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.filtered.on("change",  function(recdata){

        var filteredType = "#filtered";
        displayRecAreaSummary(recdata, filteredType);

});
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.bookmarked.on("change", function(recdata){

        var filteredType = "#bookmarked";
        displayRecAreaSummary(recdata, filteredType);
});


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state_state__ = __webpack_require__(0);


function showButton(status) {
   var container = $('#button-container');
   var text;
   var btn = $('<button class="btn center">')
      .text('Find Recreation')
      .click(__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.search)
      .css({
         display: 'block',
         margin: '0 auto'
      });
   var icon = $('<i class="material-icons pink-text text-accent3"></i>').text('warning');

   var noInterest = !__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].interests.selected.length;
   var noLocation = !__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.locationCount;
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
      btn.addClass('pulse');
      setTimeout(function(){
         btn.removeClass('pulse');
      }, 500);
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
      btn.addClass('pulse');
      setTimeout(function(){
         btn.removeClass('pulse');
      }, 500);
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

__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].interests.on('change', function(e){
   var loaded = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.loadedActivities;
   var filtered = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.filteredActivities;
   var shouldLoad = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.shouldResetLoadedActivities;
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
   var canLoad = !!e.val.selected.length && !!__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.locationCount;
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.shouldResetLoadedCoords = resetCoords;
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
   if( shouldFilter){
      __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.filterAll();
   }
});

//returns true if the area of A is (mostly) contained in the area of B
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
         if(!currentContained && j < arrB.length - 1){
            let d1 = distance;
            let d2 = google.maps.geometry.spherical.computeDistanceBetween(
            arrA[i], arrB[j + 1]);
            currentContained = d1 < radB && d2 < radB;
         }
      }
      allContained = currentContained;
   }
   return allContained;
}

__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].map.directions.on('change', function(e){
   //make this constant 50 miles!
   var radius = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.searchRadius;
   var loadedSearchCoords = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.loadedSearchCoords;
   var newRouteCoords = e.val.getCoordsByRadius(radius);
   var shouldLoad = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.shouldResetLoadedCoords;
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

   var canLoad = !!__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.locationCount && !!__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].interests.selected.length;
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.shouldResetLoadedActivities = resetActivities;

   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
   if( shouldFilter){
      __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.filterAll();
   }
});

// //might have to wait for directions to come back and be processed...
// state.route.on('change', function(e){
//    state.recreation.status.shouldResetLoadedActivities = true;
//    var shouldLoad = !!e.val.length;
//    var canLoad = !!e.val.length && !!state.interests.selected.length;
//    state.recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
// })

$(document).ready(() => showButton(__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.makeEvent()));
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.on('change', showButton);


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interests_css__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interests_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__interests_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);





/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(16);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./interests.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./interests.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".interests{\n   background: orange;\n}\n", ""]);

// exports


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layout_css__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layout_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__layout_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);



$(document).ready(function() {
    $('select').material_select();
    
	
    function addChip() {
		for (let i = 0; i < __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all.length; i++) {
			
			let newChip = $('<div class="chip center"></div>');
			$("#unselected-interests").append(newChip.text(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all[i].name));
			
			$(newChip).click(function() {
				__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all[i].toggle();
			});
// =========================
			// if (localStorage.getItem('interests') !== null) {
			// 	state.interests.emit('change');
			
			// if (localStorage.getItem('interests') !== null) {
			// 	let interestsArray = JSON.parse(localStorage.getItem('interests'));
				

			// 	if (interestsArray[state.interests.all[i].id] === true ) {
			// 		state.interests.all[i].selected = true;
			// 	}
			// }
// ==========================
		__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all[i].on('change', function(e) {
			
			if(e.val) {
				newChip.addClass("selected");
				$("#selected-interests").append(newChip);
			} else {
			 	newChip.removeClass('selected');
			 	$("#unselected-interests").prepend(newChip);
			}

		});
		}
	}

	addChip();


	$("#clear-interests").click(function() {
	
		__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.selected.forEach(function(clear) {
			clear.update(false, true);
		});
		__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.emit('change');
	});
	
	$(".destination-input").on('focus', function() {
 		if ($("#interests-header").hasClass('active')) {
 			$("#interests-header").click();
 		}
 	});


	$('#tutorial-modal').modal({
	  inDuration: 300,
	  startingTop: '40%', // Starting top style attribute
	  endingTop: '10%'
	});

});






/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(19);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./layout.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./layout.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".test-class{\n   background: lime;\n}\n\n.layout{\n   background: rebeccapurple;\n}\n\n.chip {\n\tbackground: #e8e8e8;\n\tcursor: pointer;\n\tdisplay: block;\n\tmax-height: 2em;\n\tline-height: 2em;\n\tpadding: 0px;\n\tmargin-right: 0px;\n}\n.selected{\n\tbackground: rgba(111, 179, 132, 0.4);\n}\n\n#map {\n\ttop: 7px;\n}\n\n.nav-wrapper, .btn, .btn-floating {\n\tbackground: #6fb384;\n\tcolor: white;\n}\n\n.collapsible-body {\n\tpadding: 15px;\n\tmax-height: 80vh;\n\toverflow: auto;\n}\n\n.collapsible-header {\n\tbackground: #5F8A97;\n\tcolor: white;\n}\n\n.center {\n\ttext-align: center;\n}\n\n.btn:hover {\n\tbackground: #45955D;\n}\n\n.modal-content {\n\tbackground: #dfeadf;\n}\n\n.tabs .tab a {\n\tcolor: #6fb384;\n}\n\n.tabs .tab a.active {\n\tcolor: #6fb384;\n}\n\n .tabs .indicator {\n \tbackground: #6fb384;\n }\n\n .padding {\n \tpadding-top: 10px;\n }\n.fixed {\n\tposition: absolute;\n\ttop: 10px;\n\tright: 10px;\n\tcolor: gray;\n}\n\n#font-size-12 {\n\tfont-size: 12px;\n\tmargin-bottom: 0px;\n}\n\n.range-field {\n\tmargin-top: 0px;\n\tpadding: 0 15px;\n}\n\n.tabs {\n\toverflow-x: hidden;\n}\n", ""]);

// exports


/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__map_css__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__map_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__map_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__mapconstant__ = __webpack_require__(3);




const directionsService = new google.maps.DirectionsService();
const directionsDisplay = new google.maps.DirectionsRenderer();


directionsDisplay.setMap(__WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */]);
directionsDisplay.setPanel(document.getElementById('directions-container'));

let routeMarkers = [];

__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.on('change', function(e){
   //remove all markers
   routeMarkers.forEach((m) => {
      m.setMap(null);
   });
   routeMarkers = [];

   // //add new markers
   if(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.locationCount === 1){
      directionsDisplay.set('directions', null);
      if(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.path[0].data.geometry){
         __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */].fitBounds(e.val[0].data.geometry.viewport);
         addMarker(e.val[0].data.geometry.location, 'route');
         //update route with one location
         __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].map.directions.update(e.val[0].data.geometry.location);
      }
      else if(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.path[0].data.RecAreaName){
         let coords = new google.maps.LatLng({
            lat: e.val[0].data.RecAreaLatitude,
            lng: e.val[0].data.RecAreaLongitude
         });
         __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].map.directions.update(coords);
         __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */].setCenter(coords);
         __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */].setZoom(8);
         addMarker(coords, 'route');
      }
      else{
         let coords = new google.maps.LatLng({
            lat: e.val[0].data.lat,
            lng: e.val[0].data.lng
         });
         __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].map.directions.update(coords);
         __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */].setCenter(coords);
         __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */].setZoom(8);
         addMarker(coords, 'route');
      }
   }
   else if(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.locationCount){
      if(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.shouldZoomMap){
         directionsDisplay.set('preserveViewport', false);
      }
      else{
         directionsDisplay.set('preserveViewport', true);
      }
      //get directions
      let request = {
         origin: __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.origin,
         destination: __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.destination,
         travelMode: 'DRIVING'
      }
      if(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.waypoints)
         request.waypoints = __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.waypoints;
      directionsService.route(request, function(result, status) {
         if (status == 'OK') {
            __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].map.directions.update(result.routes[0]);
            directionsDisplay.setDirections(result);
         }
         //else show some error toast?
         __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.shouldZoomMap = true;
      });
   }
   else{
      __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].map.directions.update(null);
   }
})

let recAreaMarkers = [];

__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.filtered.on('change', function(e){
   let markerMap = {};
   let newMarkers = [];
   e.val.forEach((r) => {
      if(!r.marker){
         r.addMarker();
         r.marker.setMap(__WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */]);
      }
      else if(!r.markerDisplayed){
         r.marker.setMap(__WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */]);
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
      map: __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */]
   }
   if(type === 'route'){
      kwargs.label = 'A';
   }
   let marker = new google.maps.Marker(kwargs);
   if(area){
      let info = new google.maps.InfoWindow({content: makePreview(area)});
      marker.addListener('mouseover', (e) => {
         info.open(__WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */], marker);
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

__WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */].addListener('idle', function(){
   __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.filterAll();
})

$(document).ready(function(){
   $('#directions-modal').modal();
   var directionsBtn = $('<a href="#">')
   .append($('<i class="material-icons">').text('directions'))
   .css({
      'background-color': '#fff',
      color: '#747474',
      'border-radius': '2px',
      margin: '10px',
      padding: '0 3px',
      height: '25px',
      'line-height': '25px',
      'box-shadow': 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px'
   })
   .click(function(){
      $('#directions-modal').modal('open');
   });
   __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */].controls[google.maps.ControlPosition.TOP_CENTER].push(directionsBtn[0]);

   var slider = $('#radius-slider');
   var circles = [];
   slider.on('mousedown focus', function(){
      //set radius from slider val
      __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.searchRadius = slider.val() * 1609.34;
      let rad = __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.searchRadius;
      var coords = __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].map.directions.getCoordsByRadius(rad);
      if(coords){
         coords.forEach((c) => {
            let circle = new google.maps.Circle({
               center: c,
               radius: rad,
               fillColor: 'blue',
               fillOpacity: 0.33,
               strokeColor: 'red',
               strokeOpacity: 0,
               map: __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */]
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
      __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.filterAll();
   });
   slider.on('input', function(){
      circles.forEach((c) => {
         c.setMap(null);
      })
      circles = [];
      __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.searchRadius = slider.val() * 1609.34;
      let rad = __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.searchRadius;
      var coords = __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].map.directions.getCoordsByRadius(rad);
      if(coords){
         coords.forEach((c) => {
            let circle = new google.maps.Circle({
               center: c,
               radius: rad,
               fillColor: 'blue',
               fillOpacity: 0.33,
               strokeColor: 'red',
               strokeOpacity: 0,
               map: __WEBPACK_IMPORTED_MODULE_2__mapconstant__["a" /* default */]
            });
            circles.push(circle);
         });
      }
   });
})



/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(22);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./map.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./map.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, "\n#map{\n   min-height: 90vh;\n}\n", ""]);

// exports


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__route_css__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__route_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__route_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);



var tooltip = $(
	'<span class= "route-tooltip" data-tooltip="Select from the drop-down menu." data-position="right">'
);
tooltip.tooltip({delay: 50});

// Function to manage the sorting of Google Places locations.
// Using jquery.ui for sorting function.
$(function() {
  $( ".sortable" ).sortable({
    revert: true, 
    stop: function() {
      var children = inputSection.children();
      var checker = 0;
      var stateLocation;
      var listLocation;
      // Logic created to determine where the original destination was located, where it was moved, and to update the location in State.
      for (let i = 0; i < children.length; i++) {
      	listLocation = children[i].dataset.number;
      	if (listLocation != checker){
	      	if (listLocation > checker+1){
						tooltip.mouseleave();
						tooltip.detach();
						stateLocation = __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.path[listLocation].data;
						__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(listLocation, true);
						__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.insert(stateLocation, i);
	      	} else if (listLocation == checker+1){
	      		checker++;
	      	} else if (listLocation < checker-1){
					tooltip.mouseleave();
					tooltip.detach();
	    			stateLocation = __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.path[listLocation].data;
	    			__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(listLocation, true);
					__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.insert(stateLocation, i);
	      	}
	      }
      	checker++;
      }
    }
  });
});

// Options object that will be fed into the Google Places API call.
var options = {
  componentRestrictions: {country: 'us'}
};

// Variables for the new sections within the #destinations container for the sorting and for the button/new inputs.
var inputSection = $("<div>");
var buttonSection = $('<div class="route-btn-container">');

// Applies the "sortable" class to the inputSection area so only that section can be sorted.
inputSection.attr("class", "sortable");

// Appending the new divs to the #destination section.
$("#destinations").append(inputSection);
$("#destinations").append(buttonSection);

// On page load, calls the newInputField function to load a "Starting Location" input field.
newInputField();

// Function to update the state object when something within the object is changed.
__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.on("change", function (e){
	var path = e.val;
	// Resets the input and button Section divs to avoid duplications.
	inputSection.empty();
	buttonSection.empty();
	// If all destinations have been removed, calls the newInputField function to re-add "Starting Location" input field.
	if (path.length == 0) {
		newInputField();
	} else {
		// Populates the destinations section with the locations stored in the state object.
		for (let i = 0; i < e.val.length; i++) {
			let location = e.val[i];
			let newInput;
			var inputContainer = $("<div>");
			// Adds ui-state-default class to allow input boxes to be sortable via jquery.ui.
			inputContainer.attr("class", "row inputContainer ui-state-default");
			// Stores data number in the inputContainer for manipulation in the sortable function.
			inputContainer.attr("data-number", i);
			// Creates a clean view of Google Address from the Places name and address stored in the state object.
			if (location.type == "place") {
				newInput = $("<input>").val(location.data.name + ' (' + location.data.formatted_address + ')');
			}
			// Creates a clean view of the Google Address from the recreation list in case that is the field type stored in the state object.
			else {
				newInput = $("<input>").val(location.data.RecAreaName);
			}
			// Adds and appends all classes, buttons, and functions inside the inputContainer.
			newInput.attr("class", "col s10 m10 l10 route-choice");
			let closeInput = "<i class='material-icons close-icon'>close</i>";
			let moveInput = "<i class='material-icons move-icon'>dehaze</i>";
			let closeInputDiv = $("<div class='col s1 m1 l1 closeInputDiv'>");
			let moveInputDiv = $("<div class='col s1 m1 l1 moveInputDiv'>");
			moveInputDiv.append(moveInput);
			inputContainer.append(moveInputDiv);
			inputContainer.append(newInput);
			closeInputDiv.append(closeInput);
			inputContainer.append(closeInputDiv);
			// Function to remove the inputContainer if the close (X) button is pressed.			
			closeInputDiv.click(function(){
				if (location.type === "recarea"){
			 		__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.path[i].data.setInRoute(false);
				}
				tooltip.mouseleave();
				tooltip.detach();
			 	__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(i);
			});
			// Function to remove the inputContainer if the user focuses out of the input while it is blank.			
			newInput.focusout(function(){
			 	if (newInput.val() == ""){
			 		if (location.type === "recarea"){
			 			__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.path[i].data.setInRoute(false);
					}
					tooltip.mouseleave();
					tooltip.detach();
			 		__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(i);
			 	}
			});
			// Function to remove the inputContainer if enter is pressed while the input is blank.
			newInput.keypress(function (e) {
				if (e.which === 13 && newInput.val() == ""){
			 		if (location.type === "recarea"){
			 			__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.path[i].data.setInRoute(false);
					}
					tooltip.mouseleave();
					tooltip.detach();
					__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(i);
				}
			});
			// Adds the completed inputContainer to the inputSection.
			inputSection.append(inputContainer);
			// Sends the newInput, inputContainer, bulian value, and state position to the autofill function.
			autofill(newInput[0], inputContainer, false, i);
		} 
		// Creates and appends buttons to the buttonSection when a completed input is filled in.
		buttonSection.append("<div id='newbuttons'>");
		$("#newbuttons").append("<a class='btn-floating btn-small waves-effect waves-light' id='route-addBtn'><i class='material-icons'>add</i></a>");
		$("#newbuttons").append("<p id='route-newLocationText'>Add a New Stop</p>");
		$("#route-addBtn").click(newInputField);
	}
});

// Applied autofill code to the new input fields and sends input to state object.
// Takes the newInput, inputContainer, bulian value, and state postion as variable in the autofill function.
// Tooltips included for user error handling.
function autofill(input, container, add, index){
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	// Google Places function - uses "autocomplete" placeholder defined in line above.
	autocomplete.addListener('place_changed', function (){
		var place = autocomplete.getPlace();
		if (place.place_id){
			if (add){
				tooltip.mouseleave();
				tooltip.detach();
				__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.add(place);
			}
			else {
				tooltip.mouseleave();
				tooltip.detach();
				__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(index, true);
				__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.insert(place, index);
			}
		} else {
			if (place.name != ""){
				container.append(tooltip);
				tooltip.mouseenter();
			}
		}
	});
}

// Get the HTML input element for the autocomplete search box and create the autocomplete object.
function newInputField() {
	$("#newbuttons").remove();
	var inputfield = $("<input>");
	buttonSection.append(inputfield);
	inputfield.addClass("destination-input");
	// Changes the placeholder value within the new input field based on the length of the state object.
	if (__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.locationCount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
		inputfield.focus();
	}
	autofill(inputfield[0], buttonSection, true);
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(25);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./route.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./route.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".route{\n   background: lightgrey;\n}\n\n#route-addBtn {\n\tdisplay: inline-block;\n\tmargin-right: 10px;\n\theight: 25px;\n\tpadding-top: 0;\n\twidth: 25px;\n\tbackground-color: #6fb384;\n}\n\n.btn-floating i {\n\tline-height: 25px\n}\n\n#route-newLocationText {\n\tdisplay: inline-block;\n}\n\n.inputContainer {\n\tmargin-top: 0px;\n\tmargin-bottom: 0px;\n\tpadding-bottom: 0px;\n\tbackground-color: white;\n\tposition: relative;\n}\n\n.inputContainer .route-choice {\n\tmargin-bottom: 0px;\n\tpadding-left: 0px;\n\tpadding-right: 0px;\n}\n\n.inputContainer .material-icons {\n\tfont-size: 20px;\n\tcolor: gray;\n}\n\n.inputContainer {\n\tmargin-bottom: 0px;\n\tposition: relative;\n}\n\n.close-icon {\n\tposition: absolute;\n\tline-height: 31px;\n\tright: -3px;\n\tbottom: 7px;\n}\n\n.move-icon {\n\tposition: absolute;\n\tline-height: 31px;\n\tleft: 0px;\n\tbottom: 7px;\n}\n\n.inputContainer .closeInputDiv,\n.inputContainer .moveInputDiv {\n\tcursor: pointer;\n\theight: 40px;\n\tpadding: 0px;\n}\n\n#destinations {\n\tpadding-left: 15px;\n\tpadding-right: 15px;\n}\n\n.trevortoast {\n\tfont-size: 24px;\n\tposition: fixed;\n\ttop: 100px !important;\n\tleft: 38%;\n}\n\n.route-btn-container{\n\tposition: relative;\n}\n\n.route-tooltip{\n\tposition: absolute;\n\ttop: 20px;\n\tright: 0;\n}\n", ""]);

// exports


/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state_state__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recreation_constants__ = __webpack_require__(6);



//interests
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].interests.on('change', function(e) {
   var interests = {};

   e.val.selected.forEach(function(interest) {
      interests[interest.id] = true;
   });
   localStorage.setItem('interests', JSON.stringify(interests));
   localStorage.setItem('has-stored', 'true');
});

//route
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.on('change', function(e){
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
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.bookmarked.on('change', function(e){
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
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].interests.all.forEach((a) => {
      if(interests[a.id]){
         a.update(true, true);
      }
   });
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].interests.emit('change');

   var route = JSON.parse(localStorage.getItem('route')) || [];
   var routeArr = [];
   let requestCount = 0;
   var routeCallback = function(index, response){
      requestCount -= 1;
      if(response.RecAreaID){
         __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.all.addData(response);
         let area = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.all.RECDATA.find((r) => {
            return r.id == response.RecAreaID;
         });
         area.setInRoute(true);
         routeArr[index] = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.getLocationObject(area);
      }
      if(requestCount === 0){
         __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.setData(routeArr);
      }
   }
   route.forEach((location, index) => {
      if(location.type === 'place'){
         routeArr[index] = __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.getLocationObject(location);
      }
      else{
         requestCount += 1;
         Object(__WEBPACK_IMPORTED_MODULE_1__recreation_constants__["b" /* recApiById */])(location.id, routeCallback.bind(null, index));
      }
   });
   if(requestCount === 0){
         __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.setData(routeArr);
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
         __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.all.addData(response);
         __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.addBookmark(__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.all.RECDATA.find((r) => {
            return r.id == response.RecAreaID;
         }));
      }
      if(requestCount === 0){
         //need to wait for directions to load
         __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.filterAll();
      }
   }
   bookmarked.forEach((b) => {
      requestCount += 1;
      Object(__WEBPACK_IMPORTED_MODULE_1__recreation_constants__["b" /* recApiById */])(b, bookmarkCallback);
   });
}

//make sure this is set false if they choose not to load storage!
var hasStorage = localStorage.getItem('has-stored') === 'true';
var hasLoaded = false;
if( hasStorage){
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].map.directions.on('change', getBookmarks);
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


/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__loadedcircles__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__finale_mp3__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__finale_mp3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__finale_mp3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__airhorn_mp3__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__airhorn_mp3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__airhorn_mp3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__finale_css__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__finale_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__finale_css__);





const ctx = new (AudioContext || webkitAudioContext)();
const audio = new Audio();
const source = ctx.createMediaElementSource(audio);


 var buffer = null;

 //if browser supports web audio, create a new audio context
 //and load the button tap sound 

  var request = new XMLHttpRequest();
  request.open('GET', __WEBPACK_IMPORTED_MODULE_2__airhorn_mp3___default.a, true);

  //when request returns successfully, store audio file 
  //as an array buffer 
  request.responseType = 'arraybuffer';
  request.onload = function(){
      var audioData = request.response;
      ctx.decodeAudioData(audioData, function(data){
          buffer = data;
      });
  }
 

 //play tap sound if web audio exists and sound was loaded correctly
 var horn;
 function playHorn(){
     if (buffer !== null){
         horn = ctx.createBufferSource();
         horn.buffer = buffer;
         horn.connect(ctx.destination);
         horn.start(ctx.currentTime + 0.01);
         $('#honkhonk').addClass('shake');
     }
 }
 function stopHorn(){
   if(horn){
      horn.stop();
      $('#honkhonk').removeClass('shake');
   }
}

var wholeContainer;
$(document).ready(function(){
  request.send();
   $('.oops').click(party);
   wholeContainer = $('#whole-container');
   audio.src = __WEBPACK_IMPORTED_MODULE_1__finale_mp3___default.a;
   audio.load
   $('#honkhonk').mousedown(playHorn);
   $('#honkhonk').mouseup(stopHorn);
})

function party(){
   const analyser = ctx.createAnalyser();
   analyser.fftSize = 2048;
   analyser.maxDecibels = 0;
   analyser.smoothingTimeConstant = 0.8;
   const dataArray = new Uint8Array(analyser.frequencyBinCount);
   window.analyser = analyser;
   window.dataArray = dataArray;
   source.connect(analyser);
   analyser.connect(ctx.destination);
   $('#tutorial-modal .modal-content').css({
      'transition': 'transform 1.8s cubic-bezier(.63,.01,1,.41)',
      'transform': 'rotateZ(0deg) scaleX(1)',
   });
   $('#tutorial-modal').css('overflow', 'visible');
   wholeContainer.css({
       'transform-style': 'preserve-3d',
       perspective: '500px'
    });
   $('#airhorn-container').css('visibility', 'visible');
   $('#thankyou-container').css('visibility', 'visible');

   audio.addEventListener('playing', animate);
   audio.addEventListener('ended', () => {
      $('#airhorn-container').css('opacity', '0');
      $('#thankyou-container').css('opacity', '1');
   });


   audio.play();
   filters();
}

function animate(){
   $('#tutorial-modal .modal-content').css('transform', 'rotateZ(3600deg) scaleX(1)');
}

function drop(){
   $('#tutorial-modal').modal('close');
   wholeContainer.css({
      'background-color': 'rebeccapurple',
      'min-height': '100vh'
   });
   $('#airhorn-container').css('opacity', '1');
   doFilter = true;
}


function rotate(){
   wholeContainer.addClass('big-rotate');
}


function setRandomPosition(element){
   element.css({
      'position': 'fixed',
      'top': Math.floor(Math.random() * 100) + 'vh',
      'left': Math.floor(Math.random() * 100) + 'vw',
      'width': element.width(),
      'z-index': '1000'
   })
}
function fly(){
   $('.suggestionSummary').each((i, el) => {
      setTimeout(() => {
         setRandomPosition($(el));
         $(el).addClass('should-rotate');
      }, Math.floor(Math.random() * 6000));
   });
}

function bob(){
   $('.chip').each((i, el) => {
      setTimeout(() => {
         setRandomPosition($(el));
         $(el).addClass('should-bob');
      }, Math.floor(Math.random() * 6000));
   })
}

var hasDropped = false;
var hasFlown = false;
var hasBobbed = false;
var hasSpun = false;

var hue = 0;
var brightness = 0;
var contrast = 0;
var freshStart = true;
var doFilter = false;
function filters(){   
   if(!hasDropped && audio.currentTime > 1.5){
      drop();
      hasDropped = true;
   }
   if(hasDropped && !hasFlown && audio.currentTime > 9){
      fly();
      hasFlown = true;
   }
   if(hasFlown && !hasBobbed && audio.currentTime > 17){
      bob();
      hasBobbed = true;
   }
   if(hasBobbed && !hasSpun && audio.currentTime > 24.5){
      rotate();
      hasSpun = true;
   }
   if(doFilter){
      let newBrightness;
      let newContrast;
      analyser.getByteFrequencyData(dataArray);
      newContrast = dataArray[2];
      newBrightness = dataArray[0];
      
      if(freshStart){
         brightness = newBrightness;
         contrast = newContrast;
         freshStart = false;
      }
      if( false){
         brightness = brightness - 1;
      }
      else{
         brightness = newBrightness;
      }
      if( false){
         contrast = contrast - 1;
      }
      else{
         contrast = newContrast;
      }
      var b = (brightness - 50) / 100 ;
      var c = contrast / 100 ;
      wholeContainer.css('filter', `invert(1) hue-rotate(${hue++}deg) brightness(${b}) contrast(${1.5})`);

   }
   requestAnimationFrame(filters);
}


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state_state__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__map_mapconstant__ = __webpack_require__(3);



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
         __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.loadedSearchCoords.forEach((coord) => {
            let circle = new google.maps.Circle({
               center: coord,
               radius: 160934,
               fillColor: 'red',
               fillOpacity: 0.33,
               strokeColor: 'red',
               strokeOpacity: 0,
               map: __WEBPACK_IMPORTED_MODULE_1__map_mapconstant__["a" /* default */]
            });
            circles.push(circle);
         });
      }
      shown = !shown;
   })
})

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "2520e0421dd73485f8ce9798760e6905.mp3";

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "c5cd7fa55cdc1a77fe1951e151d4f369.mp3";

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(32);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./finale.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./finale.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, "\n @keyframes shake{\n   0% {\n     transform: rotateZ(0deg) ;\n   }\n   25% {\n     transform: rotateZ(10deg);\n   }\n   50% {\n     transform: rotateZ(0deg) ;\n   }\n   75% {\n     transform: rotateZ(-10deg);\n   }\n   100% {\n     transform: rotateZ(0deg) ;\n   }\n }\n @keyframes bigrotate{\n   from {\n     transform: rotateZ(0deg) ;\n   }\n   to {\n     transform: scale(2);\n   }\n }\n @keyframes rotate{\n   from {\n     transform: translateX(-100vw) translateZ(-100px) rotateX(0deg) rotateY(360deg) rotateZ(0deg);\n   }\n   to {\n     transform: translateX(100vw) translateZ(-100px) rotateX(360deg) rotateY(0deg) rotateZ(360deg);\n   }\n }\n @keyframes bob{\n   0% {\n     transform: translateY(20vh) translateZ(200px);\n   }\n   50% {\n     transform: translateY(-20vh) translateZ(-200px);\n   }\n   100% {\n     transform: translateY(20vh) translateZ(200px);\n   }\n }\n\n.shake{\n   animation-name: shake;\n   animation-timing-function: linear;\n   animation-duration: 0.1s;\n   animation-iteration-count: infinite;\n}\n.should-rotate{\n   animation-name: rotate;\n   animation-duration: 4s;\n   animation-timing-function: linear;\n   animation-iteration-count: infinite;\n   background-color: lime;\n }\n .should-bob{\n   animation-name: bob;\n   animation-duration: 2s;\n   animation-iteration-count: infinite;\n   background-color: red;\n }\n\n .big-rotate{\n   animation-name: bigrotate;\n   animation-duration: 16s;\n   animation-timing-function: linear;\n   animation-iteration-count: infinite;\n }\n\n #airhorn-container, #thankyou-container{\n   position: absolute;\n   top: 0;\n   right: 0;\n   bottom: 0;\n   left: 0;\n   justify-content: center;\n   visibility: hidden;\n   color: #fff;\n   opacity: 0;\n }\n\n #airhorn-container button{\n   width: auto;\n   padding: 1em;\n   line-height: 1;\n }\n\n\n", ""]);

// exports


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWUwNGNiNTY5Mzg1YmM2YzA1NmYiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvc3RhdGUvc3RhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzcz8zYmM2Iiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjQXJlYURldGFpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY3JlYXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi91cmxzLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL21hcC9kaXN0YW5jZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL2Rpc3BsYXlSZWNBcmVhU3VnZ2VzdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9sb2FkQnV0dG9uLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3M/YWQ2OCIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2xheW91dC9sYXlvdXQuY3NzPzJmMzAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5jc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwLmNzcz8zNDY3Iiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL21hcC9tYXAuY3NzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmNzcz9lMDY1Iiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9sb2NhbHN0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9maW5hbGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2xvYWRlZGNpcmNsZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZS5tcDMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2Fpcmhvcm4ubXAzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9maW5hbGUuY3NzPzA2YzQiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM3RDhCO0FBQ0k7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLE1BQU0sNEJBQTRCLEtBQUs7QUFDcEU7QUFDQTtBQUNBLGdEQUFnRCxLQUFLO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQSw2QkFBNkIsTUFBTSw0QkFBNEIsS0FBSztBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBOztBQUVBLCtDQUErQztBQUMvQztBQUNBLGlEQUFpRCxLQUFLO0FBQ3REO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsZ0JBQWdCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHNCQUFzQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEO0FBQ0EsNkI7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhHQUFrQyxzQkFBc0I7QUFDeEQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixpQkFBaUI7QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLGlDQUFpQyxVQUFVO0FBQzNDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLHVEQUF1RCxLQUFLO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ2xKRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOzs7QUFHSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQsTUFBTSxrQkFBa0IsRUFBRSxhQUFhLElBQUk7O0FBRXRHO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ25NQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsSUFBSTtBQUNKLENBQUMsQzs7Ozs7O0FDN0JELGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsZ0NBQWdDLFVBQVUsRUFBRTtBQUM1QyxDOzs7Ozs7QUN6QkE7QUFDQTs7O0FBR0E7QUFDQSw2Q0FBOEMsU0FBUyxpQ0FBaUMsTUFBTSxVQUFVLGlDQUFpQyxNQUFNLFVBQVUsaUNBQWlDLE1BQU0sVUFBVSxrQ0FBa0MsTUFBTSxXQUFXLGlDQUFpQyxNQUFNLElBQUksd0JBQXdCLFdBQVcsaUNBQWlDLE1BQU0sU0FBUywyQkFBMkIsTUFBTSxJQUFJLHFCQUFxQixXQUFXLG9HQUFvRyxNQUFNLFNBQVMscUdBQXFHLE1BQU0sSUFBSSxrQkFBa0IsU0FBUyxxREFBcUQsTUFBTSxVQUFVLHVEQUF1RCxNQUFNLFdBQVcscURBQXFELE1BQU0sSUFBSSxXQUFXLDJCQUEyQix1Q0FBdUMsOEJBQThCLHlDQUF5QyxHQUFHLGlCQUFpQiw0QkFBNEIsNEJBQTRCLHVDQUF1Qyx5Q0FBeUMsNEJBQTRCLElBQUksZUFBZSx5QkFBeUIsNEJBQTRCLHlDQUF5QywyQkFBMkIsSUFBSSxpQkFBaUIsK0JBQStCLDZCQUE2Qix1Q0FBdUMseUNBQXlDLElBQUksNkNBQTZDLHdCQUF3QixZQUFZLGNBQWMsZUFBZSxhQUFhLDZCQUE2Qix3QkFBd0IsaUJBQWlCLGdCQUFnQixJQUFJLCtCQUErQixpQkFBaUIsa0JBQWtCLG9CQUFvQixJQUFJOztBQUVyekQiLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDcpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGFlMDRjYjU2OTM4NWJjNmMwNTZmIiwiaW1wb3J0IHtyZXRyaWV2ZVNpbmdsZVJlY0FyZWF9IGZyb20gJy4uL3JlY3JlYXRpb24vcmVjQXJlYURldGFpbHMnO1xuaW1wb3J0IHtyZWNBcGlRdWVyeSwgaW50ZXJlc3RMaXN0fSBmcm9tICcuLi9yZWNyZWF0aW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgbWFwIGZyb20gJy4uL21hcC9tYXBjb25zdGFudCc7XG5pbXBvcnQgZGlzdGFuY2VNYXRyaXggZnJvbSAnLi4vbWFwL2Rpc3RhbmNlJztcblxuY2xhc3MgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3RvcihldmVudHNBcnIpe1xuICAgICAgbGV0IGV2ZW50cyA9IHRoaXMuZXZlbnRzID0ge307XG4gICAgICBldmVudHNBcnIuZm9yRWFjaChmdW5jdGlvbihlKXtcbiAgICAgICAgIC8vdGhpcyBhcnJheSB3aWxsIGNvbnRhaW4gY2FsbGJhY2sgZnVuY3Rpb25zXG4gICAgICAgICBldmVudHNbZV0gPSBbXTtcbiAgICAgIH0pO1xuICAgfVxuXG4gICAvL3NldCBldmVudCBsaXN0ZW5lclxuICAgb24oZXZlbnQsIGNhbGxiYWNrKXtcbiAgICAgIGlmKHRoaXMuZXZlbnRzW2V2ZW50XSA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7ZXZlbnR9XCIgZXZlbnQgZG9lcyBub3QgZXhpc3Qgb24gJHt0aGlzfWApXG4gICAgICB9XG4gICAgICBlbHNlIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlY29uZCBhcmd1bWVudCB0byBcIiR7dGhpc30ub24oKVwiIG11c3QgYmUgYSBmdW5jdGlvbi5gKVxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgIH1cblxuICAgLy90cmlnZ2VyIGV2ZW50IGxpc3RlbmVycyBmb3IgZ2l2ZW4gZXZlbnRcbiAgIGVtaXQoZXZlbnQsIHByZXZFdmVudCA9IHt9KXtcbiAgICAgIGlmKHRoaXMuZXZlbnRzW2V2ZW50XSA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7ZXZlbnR9XCIgZXZlbnQgZG9lcyBub3QgZXhpc3Qgb24gJHt0aGlzfWApXG4gICAgICB9XG4gICAgICBlbHNlIGlmKCFwcmV2RXZlbnQuc3RvcFByb3BhZ2F0aW9uKXtcbiAgICAgICAgIGxldCBjYWxsYmFja3MgPSB0aGlzLmV2ZW50c1tldmVudF07XG4gICAgICAgICBsZXQgZSA9IHRoaXMubWFrZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgIC8vZXhlY3V0ZSBhbGwgY2FsbGJhY2tzXG4gICAgICAgICBjYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGMoZSk7XG4gICAgICAgICB9KVxuICAgICAgfVxuICAgfVxuXG4gICAvL3Byb3ZpZGVzIGV2ZW50IG9iamVjdCBmb3IgZXZlbnQgbGlzdGVuZXJzOyBzaG91bGQgYmUgb3ZlcndyaXR0ZW4gYnkgaW5oZXJpdG9yXG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIGNvbnNvbGUud2FybihgTm8gbWFrZUV2ZW50IG1ldGhvZCBzZXQgb24gJHt0aGlzfWApO1xuICAgfVxufVxuXG5cbi8qKioqKioqKioqKioqXFwgICAgXG4gICBJbnRlcmVzdHMgICAgXG5cXCoqKioqKioqKioqKiovXG5jbGFzcyBJbnRlcmVzdCBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoaW50ZXJlc3Qpe1xuICAgICAgc3VwZXIoWydjaGFuZ2UnXSk7XG4gICAgICB0aGlzLm5hbWUgPSBpbnRlcmVzdC5BY3Rpdml0eU5hbWU7XG4gICAgICB0aGlzLmlkID0gaW50ZXJlc3QuQWN0aXZpdHlJRDtcbiAgICAgIHRoaXMuaWNvbklkID0gaW50ZXJlc3QuRW1vamlcblxuICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgICB0aGlzLmV2ZW50U2hvdWxkUHJvcGFnYXRlID0gdHJ1ZTtcblxuICAgICAgdGhpcy5tYWtlRXZlbnQgPSB0aGlzLm1ha2VFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy50b2dnbGUgPSB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpO1xuICAgfVxuICAgLy90b2dnbGVzIHNlbGVjdGVkIHByb3BlcnR5XG4gICB0b2dnbGUoKXtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSAhdGhpcy5zZWxlY3RlZDtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG4gICB1cGRhdGUoc2VsZWN0ZWQsIHN0b3BQcm9wYWdhdGlvbil7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gc2VsZWN0ZWQ7XG4gICAgICBpZihzdG9wUHJvcGFnYXRpb24pXG4gICAgICAgICB0aGlzLmV2ZW50U2hvdWxkUHJvcGFnYXRlID0gZmFsc2U7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgdGhpcy5ldmVudFNob3VsZFByb3BhZ2F0ZSA9IHRydWU7XG4gICB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuIFwiSW50ZXJlc3RcIjtcbiAgIH1cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgIHZhbDogdGhpcy5zZWxlY3RlZCwgXG4gICAgICAgICBzdG9wUHJvcGFnYXRpb246ICF0aGlzLmV2ZW50U2hvdWxkUHJvcGFnYXRlXG4gICAgICB9O1xuICAgfVxufVxuXG5jbGFzcyBJbnRlcmVzdHMgZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIC8vbGlzdCBpcyBsaXN0IG9mIGludGVyZXN0cywgdG8gYmUgcHJvdmlkZWQgYnkgcmVjcmVhdGlvbiBtb2R1bGUgXG4gICBjb25zdHJ1Y3RvcihsaXN0KXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5hbGwgPSBsaXN0Lm1hcChmdW5jdGlvbihpKXtcbiAgICAgICAgIGxldCBpbnRlcmVzdCA9IG5ldyBJbnRlcmVzdChpKTtcbiAgICAgICAgIGludGVyZXN0Lm9uKCdjaGFuZ2UnLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnY2hhbmdlJykpO1xuICAgICAgICAgcmV0dXJuIGludGVyZXN0O1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgdGhpcy5tYWtlRXZlbnQgPSB0aGlzLm1ha2VFdmVudC5iaW5kKHRoaXMpO1xuICAgfVxuICAgZ2V0IHNlbGVjdGVkKCl7XG4gICAgICByZXR1cm4gdGhpcy5hbGwuZmlsdGVyKGZ1bmN0aW9uKGkpe1xuICAgICAgICAgcmV0dXJuIGkuc2VsZWN0ZWQ7XG4gICAgICB9KTtcbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gXCJzdGF0ZS5pbnRlcmVzdHNcIjtcbiAgIH1cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgIHZhbDoge1xuICAgICAgICAgICAgYWxsOiB0aGlzLmFsbCxcbiAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkXG4gICAgICAgICB9XG4gICAgICB9O1xuICAgfVxufVxuXG5cbi8qKioqKioqKioqKioqXFwgICAgXG4gICAgIFJvdXRlICAgIFxuXFwqKioqKioqKioqKioqL1xuY2xhc3MgTG9jYXRpb257XG4gICBjb25zdHJ1Y3RvcihvYmplY3Qpe1xuICAgICAgaWYoIG9iamVjdC5oYXNPd25Qcm9wZXJ0eSgnUmVjQXJlYU5hbWUnKSl7XG4gICAgICAgICAgdGhpcy50eXBlID0gJ3JlY2FyZWEnO1xuICAgICAgfVxuICAgICAgZWxzZSBpZihvYmplY3QuaGFzT3duUHJvcGVydHkoJ3BsYWNlX2lkJykpe1xuICAgICAgICAgLy9nb29nbGUgcGxhY2VzIHBsYWNlLi4uIHNvbWVob3cgdGVzdCBmb3IgZ29vZ2xlIHBsYWNlIGFuZCBcbiAgICAgICAgIC8vdGhyb3cgZXJyb3IgaWYgbmVpdGhlciBcbiAgICAgICAgIHRoaXMudHlwZSA9ICdwbGFjZSc7XG4gICAgICB9XG4gICAgICAvL21heWJlIHJlbW92ZSBhZnRlciBkZXZcbiAgICAgIGVsc2V7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3ZpZGVkIGxvY2F0aW9uIGlzIG5vdCBhIFBsYWNlUmVzdWx0IG9yIFJlY0FyZWEnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZGF0YSA9IG9iamVjdDtcbiAgIH1cbn1cblxuY2xhc3MgUm91dGUgZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICBzdXBlcihbJ2NoYW5nZSddKTtcbiAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgdGhpcy5zaG91bGRab29tTWFwID0gdHJ1ZTtcbiAgIH1cbiAgIGdldCBsb2NhdGlvbkNvdW50KCl7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoLmxlbmd0aDtcbiAgIH1cblxuICAgZ2V0IG9yaWdpbigpe1xuICAgICAgcmV0dXJuIHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKHRoaXMucGF0aFswXSk7XG4gICB9XG4gICBnZXQgd2F5cG9pbnRzKCl7XG4gICAgICBpZiggdGhpcy5sb2NhdGlvbkNvdW50IDwgMyl7XG4gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICByZXR1cm4gdGhpcy5wYXRoLnNsaWNlKDEsIHRoaXMubG9jYXRpb25Db3VudCAtIDEpLm1hcCgobCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgIGxvY2F0aW9uOiB0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZShsKSxcbiAgICAgICAgICAgICAgIHN0b3BvdmVyOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgfSk7XG4gICAgICB9XG4gICB9XG4gICBnZXQgZGVzdGluYXRpb24oKXtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPCAyKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZShcbiAgICAgICAgICAgIHRoaXMucGF0aFt0aGlzLmxvY2F0aW9uQ291bnQgLSAxXVxuICAgICAgICAgKTtcbiAgICAgIH1cbiAgIH1cblxuICAgY29udmVydExvY2F0aW9uRm9yR29vZ2xlKGxvY2F0aW9uKXtcbiAgICAgIGlmKCFsb2NhdGlvbil7XG4gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYobG9jYXRpb24udHlwZSA9PT0gJ3BsYWNlJyl7XG4gICAgICAgICByZXR1cm4ge3BsYWNlSWQ6IGxvY2F0aW9uLmRhdGEucGxhY2VfaWR9O1xuICAgICAgfVxuICAgICAgZWxzZSBpZihsb2NhdGlvbi50eXBlID09PSAncmVjYXJlYScpe1xuICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhdDogbG9jYXRpb24uZGF0YS5SZWNBcmVhTGF0aXR1ZGUsXG4gICAgICAgICAgICBsbmc6IGxvY2F0aW9uLmRhdGEuUmVjQXJlYUxvbmdpdHVkZVxuICAgICAgICAgfVxuICAgICAgfVxuICAgfVxuXG4gICBhZGQobG9jYXRpb24sIGRvbnRFbWl0KXtcbiAgICAgIGlmICghKGxvY2F0aW9uIGluc3RhbmNlb2YgTG9jYXRpb24pKXtcbiAgICAgICAgIGxvY2F0aW9uID0gbmV3IExvY2F0aW9uKGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGF0aC5wdXNoKGxvY2F0aW9uKTtcbiAgICAgIGlmKCAhZG9udEVtaXQpXG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuICAgaW5zZXJ0KGxvY2F0aW9uLCBpbmRleCl7XG4gICAgICBpZiAoIShsb2NhdGlvbiBpbnN0YW5jZW9mIExvY2F0aW9uKSl7XG4gICAgICAgICBsb2NhdGlvbiA9IG5ldyBMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnBhdGguc3BsaWNlKGluZGV4LCAwLCBsb2NhdGlvbik7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuICAgcmVtb3ZlKGluZGV4LCBkb250RW1pdCl7XG4gICAgICB0aGlzLnBhdGguc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIGlmKCAhZG9udEVtaXQpXG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuICAgaW52ZXJ0KCl7XG4gICAgICBpZiggdGhpcy5sb2NhdGlvbkNvdW50ICE9PSAyKXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdDYW4gb25seSBpbnZlcnQgcm91dGUgaWYgcm91dGUucGF0aCBjb250YWlucyBleGFjdGx5IHR3byBsb2NhdGlvbnMnXG4gICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHRoaXMucGF0aC5wdXNoKHRoaXMucGF0aC5zaGlmdCgpKTtcbiAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB9XG4gICB9XG4gICBzZXREYXRhKGFycil7XG4gICAgICB0aGlzLnBhdGggPSBhcnI7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuXG4gICBnZXRMb2NhdGlvbk9iamVjdChsb2NhdGlvbil7XG4gICAgICByZXR1cm4gbmV3IExvY2F0aW9uKGxvY2F0aW9uKTtcbiAgIH1cblxuICAgYWRkUmVjQXJlYShhcmVhKXtcbiAgICAgIHRoaXMuc2hvdWxkWm9vbU1hcCA9IGZhbHNlO1xuICAgICAgdmFyIGFyZWFMb2NhdGlvbiA9IG5ldyBMb2NhdGlvbihhcmVhKTtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPT09IDApe1xuICAgICAgICAgdGhpcy5hZGQoYXJlYUxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPD0gMSl7ICBcbiAgICAgICAgIGxldCBvcmlnaW4gPSB0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZShhcmVhTG9jYXRpb24pO1xuICAgICAgICAgbGV0IGRlc3RpbmF0aW9ucyA9IFt0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZSh0aGlzLnBhdGhbMF0pXVxuICAgICAgICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cyl7XG4gICAgICAgICAgICBpZihzdGF0dXMgPT09ICdPSycpe1xuICAgICAgICAgICAgICAgaWYocmVzcG9uc2Uucm93c1swXS5lbGVtZW50c1swXS5zdGF0dXMgPT09ICdaRVJPX1JFU1VMVFMnKXtcbiAgICAgICAgICAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICBNYXRlcmlhbGl6ZS50b2FzdChcbiAgICAgICAgICAgICAgICAgICAgICdDb3VsZCBub3QgYWRkIHJlY3JlYXRpb24gYXJlYSB0byByb3V0ZS4gVHJ5IGFkZGluZyBpdCBtYW51YWxseS4nXG4gICAgICAgICAgICAgICAgICAsIDQwMDApO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgIHRoaXMuYWRkKGFyZWFMb2NhdGlvbik7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgYXJlYS5zZXRJblJvdXRlKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgIGRpc3RhbmNlTWF0cml4LmdldERpc3RhbmNlTWF0cml4KHtcbiAgICAgICAgICAgIG9yaWdpbnM6IFtvcmlnaW5dLFxuICAgICAgICAgICAgZGVzdGluYXRpb25zOiBkZXN0aW5hdGlvbnMsXG4gICAgICAgICAgICB0cmF2ZWxNb2RlOiAnRFJJVklORydcbiAgICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYoIHRoaXMubG9jYXRpb25Db3VudCA9PT0gMil7XG4gICAgICAgICBpZih0aGlzLnBhdGhbMV0udHlwZSA9PT0gJ3BsYWNlJyl7XG4gICAgICAgICAgICBsZXQgb3JpZ2luID0gdGhpcy5jb252ZXJ0TG9jYXRpb25Gb3JHb29nbGUoYXJlYUxvY2F0aW9uKTtcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvbnMgPSBbdGhpcy5jb252ZXJ0TG9jYXRpb25Gb3JHb29nbGUodGhpcy5wYXRoWzBdKV1cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHJlc3BvbnNlLCBzdGF0dXMpe1xuICAgICAgICAgICAgICAgaWYoc3RhdHVzID09PSAnT0snKXtcbiAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLnJvd3NbMF0uZWxlbWVudHNbMF0uc3RhdHVzID09PSAnWkVST19SRVNVTFRTJyl7XG4gICAgICAgICAgICAgICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ291bGQgbm90IGFkZCByZWNyZWF0aW9uIGFyZWEgdG8gcm91dGUuIFRyeSBhZGRpbmcgaXQgbWFudWFsbHkuJ1xuICAgICAgICAgICAgICAgICAgICAgLCA0MDAwKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydChhcmVhTG9jYXRpb24sIDEpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICBkaXN0YW5jZU1hdHJpeC5nZXREaXN0YW5jZU1hdHJpeCh7XG4gICAgICAgICAgICAgICBvcmlnaW5zOiBbb3JpZ2luXSxcbiAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uczogZGVzdGluYXRpb25zLFxuICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogJ0RSSVZJTkcnXG4gICAgICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgICAgICB9XG4gICAgICAgICBlbHNle1xuICAgICAgICAgICAgLy9idXQgd2hhdCBpZiBwYXRoWzBdIGlzIGEgcmVjcmVhdGlvbiBhcmVhPz9cbiAgICAgICAgICAgIGxldCBvcmlnaW4gPSB0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZSh0aGlzLnBhdGhbMF0pO1xuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9ucyA9IFtcbiAgICAgICAgICAgICAgIHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKHRoaXMucGF0aFsxXSksXG4gICAgICAgICAgICAgICB0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZShhcmVhTG9jYXRpb24pXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzKXtcbiAgICAgICAgICAgICAgIGlmKHN0YXR1cyA9PT0gJ09LJyl7XG4gICAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5yb3dzWzBdLmVsZW1lbnRzWzFdLnN0YXR1cyA9PT0gJ1pFUk9fUkVTVUxUUycpe1xuICAgICAgICAgICAgICAgICAgICAgYXJlYS5zZXRJblJvdXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgIE1hdGVyaWFsaXplLnRvYXN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvdWxkIG5vdCBhZGQgcmVjcmVhdGlvbiBhcmVhIHRvIHJvdXRlLiBUcnkgYWRkaW5nIGl0IG1hbnVhbGx5LidcbiAgICAgICAgICAgICAgICAgICAgICwgNDAwMCk7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZihcbiAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJvd3NbMF0uZWxlbWVudHNbMF0uZGlzdGFuY2UudmFsdWUgPlxuICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uucm93c1swXS5lbGVtZW50c1sxXS5kaXN0YW5jZS52YWx1ZVxuICAgICAgICAgICAgICAgICAgKXtcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KGFyZWFMb2NhdGlvbiwgMSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGQoYXJlYUxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgZGlzdGFuY2VNYXRyaXguZ2V0RGlzdGFuY2VNYXRyaXgoe1xuICAgICAgICAgICAgICAgb3JpZ2luczogW29yaWdpbl0sXG4gICAgICAgICAgICAgICBkZXN0aW5hdGlvbnM6IGRlc3RpbmF0aW9ucyxcbiAgICAgICAgICAgICAgIHRyYXZlbE1vZGU6ICdEUklWSU5HJ1xuICAgICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIGxldCBkZXN0aW5hdGlvbnMgPSB0aGlzLnBhdGgubWFwKChsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0TG9jYXRpb25Gb3JHb29nbGUobCk7XG4gICAgICAgICB9KVxuICAgICAgICAgbGV0IG9yaWdpbiA9IHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKGFyZWFMb2NhdGlvbik7XG4gICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzKXtcbiAgICAgICAgICAgIGlmKHN0YXR1cyA9PT0gJ09LJyl7XG4gICAgICAgICAgICAgICBsZXQgYXJyID0gcmVzcG9uc2Uucm93c1swXS5lbGVtZW50cztcbiAgICAgICAgICAgICAgIGxldCBjbG9zZXN0SW5kZXggPSAxO1xuICAgICAgICAgICAgICAgaWYoYXJyWzFdLnN0YXR1cyA9PT0gJ1pFUk9fUkVTVUxUUycpe1xuICAgICAgICAgICAgICAgICAgYXJlYS5zZXRJblJvdXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgIE1hdGVyaWFsaXplLnRvYXN0KFxuICAgICAgICAgICAgICAgICAgICAgJ0NvdWxkIG5vdCBhZGQgcmVjcmVhdGlvbiBhcmVhIHRvIHJvdXRlLiBUcnkgYWRkaW5nIGl0IG1hbnVhbGx5LidcbiAgICAgICAgICAgICAgICAgICwgNDAwMClcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIC8vZmluZCByb3V0ZSBwb2ludCB0aGlzIHJlY2FyZWEgaXMgY2xvc2VzdCB0b1xuICAgICAgICAgICAgICAgbGV0IHNtYWxsZXN0RGlzdGFuY2UgPSBhcnJbMV0uZGlzdGFuY2UudmFsdWU7XG4gICAgICAgICAgICAgICBmb3IobGV0IGkgPSAxOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgIGlmKCBhcnJbaV0uZGlzdGFuY2UudmFsdWUgPCBzbWFsbGVzdERpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAvL2lmIGl0J3MgY2xvc2VzdCB0byB0aGUgc3RhcnRpbmcgbG9jYXRpb24sIFxuICAgICAgICAgICAgICAgLy9pbnNlcnQgaXQgcmlnaHQgYWZ0ZXIgdGhlIHN0YXJ0aW5nIGxvY2F0aW9uXG4gICAgICAgICAgICAgICBpZihjbG9zZXN0SW5kZXggPT09IDEpe1xuICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnQoYXJlYUxvY2F0aW9uLCAxKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIC8vb3RoZXJ3aXNlLCBpZiBpdCdzIG5vdCBjbG9zZXN0IHRvIHRoZSBmaW5hbCBsb2NhdGlvbi4uLlxuICAgICAgICAgICAgICAgZWxzZSBpZihjbG9zZXN0SW5kZXggIT09IGFyci5sZW5ndGggLSAxKXtcbiAgICAgICAgICAgICAgICAgIC8vaW5zZXJ0IGl0IGJ5IHRoZSBsb2NhdGlvbiBpdCdzIGNsb3Nlc3QgdG9cbiAgICAgICAgICAgICAgICAgIC8vQiBpcyBjbG9zZXN0IHRvIFIsIEEgaXMgcmlnaHQgYmVmb3JlIEIsIEMgaXMgcmlnaHQgYWZ0ZXIgQlxuICAgICAgICAgICAgICAgICAgbGV0IGFUb0IgPSByZXNwb25zZS5yb3dzW2Nsb3Nlc3RJbmRleF0uZWxlbWVudHNbY2xvc2VzdEluZGV4IC0gMV0uZGlzdGFuY2UudmFsdWU7XG4gICAgICAgICAgICAgICAgICBsZXQgYVRvUiA9IGFycltjbG9zZXN0SW5kZXggLSAxXS5kaXN0YW5jZS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgIGxldCByVG9CID0gc21hbGxlc3REaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIGxldCBiVG9DID0gcmVzcG9uc2Uucm93c1tjbG9zZXN0SW5kZXhdLmVsZW1lbnRzW2Nsb3Nlc3RJbmRleCArIDFdLmRpc3RhbmNlLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgbGV0IGJUb1IgPSByVG9CO1xuICAgICAgICAgICAgICAgICAgbGV0IHJUb0MgPSBhcnJbY2xvc2VzdEluZGV4ICsgMV0uZGlzdGFuY2UudmFsdWU7XG4gICAgICAgICAgICAgICAgICBpZiggXG4gICAgICAgICAgICAgICAgICAgICBhVG9SICsgclRvQiArIGJUb0MgPCBhVG9CICsgYlRvUiArIHJUb0NcbiAgICAgICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydChhcmVhTG9jYXRpb24sIGNsb3Nlc3RJbmRleCAtIDEpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KGFyZWFMb2NhdGlvbiwgY2xvc2VzdEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIC8vb3RoZXJ3aXNlLCBpZiBpdCdzIGNsb3Nlc3QgdG8gdGhlIGxhc3QgbG9jYXRpb25cbiAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAvL2lmIHRoZSBsYXN0IGxvY2F0aW9uIGlzIGEgcmVjYXJlYSwgc2VlIGlmIHRoaXMgYXJlYVxuICAgICAgICAgICAgICAgICAgLy9zaG91bGQgYmUgYmV0d2VlbiB0aGUgbGFzdCBhbmQgc2Vjb25kIHRvIGxhc3QgbG9jYXRpb25zXG4gICAgICAgICAgICAgICAgICAvL29yIGFmdGVyIHRoZSBsYXN0IFxuICAgICAgICAgICAgICAgICAgaWYoIHRoaXMucGF0aFt0aGlzLmxvY2F0aW9uQ291bnQgLSAxXS50eXBlID09PSAncmVjYXJlYScpe1xuICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGlzIGFyZWEgYW5kIHRoZSBzZWNvbmQgdG8gbGFzdCBcbiAgICAgICAgICAgICAgICAgICAgIC8vbG9jYXRpb24gaXMgbGVzcyB0aGFuIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBzZWNvbmRcbiAgICAgICAgICAgICAgICAgICAgIC8vdG8gbGFzdCBsb2NhdGlvbiBhbmQgdGhlIGxhc3QgbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgIGlmKFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyW2Fyci5sZW5ndGggLSAyXS5kaXN0YW5jZS52YWx1ZSA8IFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uucm93c1tyZXNwb25zZS5yb3dzLmxlbmd0aCAtIDJdLmVsZW1lbnRzW2Fyci5sZW5ndGggLSAxXS5kaXN0YW5jZS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KGFyZWFMb2NhdGlvbiwgY2xvc2VzdEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZChhcmVhTG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLy9vdGhlcndpc2UsIGluc2VydCBpdCBiZWZvcmUgdGhlIGZpbmFsIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnQoYXJlYUxvY2F0aW9uLCB0aGlzLmxvY2F0aW9uQ291bnQgLSAxKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgIHN0YXR1cyA9PT0gJ01BWF9FTEVNRU5UU19FWENFRURFRCcgJiYgTWF0ZXJpYWxpemUudG9hc3QoXG4gICAgICAgICAgICAgICAgICAnVG9vIG1hbnkgbG9jYXRpb25zIGluIHJvdXRlLiBUcnkgYWRkaW5nIGl0IG1hbnVhbGx5LidcbiAgICAgICAgICAgICAgICwgNDAwMCk7XG4gICAgICAgICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICAgZGlzdGFuY2VNYXRyaXguZ2V0RGlzdGFuY2VNYXRyaXgoe1xuICAgICAgICAgICAgb3JpZ2luczogW29yaWdpbiwgLi4uZGVzdGluYXRpb25zXSxcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uczogW29yaWdpbiwgLi4uZGVzdGluYXRpb25zXSxcbiAgICAgICAgICAgIHRyYXZlbE1vZGU6ICdEUklWSU5HJ1xuICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgfVxuICAgcmVtb3ZlUmVjQXJlYShhcmVhKXtcbiAgICAgIHRoaXMuc2hvdWxkWm9vbU1hcCA9IGZhbHNlO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMucGF0aC5sZW5ndGg7IGkrKyl7XG4gICAgICAgICBpZih0aGlzLnBhdGhbaV0uZGF0YSA9PT0gYXJlYSl7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZShpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgfVxuICAgICAgfTtcbiAgIH1cblxuICAgbWFrZUV2ZW50KCl7XG4gICAgICByZXR1cm4ge3ZhbDogdGhpcy5wYXRofVxuICAgfVxuXG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZS5yb3V0ZSc7XG4gICB9XG59XG5cbi8qKioqKioqKioqKioqXFwgICAgXG4gICAgICBNYXAgICAgXG5cXCoqKioqKioqKioqKiovXG5jbGFzcyBEaXJlY3Rpb25zIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgc3VwZXIoWydjaGFuZ2UnXSk7XG4gICAgICAvL2FycmF5IG9mIGNvb3JkaW5hdGVzIGFsb25nIGRpcmVjdGlvbnMgcm91dGVcbiAgICAgIHRoaXMucm91dGVDb29yZHMgPSBbXTtcbiAgICAgIC8vYXJyYXkgb2YgY29vcmRpbmF0ZXMgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHJlYyBhcGkgY2FsbHNcbiAgICAgIHRoaXMuc2VhcmNoQ29vcmRzID0gW107XG4gICAgICB0aGlzLm9yaWdpbiA9IG51bGw7XG4gICB9XG5cbiAgIHVwZGF0ZShyb3V0ZSl7XG4gICAgICBpZihyb3V0ZSA9PSBudWxsKXtcbiAgICAgICAgIHRoaXMucm91dGVDb29yZHMgPSBbXTtcbiAgICAgICAgIHRoaXMuc2VhcmNoQ29vcmRzID0gW107XG4gICAgICAgICB0aGlzLm9yaWdpbiA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKCFyb3V0ZS5sZWdzKXtcbiAgICAgICAgIHRoaXMucm91dGVDb29yZHMgPSBbcm91dGVdO1xuICAgICAgICAgdGhpcy5zZWFyY2hDb29yZHMgPSBbcm91dGVdO1xuICAgICAgICAgdGhpcy5vcmlnaW4gPSByb3V0ZTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICB0aGlzLm9yaWdpbiA9IHJvdXRlLmxlZ3NbMF0uc3RhcnRfbG9jYXRpb247XG4gICAgICAgICB0aGlzLnJvdXRlQ29vcmRzID0gcm91dGUub3ZlcnZpZXdfcGF0aDtcblxuICAgICAgICAgLy9yb3V0ZSBjb29yZGluYXRlcyBzZXBhcmF0ZWQgYnkgMTAwIG1pbGVzXG4gICAgICAgICB0aGlzLnNlYXJjaENvb3JkcyA9IHRoaXMuZ2V0Q29vcmRzQnlSYWRpdXMoMTYwOTM0KTtcbiAgICAgICAgIGxldCBkaXN0ID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsLmNvbXB1dGVEaXN0YW5jZUJldHdlZW4oXG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvb3Jkc1t0aGlzLnNlYXJjaENvb3Jkcy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgIHRoaXMucm91dGVDb29yZHNbdGhpcy5yb3V0ZUNvb3Jkcy5sZW5ndGggLSAxXVxuICAgICAgICAgKTtcbiAgICAgICAgIGlmKGRpc3QgPiA4MDQ2Ny4yKXtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoQ29vcmRzLnB1c2godGhpcy5yb3V0ZUNvb3Jkc1t0aGlzLnJvdXRlQ29vcmRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG5cbiAgIGdldENvb3Jkc0J5UmFkaXVzKHJhZGl1cyl7XG4gICAgICBpZighdGhpcy5yb3V0ZUNvb3Jkcy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZUNvb3Jkcy5yZWR1Y2UoKGFyciwgY29vcmQpID0+IHtcbiAgICAgICAgIGxldCBkaXN0YW5jZSA9IGdvb2dsZS5tYXBzLmdlb21ldHJ5LnNwaGVyaWNhbC5jb21wdXRlRGlzdGFuY2VCZXR3ZWVuKFxuICAgICAgICAgICAgY29vcmQsIGFyclthcnIubGVuZ3RoIC0gMV0pOyBcbiAgICAgICAgIGlmKGRpc3RhbmNlID4gcmFkaXVzKXtcbiAgICAgICAgICAgIHJldHVybiBhcnIuY29uY2F0KFtjb29yZF0pO1xuICAgICAgICAgfVxuICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgICB9XG4gICAgICB9LCBbdGhpcy5vcmlnaW5dKTtcbiAgIH1cblxuICAgbWFrZUV2ZW50KCl7XG4gICAgICByZXR1cm4ge3ZhbDogdGhpc307XG4gICB9XG59XG5cbmNsYXNzIE1hcHtcbiAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICB0aGlzLmRpcmVjdGlvbnMgPSBuZXcgRGlyZWN0aW9ucygpO1xuICAgfVxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnc3RhdGUubWFwJztcbiAgIH1cbn1cblxuLyoqKioqKioqKioqKioqXFwgICAgXG4gICBSZWNyZWF0aW9uICAgIFxuXFwqKioqKioqKioqKioqKi9cbmNvbnN0IHJlcXVpcmVkUHJvcHMgPSBbXG4gICAnUmVjQXJlYU5hbWUnLFxuICAgJ1JFQ0FSRUFBRERSRVNTJyxcbiAgICdGQUNJTElUWScsXG4gICAnT3JnUmVjQXJlYUlEJyxcbiAgICdHRU9KU09OJyxcbiAgICdMYXN0VXBkYXRlZERhdGUnLFxuICAgJ0VWRU5UJyxcbiAgICdPUkdBTklaQVRJT04nLFxuICAgJ1JlY0FyZWFFbWFpbCcsXG4gICAnUmVjQXJlYVJlc2VydmF0aW9uVVJMJyxcbiAgICdSZWNBcmVhTG9uZ2l0dWRlJyxcbiAgICdSZWNBcmVhSUQnLFxuICAgJ1JlY0FyZWFQaG9uZScsXG4gICAnTUVESUEnLFxuICAgJ0xJTksnLFxuICAgJ1JlY0FyZWFEZXNjcmlwdGlvbicsXG4gICAnUmVjQXJlYU1hcFVSTCcsXG4gICAnUmVjQXJlYUxhdGl0dWRlJyxcbiAgICdTdGF5TGltaXQnLFxuICAgJ1JlY0FyZWFGZWVEZXNjcmlwdGlvbicsXG4gICAnUmVjQXJlYURpcmVjdGlvbnMnLFxuICAgJ0tleXdvcmRzJyxcbiAgICdBQ1RJVklUWSdcbl07XG5cbmNsYXNzIFJlY0FyZWEgZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKGFyZWEpe1xuICAgICAgc3VwZXIoWydib29rbWFya2VkJywgJ2lucm91dGUnXSk7XG4gICAgICB0aGlzLmlkID0gYXJlYS5SZWNBcmVhSUQ7XG4gICAgICB0aGlzLmFjdGl2aXRpZXMgPSBhcmVhLkFDVElWSVRZLm1hcChmdW5jdGlvbihhKXsgXG4gICAgICAgICByZXR1cm4gYS5BY3Rpdml0eUlEOyBcbiAgICAgIH0pO1xuICAgICAgcmVxdWlyZWRQcm9wcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3Ape1xuICAgICAgICAgdGhpc1twcm9wXSA9IGFyZWFbcHJvcF07XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICB0aGlzLmJvb2ttYXJrZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW5Sb3V0ZSA9IGZhbHNlO1xuXG4gICAgICB0aGlzLm1hcmtlciA9IG51bGw7XG4gICAgICB0aGlzLm1hcmtlckRpc3BsYXllZCA9IGZhbHNlO1xuICAgICAgdGhpcy5tYXJrZXJIaWdobGlnaHRlZCA9IGZhbHNlO1xuXG4gICAgICB0aGlzLnNob3dEZXRhaWxzID0gdGhpcy5zaG93RGV0YWlscy5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5oaWdobGlnaHRNYXJrZXIgPSB0aGlzLmhpZ2hsaWdodE1hcmtlci5iaW5kKHRoaXMpXG4gICAgICB0aGlzLnVuSGlnaGxpZ2h0TWFya2VyID0gdGhpcy51bkhpZ2hsaWdodE1hcmtlci5iaW5kKHRoaXMpXG4gICB9XG4gICBzaG93RGV0YWlscygpe1xuICAgICAgcmV0cmlldmVTaW5nbGVSZWNBcmVhKHRoaXMpOy8vbmVlZCBmcm9tIGVsaXphYmV0aDsgdXNlIGltcG9ydCBhbmQgZXhwb3J0IFxuICAgfVxuXG4gICAvL1dBUk5JTkc6IHNob3VsZCBvbmx5IHNldCBvbmUgZXZlbnQgbGlzdGVuZXIgcGVyIFJlY0FyZWFcbiAgIC8vdGhhdCB1cGRhdGVzIGFsbCBvZiBhIGNlcnRhaW4gZWxlbWVudCB3aXRoIGRhdGEgbWF0Y2hpbmdcbiAgIC8vdGhlIFJlY0FyZWEgdG8gYXZvaWQgbWVtb3J5IGxlYWtzIGFuZCBpc3N1ZXMgd2l0aCByZW1vdmVkIGVsZW1lbnRzIFxuICAgc2V0Qm9va21hcmtlZCgvKmJvb2xlYW4qLyB2YWx1ZSl7XG4gICAgICB0aGlzLmJvb2ttYXJrZWQgPSB2YWx1ZTtcbiAgICAgIHRoaXMuZW1pdCgnYm9va21hcmtlZCcpO1xuICAgfVxuICAgc2V0SW5Sb3V0ZSgvKmJvb2xlYW4qLyB2YWx1ZSl7XG4gICAgICB0aGlzLmluUm91dGUgPSB2YWx1ZTtcbiAgICAgIGlmKHRoaXMubWFya2VyKXtcbiAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUoIXZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnaW5yb3V0ZScpO1xuICAgfVxuICAgLy9zZXRGb2N1cyA+IGNoYW5nZVxuXG4gICBoaWdobGlnaHRNYXJrZXIoKXtcbiAgICAgIGlmKHRoaXMubWFya2VyICYmICF0aGlzLm1hcmtlckhpZ2hsaWdodGVkKXtcbiAgICAgICAgIHRoaXMubWFya2VyLnNldEFuaW1hdGlvbihnb29nbGUubWFwcy5BbmltYXRpb24uQk9VTkNFKTtcbiAgICAgICAgIHRoaXMubWFya2VySGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICAgaWYodGhpcy5pblJvdXRlKXtcbiAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUodHJ1ZSk7XG4gICAgICAgICB9XG4gICAgICB9XG4gICB9XG4gICB1bkhpZ2hsaWdodE1hcmtlcigpe1xuICAgICAgaWYodGhpcy5tYXJrZXIgJiYgdGhpcy5tYXJrZXJIaWdobGlnaHRlZCl7XG4gICAgICAgICB0aGlzLm1hcmtlci5zZXRBbmltYXRpb24obnVsbCk7XG4gICAgICAgICB0aGlzLm1hcmtlckhpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICBpZih0aGlzLmluUm91dGUpe1xuICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgICB9XG4gICAgICB9XG4gICB9XG5cbiAgIGFkZE1hcmtlcigpe1xuICAgICAgbGV0IGxhdExuZyA9IHtcbiAgICAgICAgIGxhdDogdGhpcy5SZWNBcmVhTGF0aXR1ZGUsXG4gICAgICAgICBsbmc6IHRoaXMuUmVjQXJlYUxvbmdpdHVkZVxuICAgICAgfTtcbiAgICAgIHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICBwb3NpdGlvbjogbGF0TG5nLFxuICAgICAgICAgbWFwOiBtYXBcbiAgICAgIH0pO1xuICAgICAgbGV0IGluZm8gPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyh7XG4gICAgICAgICBjb250ZW50OiB0aGlzLm1ha2VNYXBQcmV2aWV3KClcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tYXJrZXIuYWRkTGlzdGVuZXIoJ21vdXNlb3ZlcicsIChlKSA9PiB7XG4gICAgICAgICBpbmZvLm9wZW4obWFwLCB0aGlzLm1hcmtlcik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFya2VyLmFkZExpc3RlbmVyKCdtb3VzZW91dCcsIChlKSA9PiB7XG4gICAgICAgICBpbmZvLmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIHRoaXMuc2hvd0RldGFpbHMpO1xuICAgfVxuXG4gICBtYWtlTWFwUHJldmlldygpe1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxzdHJvbmc+JHt0aGlzLlJlY0FyZWFOYW1lfTwvc3Ryb25nPlxuICAgICAgYFxuICAgfVxuXG4gICBtYWtlRXZlbnQoZXZlbnQpe1xuICAgICAgY29uc29sZS53YXJuKGV2ZW50KTtcbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gJ1JlY0FyZWEnO1xuICAgfVxufVxuXG5jbGFzcyBSZWNBcmVhQ29sbGVjdGlvbiBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IobmFtZSl7XG4gICAgICBzdXBlcihbJ2NoYW5nZSddKTtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG5cbiAgICAgIC8vYXJyYXkgb2YgXCJSZWNBcmVhXCJzIFxuICAgICAgdGhpcy5SRUNEQVRBID0gW107XG5cbiAgICAgIC8vaGFzaCBtYXAgbGlrZSBzdG9yYWdlIG9mIHdoaWNoIHJlYyBhcmVhcyBhcmUgY3VycmVudGx5IFxuICAgICAgLy9pbiB0aGlzIGNvbGxlY3Rpb24gKGJ5IGlkKVxuICAgICAgdGhpcy5pZE1hcCA9IHt9O1xuICAgfVxuXG4gICBhZGREYXRhKHJlY2RhdGEpe1xuICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xuICAgICAgaWYoICEocmVjZGF0YSBpbnN0YW5jZW9mIEFycmF5KSl7XG4gICAgICAgICBpZiggIShyZWNkYXRhIGluc3RhbmNlb2YgUmVjQXJlYSkgKXtcbiAgICAgICAgICAgIHJlY2RhdGEgPSBuZXcgUmVjQXJlYShyZWNkYXRhKTtcbiAgICAgICAgIH1cbiAgICAgICAgIHJlY2RhdGEgPSBbcmVjZGF0YV07XG4gICAgICB9XG4gICAgICByZWNkYXRhLmZvckVhY2goZnVuY3Rpb24oYXJlYSl7XG4gICAgICAgICBpZighdGhpcy5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5SRUNEQVRBLnB1c2goYXJlYSk7XG4gICAgICAgICAgICB0aGlzLmlkTWFwW2FyZWEuaWRdID0gdHJ1ZTtcbiAgICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICBpZihjaGFuZ2Upe1xuICAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgIH1cbiAgIHNldERhdGEocmVjZGF0YSl7XG4gICAgICB0aGlzLmlkTWFwID0ge307XG4gICAgICB0aGlzLlJFQ0RBVEEgPSBbXTtcbiAgICAgIGlmKCAhKHJlY2RhdGEgaW5zdGFuY2VvZiBBcnJheSkpe1xuICAgICAgICAgcmVjZGF0YSA9IFtyZWNkYXRhXTtcbiAgICAgIH1cbiAgICAgIHJlY2RhdGEuZm9yRWFjaChmdW5jdGlvbihhcmVhKXtcbiAgICAgICAgIHRoaXMuUkVDREFUQS5wdXNoKGFyZWEpO1xuICAgICAgICAgdGhpcy5pZE1hcFthcmVhLmlkXSA9IHRydWU7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIC8vY2hhbmdlIHRvIGFsbG93IGFuIGFycmF5IG9yIHNvbWV0aGluZz9cbiAgIHJlbW92ZShhcmVhKXtcbiAgICAgIGlmKHRoaXMuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgdGhpcy5SRUNEQVRBLnNwbGljZSh0aGlzLlJFQ0RBVEEuaW5kZXhPZihhcmVhKSwgMSk7XG4gICAgICAgICBkZWxldGUgdGhpcy5pZE1hcFthcmVhLmlkXTtcbiAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB9XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHRoaXMuUkVDREFUQX1cbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gYHN0YXRlLnJlY3JlYXRpb24uJHt0aGlzLm5hbWV9YDtcbiAgIH1cbn1cblxuY2xhc3MgUmVjU3RhdHVzIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgc3VwZXIoWydjaGFuZ2UnLCAncGVyY2VudCddKTtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5wZXJjZW50TG9hZGVkID0gMTAwO1xuICAgICAgdGhpcy5zaG91bGRMb2FkID0gZmFsc2U7XG4gICAgICB0aGlzLmNhbkxvYWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZmlyc3RMb2FkID0gdHJ1ZTtcblxuICAgICAgdGhpcy5sb2FkZWRBY3Rpdml0aWVzID0ge307XG4gICAgICB0aGlzLmZpbHRlcmVkQWN0aXZpdGllcyA9IHt9O1xuXG4gICAgICB0aGlzLmxvYWRlZFNlYXJjaENvb3JkcyA9IFtdO1xuICAgICAgLy9pZiB0aGUgcm91dGUgY2hhbmdlcywgdGhpcyBzaG91bGQgYmUgdHJ1ZS5cbiAgICAgIHRoaXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzID0gZmFsc2U7XG4gICAgICB0aGlzLnNob3VsZFJlc2V0TG9hZGVkQ29vcmRzID0gZmFsc2U7XG4gICB9XG4gICB1cGRhdGUoe2xvYWRpbmcsIHBlcmNlbnRMb2FkZWQsIHNob3VsZExvYWQsIGNhbkxvYWQsIGZpcnN0TG9hZH0gPSB7fSl7XG4gICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG4gICAgICBpZihsb2FkaW5nICE9PSB1bmRlZmluZWQgJiYgbG9hZGluZyAhPT0gdGhpcy5sb2FkaW5nKXtcbiAgICAgICAgIHRoaXMubG9hZGluZyA9IGxvYWRpbmc7XG4gICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYoc2hvdWxkTG9hZCAhPT0gdW5kZWZpbmVkICYmIHNob3VsZExvYWQgIT09IHRoaXMuc2hvdWxkTG9hZCl7XG4gICAgICAgICB0aGlzLnNob3VsZExvYWQgPSBzaG91bGRMb2FkO1xuICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKGNhbkxvYWQgIT09IHVuZGVmaW5lZCAmJiBjYW5Mb2FkICE9PSB0aGlzLmNhbkxvYWQpe1xuICAgICAgICAgdGhpcy5jYW5Mb2FkID0gY2FuTG9hZDtcbiAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZihmaXJzdExvYWQgIT09IHVuZGVmaW5lZCAmJiBmaXJzdExvYWQgIT09IHRoaXMuZmlyc3RMb2FkKXtcbiAgICAgICAgIHRoaXMuZmlyc3RMb2FkID0gZmlyc3RMb2FkO1xuICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKGNoYW5nZSl7XG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgfVxuICAgICAgaWYocGVyY2VudExvYWRlZCAhPT0gdW5kZWZpbmVkICYmIHBlcmNlbnRMb2FkZWQgIT09IHRoaXMucGVyY2VudExvYWRlZCl7XG4gICAgICAgICB0aGlzLnBlcmNlbnRMb2FkZWQgPSBwZXJjZW50TG9hZGVkO1xuICAgICAgICAgdGhpcy5lbWl0KCdwZXJjZW50Jyk7XG4gICAgICB9XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHtcbiAgICAgICAgIGxvYWRpbmc6IHRoaXMubG9hZGluZyxcbiAgICAgICAgIHBlcmNlbnRMb2FkZWQ6IHRoaXMucGVyY2VudExvYWRlZCxcbiAgICAgICAgIHNob3VsZExvYWQ6IHRoaXMuc2hvdWxkTG9hZCxcbiAgICAgICAgIGZpcnN0TG9hZDogdGhpcy5maXJzdExvYWQsXG4gICAgICAgICBjYW5Mb2FkOiB0aGlzLmNhbkxvYWRcbiAgICAgIH19O1xuICAgfVxuXG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cyc7XG4gICB9XG59XG5cbmNsYXNzIFJlY3JlYXRpb257XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgdGhpcy5hbGwgPSBuZXcgUmVjQXJlYUNvbGxlY3Rpb24oJ2FsbCcpO1xuICAgICAgdGhpcy5maWx0ZXJlZCA9IG5ldyBSZWNBcmVhQ29sbGVjdGlvbignZmlsdGVyZWQnKTtcbiAgICAgIHRoaXMuYm9va21hcmtlZCA9IG5ldyBSZWNBcmVhQ29sbGVjdGlvbignYm9va21hcmtlZCcpO1xuICAgICAgLy90aGlzLmluUm91dGUgPSBuZXcgUmVjQXJlYUNvbGxlY3Rpb24oJ2luUm91dGUnKTtcblxuICAgICAgLy9zZWFyY2hSYWRpdXMgaW4gbWV0ZXJzXG4gICAgICB0aGlzLnNlYXJjaFJhZGl1cyA9IDgwNDY3LjI7XG5cbiAgICAgIHRoaXMuYXBpQ2FsbCA9IHJlY0FwaVF1ZXJ5O1xuXG4gICAgICB0aGlzLnN0YXR1cyA9IG5ldyBSZWNTdGF0dXM7XG4gICAgICB0aGlzLnNlYXJjaCA9IHRoaXMuc2VhcmNoLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLmZpbHRlckFsbCA9IHRoaXMuZmlsdGVyQWxsLmJpbmQodGhpcyk7XG4gICB9XG4gICBhZGRSZWNBcmVhcyhyZWNkYXRhKXtcbiAgICAgIHZhciBkYXRhID0gcmVjZGF0YS5yZWR1Y2UoZnVuY3Rpb24oYXJyLCBhcmVhKXtcbiAgICAgICAgIGxldCB0ZW1wID0gW107XG4gICAgICAgICBpZiggIXRoaXMuYWxsLmlkTWFwW2FyZWEuUmVjQXJlYUlEXSApe1xuICAgICAgICAgICAgdGVtcC5wdXNoKG5ldyBSZWNBcmVhKGFyZWEpKTtcbiAgICAgICAgIH1cbiAgICAgICAgIHJldHVybiBhcnIuY29uY2F0KHRlbXApO1xuICAgICAgfS5iaW5kKHRoaXMpLCBbXSk7XG4gICAgICB0aGlzLmFsbC5hZGREYXRhKGRhdGEpO1xuICAgfVxuXG4gICBhZGRCb29rbWFyayhhcmVhKXtcbiAgICAgIGlmKCF0aGlzLmJvb2ttYXJrZWQuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgYXJlYS5zZXRCb29rbWFya2VkKHRydWUpO1xuICAgICAgICAgdGhpcy5ib29rbWFya2VkLmFkZERhdGEoYXJlYSk7XG4gICAgICB9XG4gICB9XG4gICByZW1vdmVCb29rbWFyayhhcmVhKXtcbiAgICAgIGlmKHRoaXMuYm9va21hcmtlZC5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICBhcmVhLnNldEJvb2ttYXJrZWQoZmFsc2UpO1xuICAgICAgICAgdGhpcy5ib29rbWFya2VkLnJlbW92ZShhcmVhKTtcbiAgICAgIH1cbiAgIH1cbiAgIGFkZFRvUm91dGUoYXJlYSl7XG4gICAgICBpZighYXJlYS5pblJvdXRlKXtcbiAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZSh0cnVlKTtcbiAgICAgICAgIHN0YXRlLnJvdXRlLmFkZFJlY0FyZWEoYXJlYSk7XG4gICAgICB9XG4gICAgICAvL2Vsc2UgY291bGQgc2hvdyB0b2FzdCBzYXlpbmcgaXQncyBhbHJlYWR5IGluIHJvdXRlIFxuICAgfVxuICAgcmVtb3ZlRnJvbVJvdXRlKGFyZWEpe1xuICAgICAgaWYoYXJlYS5pblJvdXRlKXtcbiAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZShmYWxzZSk7XG4gICAgICAgICBzdGF0ZS5yb3V0ZS5yZW1vdmVSZWNBcmVhKGFyZWEpO1xuICAgICAgfVxuICAgfVxuXG4gICAvL3NlbmRzIGFwaSByZXF1ZXN0KHMpIFxuICAgc2VhcmNoKCl7XG4gICAgICB2YXIgcmVxdWVzdENvdW50ID0gMDtcbiAgICAgIGlmKHRoaXMuc3RhdHVzLnNob3VsZFJlc2V0TG9hZGVkQWN0aXZpdGllcyl7XG4gICAgICAgICB0aGlzLnN0YXR1cy5sb2FkZWRBY3Rpdml0aWVzID0ge307XG4gICAgICAgICB0aGlzLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZEFjdGl2aXRpZXMgPSBmYWxzZTtcbiAgICAgICAgIC8vY2xlYXIgdGhpcy5hbGw/Pz9cbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuc3RhdHVzLnNob3VsZFJlc2V0TG9hZGVkQ29vcmRzKXtcbiAgICAgICAgIHRoaXMuc3RhdHVzLnNob3VsZFJlc2V0TG9hZGVkQ29vcmRzID0gZmFsc2U7XG4gICAgICAgICAvL2NsZWFyIHRoaXMuYWxsPz8/XG4gICAgICB9XG4gICAgICB0aGlzLnN0YXR1cy5sb2FkZWRTZWFyY2hDb29yZHMgPSBzdGF0ZS5tYXAuZGlyZWN0aW9ucy5zZWFyY2hDb29yZHM7XG5cbiAgICAgIHZhciBsb2FkZWQgPSB0aGlzLnN0YXR1cy5sb2FkZWRBY3Rpdml0aWVzO1xuICAgICAgdmFyIGludGVyZXN0cyA9IHN0YXRlLmludGVyZXN0cy5zZWxlY3RlZC5yZWR1Y2UoKGlkU3RyaW5nLCBpbnRlcmVzdCkgPT4ge1xuICAgICAgICAgLy9pZiB3ZSd2ZSBhbHJlYWR5IGxvYWRlZCByZWNhcmVhcyB3aXRoIHRoaXMgYWN0aXZpdHksIGRvbid0IGFkZCB0byBhY3Rpdml0aWVzXG4gICAgICAgICBpZihsb2FkZWRbaW50ZXJlc3QuaWRdKXtcbiAgICAgICAgICAgIHJldHVybiBpZFN0cmluZztcbiAgICAgICAgIH1cbiAgICAgICAgIC8vb3RoZXJ3aXNlLCB3ZSB3aWxsIGxvYWQgaXQgYW5kIGtlZXAgdHJhY2tcbiAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICBsb2FkZWRbaW50ZXJlc3QuaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzLmZpbHRlcmVkQWN0aXZpdGllc1tpbnRlcmVzdC5pZF0gPSB0cnVlO1xuICAgICAgICAgfVxuXG4gICAgICAgICBpZiggaWRTdHJpbmcubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIGlkU3RyaW5nICsgJywnICsgaW50ZXJlc3QuaWQ7XG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaWRTdHJpbmcgKyBpbnRlcmVzdC5pZDtcbiAgICAgIH0sICcnKTtcblxuXG4gICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICB0aGlzLmFkZFJlY0FyZWFzKHJlc3BvbnNlLlJFQ0RBVEEpO1xuICAgICAgICAgcmVxdWVzdENvdW50IC09IDE7XG4gICAgICAgICBpZihyZXF1ZXN0Q291bnQgPT09IDAgKXtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzLnVwZGF0ZSh7bG9hZGluZzogZmFsc2V9KTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyQWxsKHRydWUpO1xuICAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAvL3RlbXBvcmFyeS4uLiBldmVudHVhbGx5IGNoYW5nZSB0byBhbG9uZyByb3V0ZVxuICAgICAgc3RhdGUubWFwLmRpcmVjdGlvbnMuc2VhcmNoQ29vcmRzLmZvckVhY2goKGwpID0+IHtcbiAgICAgICAgIHJlcXVlc3RDb3VudCArPSAxO1xuICAgICAgICAgdGhpcy5hcGlDYWxsKFxuICAgICAgICAgICAgbC5sYXQoKSxcbiAgICAgICAgICAgIGwubG5nKCksXG4gICAgICAgICAgICAxMDAsXG4gICAgICAgICAgICBpbnRlcmVzdHMsXG4gICAgICAgICAgICBjYWxsYmFja1xuICAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnN0YXR1cy51cGRhdGUoe3Nob3VsZExvYWQ6IGZhbHNlLCBsb2FkaW5nOiB0cnVlLCBmaXJzdExvYWQ6IGZhbHNlfSk7XG4gICB9XG5cbiAgIGZpbHRlckFsbChmaXRNYXApe1xuICAgICAgY29uc3QgbWFwQm91bmRzID0gbWFwLmdldEJvdW5kcygpO1xuICAgICAgbGV0IG1hcmtlckJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcbiAgICAgIG1hcmtlckJvdW5kcy5leHRlbmQobWFwQm91bmRzLmdldE5vcnRoRWFzdCgpKTtcbiAgICAgIG1hcmtlckJvdW5kcy5leHRlbmQobWFwQm91bmRzLmdldFNvdXRoV2VzdCgpKTtcbiAgICAgIHZhciBkYXRhO1xuICAgICAgaWYoIXN0YXRlLmludGVyZXN0cy5zZWxlY3RlZC5sZW5ndGgpe1xuICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgfVxuICAgICAgZWxzZSBpZighc3RhdGUucm91dGUubG9jYXRpb25Db3VudCl7XG4gICAgICAgICBkYXRhID0gW107XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgZGF0YSA9IHRoaXMuYWxsLlJFQ0RBVEE7XG4gICAgICB9XG4gICAgICBjb25zdCBmaWx0ZXJDb29yZHMgPSBzdGF0ZS5tYXAuZGlyZWN0aW9ucy5nZXRDb29yZHNCeVJhZGl1cyh0aGlzLnNlYXJjaFJhZGl1cyk7XG4gICAgICBkYXRhID0gZGF0YS5maWx0ZXIoKGFyZWEpID0+IHtcbiAgICAgICAgIHZhciBjb29yZCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoe1xuICAgICAgICAgICAgbGF0OiBhcmVhLlJlY0FyZWFMYXRpdHVkZSxcbiAgICAgICAgICAgIGxuZzogYXJlYS5SZWNBcmVhTG9uZ2l0dWRlXG4gICAgICAgICB9KTtcblxuICAgICAgICAgLy9pZiBpdCdzIG5vdCBhIG5ldyBsb2FkLCBmaWx0ZXIgYmFzZWQgb24gbWFwIHZpZXdwb3J0XG4gICAgICAgICBpZighZml0TWFwICYmICFtYXBCb3VuZHMuY29udGFpbnMoY29vcmQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICB9XG5cbiAgICAgICAgIC8vZmlsdGVyIGJhc2VkIG9uIHByb3hpbWl0eSB0byByb3V0ZVxuICAgICAgICAgdmFyIGlzQWxvbmdSb3V0ZSA9IGZhbHNlO1xuICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGZpbHRlckNvb3Jkcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBnb29nbGUubWFwcy5nZW9tZXRyeS5zcGhlcmljYWwuY29tcHV0ZURpc3RhbmNlQmV0d2VlbihcbiAgICAgICAgICAgICAgIGZpbHRlckNvb3Jkc1tpXSwgY29vcmQpO1xuICAgICAgICAgICAgaWYoIGRpc3RhbmNlIDwgdGhpcy5zZWFyY2hSYWRpdXMpe1xuICAgICAgICAgICAgICAgaXNBbG9uZ1JvdXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgICAgaWYoIWlzQWxvbmdSb3V0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgfVxuXG5cbiAgICAgICAgIC8vZmlsdGVyIGJhc2VkIG9uIHNlbGVjdGVkIGFjdGl2aXRpZXNcbiAgICAgICAgIHZhciBoYXNBY3Rpdml0eSA9IGZhbHNlO1xuICAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBhcmVhLmFjdGl2aXRpZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGFjdGl2aXR5ID0gYXJlYS5hY3Rpdml0aWVzW2ldO1xuICAgICAgICAgICAgaWYoc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuZmlsdGVyZWRBY3Rpdml0aWVzW2FjdGl2aXR5XSl7XG4gICAgICAgICAgICAgICBoYXNBY3Rpdml0eSA9IHRydWU7XG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgICAgIGlmKCFoYXNBY3Rpdml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgfVxuXG4gICAgICAgICBtYXJrZXJCb3VuZHMuZXh0ZW5kKGNvb3JkKTtcbiAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSlcblxuICAgICAgdGhpcy5maWx0ZXJlZC5zZXREYXRhKGRhdGEpO1xuXG4gICAgICAvL2lmIHRoZSBmaWx0ZXIgaXMgZHVlIHRvIG5ldyBsb2FkLCBhbmQgdGhlcmUgYXJlIHBvaW50cyxcbiAgICAgIC8vYW5kIHRoZSBib3VuZHMgdG8gY29udGFpbiB0aGVzZSBwb2ludHMgYXJlIGxhcmdlciB0aGFuIHRoZSBcbiAgICAgIC8vY3VycmVudCB2aWV3cG9ydCwgY2hhbmdlIHRoZSBtYXAgdmlld3BvcnQgdG8gc2hvdyBldmVyeXRoaW5nXG4gICAgICBpZihmaXRNYXAgJiYgZGF0YS5sZW5ndGgpe1xuICAgICAgICAgaWYoIG1hcmtlckJvdW5kcy5lcXVhbHMobWFwQm91bmRzKSApXG4gICAgICAgICAgICBtYXAuZml0Qm91bmRzKG1hcmtlckJvdW5kcywgMCk7XG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBtYXAuZml0Qm91bmRzKG1hcmtlckJvdW5kcyk7XG4gICAgICB9XG4gICB9XG5cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gJ3N0YXRlLnJlY3JlYXRpb24nO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuIE92ZXJhbGwgU3RhdGVcblxcKioqKioqKioqKioqKi9cbmNsYXNzIFN0YXRlIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgc3VwZXIoWydyZWFkeSddKTtcbiAgICAgIHRoaXMucmVjcmVhdGlvbiA9IG5ldyBSZWNyZWF0aW9uKCk7XG4gICAgICB0aGlzLnJvdXRlID0gbmV3IFJvdXRlKCk7XG4gICAgICB0aGlzLmludGVyZXN0cyA9IG5ldyBJbnRlcmVzdHMoaW50ZXJlc3RMaXN0KTtcbiAgICAgIHRoaXMubWFwID0gbmV3IE1hcCgpO1xuICAgfVxuICAgXG4gICAvL3JlZmFjdG9yIHRoaXMsIHVzZSBleHBvcnQgYW5kIGltcG9ydCBmcm9tIGEgc2VwYXJhdGUgZmlsZSAobm90IHJlY3JlYXRpb24uanMpXG4gICAvLyBzZXRJbnRlcmVzdHMobGlzdCl7XG4gICAvLyAgICB0aGlzLmludGVyZXN0cyA9IG5ldyBJbnRlcmVzdHMobGlzdCk7XG4gICAvLyB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZSc7XG4gICB9XG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIHJldHVybiB7dmFsOiBudWxsfTtcbiAgIH1cbn1cblxuY29uc3Qgc3RhdGUgPSBuZXcgU3RhdGU7XG5cblxuZXhwb3J0IGRlZmF1bHQgc3RhdGU7XG5cblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9zdGF0ZS9zdGF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuXG52YXIgc3R5bGVzSW5Eb20gPSB7fTtcblxudmFyXHRtZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG5cdHZhciBtZW1vO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHR5cGVvZiBtZW1vID09PSBcInVuZGVmaW5lZFwiKSBtZW1vID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRyZXR1cm4gbWVtbztcblx0fTtcbn07XG5cbnZhciBpc09sZElFID0gbWVtb2l6ZShmdW5jdGlvbiAoKSB7XG5cdC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG5cdC8vIEBzZWUgaHR0cDovL2Jyb3dzZXJoYWNrcy5jb20vI2hhY2stZTcxZDg2OTJmNjUzMzQxNzNmZWU3MTVjMjIyY2I4MDVcblx0Ly8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlclxuXHQvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcblx0Ly8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG5cdHJldHVybiB3aW5kb3cgJiYgZG9jdW1lbnQgJiYgZG9jdW1lbnQuYWxsICYmICF3aW5kb3cuYXRvYjtcbn0pO1xuXG52YXIgZ2V0RWxlbWVudCA9IChmdW5jdGlvbiAoZm4pIHtcblx0dmFyIG1lbW8gPSB7fTtcblxuXHRyZXR1cm4gZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0XHRpZiAodHlwZW9mIG1lbW9bc2VsZWN0b3JdID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRtZW1vW3NlbGVjdG9yXSA9IGZuLmNhbGwodGhpcywgc2VsZWN0b3IpO1xuXHRcdH1cblxuXHRcdHJldHVybiBtZW1vW3NlbGVjdG9yXVxuXHR9O1xufSkoZnVuY3Rpb24gKHRhcmdldCkge1xuXHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpXG59KTtcblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXJcdHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xudmFyXHRzdHlsZXNJbnNlcnRlZEF0VG9wID0gW107XG5cbnZhclx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL3VybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZiAodHlwZW9mIERFQlVHICE9PSBcInVuZGVmaW5lZFwiICYmIERFQlVHKSB7XG5cdFx0aWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuXHR9XG5cblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0b3B0aW9ucy5hdHRycyA9IHR5cGVvZiBvcHRpb25zLmF0dHJzID09PSBcIm9iamVjdFwiID8gb3B0aW9ucy5hdHRycyA6IHt9O1xuXG5cdC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuXHQvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cdGlmICghb3B0aW9ucy5zaW5nbGV0b24pIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIDxoZWFkPiBlbGVtZW50XG5cdGlmICghb3B0aW9ucy5pbnNlcnRJbnRvKSBvcHRpb25zLmluc2VydEludG8gPSBcImhlYWRcIjtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSBib3R0b20gb2YgdGhlIHRhcmdldFxuXHRpZiAoIW9wdGlvbnMuaW5zZXJ0QXQpIG9wdGlvbnMuaW5zZXJ0QXQgPSBcImJvdHRvbVwiO1xuXG5cdHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucyk7XG5cblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlIChuZXdMaXN0KSB7XG5cdFx0dmFyIG1heVJlbW92ZSA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QsIG9wdGlvbnMpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXG5cdFx0XHRpZihkb21TdHlsZS5yZWZzID09PSAwKSB7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuXG5mdW5jdGlvbiBhZGRTdHlsZXNUb0RvbSAoc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oaXRlbS5wYXJ0c1tqXSk7XG5cdFx0XHR9XG5cblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0VG9TdHlsZXMgKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXG5cdFx0aWYoIW5ld1N0eWxlc1tpZF0pIHN0eWxlcy5wdXNoKG5ld1N0eWxlc1tpZF0gPSB7aWQ6IGlkLCBwYXJ0czogW3BhcnRdfSk7XG5cdFx0ZWxzZSBuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQgKG9wdGlvbnMsIHN0eWxlKSB7XG5cdHZhciB0YXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblxuXHRpZiAoIXRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cblx0dmFyIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wID0gc3R5bGVzSW5zZXJ0ZWRBdFRvcFtzdHlsZXNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XG5cdFx0aWYgKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xuXHRcdH0gZWxzZSBpZiAobGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0XHR9XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5wdXNoKHN0eWxlKTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0Jy4gTXVzdCBiZSAndG9wJyBvciAnYm90dG9tJy5cIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50IChzdHlsZSkge1xuXHRpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuXHRzdHlsZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlKTtcblxuXHR2YXIgaWR4ID0gc3R5bGVzSW5zZXJ0ZWRBdFRvcC5pbmRleE9mKHN0eWxlKTtcblx0aWYoaWR4ID49IDApIHtcblx0XHRzdHlsZXNJbnNlcnRlZEF0VG9wLnNwbGljZShpZHgsIDEpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudCAob3B0aW9ucykge1xuXHR2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXG5cdGFkZEF0dHJzKHN0eWxlLCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlKTtcblxuXHRyZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmtFbGVtZW50IChvcHRpb25zKSB7XG5cdHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG5cblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXHRvcHRpb25zLmF0dHJzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXG5cdGFkZEF0dHJzKGxpbmssIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgbGluayk7XG5cblx0cmV0dXJuIGxpbms7XG59XG5cbmZ1bmN0aW9uIGFkZEF0dHJzIChlbCwgYXR0cnMpIHtcblx0T2JqZWN0LmtleXMoYXR0cnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGUgKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGUsIHVwZGF0ZSwgcmVtb3ZlLCByZXN1bHQ7XG5cblx0Ly8gSWYgYSB0cmFuc2Zvcm0gZnVuY3Rpb24gd2FzIGRlZmluZWQsIHJ1biBpdCBvbiB0aGUgY3NzXG5cdGlmIChvcHRpb25zLnRyYW5zZm9ybSAmJiBvYmouY3NzKSB7XG5cdCAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybShvYmouY3NzKTtcblxuXHQgICAgaWYgKHJlc3VsdCkge1xuXHQgICAgXHQvLyBJZiB0cmFuc2Zvcm0gcmV0dXJucyBhIHZhbHVlLCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIHJ1bm5pbmcgcnVudGltZSB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIGNzcy5cblx0ICAgIFx0b2JqLmNzcyA9IHJlc3VsdDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIElmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5IHZhbHVlLCBkb24ndCBhZGQgdGhpcyBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIGNvbmRpdGlvbmFsIGxvYWRpbmcgb2YgY3NzXG5cdCAgICBcdHJldHVybiBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHQvLyBub29wXG5cdCAgICBcdH07XG5cdCAgICB9XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcblx0XHR2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcblxuXHRcdHN0eWxlID0gc2luZ2xldG9uIHx8IChzaW5nbGV0b24gPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuXG5cdFx0dXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG5cdFx0cmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcblxuXHR9IGVsc2UgaWYgKFxuXHRcdG9iai5zb3VyY2VNYXAgJiZcblx0XHR0eXBlb2YgVVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5yZXZva2VPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBCbG9iID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiXG5cdCkge1xuXHRcdHN0eWxlID0gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gdXBkYXRlTGluay5iaW5kKG51bGwsIHN0eWxlLCBvcHRpb25zKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuXG5cdFx0XHRpZihzdHlsZS5ocmVmKSBVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlLmhyZWYpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0c3R5bGUgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuXHRcdH07XG5cdH1cblxuXHR1cGRhdGUob2JqKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUgKG5ld09iaikge1xuXHRcdGlmIChuZXdPYmopIHtcblx0XHRcdGlmIChcblx0XHRcdFx0bmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJlxuXHRcdFx0XHRuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJlxuXHRcdFx0XHRuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR1cGRhdGUob2JqID0gbmV3T2JqKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVtb3ZlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG52YXIgcmVwbGFjZVRleHQgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgdGV4dFN0b3JlID0gW107XG5cblx0cmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcblx0XHR0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG5cblx0XHRyZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblx0fTtcbn0pKCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcgKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xuXG5cdGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuXHRcdHZhciBjaGlsZE5vZGVzID0gc3R5bGUuY2hpbGROb2RlcztcblxuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGUucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuXG5cdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRzdHlsZS5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZS5hcHBlbmRDaGlsZChjc3NOb2RlKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyAoc3R5bGUsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuXG5cdGlmKG1lZGlhKSB7XG5cdFx0c3R5bGUuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXG5cdH1cblxuXHRpZihzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuXHR9IGVsc2Uge1xuXHRcdHdoaWxlKHN0eWxlLmZpcnN0Q2hpbGQpIHtcblx0XHRcdHN0eWxlLnJlbW92ZUNoaWxkKHN0eWxlLmZpcnN0Q2hpbGQpO1xuXHRcdH1cblxuXHRcdHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmsgKGxpbmssIG9wdGlvbnMsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cblx0Lypcblx0XHRJZiBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgaXNuJ3QgZGVmaW5lZCwgYnV0IHNvdXJjZW1hcHMgYXJlIGVuYWJsZWRcblx0XHRhbmQgdGhlcmUgaXMgbm8gcHVibGljUGF0aCBkZWZpbmVkIHRoZW4gbGV0cyB0dXJuIGNvbnZlcnRUb0Fic29sdXRlVXJsc1xuXHRcdG9uIGJ5IGRlZmF1bHQuICBPdGhlcndpc2UgZGVmYXVsdCB0byB0aGUgY29udmVydFRvQWJzb2x1dGVVcmxzIG9wdGlvblxuXHRcdGRpcmVjdGx5XG5cdCovXG5cdHZhciBhdXRvRml4VXJscyA9IG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzID09PSB1bmRlZmluZWQgJiYgc291cmNlTWFwO1xuXG5cdGlmIChvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyB8fCBhdXRvRml4VXJscykge1xuXHRcdGNzcyA9IGZpeFVybHMoY3NzKTtcblx0fVxuXG5cdGlmIChzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rLmhyZWY7XG5cblx0bGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblxuXHRpZihvbGRTcmMpIFVSTC5yZXZva2VPYmplY3RVUkwob2xkU3JjKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNvbnN0IG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCB7XG4gIGNlbnRlcjoge2xhdDogMzkuNzY0MjU0OCwgbG5nOiAtMTA0Ljk5NTE5Mzd9LFxuICB6b29tOiA1XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgbWFwO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwY29uc3RhbnQuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcmVjcmVhdGlvbi5jc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcmVjcmVhdGlvbi5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcmVjcmVhdGlvbi5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBSZXRyaWV2ZSB0aGUgZGF0YSBmb3IgYSByZWNyZWF0aW9uIGFyZWEgXG4qICBEaXNwbGF5IHRoZSBkYXRhIHRvIGEgbW9kYWwgb24gdGhlIHdlYiBwYWdlICovXG5cbmltcG9ydCAnLi9yZWNyZWF0aW9uLmNzcyc7XG5pbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuXG52YXIgYm9va01hcmtJdGVtO1xudmFyIHVuc2V0Qm9va01hcms7XG52YXIgYWRkUmVjVG9Sb3V0ZTtcblxuLy8gZGlzcGxheSB0aGUgZGF0YSBpbiBhIG1vZGFsIGJveFxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlU2luZ2xlUmVjQXJlYShyZWNhcmVhKSB7XG4gICAgJCgnI21vZGFsMS1jb250ZW50JykuZW1wdHkoKTtcbiAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSB1c2luZyByZWNBcmVhSWRcblxuICAgIC8vIFRoZSByZWNyZWF0aW9uIEFyZWEgVGl0bGVcbiAgICB2YXIgcmVjTmFtZVRleHQgPSAkKFwiPGRpdiBpZD0ncmVjTmFtZU1vZGFsJz5cIikudGV4dChyZWNhcmVhLlJlY0FyZWFOYW1lKTtcblxuICAgIC8vVGhlIHB1Ymxpc2hlZCBwaG9uZSBudW1iZXIgb2YgdGhlIGFyZWFcbiAgICB2YXIgcmVjUGhvbmVUZXh0ID0gJChcIjxkaXYgaWQ9J3JlY1Bob25lTW9kYWwnPlwiKS50ZXh0KHJlY2FyZWEuUmVjQXJlYVBob25lKTtcblxuICAgIHZhciByZWNBcmVhRW1haWwgPSAkKFwiPGRpdiBpZD0ncmVjRW1haWxNb2RhbCc+XCIpLnRleHQocmVjYXJlYS5SZWNBcmVhRW1haWwpO1xuXG4gICAgLy8gQ2hlY2sgYW5kIHNlZSBpZiB0aGUgbGluayBhcnJheSBpcyBlbXB0eSBvciBub3QgXG4gICAgaWYgKHJlY2FyZWEuTElOS1swXSAhPSBudWxsKSB7XG4gICAgICAgIHZhciByZWNBcmVhTGlua1RpdGxlID0gcmVjYXJlYS5MSU5LWzBdLlRpdGxlO1xuICAgICAgICB2YXIgcmVjQXJlYVVybCA9IHJlY2FyZWEuTElOS1swXS5VUkw7XG4gICAgICAgIHZhciByZWNBcmVhTGluayA9ICQoXCI8YSAvPlwiLCB7XG4gICAgICAgICAgICBocmVmOiByZWNBcmVhVXJsLFxuICAgICAgICAgICAgdGV4dDogcmVjQXJlYUxpbmtUaXRsZSxcbiAgICAgICAgICAgIHRhcmdldDogXCJfYmxhbmtcIixcbiAgICAgICAgICAgIGlkOiBcInJlY1VybE1vZGFsXCJ9KTtcbiAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHRlbGVwaG9uZUNoZWNrKHN0clBob25lKXtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhhdCB0aGUgdmFsdWUgd2UgZ2V0IGlzIGEgcGhvbmUgbnVtYmVyXG4gICAgICAgICAgICAgICAgdmFyIGlzUGhvbmUgPSBuZXcgUmVnRXhwKC9eXFwrPzE/XFxzKj9cXCg/XFxkezN9fFxcd3szfSg/OlxcKXxbLXxcXHNdKT9cXHMqP1xcZHszfXxcXHd7M31bLXxcXHNdP1xcZHs0fXxcXHd7NH0kLyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzUGhvbmUudGVzdChzdHJQaG9uZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAvLyBBcHBlbmQgdGhlIGRldGFpbHMgb2YgdGhlIHJlY2FyZWEgdG8gdGhlIG1vZGFsXG4gICAgLy8gQ2hlY2tzIHdoZXRoZXIgYSBwaG9uZSBudW1iZXIgbWF0Y2hlcyBhIHBhdHRlcm4gYmVmb3JlIGFwcGVuZGluZyB0byB0aGUgbW9kYWxcbiAgICBpZiAodGVsZXBob25lQ2hlY2socmVjYXJlYS5SZWNBcmVhUGhvbmUpID09IHRydWUpeyAgICBcbiAgICAgICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKHJlY05hbWVUZXh0LHJlY1Bob25lVGV4dCxyZWNBcmVhRW1haWwscmVjQXJlYUxpbmspO1xuICAgIH0gZWxzZVxuICAgICAgICAkKCcjbW9kYWwxLWNvbnRlbnQnKS5hcHBlbmQocmVjTmFtZVRleHQscmVjQXJlYUVtYWlsLHJlY0FyZWFMaW5rKTtcblxuICAgIC8vIFJlY0FyZWFEZXNjcmlwdGlvblxuXG4gICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKGA8c3Ryb25nPjxkaXYgaWQ9J2Rlc2NNb2RhbCc+RGVzY3JpcHRpb246PC9zdHJvbmc+ICR7cmVjYXJlYS5SZWNBcmVhRGVzY3JpcHRpb259YCk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIEFjdGl2aXRpZXMgdG8gdGhlIG1vZGFsXG4gICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKFwiPHN0cm9uZz48ZGl2IGlkPSdhY3Rpdml0eU1vZGFsSGVhZCcgY2xhc3M9J2NvbGxlY3Rpb24taGVhZGVyJz5BY3Rpdml0aWVzPC9kaXY+XCIpO1xuICAgIHJlY2FyZWEuQUNUSVZJVFkuZm9yRWFjaChmdW5jdGlvbihhY3Rpdml0eSl7XG4gICAgICAgICQoJyNtb2RhbDEtY29udGVudCcpLmFwcGVuZChcIjx1bD5cIik7XG4gICAgICAgICQoJyNtb2RhbDEtY29udGVudCcpLmFwcGVuZChcIjxsaSBpZD0nYWN0aXZpdHlUeXBlTW9kYWwnPlwiICsgYWN0aXZpdHkuQWN0aXZpdHlOYW1lKTtcbiAgICB9KVxuXG4gICAgLy8gUkVDQVJFQUFERFJFU1NcbiAgICByZWNhcmVhLlJFQ0FSRUFBRERSRVNTLmZvckVhY2goZnVuY3Rpb24oYWRkcmVzcyl7XG4gICAgICAgICQoJyNtb2RhbDEtY29udGVudCcpLmFwcGVuZChcIjxzdHJvbmc+PGRpdiBpZD0nYWRkcmVzc0hlYWRNb2RhbCc+QWRkcmVzc1wiKTtcbiAgICAgICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nYWRkcmVzc01vZGFsJz5cIiArIGFkZHJlc3MuUmVjQXJlYVN0cmVldEFkZHJlc3MxKTtcbiAgICAgICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nYWRkcmVzc01vZGFsJz5cIiArIGFkZHJlc3MuUmVjQXJlYVN0cmVldEFkZHJlc3MyKTtcbiAgICAgICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKGA8ZGl2IGNsYXNzPSdhZGRyZXNzTW9kYWwnPiAke2FkZHJlc3MuQ2l0eX0sICR7YWRkcmVzcy5BZGRyZXNzU3RhdGVDb2RlfSAke2FkZHJlc3MuUG9zdGFsQ29kZX1gKTtcbiAgICB9KVxuXG5cbiAgICAvLyBTZXQvVW5zZXQgdGhlIGJvb2ttYXJrIGl0ZW1cbiAgICBib29rTWFya0l0ZW0gPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAocmVjYXJlYS5ib29rbWFya2VkID09PSBmYWxzZSkge1xuICAgICAgICAgIHN0YXRlLnJlY3JlYXRpb24uYWRkQm9va21hcmsocmVjYXJlYSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcjYm9vay1tYXJrLWJ0bicpLnRleHQoXCJVbmJvb2ttYXJrXCIpOyAgICAgICAgICAgXG4gICAgICAgICAgICBzdGF0ZS5yZWNyZWF0aW9uLnJlbW92ZUJvb2ttYXJrKHJlY2FyZWEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgICAgIGlmIChyZWNhcmVhLmJvb2ttYXJrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAkKFwiI2Jvb2stbWFyay1idG5cIikudGV4dChcIkJvb2ttYXJrXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2Jvb2stbWFyay1idG4nKS50ZXh0KFwiVW5ib29rbWFya1wiKTsgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAvLyBOZWVkIHRvIGFkZCBhIGJ1dHRvbiB0aGF0IGFkZHMgdGhlIHJlY2FyZWEgdG8gcm91dGVcblxuICAgIGFkZFJlY1RvUm91dGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYocmVjYXJlYS5pblJvdXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgc3RhdGUucmVjcmVhdGlvbi5hZGRUb1JvdXRlKHJlY2FyZWEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2FkZFRvUm91dGVCdG4nKS50ZXh0KFwiUmVtb3ZlIGZyb20gUm91dGVcIik7XG4gICAgICAgICAgICBzdGF0ZS5yZWNyZWF0aW9uLnJlbW92ZUZyb21Sb3V0ZShyZWNhcmVhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICAgICBpZiAocmVjYXJlYS5pblJvdXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgJCgnI2FkZFRvUm91dGVCdG4nKS50ZXh0KFwiQWRkIHRvIFJvdXRlXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2FkZFRvUm91dGVCdG4nKS50ZXh0KFwiUmVtb3ZlIGZyb20gUm91dGVcIik7XG4gICAgICAgIH1cblxuICAgIC8vIExhc3Qgc3RlcCBpcyB0byBvcGVuIHRoZSBtb2RhbCBhZnRlciBldmVyeXRoaW5nIGlzIGFwcGVuZGVkXG4gICAgICAgICQoJyNtb2RhbDEnKS5tb2RhbCgnb3BlbicpO1xuXG59XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuICAgICQoJyNtb2RhbDEnKS5tb2RhbCh7XG4gICAgICAgIGluRHVyYXRpb246IDMwMCxcbiAgICAgICAgc3RhcnRpbmdUb3A6ICc0MCUnLCAvLyBTdGFydGluZyB0b3Agc3R5bGUgYXR0cmlidXRlXG4gICAgICAgIGVuZGluZ1RvcDogJzEwJSdcbiAgICB9KTtcblxuICAgICQoJyNib29rLW1hcmstYnRuJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgIGJvb2tNYXJrSXRlbSgpO1xuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGJ1dHRvbiB0byBhZGQgYSByb3V0ZSB0byB0aGUgbW9kYWwgZm9vdGVyXG5cbiAgICAgICAgdmFyIGFkZFRvUm91dGVCdXR0b24gPSAkKFwiPGEgLz5cIiwge1xuICAgICAgICAgICAgaHJlZjogXCIjIVwiLFxuICAgICAgICAgICAgdGV4dDogXCJBZGQgdG8gUm91dGVcIixcbiAgICAgICAgICAgIGNsYXNzOiBcIm1vZGFsLWFjdGlvbiBtb2RhbC1jbG9zZSB3YXZlcy1lZmZlY3QgYnRuIGJ0bi1mbGF0IHJpZ2h0XCIsXG4gICAgICAgICAgICBzdHlsZTogXCJtYXJnaW46IDZweFwiLFxuICAgICAgICAgICAgaWQ6IFwiYWRkVG9Sb3V0ZUJ0blwifSk7XG5cbiAgICAgICAgJCgnI3JlYy1hcmVhLWRldGFpbC1tb2RhbC1mb290ZXInKS5hcHBlbmQoYWRkVG9Sb3V0ZUJ1dHRvbik7XG5cbiAgICAkKCcjYWRkVG9Sb3V0ZUJ0bicpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgIGFkZFJlY1RvUm91dGUoKTtcbiAgICB9KVxuIFxuIH0pO1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjQXJlYURldGFpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0IHZhciBpbnRlcmVzdExpc3QgPSBbXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiQklLSU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiA1LFxuICAgICBcIkVtb2ppXCI6IFwi8J+atFwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJDTElNQklOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogNyxcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiQ0FNUElOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogOSxcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgICB9LFxuICAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJISUtJTkdcIixcbiAgICAgIFwiQWN0aXZpdHlJRFwiOiAxNCxcbiAgICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9LFxuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIlBJQ05JQ0tJTkdcIixcbiAgICAgIFwiQWN0aXZpdHlJRFwiOiAyMCxcbiAgICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICAgfSxcbiAgICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiUkVDUkVBVElPTkFMIFZFSElDTEVTXCIsXG4gICAgICBcIkFjdGl2aXR5SURcIjogMjMsXG4gICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgIH0sXG4gICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIlZJU0lUT1IgQ0VOVEVSXCIsXG4gICAgICBcIkFjdGl2aXR5SURcIjogMjQsXG4gICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJXQVRFUiBTUE9SVFNcIixcbiAgICAgXCJBY3Rpdml0eUlEXCI6IDI1LFxuICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJXSUxETElGRSBWSUVXSU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiAyNixcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiSE9SU0VCQUNLIFJJRElOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogMTUsXG4gICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9XG5cbl1cblxuXG5leHBvcnQgZnVuY3Rpb24gcmVjQXBpUXVlcnkobGF0aXR1ZGVWYWwsbG9uZ2l0dWRlVmFsLHJhZGl1c1ZhbCxhY3Rpdml0eVZhbCxjYWxsYmFjaykge1xuXG4gICAgdmFyIHJlY1F1ZXJ5VVJMID0gXCJodHRwczovL3JpZGIucmVjcmVhdGlvbi5nb3YvYXBpL3YxL3JlY2FyZWFzLmpzb24/YXBpa2V5PTJDMUIyQUM2OUUxOTQ1REU4MTVCNjlCQkNDOUM3QjE5JmZ1bGwmbGF0aXR1ZGU9XCJcbiAgICArIGxhdGl0dWRlVmFsICsgXCImbG9uZ2l0dWRlPVwiICsgbG9uZ2l0dWRlVmFsICsgXCImcmFkaXVzPVwiICsgcmFkaXVzVmFsICsgXCImYWN0aXZpdHk9XCIgKyBhY3Rpdml0eVZhbDtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiByZWNRdWVyeVVSTCxcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIlxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShjYWxsYmFjayk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNBcGlCeUlkKGlkLCBjYWxsYmFjaykge1xuXG4gICAgdmFyIHJlY1F1ZXJ5VVJMID0gXCJodHRwczovL3JpZGIucmVjcmVhdGlvbi5nb3YvYXBpL3YxL3JlY2FyZWFzL1wiICsgaWQgKyBcIi5qc29uP2FwaWtleT0yQzFCMkFDNjlFMTk0NURFODE1QjY5QkJDQzlDN0IxOSZmdWxsXCJcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiByZWNRdWVyeVVSTCxcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIlxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShjYWxsYmFjayk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vY29uc3RhbnRzLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbic7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9yZWNyZWF0aW9uL2xvYWRCdXR0b24nO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cyc7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0JztcbmltcG9ydCAnLi9jb21wb25lbnRzL21hcC9tYXAnO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvcm91dGUvcm91dGUnO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvbG9jYWxzdG9yYWdlL2xvY2Fsc3RvcmFnZSc7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9maW5hbGUvZmluYWxlJztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2FwcC5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJy4vcmVjcmVhdGlvbi5jc3MnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcbmltcG9ydCAnLi9kaXNwbGF5UmVjQXJlYVN1Z2dlc3Rpb25zJztcbmltcG9ydCAnLi9yZWNBcmVhRGV0YWlscyc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbi5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIucmVjcmVhdGlvbntcXG4gICBiYWNrZ3JvdW5kOiByZWQ7XFxufVxcblxcbi5zdWdnZXN0aW9uU3VtbWFyeSB7XFxuICAgIGZvbnQtc2l6ZTogMWVtO1xcbiAgICBtYXJnaW4tdG9wOiA1JTtcXG59XFxuXFxuLnN1Z2dlc3Rpb25TdW1tYXJ5OmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsIDAsIDAsIDAuMSk7XFxuXFxufVxcblxcbiNyZWNOYW1lTW9kYWwge1xcbiAgICBmb250LXNpemU6IDI1cHg7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuI2FjdGl2aXR5VHlwZU1vZGFsIHtcXG4gICAgbWFyZ2luLWxlZnQ6IDUlO1xcbiAgICBsaW5lLWhlaWdodDogNSU7XFxufVxcblxcbiNhY3Rpdml0eU1vZGFsSGVhZCwgI2Rlc2NNb2RhbCwgI2FkZHJlc3NIZWFkTW9kYWwge1xcbiAgICBtYXJnaW4tbGVmdDogNSU7XFxuICAgIG1hcmdpbi10b3A6IDIlOyAgICBcXG59XFxuXFxuI3JlY1Bob25lTW9kYWwsICNyZWNFbWFpbE1vZGFsLCAjcmVjVXJsTW9kYWwge1xcbiAgICBtYXJnaW4tbGVmdDogNSU7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLmFkZHJlc3NNb2RhbCB7XFxuICAgIG1hcmdpbi1sZWZ0OiA1JTtcXG5cXG59XFxuXFxuI25vbmVGb3VuZCB7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgZm9udC1zaXplOiAxZW07XFxuICAgIG1hcmdpbi10b3A6IDUlO1xcbn1cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8qKlxuICogV2hlbiBzb3VyY2UgbWFwcyBhcmUgZW5hYmxlZCwgYHN0eWxlLWxvYWRlcmAgdXNlcyBhIGxpbmsgZWxlbWVudCB3aXRoIGEgZGF0YS11cmkgdG9cbiAqIGVtYmVkIHRoZSBjc3Mgb24gdGhlIHBhZ2UuIFRoaXMgYnJlYWtzIGFsbCByZWxhdGl2ZSB1cmxzIGJlY2F1c2Ugbm93IHRoZXkgYXJlIHJlbGF0aXZlIHRvIGFcbiAqIGJ1bmRsZSBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IHBhZ2UuXG4gKlxuICogT25lIHNvbHV0aW9uIGlzIHRvIG9ubHkgdXNlIGZ1bGwgdXJscywgYnV0IHRoYXQgbWF5IGJlIGltcG9zc2libGUuXG4gKlxuICogSW5zdGVhZCwgdGhpcyBmdW5jdGlvbiBcImZpeGVzXCIgdGhlIHJlbGF0aXZlIHVybHMgdG8gYmUgYWJzb2x1dGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHBhZ2UgbG9jYXRpb24uXG4gKlxuICogQSBydWRpbWVudGFyeSB0ZXN0IHN1aXRlIGlzIGxvY2F0ZWQgYXQgYHRlc3QvZml4VXJscy5qc2AgYW5kIGNhbiBiZSBydW4gdmlhIHRoZSBgbnBtIHRlc3RgIGNvbW1hbmQuXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcykge1xuICAvLyBnZXQgY3VycmVudCBsb2NhdGlvblxuICB2YXIgbG9jYXRpb24gPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5sb2NhdGlvbjtcblxuICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZml4VXJscyByZXF1aXJlcyB3aW5kb3cubG9jYXRpb25cIik7XG4gIH1cblxuXHQvLyBibGFuayBvciBudWxsP1xuXHRpZiAoIWNzcyB8fCB0eXBlb2YgY3NzICE9PSBcInN0cmluZ1wiKSB7XG5cdCAgcmV0dXJuIGNzcztcbiAgfVxuXG4gIHZhciBiYXNlVXJsID0gbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0O1xuICB2YXIgY3VycmVudERpciA9IGJhc2VVcmwgKyBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qJC8sIFwiL1wiKTtcblxuXHQvLyBjb252ZXJ0IGVhY2ggdXJsKC4uLilcblx0Lypcblx0VGhpcyByZWd1bGFyIGV4cHJlc3Npb24gaXMganVzdCBhIHdheSB0byByZWN1cnNpdmVseSBtYXRjaCBicmFja2V0cyB3aXRoaW5cblx0YSBzdHJpbmcuXG5cblx0IC91cmxcXHMqXFwoICA9IE1hdGNoIG9uIHRoZSB3b3JkIFwidXJsXCIgd2l0aCBhbnkgd2hpdGVzcGFjZSBhZnRlciBpdCBhbmQgdGhlbiBhIHBhcmVuc1xuXHQgICAoICA9IFN0YXJ0IGEgY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgKD86ICA9IFN0YXJ0IGEgbm9uLWNhcHR1cmluZyBncm91cFxuXHQgICAgICAgICBbXikoXSAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKD86ICA9IFN0YXJ0IGFub3RoZXIgbm9uLWNhcHR1cmluZyBncm91cHNcblx0ICAgICAgICAgICAgICAgICBbXikoXSsgID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgICAgIFteKShdKiAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICBcXCkgID0gTWF0Y2ggYSBlbmQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICkgID0gRW5kIEdyb3VwXG4gICAgICAgICAgICAgICpcXCkgPSBNYXRjaCBhbnl0aGluZyBhbmQgdGhlbiBhIGNsb3NlIHBhcmVuc1xuICAgICAgICAgICkgID0gQ2xvc2Ugbm9uLWNhcHR1cmluZyBncm91cFxuICAgICAgICAgICogID0gTWF0Y2ggYW55dGhpbmdcbiAgICAgICApICA9IENsb3NlIGNhcHR1cmluZyBncm91cFxuXHQgXFwpICA9IE1hdGNoIGEgY2xvc2UgcGFyZW5zXG5cblx0IC9naSAgPSBHZXQgYWxsIG1hdGNoZXMsIG5vdCB0aGUgZmlyc3QuICBCZSBjYXNlIGluc2Vuc2l0aXZlLlxuXHQgKi9cblx0dmFyIGZpeGVkQ3NzID0gY3NzLnJlcGxhY2UoL3VybFxccypcXCgoKD86W14pKF18XFwoKD86W14pKF0rfFxcKFteKShdKlxcKSkqXFwpKSopXFwpL2dpLCBmdW5jdGlvbihmdWxsTWF0Y2gsIG9yaWdVcmwpIHtcblx0XHQvLyBzdHJpcCBxdW90ZXMgKGlmIHRoZXkgZXhpc3QpXG5cdFx0dmFyIHVucXVvdGVkT3JpZ1VybCA9IG9yaWdVcmxcblx0XHRcdC50cmltKClcblx0XHRcdC5yZXBsYWNlKC9eXCIoLiopXCIkLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pXG5cdFx0XHQucmVwbGFjZSgvXicoLiopJyQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSk7XG5cblx0XHQvLyBhbHJlYWR5IGEgZnVsbCB1cmw/IG5vIGNoYW5nZVxuXHRcdGlmICgvXigjfGRhdGE6fGh0dHA6XFwvXFwvfGh0dHBzOlxcL1xcL3xmaWxlOlxcL1xcL1xcLykvaS50ZXN0KHVucXVvdGVkT3JpZ1VybCkpIHtcblx0XHQgIHJldHVybiBmdWxsTWF0Y2g7XG5cdFx0fVxuXG5cdFx0Ly8gY29udmVydCB0aGUgdXJsIHRvIGEgZnVsbCB1cmxcblx0XHR2YXIgbmV3VXJsO1xuXG5cdFx0aWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiLy9cIikgPT09IDApIHtcblx0XHQgIFx0Ly9UT0RPOiBzaG91bGQgd2UgYWRkIHByb3RvY29sP1xuXHRcdFx0bmV3VXJsID0gdW5xdW90ZWRPcmlnVXJsO1xuXHRcdH0gZWxzZSBpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byB0aGUgYmFzZSB1cmxcblx0XHRcdG5ld1VybCA9IGJhc2VVcmwgKyB1bnF1b3RlZE9yaWdVcmw7IC8vIGFscmVhZHkgc3RhcnRzIHdpdGggJy8nXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG5cdFx0XHRuZXdVcmwgPSBjdXJyZW50RGlyICsgdW5xdW90ZWRPcmlnVXJsLnJlcGxhY2UoL15cXC5cXC8vLCBcIlwiKTsgLy8gU3RyaXAgbGVhZGluZyAnLi8nXG5cdFx0fVxuXG5cdFx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCB1cmwoLi4uKVxuXHRcdHJldHVybiBcInVybChcIiArIEpTT04uc3RyaW5naWZ5KG5ld1VybCkgKyBcIilcIjtcblx0fSk7XG5cblx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCBjc3Ncblx0cmV0dXJuIGZpeGVkQ3NzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvdXJscy5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHNlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlzdGFuY2VNYXRyaXhTZXJ2aWNlKCk7XG5leHBvcnQgZGVmYXVsdCBzZXJ2aWNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9tYXAvZGlzdGFuY2UuanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5UmVjQXJlYVN1bW1hcnkocmVjZGF0YSwgZmlsdGVyZWRUeXBlKSB7XG4gICAgICAgICQoZmlsdGVyZWRUeXBlKS5lbXB0eSgpO1xuXG4gICAgICAgZnVuY3Rpb24gdGVsZXBob25lQ2hlY2soc3RyUGhvbmUpe1xuICAgICAgICAgICAgLy8gQ2hlY2sgdGhhdCB0aGUgdmFsdWUgd2UgZ2V0IGlzIGEgcGhvbmUgbnVtYmVyXG4gICAgICAgICAgICB2YXIgaXNQaG9uZSA9IG5ldyBSZWdFeHAoL15cXCs/MT9cXHMqP1xcKD9cXGR7M318XFx3ezN9KD86XFwpfFstfFxcc10pP1xccyo/XFxkezN9fFxcd3szfVstfFxcc10/XFxkezR9fFxcd3s0fSQvKTtcbiAgICAgICAgICAgIHJldHVybiBpc1Bob25lLnRlc3Qoc3RyUGhvbmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPHJlY2RhdGEudmFsLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciByZWNWYWxBbGlhcyA9IHJlY2RhdGEudmFsW2ldO1xuXG4gICAgICAgICAgICB2YXIgc3VnRGl2Q2xhc3MgPSAkKFwiPHVsIGNsYXNzPSdzdWdnZXN0aW9uU3VtbWFyeSBjYXJkJyBpZD0nYXJlYUlkLVwiICsgcmVjVmFsQWxpYXMuaWQgKyBcIic+XCIpO1xuXG4gICAgICAgICAgICB2YXIgcmVjTmFtZVRleHQgPSAkKFwiPHN0cm9uZz48bGkgY2FyZC10aXRsZT5cIikudGV4dChyZWNWYWxBbGlhcy5SZWNBcmVhTmFtZSk7XG5cbiAgICAgICAgICAgIHZhciByZWNQaG9uZVRleHQgPSAkKFwiPGxpIGNhcmQtY29udGVudD5cIikudGV4dChyZWNWYWxBbGlhcy5SZWNBcmVhUGhvbmUpO1xuXG5cbiAgICAgICAgICAgIGlmICh0ZWxlcGhvbmVDaGVjayhyZWNWYWxBbGlhcy5SZWNBcmVhUGhvbmUpID09IHRydWUpe1xuICAgICAgICAgICAgICAgIHN1Z0RpdkNsYXNzLmFwcGVuZChyZWNOYW1lVGV4dCwgcmVjUGhvbmVUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIHN1Z0RpdkNsYXNzLmFwcGVuZChyZWNOYW1lVGV4dCk7XG5cbiAgICAgICAgICAgIC8vR2V0IGJvdGggdGhlIFRpdGxlIGFuZCBVUkwgdmFsdWVzIGFuZCBjcmVhdGUgYSBsaW5rIHRhZyBvdXQgb2YgdGhlbVxuICAgICAgICAgICAgLy8gV2UncmUgb25seSBncmFiYmluZyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIExJTksgYXJyYXlcbiAgICAgICAgICAgIGlmIChyZWNWYWxBbGlhcy5MSU5LWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjQXJlYUxpbmtUaXRsZSA9IHJlY1ZhbEFsaWFzLkxJTktbMF0uVGl0bGU7XG4gICAgICAgICAgICAgICAgdmFyIHJlY0FyZWFVcmwgPSByZWNWYWxBbGlhcy5MSU5LWzBdLlVSTDtcbiAgICAgICAgICAgICAgICB2YXIgcmVjQXJlYUxpbmsgPSAkKFwiPGEgLz5cIiwge1xuICAgICAgICAgICAgICAgICAgICBocmVmOiByZWNBcmVhVXJsLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiByZWNBcmVhTGlua1RpdGxlLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCJ9KTtcblxuICAgICAgICAgICAgICAgIHZhciByZWNBcmVhTGlua1AgPSAkKFwiPGxpIGNhcmQtY29udGVudD5cIikuYXBwZW5kKHJlY0FyZWFMaW5rKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzdWdEaXZDbGFzcy5hcHBlbmQocmVjQXJlYUxpbmtQKTtcbiAgICAgICAgICAgIH0gZWxzZSBcbiAgICAgICAgICAgICAgICBzdWdEaXZDbGFzcy5hcHBlbmQoXCI8bGkgY2FyZC1jb250ZW50PlwiKTtcblxuICAgICAgICAgICAgJChmaWx0ZXJlZFR5cGUpLmFwcGVuZChzdWdEaXZDbGFzcyk7XG5cbiAgICAgICAgICAgIHN1Z0RpdkNsYXNzLmNsaWNrKHJlY1ZhbEFsaWFzLnNob3dEZXRhaWxzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3VnRGl2Q2xhc3MuaG92ZXIocmVjVmFsQWxpYXMuaGlnaGxpZ2h0TWFya2VyLCByZWNWYWxBbGlhcy51bkhpZ2hsaWdodE1hcmtlcik7XG5cbiAgICAgICB9XG5cbiAgICBpZiAocmVjZGF0YS52YWwubGVuZ3RoID09PSAwKXsgICBcbiAgICAgICAgIGlmIChmaWx0ZXJlZFR5cGUgPT09IFwiI2ZpbHRlcmVkXCIpe1xuICAgICAgICAgICAgJChmaWx0ZXJlZFR5cGUpLmFwcGVuZChcIjxkaXYgaWQ9J25vbmVGb3VuZCc+Tm8gcmVjcmVhdGlvbiBhcmVhcyBmb3VuZC48L2Rpdj5cIik7XG4gICAgICAgICB9IGVsc2UgaWYgKGZpbHRlcmVkVHlwZSA9PT0gXCIjYm9va21hcmtlZFwiKSB7XG4gICAgICAgICAgICAkKGZpbHRlcmVkVHlwZSkuYXBwZW5kKFwiPGRpdiBzdHlsZT0ndGV4dC1hbGlnbjpjZW50ZXI7IG1hcmdpbjo1JTsnIGlkPSduby1ib29rbWFyayc+Tm90aGluZyBib29rbWFya2VkLjwvZGl2PlwiKTtcbiAgICAgICAgfVxuICAgICB9XG4gICAgfVxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgICAgICQoXCIjYm9va21hcmtlZFwiKS5hcHBlbmQoXCI8ZGl2IHN0eWxlPSd0ZXh0LWFsaWduOmNlbnRlcjsgbWFyZ2luOjUlOycgaWQ9J25vLWJvb2ttYXJrJz5Ob3RoaW5nIGJvb2ttYXJrZWQuPC9kaXY+XCIpO1xufSk7XG5cbnN0YXRlLnJlY3JlYXRpb24uZmlsdGVyZWQub24oXCJjaGFuZ2VcIiwgIGZ1bmN0aW9uKHJlY2RhdGEpe1xuXG4gICAgICAgIHZhciBmaWx0ZXJlZFR5cGUgPSBcIiNmaWx0ZXJlZFwiO1xuICAgICAgICBkaXNwbGF5UmVjQXJlYVN1bW1hcnkocmVjZGF0YSwgZmlsdGVyZWRUeXBlKTtcblxufSk7XG5zdGF0ZS5yZWNyZWF0aW9uLmJvb2ttYXJrZWQub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24ocmVjZGF0YSl7XG5cbiAgICAgICAgdmFyIGZpbHRlcmVkVHlwZSA9IFwiI2Jvb2ttYXJrZWRcIjtcbiAgICAgICAgZGlzcGxheVJlY0FyZWFTdW1tYXJ5KHJlY2RhdGEsIGZpbHRlcmVkVHlwZSk7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9kaXNwbGF5UmVjQXJlYVN1Z2dlc3Rpb25zLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuXG5mdW5jdGlvbiBzaG93QnV0dG9uKHN0YXR1cykge1xuICAgdmFyIGNvbnRhaW5lciA9ICQoJyNidXR0b24tY29udGFpbmVyJyk7XG4gICB2YXIgdGV4dDtcbiAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiYnRuIGNlbnRlclwiPicpXG4gICAgICAudGV4dCgnRmluZCBSZWNyZWF0aW9uJylcbiAgICAgIC5jbGljayhzdGF0ZS5yZWNyZWF0aW9uLnNlYXJjaClcbiAgICAgIC5jc3Moe1xuICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgIG1hcmdpbjogJzAgYXV0bydcbiAgICAgIH0pO1xuICAgdmFyIGljb24gPSAkKCc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHBpbmstdGV4dCB0ZXh0LWFjY2VudDNcIj48L2k+JykudGV4dCgnd2FybmluZycpO1xuXG4gICB2YXIgbm9JbnRlcmVzdCA9ICFzdGF0ZS5pbnRlcmVzdHMuc2VsZWN0ZWQubGVuZ3RoO1xuICAgdmFyIG5vTG9jYXRpb24gPSAhc3RhdGUucm91dGUubG9jYXRpb25Db3VudDtcbiAgIGlmKHN0YXR1cy52YWwuZmlyc3RMb2FkICYmIG5vSW50ZXJlc3QgJiYgbm9Mb2NhdGlvbil7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBzb21lIGludGVyZXN0cyBhbmQgY2hvb3NlIGF0IGxlYXN0IG9uZSBsb2NhdGlvbiB0byBnZXQgc3RhcnRlZCc7XG4gICAgICBidG4uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgIH1cbiAgIGVsc2UgaWYoc3RhdHVzLnZhbC5maXJzdExvYWQgJiYgbm9JbnRlcmVzdCl7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBhdCBsZWFzdCBvbmUgaW50ZXJlc3QgdG8gZ2V0IHN0YXJ0ZWQnO1xuICAgICAgYnRuLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICB9XG4gICBlbHNlIGlmKHN0YXR1cy52YWwuZmlyc3RMb2FkICYmIG5vTG9jYXRpb24pe1xuICAgICAgdGV4dCA9ICdTZWxlY3QgYXQgbGVhc3Qgb25lIGxvY2F0aW9uIHRvIGdldCBzdGFydGVkJztcbiAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgfVxuICAgZWxzZSBpZihzdGF0dXMudmFsLmZpcnN0TG9hZCl7XG4gICAgICB0ZXh0ID0gJ0NsaWNrIHRoZSBidXR0b24gdG8gZ2V0IHN0YXJ0ZWQnXG4gICAgICBpY29uID0gbnVsbDtcbiAgICAgIGJ0bi5hZGRDbGFzcygncHVsc2UnKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgIGJ0bi5yZW1vdmVDbGFzcygncHVsc2UnKTtcbiAgICAgIH0sIDUwMCk7XG4gICB9XG4gICBlbHNlIGlmKG5vSW50ZXJlc3Qpe1xuICAgICAgdGV4dCA9ICdTZWxlY3QgYXQgbGVhc3Qgb25lIGludGVyZXN0IHRvIHNlYXJjaCBmb3IgcmVjcmVhdGlvbiBhcmVhcyc7XG4gICAgICBidG4uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgIH1cbiAgIGVsc2UgaWYobm9Mb2NhdGlvbil7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBhdCBsZWFzdCBvbmUgbG9jYXRpb24gdG8gc2VhcmNoIGZvciByZWNyZWF0aW9uIGFyZWFzJztcbiAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgfVxuICAgZWxzZXtcbiAgICAgIHRleHQgPSAnTmV3IHJlY3JlYXRpb24gYXJlYXMgbWF5IGJlIGF2YWlsYWJsZS4nXG4gICAgICBpY29uID0gbnVsbDtcbiAgICAgIGJ0bi5hZGRDbGFzcygncHVsc2UnKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgIGJ0bi5yZW1vdmVDbGFzcygncHVsc2UnKTtcbiAgICAgIH0sIDUwMCk7XG4gICB9XG5cbiAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgaWYoIHN0YXR1cy52YWwuc2hvdWxkTG9hZCB8fCBzdGF0dXMudmFsLmZpcnN0TG9hZCB8fCAhc3RhdHVzLnZhbC5jYW5Mb2FkKXtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQoJCgnPHA+JykudGV4dCh0ZXh0KS5wcmVwZW5kKGljb24pLCBidG4pO1xuICAgfVxuICAgZWxzZSBpZihzdGF0dXMudmFsLmxvYWRpbmcpe1xuICAgICAgdGV4dCA9ICdMb2FkaW5nIHJlY3JlYXRpb24gYXJlYXPigKYnXG4gICAgICBjb250YWluZXIuYXBwZW5kKCQoJzxwPicpLnRleHQodGV4dCksIFxuICAgICAgICAgYDxkaXYgY2xhc3M9XCJwcmVsb2FkZXItd3JhcHBlciBiaWcgYWN0aXZlXCI+XG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItbGF5ZXIgc3Bpbm5lci1ibHVlLW9ubHlcIj5cbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGUtY2xpcHBlciBsZWZ0XCI+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PjxkaXYgY2xhc3M9XCJnYXAtcGF0Y2hcIj5cbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgPC9kaXY+PGRpdiBjbGFzcz1cImNpcmNsZS1jbGlwcGVyIHJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICA8L2Rpdj5gKTtcbiAgIH1cbn1cblxuc3RhdGUuaW50ZXJlc3RzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKXtcbiAgIHZhciBsb2FkZWQgPSBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5sb2FkZWRBY3Rpdml0aWVzO1xuICAgdmFyIGZpbHRlcmVkID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuZmlsdGVyZWRBY3Rpdml0aWVzO1xuICAgdmFyIHNob3VsZExvYWQgPSBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZEFjdGl2aXRpZXM7XG4gICB2YXIgc2hvdWxkRmlsdGVyID0gZmFsc2U7XG4gICB2YXIgcmVzZXRDb29yZHMgPSBmYWxzZTtcbiAgIGUudmFsLmFsbC5mb3JFYWNoKChpbnRlcmVzdCkgPT4ge1xuICAgICAgaWYoIWxvYWRlZFtpbnRlcmVzdC5pZF0gJiYgaW50ZXJlc3Quc2VsZWN0ZWQpe1xuICAgICAgICAgc2hvdWxkTG9hZCA9IHRydWU7XG4gICAgICAgICByZXNldENvb3JkcyA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZihpbnRlcmVzdC5zZWxlY3RlZCAhPT0gZmlsdGVyZWRbaW50ZXJlc3QuaWRdKXtcbiAgICAgICAgIHNob3VsZEZpbHRlciA9IHRydWU7XG4gICAgICAgICBmaWx0ZXJlZFtpbnRlcmVzdC5pZF0gPSBpbnRlcmVzdC5zZWxlY3RlZDtcbiAgICAgIH1cbiAgIH0pO1xuICAgdmFyIGNhbkxvYWQgPSAhIWUudmFsLnNlbGVjdGVkLmxlbmd0aCAmJiAhIXN0YXRlLnJvdXRlLmxvY2F0aW9uQ291bnQ7XG4gICBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZENvb3JkcyA9IHJlc2V0Q29vcmRzO1xuICAgc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMudXBkYXRlKHtzaG91bGRMb2FkOiBzaG91bGRMb2FkLCBjYW5Mb2FkOiBjYW5Mb2FkfSk7XG4gICBpZiggc2hvdWxkRmlsdGVyKXtcbiAgICAgIHN0YXRlLnJlY3JlYXRpb24uZmlsdGVyQWxsKCk7XG4gICB9XG59KTtcblxuLy9yZXR1cm5zIHRydWUgaWYgdGhlIGFyZWEgb2YgQSBpcyAobW9zdGx5KSBjb250YWluZWQgaW4gdGhlIGFyZWEgb2YgQlxuZnVuY3Rpb24gaXNDb250YWluZWQoYXJyQSwgcmFkQSwgYXJyQiwgcmFkQil7XG4gICBsZXQgYWxsQ29udGFpbmVkID0gdHJ1ZTtcbiAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyQS5sZW5ndGggJiYgYWxsQ29udGFpbmVkOyBpKyspe1xuICAgICAgbGV0IGN1cnJlbnRDb250YWluZWQgPSBmYWxzZTtcbiAgICAgIGZvciggbGV0IGogPSAwOyBqIDwgYXJyQi5sZW5ndGggJiYgIWN1cnJlbnRDb250YWluZWQ7IGorKyl7XG4gICAgICAgICBsZXQgZGlzdGFuY2UgPSBnb29nbGUubWFwcy5nZW9tZXRyeS5zcGhlcmljYWwuY29tcHV0ZURpc3RhbmNlQmV0d2VlbihcbiAgICAgICAgICAgIGFyckFbaV0sIGFyckJbal0pO1xuICAgICAgICAgaWYoZGlzdGFuY2UgPD0gcmFkQiAtIHJhZEEpe1xuICAgICAgICAgICAgY3VycmVudENvbnRhaW5lZCA9IHRydWU7XG4gICAgICAgICB9XG4gICAgICAgICBpZighY3VycmVudENvbnRhaW5lZCAmJiBqIDwgYXJyQi5sZW5ndGggLSAxKXtcbiAgICAgICAgICAgIGxldCBkMSA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgbGV0IGQyID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsLmNvbXB1dGVEaXN0YW5jZUJldHdlZW4oXG4gICAgICAgICAgICBhcnJBW2ldLCBhcnJCW2ogKyAxXSk7XG4gICAgICAgICAgICBjdXJyZW50Q29udGFpbmVkID0gZDEgPCByYWRCICYmIGQyIDwgcmFkQjtcbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFsbENvbnRhaW5lZCA9IGN1cnJlbnRDb250YWluZWQ7XG4gICB9XG4gICByZXR1cm4gYWxsQ29udGFpbmVkO1xufVxuXG5zdGF0ZS5tYXAuZGlyZWN0aW9ucy5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4gICAvL21ha2UgdGhpcyBjb25zdGFudCA1MCBtaWxlcyFcbiAgIHZhciByYWRpdXMgPSBzdGF0ZS5yZWNyZWF0aW9uLnNlYXJjaFJhZGl1cztcbiAgIHZhciBsb2FkZWRTZWFyY2hDb29yZHMgPSBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5sb2FkZWRTZWFyY2hDb29yZHM7XG4gICB2YXIgbmV3Um91dGVDb29yZHMgPSBlLnZhbC5nZXRDb29yZHNCeVJhZGl1cyhyYWRpdXMpO1xuICAgdmFyIHNob3VsZExvYWQgPSBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZENvb3JkcztcbiAgIHZhciBzaG91bGRGaWx0ZXIgPSB0cnVlO1xuICAgdmFyIHJlc2V0QWN0aXZpdGllcyA9IGZhbHNlO1xuXG4gICAvL2lmIHRoZXJlIGlzIG5vIGxvY2F0aW9uIGdpdmVuXG4gICBpZihuZXdSb3V0ZUNvb3JkcyA9PSBudWxsKXtcbiAgICAgIC8vZG8gbm90aGluZztcbiAgIH1cbiAgIC8vaWYgbm90aGluZyBoYXMgYmVlbiBsb2FkZWRcbiAgIGVsc2UgaWYoIWxvYWRlZFNlYXJjaENvb3Jkcy5sZW5ndGgpe1xuICAgICAgc2hvdWxkTG9hZCA9IHRydWU7XG4gICAgICByZXNldEFjdGl2aXRpZXMgPSB0cnVlO1xuICAgfVxuICAgZWxzZXtcbiAgICAgIGxldCBuZXdBcmVhID0gIWlzQ29udGFpbmVkKG5ld1JvdXRlQ29vcmRzLCByYWRpdXMsIGxvYWRlZFNlYXJjaENvb3JkcywgMTYwOTM0KTtcbiAgICAgIHNob3VsZExvYWQgPSBuZXdBcmVhIHx8IHNob3VsZExvYWQ7XG4gICAgICByZXNldEFjdGl2aXRpZXMgPSBuZXdBcmVhO1xuICAgfVxuXG4gICB2YXIgY2FuTG9hZCA9ICEhc3RhdGUucm91dGUubG9jYXRpb25Db3VudCAmJiAhIXN0YXRlLmludGVyZXN0cy5zZWxlY3RlZC5sZW5ndGg7XG4gICBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZEFjdGl2aXRpZXMgPSByZXNldEFjdGl2aXRpZXM7XG5cbiAgIHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLnVwZGF0ZSh7c2hvdWxkTG9hZDogc2hvdWxkTG9hZCwgY2FuTG9hZDogY2FuTG9hZH0pO1xuICAgaWYoIHNob3VsZEZpbHRlcil7XG4gICAgICBzdGF0ZS5yZWNyZWF0aW9uLmZpbHRlckFsbCgpO1xuICAgfVxufSk7XG5cbi8vIC8vbWlnaHQgaGF2ZSB0byB3YWl0IGZvciBkaXJlY3Rpb25zIHRvIGNvbWUgYmFjayBhbmQgYmUgcHJvY2Vzc2VkLi4uXG4vLyBzdGF0ZS5yb3V0ZS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4vLyAgICBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZEFjdGl2aXRpZXMgPSB0cnVlO1xuLy8gICAgdmFyIHNob3VsZExvYWQgPSAhIWUudmFsLmxlbmd0aDtcbi8vICAgIHZhciBjYW5Mb2FkID0gISFlLnZhbC5sZW5ndGggJiYgISFzdGF0ZS5pbnRlcmVzdHMuc2VsZWN0ZWQubGVuZ3RoO1xuLy8gICAgc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMudXBkYXRlKHtzaG91bGRMb2FkOiBzaG91bGRMb2FkLCBjYW5Mb2FkOiBjYW5Mb2FkfSk7XG4vLyB9KVxuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiBzaG93QnV0dG9uKHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLm1ha2VFdmVudCgpKSk7XG5zdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5vbignY2hhbmdlJywgc2hvd0J1dHRvbik7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vbG9hZEJ1dHRvbi5qc1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL2ludGVyZXN0cy5jc3MnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzLmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9pbnRlcmVzdHMuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2ludGVyZXN0cy5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vaW50ZXJlc3RzLmNzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzLmNzc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLmludGVyZXN0c3tcXG4gICBiYWNrZ3JvdW5kOiBvcmFuZ2U7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzLmNzc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL2xheW91dC5jc3MnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgJCgnc2VsZWN0JykubWF0ZXJpYWxfc2VsZWN0KCk7XG4gICAgXG5cdFxuICAgIGZ1bmN0aW9uIGFkZENoaXAoKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0ZS5pbnRlcmVzdHMuYWxsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcblx0XHRcdGxldCBuZXdDaGlwID0gJCgnPGRpdiBjbGFzcz1cImNoaXAgY2VudGVyXCI+PC9kaXY+Jyk7XG5cdFx0XHQkKFwiI3Vuc2VsZWN0ZWQtaW50ZXJlc3RzXCIpLmFwcGVuZChuZXdDaGlwLnRleHQoc3RhdGUuaW50ZXJlc3RzLmFsbFtpXS5uYW1lKSk7XG5cdFx0XHRcblx0XHRcdCQobmV3Q2hpcCkuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHN0YXRlLmludGVyZXN0cy5hbGxbaV0udG9nZ2xlKCk7XG5cdFx0XHR9KTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHRcdC8vIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW50ZXJlc3RzJykgIT09IG51bGwpIHtcblx0XHRcdC8vIFx0c3RhdGUuaW50ZXJlc3RzLmVtaXQoJ2NoYW5nZScpO1xuXHRcdFx0XG5cdFx0XHQvLyBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ludGVyZXN0cycpICE9PSBudWxsKSB7XG5cdFx0XHQvLyBcdGxldCBpbnRlcmVzdHNBcnJheSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ludGVyZXN0cycpKTtcblx0XHRcdFx0XG5cblx0XHRcdC8vIFx0aWYgKGludGVyZXN0c0FycmF5W3N0YXRlLmludGVyZXN0cy5hbGxbaV0uaWRdID09PSB0cnVlICkge1xuXHRcdFx0Ly8gXHRcdHN0YXRlLmludGVyZXN0cy5hbGxbaV0uc2VsZWN0ZWQgPSB0cnVlO1xuXHRcdFx0Ly8gXHR9XG5cdFx0XHQvLyB9XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdHN0YXRlLmludGVyZXN0cy5hbGxbaV0ub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFxuXHRcdFx0aWYoZS52YWwpIHtcblx0XHRcdFx0bmV3Q2hpcC5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdFx0XHQkKFwiI3NlbGVjdGVkLWludGVyZXN0c1wiKS5hcHBlbmQobmV3Q2hpcCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0IFx0bmV3Q2hpcC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdCBcdCQoXCIjdW5zZWxlY3RlZC1pbnRlcmVzdHNcIikucHJlcGVuZChuZXdDaGlwKTtcblx0XHRcdH1cblxuXHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGFkZENoaXAoKTtcblxuXG5cdCQoXCIjY2xlYXItaW50ZXJlc3RzXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcblx0XHRzdGF0ZS5pbnRlcmVzdHMuc2VsZWN0ZWQuZm9yRWFjaChmdW5jdGlvbihjbGVhcikge1xuXHRcdFx0Y2xlYXIudXBkYXRlKGZhbHNlLCB0cnVlKTtcblx0XHR9KTtcblx0XHRzdGF0ZS5pbnRlcmVzdHMuZW1pdCgnY2hhbmdlJyk7XG5cdH0pO1xuXHRcblx0JChcIi5kZXN0aW5hdGlvbi1pbnB1dFwiKS5vbignZm9jdXMnLCBmdW5jdGlvbigpIHtcbiBcdFx0aWYgKCQoXCIjaW50ZXJlc3RzLWhlYWRlclwiKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcbiBcdFx0XHQkKFwiI2ludGVyZXN0cy1oZWFkZXJcIikuY2xpY2soKTtcbiBcdFx0fVxuIFx0fSk7XG5cblxuXHQkKCcjdHV0b3JpYWwtbW9kYWwnKS5tb2RhbCh7XG5cdCAgaW5EdXJhdGlvbjogMzAwLFxuXHQgIHN0YXJ0aW5nVG9wOiAnNDAlJywgLy8gU3RhcnRpbmcgdG9wIHN0eWxlIGF0dHJpYnV0ZVxuXHQgIGVuZGluZ1RvcDogJzEwJSdcblx0fSk7XG5cbn0pO1xuXG5cblxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2xheW91dC9sYXlvdXQuanNcbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2xheW91dC5jc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbGF5b3V0LmNzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9sYXlvdXQuY3NzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2xheW91dC9sYXlvdXQuY3NzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIudGVzdC1jbGFzc3tcXG4gICBiYWNrZ3JvdW5kOiBsaW1lO1xcbn1cXG5cXG4ubGF5b3V0e1xcbiAgIGJhY2tncm91bmQ6IHJlYmVjY2FwdXJwbGU7XFxufVxcblxcbi5jaGlwIHtcXG5cXHRiYWNrZ3JvdW5kOiAjZThlOGU4O1xcblxcdGN1cnNvcjogcG9pbnRlcjtcXG5cXHRkaXNwbGF5OiBibG9jaztcXG5cXHRtYXgtaGVpZ2h0OiAyZW07XFxuXFx0bGluZS1oZWlnaHQ6IDJlbTtcXG5cXHRwYWRkaW5nOiAwcHg7XFxuXFx0bWFyZ2luLXJpZ2h0OiAwcHg7XFxufVxcbi5zZWxlY3RlZHtcXG5cXHRiYWNrZ3JvdW5kOiByZ2JhKDExMSwgMTc5LCAxMzIsIDAuNCk7XFxufVxcblxcbiNtYXAge1xcblxcdHRvcDogN3B4O1xcbn1cXG5cXG4ubmF2LXdyYXBwZXIsIC5idG4sIC5idG4tZmxvYXRpbmcge1xcblxcdGJhY2tncm91bmQ6ICM2ZmIzODQ7XFxuXFx0Y29sb3I6IHdoaXRlO1xcbn1cXG5cXG4uY29sbGFwc2libGUtYm9keSB7XFxuXFx0cGFkZGluZzogMTVweDtcXG5cXHRtYXgtaGVpZ2h0OiA4MHZoO1xcblxcdG92ZXJmbG93OiBhdXRvO1xcbn1cXG5cXG4uY29sbGFwc2libGUtaGVhZGVyIHtcXG5cXHRiYWNrZ3JvdW5kOiAjNUY4QTk3O1xcblxcdGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLmNlbnRlciB7XFxuXFx0dGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4uYnRuOmhvdmVyIHtcXG5cXHRiYWNrZ3JvdW5kOiAjNDU5NTVEO1xcbn1cXG5cXG4ubW9kYWwtY29udGVudCB7XFxuXFx0YmFja2dyb3VuZDogI2RmZWFkZjtcXG59XFxuXFxuLnRhYnMgLnRhYiBhIHtcXG5cXHRjb2xvcjogIzZmYjM4NDtcXG59XFxuXFxuLnRhYnMgLnRhYiBhLmFjdGl2ZSB7XFxuXFx0Y29sb3I6ICM2ZmIzODQ7XFxufVxcblxcbiAudGFicyAuaW5kaWNhdG9yIHtcXG4gXFx0YmFja2dyb3VuZDogIzZmYjM4NDtcXG4gfVxcblxcbiAucGFkZGluZyB7XFxuIFxcdHBhZGRpbmctdG9wOiAxMHB4O1xcbiB9XFxuLmZpeGVkIHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiAxMHB4O1xcblxcdHJpZ2h0OiAxMHB4O1xcblxcdGNvbG9yOiBncmF5O1xcbn1cXG5cXG4jZm9udC1zaXplLTEyIHtcXG5cXHRmb250LXNpemU6IDEycHg7XFxuXFx0bWFyZ2luLWJvdHRvbTogMHB4O1xcbn1cXG5cXG4ucmFuZ2UtZmllbGQge1xcblxcdG1hcmdpbi10b3A6IDBweDtcXG5cXHRwYWRkaW5nOiAwIDE1cHg7XFxufVxcblxcbi50YWJzIHtcXG5cXHRvdmVyZmxvdy14OiBoaWRkZW47XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmNzc1xuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL21hcC5jc3MnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcbmltcG9ydCBtYXAgZnJvbSAnLi9tYXBjb25zdGFudCc7XG5cbmNvbnN0IGRpcmVjdGlvbnNTZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTZXJ2aWNlKCk7XG5jb25zdCBkaXJlY3Rpb25zRGlzcGxheSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zUmVuZGVyZXIoKTtcblxuXG5kaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAobWFwKTtcbmRpcmVjdGlvbnNEaXNwbGF5LnNldFBhbmVsKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXJlY3Rpb25zLWNvbnRhaW5lcicpKTtcblxubGV0IHJvdXRlTWFya2VycyA9IFtdO1xuXG5zdGF0ZS5yb3V0ZS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4gICAvL3JlbW92ZSBhbGwgbWFya2Vyc1xuICAgcm91dGVNYXJrZXJzLmZvckVhY2goKG0pID0+IHtcbiAgICAgIG0uc2V0TWFwKG51bGwpO1xuICAgfSk7XG4gICByb3V0ZU1hcmtlcnMgPSBbXTtcblxuICAgLy8gLy9hZGQgbmV3IG1hcmtlcnNcbiAgIGlmKHN0YXRlLnJvdXRlLmxvY2F0aW9uQ291bnQgPT09IDEpe1xuICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkuc2V0KCdkaXJlY3Rpb25zJywgbnVsbCk7XG4gICAgICBpZihzdGF0ZS5yb3V0ZS5wYXRoWzBdLmRhdGEuZ2VvbWV0cnkpe1xuICAgICAgICAgbWFwLmZpdEJvdW5kcyhlLnZhbFswXS5kYXRhLmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgIGFkZE1hcmtlcihlLnZhbFswXS5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uLCAncm91dGUnKTtcbiAgICAgICAgIC8vdXBkYXRlIHJvdXRlIHdpdGggb25lIGxvY2F0aW9uXG4gICAgICAgICBzdGF0ZS5tYXAuZGlyZWN0aW9ucy51cGRhdGUoZS52YWxbMF0uZGF0YS5nZW9tZXRyeS5sb2NhdGlvbik7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHN0YXRlLnJvdXRlLnBhdGhbMF0uZGF0YS5SZWNBcmVhTmFtZSl7XG4gICAgICAgICBsZXQgY29vcmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyh7XG4gICAgICAgICAgICBsYXQ6IGUudmFsWzBdLmRhdGEuUmVjQXJlYUxhdGl0dWRlLFxuICAgICAgICAgICAgbG5nOiBlLnZhbFswXS5kYXRhLlJlY0FyZWFMb25naXR1ZGVcbiAgICAgICAgIH0pO1xuICAgICAgICAgc3RhdGUubWFwLmRpcmVjdGlvbnMudXBkYXRlKGNvb3Jkcyk7XG4gICAgICAgICBtYXAuc2V0Q2VudGVyKGNvb3Jkcyk7XG4gICAgICAgICBtYXAuc2V0Wm9vbSg4KTtcbiAgICAgICAgIGFkZE1hcmtlcihjb29yZHMsICdyb3V0ZScpO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIGxldCBjb29yZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHtcbiAgICAgICAgICAgIGxhdDogZS52YWxbMF0uZGF0YS5sYXQsXG4gICAgICAgICAgICBsbmc6IGUudmFsWzBdLmRhdGEubG5nXG4gICAgICAgICB9KTtcbiAgICAgICAgIHN0YXRlLm1hcC5kaXJlY3Rpb25zLnVwZGF0ZShjb29yZHMpO1xuICAgICAgICAgbWFwLnNldENlbnRlcihjb29yZHMpO1xuICAgICAgICAgbWFwLnNldFpvb20oOCk7XG4gICAgICAgICBhZGRNYXJrZXIoY29vcmRzLCAncm91dGUnKTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYoc3RhdGUucm91dGUubG9jYXRpb25Db3VudCl7XG4gICAgICBpZihzdGF0ZS5yb3V0ZS5zaG91bGRab29tTWFwKXtcbiAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldCgncHJlc2VydmVWaWV3cG9ydCcsIGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXQoJ3ByZXNlcnZlVmlld3BvcnQnLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIC8vZ2V0IGRpcmVjdGlvbnNcbiAgICAgIGxldCByZXF1ZXN0ID0ge1xuICAgICAgICAgb3JpZ2luOiBzdGF0ZS5yb3V0ZS5vcmlnaW4sXG4gICAgICAgICBkZXN0aW5hdGlvbjogc3RhdGUucm91dGUuZGVzdGluYXRpb24sXG4gICAgICAgICB0cmF2ZWxNb2RlOiAnRFJJVklORydcbiAgICAgIH1cbiAgICAgIGlmKHN0YXRlLnJvdXRlLndheXBvaW50cylcbiAgICAgICAgIHJlcXVlc3Qud2F5cG9pbnRzID0gc3RhdGUucm91dGUud2F5cG9pbnRzO1xuICAgICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzdWx0LCBzdGF0dXMpIHtcbiAgICAgICAgIGlmIChzdGF0dXMgPT0gJ09LJykge1xuICAgICAgICAgICAgc3RhdGUubWFwLmRpcmVjdGlvbnMudXBkYXRlKHJlc3VsdC5yb3V0ZXNbMF0pO1xuICAgICAgICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkuc2V0RGlyZWN0aW9ucyhyZXN1bHQpO1xuICAgICAgICAgfVxuICAgICAgICAgLy9lbHNlIHNob3cgc29tZSBlcnJvciB0b2FzdD9cbiAgICAgICAgIHN0YXRlLnJvdXRlLnNob3VsZFpvb21NYXAgPSB0cnVlO1xuICAgICAgfSk7XG4gICB9XG4gICBlbHNle1xuICAgICAgc3RhdGUubWFwLmRpcmVjdGlvbnMudXBkYXRlKG51bGwpO1xuICAgfVxufSlcblxubGV0IHJlY0FyZWFNYXJrZXJzID0gW107XG5cbnN0YXRlLnJlY3JlYXRpb24uZmlsdGVyZWQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgbGV0IG1hcmtlck1hcCA9IHt9O1xuICAgbGV0IG5ld01hcmtlcnMgPSBbXTtcbiAgIGUudmFsLmZvckVhY2goKHIpID0+IHtcbiAgICAgIGlmKCFyLm1hcmtlcil7XG4gICAgICAgICByLmFkZE1hcmtlcigpO1xuICAgICAgICAgci5tYXJrZXIuc2V0TWFwKG1hcCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKCFyLm1hcmtlckRpc3BsYXllZCl7XG4gICAgICAgICByLm1hcmtlci5zZXRNYXAobWFwKTtcbiAgICAgIH1cbiAgICAgIHIubWFya2VyRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgIG1hcmtlck1hcFtyLmlkXSA9IHRydWU7XG4gICAgICBuZXdNYXJrZXJzLnB1c2gocik7XG4gICB9KTtcblxuICAgLy9yZW1vdmUgZmlsdGVyZWQgb3V0IG1hcmtlcnNcbiAgIHJlY0FyZWFNYXJrZXJzLmZvckVhY2goKHIpID0+IHtcbiAgICAgIGlmKCFtYXJrZXJNYXBbci5pZF0pe1xuICAgICAgICAgci5tYXJrZXIuc2V0TWFwKG51bGwpO1xuICAgICAgICAgci5tYXJrZXJEaXNwbGF5ZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgIH0pO1xuICAgcmVjQXJlYU1hcmtlcnMgPSBuZXdNYXJrZXJzO1xufSk7XG5cblxuXG5mdW5jdGlvbiBhZGRNYXJrZXIobG9jYXRpb24sIHR5cGUsIGFyZWEpIHtcbiAgIGxldCBrd2FyZ3MgPSB7XG4gICAgICBwb3NpdGlvbjogbG9jYXRpb24sXG4gICAgICBtYXA6IG1hcFxuICAgfVxuICAgaWYodHlwZSA9PT0gJ3JvdXRlJyl7XG4gICAgICBrd2FyZ3MubGFiZWwgPSAnQSc7XG4gICB9XG4gICBsZXQgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihrd2FyZ3MpO1xuICAgaWYoYXJlYSl7XG4gICAgICBsZXQgaW5mbyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtjb250ZW50OiBtYWtlUHJldmlldyhhcmVhKX0pO1xuICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZSkgPT4ge1xuICAgICAgICAgaW5mby5vcGVuKG1hcCwgbWFya2VyKTtcbiAgICAgIH0pO1xuICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdtb3VzZW91dCcsIChlKSA9PiB7XG4gICAgICAgICBpbmZvLmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBhcmVhLnNob3dEZXRhaWxzKTtcbiAgIH1cbiAgIGlmKCB0eXBlID09PSAncmVjJyl7XG4gICAgICByZWNBcmVhTWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICB9XG4gICBlbHNlIGlmKHR5cGUgPT09ICdyb3V0ZScpe1xuICAgICAgcm91dGVNYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgIH1cbiAgIGVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlciB0eXBlIG11c3QgYmUgZWl0aGVyIFwicmVjXCIgb3IgXCJyb3V0ZVwiJyk7XG4gICB9XG59XG5cbm1hcC5hZGRMaXN0ZW5lcignaWRsZScsIGZ1bmN0aW9uKCl7XG4gICBzdGF0ZS5yZWNyZWF0aW9uLmZpbHRlckFsbCgpO1xufSlcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcbiAgICQoJyNkaXJlY3Rpb25zLW1vZGFsJykubW9kYWwoKTtcbiAgIHZhciBkaXJlY3Rpb25zQnRuID0gJCgnPGEgaHJlZj1cIiNcIj4nKVxuICAgLmFwcGVuZCgkKCc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+JykudGV4dCgnZGlyZWN0aW9ucycpKVxuICAgLmNzcyh7XG4gICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmZmJyxcbiAgICAgIGNvbG9yOiAnIzc0NzQ3NCcsXG4gICAgICAnYm9yZGVyLXJhZGl1cyc6ICcycHgnLFxuICAgICAgbWFyZ2luOiAnMTBweCcsXG4gICAgICBwYWRkaW5nOiAnMCAzcHgnLFxuICAgICAgaGVpZ2h0OiAnMjVweCcsXG4gICAgICAnbGluZS1oZWlnaHQnOiAnMjVweCcsXG4gICAgICAnYm94LXNoYWRvdyc6ICdyZ2JhKDAsIDAsIDAsIDAuMykgMHB4IDFweCA0cHggLTFweCdcbiAgIH0pXG4gICAuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICQoJyNkaXJlY3Rpb25zLW1vZGFsJykubW9kYWwoJ29wZW4nKTtcbiAgIH0pO1xuICAgbWFwLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5UT1BfQ0VOVEVSXS5wdXNoKGRpcmVjdGlvbnNCdG5bMF0pO1xuXG4gICB2YXIgc2xpZGVyID0gJCgnI3JhZGl1cy1zbGlkZXInKTtcbiAgIHZhciBjaXJjbGVzID0gW107XG4gICBzbGlkZXIub24oJ21vdXNlZG93biBmb2N1cycsIGZ1bmN0aW9uKCl7XG4gICAgICAvL3NldCByYWRpdXMgZnJvbSBzbGlkZXIgdmFsXG4gICAgICBzdGF0ZS5yZWNyZWF0aW9uLnNlYXJjaFJhZGl1cyA9IHNsaWRlci52YWwoKSAqIDE2MDkuMzQ7XG4gICAgICBsZXQgcmFkID0gc3RhdGUucmVjcmVhdGlvbi5zZWFyY2hSYWRpdXM7XG4gICAgICB2YXIgY29vcmRzID0gc3RhdGUubWFwLmRpcmVjdGlvbnMuZ2V0Q29vcmRzQnlSYWRpdXMocmFkKTtcbiAgICAgIGlmKGNvb3Jkcyl7XG4gICAgICAgICBjb29yZHMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgICAgICAgbGV0IGNpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xuICAgICAgICAgICAgICAgY2VudGVyOiBjLFxuICAgICAgICAgICAgICAgcmFkaXVzOiByYWQsXG4gICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdibHVlJyxcbiAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjMzLFxuICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZWQnLFxuICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgIG1hcDogbWFwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNpcmNsZXMucHVzaChjaXJjbGUpO1xuICAgICAgICAgfSk7XG4gICAgICB9XG4gICB9KTtcbiAgIHNsaWRlci5vbignbW91c2V1cCBmb2N1c291dCcsIGZ1bmN0aW9uKCl7XG4gICAgICBjaXJjbGVzLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgIGMuc2V0TWFwKG51bGwpO1xuICAgICAgfSlcbiAgICAgIGNpcmNsZXMgPSBbXTtcbiAgICAgIHN0YXRlLnJlY3JlYXRpb24uZmlsdGVyQWxsKCk7XG4gICB9KTtcbiAgIHNsaWRlci5vbignaW5wdXQnLCBmdW5jdGlvbigpe1xuICAgICAgY2lyY2xlcy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICAgICBjLnNldE1hcChudWxsKTtcbiAgICAgIH0pXG4gICAgICBjaXJjbGVzID0gW107XG4gICAgICBzdGF0ZS5yZWNyZWF0aW9uLnNlYXJjaFJhZGl1cyA9IHNsaWRlci52YWwoKSAqIDE2MDkuMzQ7XG4gICAgICBsZXQgcmFkID0gc3RhdGUucmVjcmVhdGlvbi5zZWFyY2hSYWRpdXM7XG4gICAgICB2YXIgY29vcmRzID0gc3RhdGUubWFwLmRpcmVjdGlvbnMuZ2V0Q29vcmRzQnlSYWRpdXMocmFkKTtcbiAgICAgIGlmKGNvb3Jkcyl7XG4gICAgICAgICBjb29yZHMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgICAgICAgbGV0IGNpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xuICAgICAgICAgICAgICAgY2VudGVyOiBjLFxuICAgICAgICAgICAgICAgcmFkaXVzOiByYWQsXG4gICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdibHVlJyxcbiAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjMzLFxuICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZWQnLFxuICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgIG1hcDogbWFwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNpcmNsZXMucHVzaChjaXJjbGUpO1xuICAgICAgICAgfSk7XG4gICAgICB9XG4gICB9KTtcbn0pXG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5qc1xuLy8gbW9kdWxlIGlkID0gMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbWFwLmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9tYXAuY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL21hcC5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikodW5kZWZpbmVkKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIlxcbiNtYXB7XFxuICAgbWluLWhlaWdodDogOTB2aDtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9jb21wb25lbnRzL21hcC9tYXAuY3NzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJy4vcm91dGUuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cbnZhciB0b29sdGlwID0gJChcblx0JzxzcGFuIGNsYXNzPSBcInJvdXRlLXRvb2x0aXBcIiBkYXRhLXRvb2x0aXA9XCJTZWxlY3QgZnJvbSB0aGUgZHJvcC1kb3duIG1lbnUuXCIgZGF0YS1wb3NpdGlvbj1cInJpZ2h0XCI+J1xuKTtcbnRvb2x0aXAudG9vbHRpcCh7ZGVsYXk6IDUwfSk7XG5cbi8vIEZ1bmN0aW9uIHRvIG1hbmFnZSB0aGUgc29ydGluZyBvZiBHb29nbGUgUGxhY2VzIGxvY2F0aW9ucy5cbi8vIFVzaW5nIGpxdWVyeS51aSBmb3Igc29ydGluZyBmdW5jdGlvbi5cbiQoZnVuY3Rpb24oKSB7XG4gICQoIFwiLnNvcnRhYmxlXCIgKS5zb3J0YWJsZSh7XG4gICAgcmV2ZXJ0OiB0cnVlLCBcbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IGlucHV0U2VjdGlvbi5jaGlsZHJlbigpO1xuICAgICAgdmFyIGNoZWNrZXIgPSAwO1xuICAgICAgdmFyIHN0YXRlTG9jYXRpb247XG4gICAgICB2YXIgbGlzdExvY2F0aW9uO1xuICAgICAgLy8gTG9naWMgY3JlYXRlZCB0byBkZXRlcm1pbmUgd2hlcmUgdGhlIG9yaWdpbmFsIGRlc3RpbmF0aW9uIHdhcyBsb2NhdGVkLCB3aGVyZSBpdCB3YXMgbW92ZWQsIGFuZCB0byB1cGRhdGUgdGhlIGxvY2F0aW9uIGluIFN0YXRlLlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgXHRsaXN0TG9jYXRpb24gPSBjaGlsZHJlbltpXS5kYXRhc2V0Lm51bWJlcjtcbiAgICAgIFx0aWYgKGxpc3RMb2NhdGlvbiAhPSBjaGVja2VyKXtcblx0ICAgICAgXHRpZiAobGlzdExvY2F0aW9uID4gY2hlY2tlcisxKXtcblx0XHRcdFx0XHRcdHRvb2x0aXAubW91c2VsZWF2ZSgpO1xuXHRcdFx0XHRcdFx0dG9vbHRpcC5kZXRhY2goKTtcblx0XHRcdFx0XHRcdHN0YXRlTG9jYXRpb24gPSBzdGF0ZS5yb3V0ZS5wYXRoW2xpc3RMb2NhdGlvbl0uZGF0YTtcblx0XHRcdFx0XHRcdHN0YXRlLnJvdXRlLnJlbW92ZShsaXN0TG9jYXRpb24sIHRydWUpO1xuXHRcdFx0XHRcdFx0c3RhdGUucm91dGUuaW5zZXJ0KHN0YXRlTG9jYXRpb24sIGkpO1xuXHQgICAgICBcdH0gZWxzZSBpZiAobGlzdExvY2F0aW9uID09IGNoZWNrZXIrMSl7XG5cdCAgICAgIFx0XHRjaGVja2VyKys7XG5cdCAgICAgIFx0fSBlbHNlIGlmIChsaXN0TG9jYXRpb24gPCBjaGVja2VyLTEpe1xuXHRcdFx0XHRcdHRvb2x0aXAubW91c2VsZWF2ZSgpO1xuXHRcdFx0XHRcdHRvb2x0aXAuZGV0YWNoKCk7XG5cdCAgICBcdFx0XHRzdGF0ZUxvY2F0aW9uID0gc3RhdGUucm91dGUucGF0aFtsaXN0TG9jYXRpb25dLmRhdGE7XG5cdCAgICBcdFx0XHRzdGF0ZS5yb3V0ZS5yZW1vdmUobGlzdExvY2F0aW9uLCB0cnVlKTtcblx0XHRcdFx0XHRzdGF0ZS5yb3V0ZS5pbnNlcnQoc3RhdGVMb2NhdGlvbiwgaSk7XG5cdCAgICAgIFx0fVxuXHQgICAgICB9XG4gICAgICBcdGNoZWNrZXIrKztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSk7XG5cbi8vIE9wdGlvbnMgb2JqZWN0IHRoYXQgd2lsbCBiZSBmZWQgaW50byB0aGUgR29vZ2xlIFBsYWNlcyBBUEkgY2FsbC5cbnZhciBvcHRpb25zID0ge1xuICBjb21wb25lbnRSZXN0cmljdGlvbnM6IHtjb3VudHJ5OiAndXMnfVxufTtcblxuLy8gVmFyaWFibGVzIGZvciB0aGUgbmV3IHNlY3Rpb25zIHdpdGhpbiB0aGUgI2Rlc3RpbmF0aW9ucyBjb250YWluZXIgZm9yIHRoZSBzb3J0aW5nIGFuZCBmb3IgdGhlIGJ1dHRvbi9uZXcgaW5wdXRzLlxudmFyIGlucHV0U2VjdGlvbiA9ICQoXCI8ZGl2PlwiKTtcbnZhciBidXR0b25TZWN0aW9uID0gJCgnPGRpdiBjbGFzcz1cInJvdXRlLWJ0bi1jb250YWluZXJcIj4nKTtcblxuLy8gQXBwbGllcyB0aGUgXCJzb3J0YWJsZVwiIGNsYXNzIHRvIHRoZSBpbnB1dFNlY3Rpb24gYXJlYSBzbyBvbmx5IHRoYXQgc2VjdGlvbiBjYW4gYmUgc29ydGVkLlxuaW5wdXRTZWN0aW9uLmF0dHIoXCJjbGFzc1wiLCBcInNvcnRhYmxlXCIpO1xuXG4vLyBBcHBlbmRpbmcgdGhlIG5ldyBkaXZzIHRvIHRoZSAjZGVzdGluYXRpb24gc2VjdGlvbi5cbiQoXCIjZGVzdGluYXRpb25zXCIpLmFwcGVuZChpbnB1dFNlY3Rpb24pO1xuJChcIiNkZXN0aW5hdGlvbnNcIikuYXBwZW5kKGJ1dHRvblNlY3Rpb24pO1xuXG4vLyBPbiBwYWdlIGxvYWQsIGNhbGxzIHRoZSBuZXdJbnB1dEZpZWxkIGZ1bmN0aW9uIHRvIGxvYWQgYSBcIlN0YXJ0aW5nIExvY2F0aW9uXCIgaW5wdXQgZmllbGQuXG5uZXdJbnB1dEZpZWxkKCk7XG5cbi8vIEZ1bmN0aW9uIHRvIHVwZGF0ZSB0aGUgc3RhdGUgb2JqZWN0IHdoZW4gc29tZXRoaW5nIHdpdGhpbiB0aGUgb2JqZWN0IGlzIGNoYW5nZWQuXG5zdGF0ZS5yb3V0ZS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoZSl7XG5cdHZhciBwYXRoID0gZS52YWw7XG5cdC8vIFJlc2V0cyB0aGUgaW5wdXQgYW5kIGJ1dHRvbiBTZWN0aW9uIGRpdnMgdG8gYXZvaWQgZHVwbGljYXRpb25zLlxuXHRpbnB1dFNlY3Rpb24uZW1wdHkoKTtcblx0YnV0dG9uU2VjdGlvbi5lbXB0eSgpO1xuXHQvLyBJZiBhbGwgZGVzdGluYXRpb25zIGhhdmUgYmVlbiByZW1vdmVkLCBjYWxscyB0aGUgbmV3SW5wdXRGaWVsZCBmdW5jdGlvbiB0byByZS1hZGQgXCJTdGFydGluZyBMb2NhdGlvblwiIGlucHV0IGZpZWxkLlxuXHRpZiAocGF0aC5sZW5ndGggPT0gMCkge1xuXHRcdG5ld0lucHV0RmllbGQoKTtcblx0fSBlbHNlIHtcblx0XHQvLyBQb3B1bGF0ZXMgdGhlIGRlc3RpbmF0aW9ucyBzZWN0aW9uIHdpdGggdGhlIGxvY2F0aW9ucyBzdG9yZWQgaW4gdGhlIHN0YXRlIG9iamVjdC5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGUudmFsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgbG9jYXRpb24gPSBlLnZhbFtpXTtcblx0XHRcdGxldCBuZXdJbnB1dDtcblx0XHRcdHZhciBpbnB1dENvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcblx0XHRcdC8vIEFkZHMgdWktc3RhdGUtZGVmYXVsdCBjbGFzcyB0byBhbGxvdyBpbnB1dCBib3hlcyB0byBiZSBzb3J0YWJsZSB2aWEganF1ZXJ5LnVpLlxuXHRcdFx0aW5wdXRDb250YWluZXIuYXR0cihcImNsYXNzXCIsIFwicm93IGlucHV0Q29udGFpbmVyIHVpLXN0YXRlLWRlZmF1bHRcIik7XG5cdFx0XHQvLyBTdG9yZXMgZGF0YSBudW1iZXIgaW4gdGhlIGlucHV0Q29udGFpbmVyIGZvciBtYW5pcHVsYXRpb24gaW4gdGhlIHNvcnRhYmxlIGZ1bmN0aW9uLlxuXHRcdFx0aW5wdXRDb250YWluZXIuYXR0cihcImRhdGEtbnVtYmVyXCIsIGkpO1xuXHRcdFx0Ly8gQ3JlYXRlcyBhIGNsZWFuIHZpZXcgb2YgR29vZ2xlIEFkZHJlc3MgZnJvbSB0aGUgUGxhY2VzIG5hbWUgYW5kIGFkZHJlc3Mgc3RvcmVkIGluIHRoZSBzdGF0ZSBvYmplY3QuXG5cdFx0XHRpZiAobG9jYXRpb24udHlwZSA9PSBcInBsYWNlXCIpIHtcblx0XHRcdFx0bmV3SW5wdXQgPSAkKFwiPGlucHV0PlwiKS52YWwobG9jYXRpb24uZGF0YS5uYW1lICsgJyAoJyArIGxvY2F0aW9uLmRhdGEuZm9ybWF0dGVkX2FkZHJlc3MgKyAnKScpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQ3JlYXRlcyBhIGNsZWFuIHZpZXcgb2YgdGhlIEdvb2dsZSBBZGRyZXNzIGZyb20gdGhlIHJlY3JlYXRpb24gbGlzdCBpbiBjYXNlIHRoYXQgaXMgdGhlIGZpZWxkIHR5cGUgc3RvcmVkIGluIHRoZSBzdGF0ZSBvYmplY3QuXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bmV3SW5wdXQgPSAkKFwiPGlucHV0PlwiKS52YWwobG9jYXRpb24uZGF0YS5SZWNBcmVhTmFtZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBBZGRzIGFuZCBhcHBlbmRzIGFsbCBjbGFzc2VzLCBidXR0b25zLCBhbmQgZnVuY3Rpb25zIGluc2lkZSB0aGUgaW5wdXRDb250YWluZXIuXG5cdFx0XHRuZXdJbnB1dC5hdHRyKFwiY2xhc3NcIiwgXCJjb2wgczEwIG0xMCBsMTAgcm91dGUtY2hvaWNlXCIpO1xuXHRcdFx0bGV0IGNsb3NlSW5wdXQgPSBcIjxpIGNsYXNzPSdtYXRlcmlhbC1pY29ucyBjbG9zZS1pY29uJz5jbG9zZTwvaT5cIjtcblx0XHRcdGxldCBtb3ZlSW5wdXQgPSBcIjxpIGNsYXNzPSdtYXRlcmlhbC1pY29ucyBtb3ZlLWljb24nPmRlaGF6ZTwvaT5cIjtcblx0XHRcdGxldCBjbG9zZUlucHV0RGl2ID0gJChcIjxkaXYgY2xhc3M9J2NvbCBzMSBtMSBsMSBjbG9zZUlucHV0RGl2Jz5cIik7XG5cdFx0XHRsZXQgbW92ZUlucHV0RGl2ID0gJChcIjxkaXYgY2xhc3M9J2NvbCBzMSBtMSBsMSBtb3ZlSW5wdXREaXYnPlwiKTtcblx0XHRcdG1vdmVJbnB1dERpdi5hcHBlbmQobW92ZUlucHV0KTtcblx0XHRcdGlucHV0Q29udGFpbmVyLmFwcGVuZChtb3ZlSW5wdXREaXYpO1xuXHRcdFx0aW5wdXRDb250YWluZXIuYXBwZW5kKG5ld0lucHV0KTtcblx0XHRcdGNsb3NlSW5wdXREaXYuYXBwZW5kKGNsb3NlSW5wdXQpO1xuXHRcdFx0aW5wdXRDb250YWluZXIuYXBwZW5kKGNsb3NlSW5wdXREaXYpO1xuXHRcdFx0Ly8gRnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBpbnB1dENvbnRhaW5lciBpZiB0aGUgY2xvc2UgKFgpIGJ1dHRvbiBpcyBwcmVzc2VkLlx0XHRcdFxuXHRcdFx0Y2xvc2VJbnB1dERpdi5jbGljayhmdW5jdGlvbigpe1xuXHRcdFx0XHRpZiAobG9jYXRpb24udHlwZSA9PT0gXCJyZWNhcmVhXCIpe1xuXHRcdFx0IFx0XHRzdGF0ZS5yb3V0ZS5wYXRoW2ldLmRhdGEuc2V0SW5Sb3V0ZShmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dG9vbHRpcC5tb3VzZWxlYXZlKCk7XG5cdFx0XHRcdHRvb2x0aXAuZGV0YWNoKCk7XG5cdFx0XHQgXHRzdGF0ZS5yb3V0ZS5yZW1vdmUoaSk7XG5cdFx0XHR9KTtcblx0XHRcdC8vIEZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgaW5wdXRDb250YWluZXIgaWYgdGhlIHVzZXIgZm9jdXNlcyBvdXQgb2YgdGhlIGlucHV0IHdoaWxlIGl0IGlzIGJsYW5rLlx0XHRcdFxuXHRcdFx0bmV3SW5wdXQuZm9jdXNvdXQoZnVuY3Rpb24oKXtcblx0XHRcdCBcdGlmIChuZXdJbnB1dC52YWwoKSA9PSBcIlwiKXtcblx0XHRcdCBcdFx0aWYgKGxvY2F0aW9uLnR5cGUgPT09IFwicmVjYXJlYVwiKXtcblx0XHRcdCBcdFx0XHRzdGF0ZS5yb3V0ZS5wYXRoW2ldLmRhdGEuc2V0SW5Sb3V0ZShmYWxzZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRvb2x0aXAubW91c2VsZWF2ZSgpO1xuXHRcdFx0XHRcdHRvb2x0aXAuZGV0YWNoKCk7XG5cdFx0XHQgXHRcdHN0YXRlLnJvdXRlLnJlbW92ZShpKTtcblx0XHRcdCBcdH1cblx0XHRcdH0pO1xuXHRcdFx0Ly8gRnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBpbnB1dENvbnRhaW5lciBpZiBlbnRlciBpcyBwcmVzc2VkIHdoaWxlIHRoZSBpbnB1dCBpcyBibGFuay5cblx0XHRcdG5ld0lucHV0LmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdGlmIChlLndoaWNoID09PSAxMyAmJiBuZXdJbnB1dC52YWwoKSA9PSBcIlwiKXtcblx0XHRcdCBcdFx0aWYgKGxvY2F0aW9uLnR5cGUgPT09IFwicmVjYXJlYVwiKXtcblx0XHRcdCBcdFx0XHRzdGF0ZS5yb3V0ZS5wYXRoW2ldLmRhdGEuc2V0SW5Sb3V0ZShmYWxzZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRvb2x0aXAubW91c2VsZWF2ZSgpO1xuXHRcdFx0XHRcdHRvb2x0aXAuZGV0YWNoKCk7XG5cdFx0XHRcdFx0c3RhdGUucm91dGUucmVtb3ZlKGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdC8vIEFkZHMgdGhlIGNvbXBsZXRlZCBpbnB1dENvbnRhaW5lciB0byB0aGUgaW5wdXRTZWN0aW9uLlxuXHRcdFx0aW5wdXRTZWN0aW9uLmFwcGVuZChpbnB1dENvbnRhaW5lcik7XG5cdFx0XHQvLyBTZW5kcyB0aGUgbmV3SW5wdXQsIGlucHV0Q29udGFpbmVyLCBidWxpYW4gdmFsdWUsIGFuZCBzdGF0ZSBwb3NpdGlvbiB0byB0aGUgYXV0b2ZpbGwgZnVuY3Rpb24uXG5cdFx0XHRhdXRvZmlsbChuZXdJbnB1dFswXSwgaW5wdXRDb250YWluZXIsIGZhbHNlLCBpKTtcblx0XHR9IFxuXHRcdC8vIENyZWF0ZXMgYW5kIGFwcGVuZHMgYnV0dG9ucyB0byB0aGUgYnV0dG9uU2VjdGlvbiB3aGVuIGEgY29tcGxldGVkIGlucHV0IGlzIGZpbGxlZCBpbi5cblx0XHRidXR0b25TZWN0aW9uLmFwcGVuZChcIjxkaXYgaWQ9J25ld2J1dHRvbnMnPlwiKTtcblx0XHQkKFwiI25ld2J1dHRvbnNcIikuYXBwZW5kKFwiPGEgY2xhc3M9J2J0bi1mbG9hdGluZyBidG4tc21hbGwgd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0JyBpZD0ncm91dGUtYWRkQnRuJz48aSBjbGFzcz0nbWF0ZXJpYWwtaWNvbnMnPmFkZDwvaT48L2E+XCIpO1xuXHRcdCQoXCIjbmV3YnV0dG9uc1wiKS5hcHBlbmQoXCI8cCBpZD0ncm91dGUtbmV3TG9jYXRpb25UZXh0Jz5BZGQgYSBOZXcgU3RvcDwvcD5cIik7XG5cdFx0JChcIiNyb3V0ZS1hZGRCdG5cIikuY2xpY2sobmV3SW5wdXRGaWVsZCk7XG5cdH1cbn0pO1xuXG4vLyBBcHBsaWVkIGF1dG9maWxsIGNvZGUgdG8gdGhlIG5ldyBpbnB1dCBmaWVsZHMgYW5kIHNlbmRzIGlucHV0IHRvIHN0YXRlIG9iamVjdC5cbi8vIFRha2VzIHRoZSBuZXdJbnB1dCwgaW5wdXRDb250YWluZXIsIGJ1bGlhbiB2YWx1ZSwgYW5kIHN0YXRlIHBvc3Rpb24gYXMgdmFyaWFibGUgaW4gdGhlIGF1dG9maWxsIGZ1bmN0aW9uLlxuLy8gVG9vbHRpcHMgaW5jbHVkZWQgZm9yIHVzZXIgZXJyb3IgaGFuZGxpbmcuXG5mdW5jdGlvbiBhdXRvZmlsbChpbnB1dCwgY29udGFpbmVyLCBhZGQsIGluZGV4KXtcblx0dmFyIGF1dG9jb21wbGV0ZSA9IG5ldyBnb29nbGUubWFwcy5wbGFjZXMuQXV0b2NvbXBsZXRlKGlucHV0LCBvcHRpb25zKTtcblx0Ly8gR29vZ2xlIFBsYWNlcyBmdW5jdGlvbiAtIHVzZXMgXCJhdXRvY29tcGxldGVcIiBwbGFjZWhvbGRlciBkZWZpbmVkIGluIGxpbmUgYWJvdmUuXG5cdGF1dG9jb21wbGV0ZS5hZGRMaXN0ZW5lcigncGxhY2VfY2hhbmdlZCcsIGZ1bmN0aW9uICgpe1xuXHRcdHZhciBwbGFjZSA9IGF1dG9jb21wbGV0ZS5nZXRQbGFjZSgpO1xuXHRcdGlmIChwbGFjZS5wbGFjZV9pZCl7XG5cdFx0XHRpZiAoYWRkKXtcblx0XHRcdFx0dG9vbHRpcC5tb3VzZWxlYXZlKCk7XG5cdFx0XHRcdHRvb2x0aXAuZGV0YWNoKCk7XG5cdFx0XHRcdHN0YXRlLnJvdXRlLmFkZChwbGFjZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dG9vbHRpcC5tb3VzZWxlYXZlKCk7XG5cdFx0XHRcdHRvb2x0aXAuZGV0YWNoKCk7XG5cdFx0XHRcdHN0YXRlLnJvdXRlLnJlbW92ZShpbmRleCwgdHJ1ZSk7XG5cdFx0XHRcdHN0YXRlLnJvdXRlLmluc2VydChwbGFjZSwgaW5kZXgpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAocGxhY2UubmFtZSAhPSBcIlwiKXtcblx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZCh0b29sdGlwKTtcblx0XHRcdFx0dG9vbHRpcC5tb3VzZWVudGVyKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cblxuLy8gR2V0IHRoZSBIVE1MIGlucHV0IGVsZW1lbnQgZm9yIHRoZSBhdXRvY29tcGxldGUgc2VhcmNoIGJveCBhbmQgY3JlYXRlIHRoZSBhdXRvY29tcGxldGUgb2JqZWN0LlxuZnVuY3Rpb24gbmV3SW5wdXRGaWVsZCgpIHtcblx0JChcIiNuZXdidXR0b25zXCIpLnJlbW92ZSgpO1xuXHR2YXIgaW5wdXRmaWVsZCA9ICQoXCI8aW5wdXQ+XCIpO1xuXHRidXR0b25TZWN0aW9uLmFwcGVuZChpbnB1dGZpZWxkKTtcblx0aW5wdXRmaWVsZC5hZGRDbGFzcyhcImRlc3RpbmF0aW9uLWlucHV0XCIpO1xuXHQvLyBDaGFuZ2VzIHRoZSBwbGFjZWhvbGRlciB2YWx1ZSB3aXRoaW4gdGhlIG5ldyBpbnB1dCBmaWVsZCBiYXNlZCBvbiB0aGUgbGVuZ3RoIG9mIHRoZSBzdGF0ZSBvYmplY3QuXG5cdGlmIChzdGF0ZS5yb3V0ZS5sb2NhdGlvbkNvdW50ID09IDApIHtcblx0XHRpbnB1dGZpZWxkLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBcIlN0YXJ0aW5nIExvY2F0aW9uOiBcIik7XG5cdH1cblx0ZWxzZSB7XG5cdFx0aW5wdXRmaWVsZC5hdHRyKFwicGxhY2Vob2xkZXJcIiwgXCJOZXh0IFN0b3A6IFwiKTtcblx0XHRpbnB1dGZpZWxkLmZvY3VzKCk7XG5cdH1cblx0YXV0b2ZpbGwoaW5wdXRmaWVsZFswXSwgYnV0dG9uU2VjdGlvbiwgdHJ1ZSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcm91dGUuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JvdXRlLmNzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9yb3V0ZS5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcm91dGUvcm91dGUuY3NzXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIucm91dGV7XFxuICAgYmFja2dyb3VuZDogbGlnaHRncmV5O1xcbn1cXG5cXG4jcm91dGUtYWRkQnRuIHtcXG5cXHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuXFx0bWFyZ2luLXJpZ2h0OiAxMHB4O1xcblxcdGhlaWdodDogMjVweDtcXG5cXHRwYWRkaW5nLXRvcDogMDtcXG5cXHR3aWR0aDogMjVweDtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjNmZiMzg0O1xcbn1cXG5cXG4uYnRuLWZsb2F0aW5nIGkge1xcblxcdGxpbmUtaGVpZ2h0OiAyNXB4XFxufVxcblxcbiNyb3V0ZS1uZXdMb2NhdGlvblRleHQge1xcblxcdGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG59XFxuXFxuLmlucHV0Q29udGFpbmVyIHtcXG5cXHRtYXJnaW4tdG9wOiAwcHg7XFxuXFx0bWFyZ2luLWJvdHRvbTogMHB4O1xcblxcdHBhZGRpbmctYm90dG9tOiAwcHg7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuXFx0cG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG4uaW5wdXRDb250YWluZXIgLnJvdXRlLWNob2ljZSB7XFxuXFx0bWFyZ2luLWJvdHRvbTogMHB4O1xcblxcdHBhZGRpbmctbGVmdDogMHB4O1xcblxcdHBhZGRpbmctcmlnaHQ6IDBweDtcXG59XFxuXFxuLmlucHV0Q29udGFpbmVyIC5tYXRlcmlhbC1pY29ucyB7XFxuXFx0Zm9udC1zaXplOiAyMHB4O1xcblxcdGNvbG9yOiBncmF5O1xcbn1cXG5cXG4uaW5wdXRDb250YWluZXIge1xcblxcdG1hcmdpbi1ib3R0b206IDBweDtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi5jbG9zZS1pY29uIHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0bGluZS1oZWlnaHQ6IDMxcHg7XFxuXFx0cmlnaHQ6IC0zcHg7XFxuXFx0Ym90dG9tOiA3cHg7XFxufVxcblxcbi5tb3ZlLWljb24ge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRsaW5lLWhlaWdodDogMzFweDtcXG5cXHRsZWZ0OiAwcHg7XFxuXFx0Ym90dG9tOiA3cHg7XFxufVxcblxcbi5pbnB1dENvbnRhaW5lciAuY2xvc2VJbnB1dERpdixcXG4uaW5wdXRDb250YWluZXIgLm1vdmVJbnB1dERpdiB7XFxuXFx0Y3Vyc29yOiBwb2ludGVyO1xcblxcdGhlaWdodDogNDBweDtcXG5cXHRwYWRkaW5nOiAwcHg7XFxufVxcblxcbiNkZXN0aW5hdGlvbnMge1xcblxcdHBhZGRpbmctbGVmdDogMTVweDtcXG5cXHRwYWRkaW5nLXJpZ2h0OiAxNXB4O1xcbn1cXG5cXG4udHJldm9ydG9hc3Qge1xcblxcdGZvbnQtc2l6ZTogMjRweDtcXG5cXHRwb3NpdGlvbjogZml4ZWQ7XFxuXFx0dG9wOiAxMDBweCAhaW1wb3J0YW50O1xcblxcdGxlZnQ6IDM4JTtcXG59XFxuXFxuLnJvdXRlLWJ0bi1jb250YWluZXJ7XFxuXFx0cG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG4ucm91dGUtdG9vbHRpcHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiAyMHB4O1xcblxcdHJpZ2h0OiAwO1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvcm91dGUvcm91dGUuY3NzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuaW1wb3J0IHtyZWNBcGlCeUlkfSBmcm9tICcuLi9yZWNyZWF0aW9uL2NvbnN0YW50cyc7XG5cbi8vaW50ZXJlc3RzXG5zdGF0ZS5pbnRlcmVzdHMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcbiAgIHZhciBpbnRlcmVzdHMgPSB7fTtcblxuICAgZS52YWwuc2VsZWN0ZWQuZm9yRWFjaChmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgaW50ZXJlc3RzW2ludGVyZXN0LmlkXSA9IHRydWU7XG4gICB9KTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbnRlcmVzdHMnLCBKU09OLnN0cmluZ2lmeShpbnRlcmVzdHMpKTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdoYXMtc3RvcmVkJywgJ3RydWUnKTtcbn0pO1xuXG4vL3JvdXRlXG5zdGF0ZS5yb3V0ZS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4gICB2YXIgbG9jYXRpb25zID0gZS52YWwubWFwKChsKSA9PiB7XG4gICAgICBpZihsLnR5cGUgPT09ICdwbGFjZScpe1xuICAgICAgICAgcmV0dXJue1xuICAgICAgICAgICAgdHlwZTogJ3BsYWNlJyxcbiAgICAgICAgICAgIHBsYWNlX2lkOiBsLmRhdGEucGxhY2VfaWQsXG4gICAgICAgICAgICBuYW1lOiBsLmRhdGEubmFtZSxcbiAgICAgICAgICAgIGZvcm1hdHRlZF9hZGRyZXNzOmwuZGF0YS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgIGxhdDogbC5kYXRhLmxhdCB8fCBsLmRhdGEuZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksXG4gICAgICAgICAgICBsbmc6IGwuZGF0YS5sbmcgfHwgbC5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpXG4gICAgICAgICB9O1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHR5cGU6ICdyZWNhcmVhJyxcbiAgICAgICAgICAgIGlkOiBsLmRhdGEuaWQsXG4gICAgICAgICAgICBSZWNBcmVhTmFtZTogbC5kYXRhLlJlY0FyZWFOYW1lLFxuICAgICAgICAgICAgUmVjQXJlYUxhdGl0dWRlOiBsLmRhdGEuUmVjQXJlYUxhdGl0dWRlLFxuICAgICAgICAgICAgUmVjQXJlYUxvbmdpdHVkZTogbC5kYXRhLlJlY0FyZWFMb25naXR1ZGVcbiAgICAgICAgIH07XG4gICAgICB9XG4gICB9KTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyb3V0ZScsIEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucykpO1xuICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hhcy1zdG9yZWQnLCAndHJ1ZScpO1xufSlcblxuLy9ib29rbWFya3NcbnN0YXRlLnJlY3JlYXRpb24uYm9va21hcmtlZC5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4gICB2YXIgYm9va21hcmtlZCA9IGUudmFsLm1hcCgocikgPT4ge1xuICAgICAgICAgcmV0dXJuIHIuaWQ7XG4gICB9KTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdib29rbWFya2VkJywgSlNPTi5zdHJpbmdpZnkoYm9va21hcmtlZCkpO1xuICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hhcy1zdG9yZWQnLCAndHJ1ZScpO1xufSlcblxuZnVuY3Rpb24gcmVzZXRTdG9yYWdlKCl7XG4gICBoYXNMb2FkZWQgPSB0cnVlO1xuICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hhcy1zdG9yZWQnLCBudWxsKTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdib29rbWFya2VkJywgbnVsbCk7XG4gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncm91dGUnLCBudWxsKTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbnRlcmVzdHMnLCBudWxsKTtcbiAgICQoJyNzdG9yYWdlLW1vZGFsJykubW9kYWwoJ2Nsb3NlJyk7XG59XG5cbmZ1bmN0aW9uIGxvYWRTdG9yYWdlKCl7XG4gICBpZihoYXNMb2FkZWQpIHJldHVybjtcbiAgIHZhciBpbnRlcmVzdHMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbnRlcmVzdHMnKSkgfHwge307XG4gICBzdGF0ZS5pbnRlcmVzdHMuYWxsLmZvckVhY2goKGEpID0+IHtcbiAgICAgIGlmKGludGVyZXN0c1thLmlkXSl7XG4gICAgICAgICBhLnVwZGF0ZSh0cnVlLCB0cnVlKTtcbiAgICAgIH1cbiAgIH0pO1xuICAgc3RhdGUuaW50ZXJlc3RzLmVtaXQoJ2NoYW5nZScpO1xuXG4gICB2YXIgcm91dGUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyb3V0ZScpKSB8fCBbXTtcbiAgIHZhciByb3V0ZUFyciA9IFtdO1xuICAgbGV0IHJlcXVlc3RDb3VudCA9IDA7XG4gICB2YXIgcm91dGVDYWxsYmFjayA9IGZ1bmN0aW9uKGluZGV4LCByZXNwb25zZSl7XG4gICAgICByZXF1ZXN0Q291bnQgLT0gMTtcbiAgICAgIGlmKHJlc3BvbnNlLlJlY0FyZWFJRCl7XG4gICAgICAgICBzdGF0ZS5yZWNyZWF0aW9uLmFsbC5hZGREYXRhKHJlc3BvbnNlKTtcbiAgICAgICAgIGxldCBhcmVhID0gc3RhdGUucmVjcmVhdGlvbi5hbGwuUkVDREFUQS5maW5kKChyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gci5pZCA9PSByZXNwb25zZS5SZWNBcmVhSUQ7XG4gICAgICAgICB9KTtcbiAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZSh0cnVlKTtcbiAgICAgICAgIHJvdXRlQXJyW2luZGV4XSA9IHN0YXRlLnJvdXRlLmdldExvY2F0aW9uT2JqZWN0KGFyZWEpO1xuICAgICAgfVxuICAgICAgaWYocmVxdWVzdENvdW50ID09PSAwKXtcbiAgICAgICAgIHN0YXRlLnJvdXRlLnNldERhdGEocm91dGVBcnIpO1xuICAgICAgfVxuICAgfVxuICAgcm91dGUuZm9yRWFjaCgobG9jYXRpb24sIGluZGV4KSA9PiB7XG4gICAgICBpZihsb2NhdGlvbi50eXBlID09PSAncGxhY2UnKXtcbiAgICAgICAgIHJvdXRlQXJyW2luZGV4XSA9IHN0YXRlLnJvdXRlLmdldExvY2F0aW9uT2JqZWN0KGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICByZXF1ZXN0Q291bnQgKz0gMTtcbiAgICAgICAgIHJlY0FwaUJ5SWQobG9jYXRpb24uaWQsIHJvdXRlQ2FsbGJhY2suYmluZChudWxsLCBpbmRleCkpO1xuICAgICAgfVxuICAgfSk7XG4gICBpZihyZXF1ZXN0Q291bnQgPT09IDApe1xuICAgICAgICAgc3RhdGUucm91dGUuc2V0RGF0YShyb3V0ZUFycik7XG4gICB9XG59XG5cbmZ1bmN0aW9uIGdldEJvb2ttYXJrcygpe1xuICAgaWYoaGFzTG9hZGVkKSByZXR1cm47XG4gICBoYXNMb2FkZWQgPSB0cnVlO1xuICAgJCgnI3N0b3JhZ2UtbW9kYWwnKS5tb2RhbCgnY2xvc2UnKTtcbiAgIGxldCByZXF1ZXN0Q291bnQgPSAwO1xuICAgdmFyIGJvb2ttYXJrZWQgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdib29rbWFya2VkJykpIHx8IFtdO1xuICAgdmFyIGJvb2ttYXJrQ2FsbGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICByZXF1ZXN0Q291bnQgLT0gMTtcbiAgICAgIGlmKHJlc3BvbnNlLlJlY0FyZWFJRCl7XG4gICAgICAgICBzdGF0ZS5yZWNyZWF0aW9uLmFsbC5hZGREYXRhKHJlc3BvbnNlKTtcbiAgICAgICAgIHN0YXRlLnJlY3JlYXRpb24uYWRkQm9va21hcmsoc3RhdGUucmVjcmVhdGlvbi5hbGwuUkVDREFUQS5maW5kKChyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gci5pZCA9PSByZXNwb25zZS5SZWNBcmVhSUQ7XG4gICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICBpZihyZXF1ZXN0Q291bnQgPT09IDApe1xuICAgICAgICAgLy9uZWVkIHRvIHdhaXQgZm9yIGRpcmVjdGlvbnMgdG8gbG9hZFxuICAgICAgICAgc3RhdGUucmVjcmVhdGlvbi5maWx0ZXJBbGwoKTtcbiAgICAgIH1cbiAgIH1cbiAgIGJvb2ttYXJrZWQuZm9yRWFjaCgoYikgPT4ge1xuICAgICAgcmVxdWVzdENvdW50ICs9IDE7XG4gICAgICByZWNBcGlCeUlkKGIsIGJvb2ttYXJrQ2FsbGJhY2spO1xuICAgfSk7XG59XG5cbi8vbWFrZSBzdXJlIHRoaXMgaXMgc2V0IGZhbHNlIGlmIHRoZXkgY2hvb3NlIG5vdCB0byBsb2FkIHN0b3JhZ2UhXG52YXIgaGFzU3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdoYXMtc3RvcmVkJykgPT09ICd0cnVlJztcbnZhciBoYXNMb2FkZWQgPSBmYWxzZTtcbmlmKCBoYXNTdG9yYWdlKXtcbiAgIHN0YXRlLm1hcC5kaXJlY3Rpb25zLm9uKCdjaGFuZ2UnLCBnZXRCb29rbWFya3MpO1xufVxuXG53aW5kb3cubG9hZFN0b3JhZ2UgPSBsb2FkU3RvcmFnZTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcbiAgICQoJyNzdG9yYWdlLW1vZGFsJykubW9kYWwoe1xuICAgICAgZGlzbWlzc2libGU6IGZhbHNlLFxuICAgICAgaW5EdXJhdGlvbjogMzAwLFxuICAgICAgc3RhcnRpbmdUb3A6ICc0MCUnLCAvLyBTdGFydGluZyB0b3Agc3R5bGUgYXR0cmlidXRlXG4gICAgICBlbmRpbmdUb3A6ICcxMCUnXG4gICB9KTtcbiAgIGlmKGhhc1N0b3JhZ2Upe1xuICAgICAgJCgnI3N0b3JhZ2UtbW9kYWwnKS5tb2RhbCgnb3BlbicpO1xuICAgICAgJCgnI25ldy1zZXNzaW9uJykuY2xpY2socmVzZXRTdG9yYWdlKTtcbiAgICAgICQoJyNjb250aW51ZS1zZXNzaW9uJykuY2xpY2sobG9hZFN0b3JhZ2UpO1xuICAgfVxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2xvY2Fsc3RvcmFnZS9sb2NhbHN0b3JhZ2UuanNcbi8vIG1vZHVsZSBpZCA9IDI2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9sb2FkZWRjaXJjbGVzJztcbmltcG9ydCBzb25nIGZyb20gJy4vZmluYWxlLm1wMyc7XG5pbXBvcnQgYWlyaG9ybiBmcm9tICcuL2Fpcmhvcm4ubXAzJztcbmltcG9ydCAnLi9maW5hbGUuY3NzJztcblxuY29uc3QgY3R4ID0gbmV3IChBdWRpb0NvbnRleHQgfHwgd2Via2l0QXVkaW9Db250ZXh0KSgpO1xuY29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oKTtcbmNvbnN0IHNvdXJjZSA9IGN0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UoYXVkaW8pO1xuXG5cbiB2YXIgYnVmZmVyID0gbnVsbDtcblxuIC8vaWYgYnJvd3NlciBzdXBwb3J0cyB3ZWIgYXVkaW8sIGNyZWF0ZSBhIG5ldyBhdWRpbyBjb250ZXh0XG4gLy9hbmQgbG9hZCB0aGUgYnV0dG9uIHRhcCBzb3VuZCBcblxuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIGFpcmhvcm4sIHRydWUpO1xuXG4gIC8vd2hlbiByZXF1ZXN0IHJldHVybnMgc3VjY2Vzc2Z1bGx5LCBzdG9yZSBhdWRpbyBmaWxlIFxuICAvL2FzIGFuIGFycmF5IGJ1ZmZlciBcbiAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgYXVkaW9EYXRhID0gcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIGN0eC5kZWNvZGVBdWRpb0RhdGEoYXVkaW9EYXRhLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICBidWZmZXIgPSBkYXRhO1xuICAgICAgfSk7XG4gIH1cbiBcblxuIC8vcGxheSB0YXAgc291bmQgaWYgd2ViIGF1ZGlvIGV4aXN0cyBhbmQgc291bmQgd2FzIGxvYWRlZCBjb3JyZWN0bHlcbiB2YXIgaG9ybjtcbiBmdW5jdGlvbiBwbGF5SG9ybigpe1xuICAgICBpZiAoYnVmZmVyICE9PSBudWxsKXtcbiAgICAgICAgIGhvcm4gPSBjdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgICBob3JuLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgIGhvcm4uY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xuICAgICAgICAgaG9ybi5zdGFydChjdHguY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgICAgICQoJyNob25raG9uaycpLmFkZENsYXNzKCdzaGFrZScpO1xuICAgICB9XG4gfVxuIGZ1bmN0aW9uIHN0b3BIb3JuKCl7XG4gICBpZihob3JuKXtcbiAgICAgIGhvcm4uc3RvcCgpO1xuICAgICAgJCgnI2hvbmtob25rJykucmVtb3ZlQ2xhc3MoJ3NoYWtlJyk7XG4gICB9XG59XG5cbnZhciB3aG9sZUNvbnRhaW5lcjtcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gIHJlcXVlc3Quc2VuZCgpO1xuICAgJCgnLm9vcHMnKS5jbGljayhwYXJ0eSk7XG4gICB3aG9sZUNvbnRhaW5lciA9ICQoJyN3aG9sZS1jb250YWluZXInKTtcbiAgIGF1ZGlvLnNyYyA9IHNvbmc7XG4gICBhdWRpby5sb2FkXG4gICAkKCcjaG9ua2hvbmsnKS5tb3VzZWRvd24ocGxheUhvcm4pO1xuICAgJCgnI2hvbmtob25rJykubW91c2V1cChzdG9wSG9ybik7XG59KVxuXG5mdW5jdGlvbiBwYXJ0eSgpe1xuICAgY29uc3QgYW5hbHlzZXIgPSBjdHguY3JlYXRlQW5hbHlzZXIoKTtcbiAgIGFuYWx5c2VyLmZmdFNpemUgPSAyMDQ4O1xuICAgYW5hbHlzZXIubWF4RGVjaWJlbHMgPSAwO1xuICAgYW5hbHlzZXIuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gMC44O1xuICAgY29uc3QgZGF0YUFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQpO1xuICAgd2luZG93LmFuYWx5c2VyID0gYW5hbHlzZXI7XG4gICB3aW5kb3cuZGF0YUFycmF5ID0gZGF0YUFycmF5O1xuICAgc291cmNlLmNvbm5lY3QoYW5hbHlzZXIpO1xuICAgYW5hbHlzZXIuY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xuICAgJCgnI3R1dG9yaWFsLW1vZGFsIC5tb2RhbC1jb250ZW50JykuY3NzKHtcbiAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zZm9ybSAxLjhzIGN1YmljLWJlemllciguNjMsLjAxLDEsLjQxKScsXG4gICAgICAndHJhbnNmb3JtJzogJ3JvdGF0ZVooMGRlZykgc2NhbGVYKDEpJyxcbiAgIH0pO1xuICAgJCgnI3R1dG9yaWFsLW1vZGFsJykuY3NzKCdvdmVyZmxvdycsICd2aXNpYmxlJyk7XG4gICB3aG9sZUNvbnRhaW5lci5jc3Moe1xuICAgICAgICd0cmFuc2Zvcm0tc3R5bGUnOiAncHJlc2VydmUtM2QnLFxuICAgICAgIHBlcnNwZWN0aXZlOiAnNTAwcHgnXG4gICAgfSk7XG4gICAkKCcjYWlyaG9ybi1jb250YWluZXInKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgJCgnI3RoYW5reW91LWNvbnRhaW5lcicpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG5cbiAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXlpbmcnLCBhbmltYXRlKTtcbiAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgJCgnI2Fpcmhvcm4tY29udGFpbmVyJykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiAgICAgICQoJyN0aGFua3lvdS1jb250YWluZXInKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuICAgfSk7XG5cblxuICAgYXVkaW8ucGxheSgpO1xuICAgZmlsdGVycygpO1xufVxuXG5mdW5jdGlvbiBhbmltYXRlKCl7XG4gICAkKCcjdHV0b3JpYWwtbW9kYWwgLm1vZGFsLWNvbnRlbnQnKS5jc3MoJ3RyYW5zZm9ybScsICdyb3RhdGVaKDM2MDBkZWcpIHNjYWxlWCgxKScpO1xufVxuXG5mdW5jdGlvbiBkcm9wKCl7XG4gICAkKCcjdHV0b3JpYWwtbW9kYWwnKS5tb2RhbCgnY2xvc2UnKTtcbiAgIHdob2xlQ29udGFpbmVyLmNzcyh7XG4gICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICdyZWJlY2NhcHVycGxlJyxcbiAgICAgICdtaW4taGVpZ2h0JzogJzEwMHZoJ1xuICAgfSk7XG4gICAkKCcjYWlyaG9ybi1jb250YWluZXInKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuICAgZG9GaWx0ZXIgPSB0cnVlO1xufVxuXG5cbmZ1bmN0aW9uIHJvdGF0ZSgpe1xuICAgd2hvbGVDb250YWluZXIuYWRkQ2xhc3MoJ2JpZy1yb3RhdGUnKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRSYW5kb21Qb3NpdGlvbihlbGVtZW50KXtcbiAgIGVsZW1lbnQuY3NzKHtcbiAgICAgICdwb3NpdGlvbic6ICdmaXhlZCcsXG4gICAgICAndG9wJzogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSArICd2aCcsXG4gICAgICAnbGVmdCc6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAndncnLFxuICAgICAgJ3dpZHRoJzogZWxlbWVudC53aWR0aCgpLFxuICAgICAgJ3otaW5kZXgnOiAnMTAwMCdcbiAgIH0pXG59XG5mdW5jdGlvbiBmbHkoKXtcbiAgICQoJy5zdWdnZXN0aW9uU3VtbWFyeScpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgIHNldFJhbmRvbVBvc2l0aW9uKCQoZWwpKTtcbiAgICAgICAgICQoZWwpLmFkZENsYXNzKCdzaG91bGQtcm90YXRlJyk7XG4gICAgICB9LCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2MDAwKSk7XG4gICB9KTtcbn1cblxuZnVuY3Rpb24gYm9iKCl7XG4gICAkKCcuY2hpcCcpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgIHNldFJhbmRvbVBvc2l0aW9uKCQoZWwpKTtcbiAgICAgICAgICQoZWwpLmFkZENsYXNzKCdzaG91bGQtYm9iJyk7XG4gICAgICB9LCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2MDAwKSk7XG4gICB9KVxufVxuXG52YXIgaGFzRHJvcHBlZCA9IGZhbHNlO1xudmFyIGhhc0Zsb3duID0gZmFsc2U7XG52YXIgaGFzQm9iYmVkID0gZmFsc2U7XG52YXIgaGFzU3B1biA9IGZhbHNlO1xuXG52YXIgaHVlID0gMDtcbnZhciBicmlnaHRuZXNzID0gMDtcbnZhciBjb250cmFzdCA9IDA7XG52YXIgZnJlc2hTdGFydCA9IHRydWU7XG52YXIgZG9GaWx0ZXIgPSBmYWxzZTtcbmZ1bmN0aW9uIGZpbHRlcnMoKXsgICBcbiAgIGlmKCFoYXNEcm9wcGVkICYmIGF1ZGlvLmN1cnJlbnRUaW1lID4gMS41KXtcbiAgICAgIGRyb3AoKTtcbiAgICAgIGhhc0Ryb3BwZWQgPSB0cnVlO1xuICAgfVxuICAgaWYoaGFzRHJvcHBlZCAmJiAhaGFzRmxvd24gJiYgYXVkaW8uY3VycmVudFRpbWUgPiA5KXtcbiAgICAgIGZseSgpO1xuICAgICAgaGFzRmxvd24gPSB0cnVlO1xuICAgfVxuICAgaWYoaGFzRmxvd24gJiYgIWhhc0JvYmJlZCAmJiBhdWRpby5jdXJyZW50VGltZSA+IDE3KXtcbiAgICAgIGJvYigpO1xuICAgICAgaGFzQm9iYmVkID0gdHJ1ZTtcbiAgIH1cbiAgIGlmKGhhc0JvYmJlZCAmJiAhaGFzU3B1biAmJiBhdWRpby5jdXJyZW50VGltZSA+IDI0LjUpe1xuICAgICAgcm90YXRlKCk7XG4gICAgICBoYXNTcHVuID0gdHJ1ZTtcbiAgIH1cbiAgIGlmKGRvRmlsdGVyKXtcbiAgICAgIGxldCBuZXdCcmlnaHRuZXNzO1xuICAgICAgbGV0IG5ld0NvbnRyYXN0O1xuICAgICAgYW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEoZGF0YUFycmF5KTtcbiAgICAgIG5ld0NvbnRyYXN0ID0gZGF0YUFycmF5WzJdO1xuICAgICAgbmV3QnJpZ2h0bmVzcyA9IGRhdGFBcnJheVswXTtcbiAgICAgIFxuICAgICAgaWYoZnJlc2hTdGFydCl7XG4gICAgICAgICBicmlnaHRuZXNzID0gbmV3QnJpZ2h0bmVzcztcbiAgICAgICAgIGNvbnRyYXN0ID0gbmV3Q29udHJhc3Q7XG4gICAgICAgICBmcmVzaFN0YXJ0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiggZmFsc2UgJiYgbmV3QnJpZ2h0bmVzcyA8IGJyaWdodG5lc3MgLSAxKXtcbiAgICAgICAgIGJyaWdodG5lc3MgPSBicmlnaHRuZXNzIC0gMTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICBicmlnaHRuZXNzID0gbmV3QnJpZ2h0bmVzcztcbiAgICAgIH1cbiAgICAgIGlmKCBmYWxzZSAmJiBuZXdDb250cmFzdCA8IGNvbnRyYXN0IC0gMSl7XG4gICAgICAgICBjb250cmFzdCA9IGNvbnRyYXN0IC0gMTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICBjb250cmFzdCA9IG5ld0NvbnRyYXN0O1xuICAgICAgfVxuICAgICAgdmFyIGIgPSAoYnJpZ2h0bmVzcyAtIDUwKSAvIDEwMCA7XG4gICAgICB2YXIgYyA9IGNvbnRyYXN0IC8gMTAwIDtcbiAgICAgIHdob2xlQ29udGFpbmVyLmNzcygnZmlsdGVyJywgYGludmVydCgxKSBodWUtcm90YXRlKCR7aHVlKyt9ZGVnKSBicmlnaHRuZXNzKCR7Yn0pIGNvbnRyYXN0KCR7MS41fSlgKTtcblxuICAgfVxuICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZpbHRlcnMpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9maW5hbGUvZmluYWxlLmpzXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuaW1wb3J0IG1hcCBmcm9tICcuLi9tYXAvbWFwY29uc3RhbnQnO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgdmFyIGNpcmNsZXMgPSBbXTtcbiAgIHZhciBzaG93biA9IGZhbHNlO1xuICAgJCgnLmJyYW5kLWxvZ28nKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgaWYoIHNob3duKXtcbiAgICAgICAgIGNpcmNsZXMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgICAgICAgYy5zZXRNYXAobnVsbCk7XG4gICAgICAgICB9KVxuICAgICAgICAgY2lyY2xlcyA9IFtdO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLmxvYWRlZFNlYXJjaENvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xuICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZCxcbiAgICAgICAgICAgICAgIHJhZGl1czogMTYwOTM0LFxuICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmVkJyxcbiAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjMzLFxuICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZWQnLFxuICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgIG1hcDogbWFwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNpcmNsZXMucHVzaChjaXJjbGUpO1xuICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBzaG93biA9ICFzaG93bjtcbiAgIH0pXG59KVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2xvYWRlZGNpcmNsZXMuanNcbi8vIG1vZHVsZSBpZCA9IDI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjI1MjBlMDQyMWRkNzM0ODVmOGNlOTc5ODc2MGU2OTA1Lm1wM1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZS5tcDNcbi8vIG1vZHVsZSBpZCA9IDI5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImM1Y2Q3ZmE1NWNkYzFhNzdmZTE5NTFlMTUxZDRmMzY5Lm1wM1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2Fpcmhvcm4ubXAzXG4vLyBtb2R1bGUgaWQgPSAzMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9maW5hbGUuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2ZpbmFsZS5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vZmluYWxlLmNzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9maW5hbGUvZmluYWxlLmNzc1xuLy8gbW9kdWxlIGlkID0gMzFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiXFxuIEBrZXlmcmFtZXMgc2hha2V7XFxuICAgMCUge1xcbiAgICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIDtcXG4gICB9XFxuICAgMjUlIHtcXG4gICAgIHRyYW5zZm9ybTogcm90YXRlWigxMGRlZyk7XFxuICAgfVxcbiAgIDUwJSB7XFxuICAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgO1xcbiAgIH1cXG4gICA3NSUge1xcbiAgICAgdHJhbnNmb3JtOiByb3RhdGVaKC0xMGRlZyk7XFxuICAgfVxcbiAgIDEwMCUge1xcbiAgICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIDtcXG4gICB9XFxuIH1cXG4gQGtleWZyYW1lcyBiaWdyb3RhdGV7XFxuICAgZnJvbSB7XFxuICAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgO1xcbiAgIH1cXG4gICB0byB7XFxuICAgICB0cmFuc2Zvcm06IHNjYWxlKDIpO1xcbiAgIH1cXG4gfVxcbiBAa2V5ZnJhbWVzIHJvdGF0ZXtcXG4gICBmcm9tIHtcXG4gICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTAwdncpIHRyYW5zbGF0ZVooLTEwMHB4KSByb3RhdGVYKDBkZWcpIHJvdGF0ZVkoMzYwZGVnKSByb3RhdGVaKDBkZWcpO1xcbiAgIH1cXG4gICB0byB7XFxuICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTAwdncpIHRyYW5zbGF0ZVooLTEwMHB4KSByb3RhdGVYKDM2MGRlZykgcm90YXRlWSgwZGVnKSByb3RhdGVaKDM2MGRlZyk7XFxuICAgfVxcbiB9XFxuIEBrZXlmcmFtZXMgYm9ie1xcbiAgIDAlIHtcXG4gICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgyMHZoKSB0cmFuc2xhdGVaKDIwMHB4KTtcXG4gICB9XFxuICAgNTAlIHtcXG4gICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjB2aCkgdHJhbnNsYXRlWigtMjAwcHgpO1xcbiAgIH1cXG4gICAxMDAlIHtcXG4gICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgyMHZoKSB0cmFuc2xhdGVaKDIwMHB4KTtcXG4gICB9XFxuIH1cXG5cXG4uc2hha2V7XFxuICAgYW5pbWF0aW9uLW5hbWU6IHNoYWtlO1xcbiAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGxpbmVhcjtcXG4gICBhbmltYXRpb24tZHVyYXRpb246IDAuMXM7XFxuICAgYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudDogaW5maW5pdGU7XFxufVxcbi5zaG91bGQtcm90YXRle1xcbiAgIGFuaW1hdGlvbi1uYW1lOiByb3RhdGU7XFxuICAgYW5pbWF0aW9uLWR1cmF0aW9uOiA0cztcXG4gICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBsaW5lYXI7XFxuICAgYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudDogaW5maW5pdGU7XFxuICAgYmFja2dyb3VuZC1jb2xvcjogbGltZTtcXG4gfVxcbiAuc2hvdWxkLWJvYntcXG4gICBhbmltYXRpb24tbmFtZTogYm9iO1xcbiAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMnM7XFxuICAgYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudDogaW5maW5pdGU7XFxuICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbiB9XFxuXFxuIC5iaWctcm90YXRle1xcbiAgIGFuaW1hdGlvbi1uYW1lOiBiaWdyb3RhdGU7XFxuICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAxNnM7XFxuICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogbGluZWFyO1xcbiAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlO1xcbiB9XFxuXFxuICNhaXJob3JuLWNvbnRhaW5lciwgI3RoYW5reW91LWNvbnRhaW5lcntcXG4gICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgdG9wOiAwO1xcbiAgIHJpZ2h0OiAwO1xcbiAgIGJvdHRvbTogMDtcXG4gICBsZWZ0OiAwO1xcbiAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICBjb2xvcjogI2ZmZjtcXG4gICBvcGFjaXR5OiAwO1xcbiB9XFxuXFxuICNhaXJob3JuLWNvbnRhaW5lciBidXR0b257XFxuICAgd2lkdGg6IGF1dG87XFxuICAgcGFkZGluZzogMWVtO1xcbiAgIGxpbmUtaGVpZ2h0OiAxO1xcbiB9XFxuXFxuXFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9maW5hbGUuY3NzXG4vLyBtb2R1bGUgaWQgPSAzMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9