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
               let closestIndex = 0;
               if(arr[0].status === 'ZERO_RESULTS'){
                  area.setInRoute(false);
                  Materialize.toast(
                     'Could not add recreation area to route. Try adding it manually.'
                  , 4000)
                  return;
               }
               let smallestDistance = arr[0].distance.value;
               for(let i = 1; i < arr.length; i++){
                  if( arr[i].distance.value < smallestDistance){
                     closestIndex = i;
                  }
               }
               //if it's closest to the starting location, 
               //insert it right after the starting location
               if(closestIndex === 0){
                  this.insert(areaLocation, 1);
               }
               //otherwise, if it's not closest to the final location...
               else if(closestIndex !== arr.length - 1){
                  //insert it between the location it's closest to and the 
                  //next/previous location (whichever is closer)
                  if( 
                     arr[closestIndex - 1].distance.value < 
                     arr[closestIndex + 1].distance.value
                  ){
                     this.insert(areaLocation, closestIndex);
                  }
                  else{
                     this.insert(areaLocation, closestIndex + 1);
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
                        response.rows[1].elements[arr.length - 1].distance.value
                     ){
                        this.insert(areaLocation, closestIndex);
                     }
                     else{
                        this.add(areaLocation);
                     }
                  }
                  //otherwise, insert it before the final destination
                  else{
                     this.insert(areaLocation, this.locationCount - 1);;
                  }

               }
            }
            else{
               area.setInRoute(false);
            }
         }.bind(this);
         __WEBPACK_IMPORTED_MODULE_3__map_distance__["a" /* default */].getDistanceMatrix({
            origins: [origin, destinations[destinations.length - 2]],
            destinations: destinations,
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
    console.log(recarea);

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
                console.log("Phone # is: " + isPhone);
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
            console.log("Add to the route");
        } else {
            $('#addToRouteBtn').text("Remove from Route");
            __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.removeFromRoute(recarea);
            console.log("Removed from route");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDQzODIzNGI2Mjk5NjA5ZmYyZmMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvc3RhdGUvc3RhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzcz8zYmM2Iiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjQXJlYURldGFpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY3JlYXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi91cmxzLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL21hcC9kaXN0YW5jZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL2Rpc3BsYXlSZWNBcmVhU3VnZ2VzdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9sb2FkQnV0dG9uLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3M/YWQ2OCIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2xheW91dC9sYXlvdXQuY3NzPzJmMzAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5jc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwLmNzcz8zNDY3Iiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL21hcC9tYXAuY3NzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmNzcz9lMDY1Iiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9sb2NhbHN0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9maW5hbGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2xvYWRlZGNpcmNsZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZS5tcDMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2Fpcmhvcm4ubXAzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9maW5hbGUuY3NzPzA2YzQiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM3RDhCO0FBQ0k7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLE1BQU0sNEJBQTRCLEtBQUs7QUFDcEU7QUFDQTtBQUNBLGdEQUFnRCxLQUFLO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQSw2QkFBNkIsTUFBTSw0QkFBNEIsS0FBSztBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBOztBQUVBLCtDQUErQztBQUMvQztBQUNBLGlEQUFpRCxLQUFLO0FBQ3REO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLGdCQUFnQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHNCQUFzQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEO0FBQ0EsNkI7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhHQUFrQyxzQkFBc0I7QUFDeEQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixpQkFBaUI7QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLGlDQUFpQyxVQUFVO0FBQzNDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLHVEQUF1RCxLQUFLO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDbEpEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7OztBQUdKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRCxNQUFNLGtCQUFrQixFQUFFLGFBQWEsSUFBSTs7QUFFdEc7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDbk1BO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxJQUFJO0FBQ0osQ0FBQyxDOzs7Ozs7QUM3QkQsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFO0FBQzVDLEM7Ozs7OztBQ3pCQTtBQUNBOzs7QUFHQTtBQUNBLDZDQUE4QyxTQUFTLGlDQUFpQyxNQUFNLFVBQVUsaUNBQWlDLE1BQU0sVUFBVSxpQ0FBaUMsTUFBTSxVQUFVLGtDQUFrQyxNQUFNLFdBQVcsaUNBQWlDLE1BQU0sSUFBSSx3QkFBd0IsV0FBVyxpQ0FBaUMsTUFBTSxTQUFTLDJCQUEyQixNQUFNLElBQUkscUJBQXFCLFdBQVcsb0dBQW9HLE1BQU0sU0FBUyxxR0FBcUcsTUFBTSxJQUFJLGtCQUFrQixTQUFTLHFEQUFxRCxNQUFNLFVBQVUsdURBQXVELE1BQU0sV0FBVyxxREFBcUQsTUFBTSxJQUFJLFdBQVcsMkJBQTJCLHVDQUF1Qyw4QkFBOEIseUNBQXlDLEdBQUcsaUJBQWlCLDRCQUE0Qiw0QkFBNEIsdUNBQXVDLHlDQUF5Qyw0QkFBNEIsSUFBSSxlQUFlLHlCQUF5Qiw0QkFBNEIseUNBQXlDLDJCQUEyQixJQUFJLGlCQUFpQiwrQkFBK0IsNkJBQTZCLHVDQUF1Qyx5Q0FBeUMsSUFBSSw2Q0FBNkMsd0JBQXdCLFlBQVksY0FBYyxlQUFlLGFBQWEsNkJBQTZCLHdCQUF3QixpQkFBaUIsZ0JBQWdCLElBQUksK0JBQStCLGlCQUFpQixrQkFBa0Isb0JBQW9CLElBQUk7O0FBRXJ6RCIsImZpbGUiOiJhcHAuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMDQzODIzNGI2Mjk5NjA5ZmYyZmMiLCJpbXBvcnQge3JldHJpZXZlU2luZ2xlUmVjQXJlYX0gZnJvbSAnLi4vcmVjcmVhdGlvbi9yZWNBcmVhRGV0YWlscyc7XG5pbXBvcnQge3JlY0FwaVF1ZXJ5LCBpbnRlcmVzdExpc3R9IGZyb20gJy4uL3JlY3JlYXRpb24vY29uc3RhbnRzJztcbmltcG9ydCBtYXAgZnJvbSAnLi4vbWFwL21hcGNvbnN0YW50JztcbmltcG9ydCBkaXN0YW5jZU1hdHJpeCBmcm9tICcuLi9tYXAvZGlzdGFuY2UnO1xuXG5jbGFzcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKGV2ZW50c0Fycil7XG4gICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHMgPSB7fTtcbiAgICAgIGV2ZW50c0Fyci5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgLy90aGlzIGFycmF5IHdpbGwgY29udGFpbiBjYWxsYmFjayBmdW5jdGlvbnNcbiAgICAgICAgIGV2ZW50c1tlXSA9IFtdO1xuICAgICAgfSk7XG4gICB9XG5cbiAgIC8vc2V0IGV2ZW50IGxpc3RlbmVyXG4gICBvbihldmVudCwgY2FsbGJhY2spe1xuICAgICAgaWYodGhpcy5ldmVudHNbZXZlbnRdID09IHVuZGVmaW5lZCl7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtldmVudH1cIiBldmVudCBkb2VzIG5vdCBleGlzdCBvbiAke3RoaXN9YClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IHRvIFwiJHt0aGlzfS5vbigpXCIgbXVzdCBiZSBhIGZ1bmN0aW9uLmApXG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgfVxuXG4gICAvL3RyaWdnZXIgZXZlbnQgbGlzdGVuZXJzIGZvciBnaXZlbiBldmVudFxuICAgZW1pdChldmVudCwgcHJldkV2ZW50ID0ge30pe1xuICAgICAgaWYodGhpcy5ldmVudHNbZXZlbnRdID09IHVuZGVmaW5lZCl7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtldmVudH1cIiBldmVudCBkb2VzIG5vdCBleGlzdCBvbiAke3RoaXN9YClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYoIXByZXZFdmVudC5zdG9wUHJvcGFnYXRpb24pe1xuICAgICAgICAgbGV0IGNhbGxiYWNrcyA9IHRoaXMuZXZlbnRzW2V2ZW50XTtcbiAgICAgICAgIGxldCBlID0gdGhpcy5tYWtlRXZlbnQoZXZlbnQpO1xuICAgICAgICAgLy9leGVjdXRlIGFsbCBjYWxsYmFja3NcbiAgICAgICAgIGNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgYyhlKTtcbiAgICAgICAgIH0pXG4gICAgICB9XG4gICB9XG5cbiAgIC8vcHJvdmlkZXMgZXZlbnQgb2JqZWN0IGZvciBldmVudCBsaXN0ZW5lcnM7IHNob3VsZCBiZSBvdmVyd3JpdHRlbiBieSBpbmhlcml0b3JcbiAgIG1ha2VFdmVudCgpe1xuICAgICAgY29uc29sZS53YXJuKGBObyBtYWtlRXZlbnQgbWV0aG9kIHNldCBvbiAke3RoaXN9YCk7XG4gICB9XG59XG5cblxuLyoqKioqKioqKioqKipcXCAgICBcbiAgIEludGVyZXN0cyAgICBcblxcKioqKioqKioqKioqKi9cbmNsYXNzIEludGVyZXN0IGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3RvcihpbnRlcmVzdCl7XG4gICAgICBzdXBlcihbJ2NoYW5nZSddKTtcbiAgICAgIHRoaXMubmFtZSA9IGludGVyZXN0LkFjdGl2aXR5TmFtZTtcbiAgICAgIHRoaXMuaWQgPSBpbnRlcmVzdC5BY3Rpdml0eUlEO1xuICAgICAgdGhpcy5pY29uSWQgPSBpbnRlcmVzdC5FbW9qaVxuXG4gICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuZXZlbnRTaG91bGRQcm9wYWdhdGUgPSB0cnVlO1xuXG4gICAgICB0aGlzLm1ha2VFdmVudCA9IHRoaXMubWFrZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICB0aGlzLnRvZ2dsZSA9IHRoaXMudG9nZ2xlLmJpbmQodGhpcyk7XG4gICB9XG4gICAvL3RvZ2dsZXMgc2VsZWN0ZWQgcHJvcGVydHlcbiAgIHRvZ2dsZSgpe1xuICAgICAgdGhpcy5zZWxlY3RlZCA9ICF0aGlzLnNlbGVjdGVkO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIHVwZGF0ZShzZWxlY3RlZCwgc3RvcFByb3BhZ2F0aW9uKXtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSBzZWxlY3RlZDtcbiAgICAgIGlmKHN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgIHRoaXMuZXZlbnRTaG91bGRQcm9wYWdhdGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB0aGlzLmV2ZW50U2hvdWxkUHJvcGFnYXRlID0gdHJ1ZTtcbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gXCJJbnRlcmVzdFwiO1xuICAgfVxuICAgbWFrZUV2ZW50KCl7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAgdmFsOiB0aGlzLnNlbGVjdGVkLCBcbiAgICAgICAgIHN0b3BQcm9wYWdhdGlvbjogIXRoaXMuZXZlbnRTaG91bGRQcm9wYWdhdGVcbiAgICAgIH07XG4gICB9XG59XG5cbmNsYXNzIEludGVyZXN0cyBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgLy9saXN0IGlzIGxpc3Qgb2YgaW50ZXJlc3RzLCB0byBiZSBwcm92aWRlZCBieSByZWNyZWF0aW9uIG1vZHVsZSBcbiAgIGNvbnN0cnVjdG9yKGxpc3Qpe1xuICAgICAgc3VwZXIoWydjaGFuZ2UnXSk7XG4gICAgICB0aGlzLmFsbCA9IGxpc3QubWFwKGZ1bmN0aW9uKGkpe1xuICAgICAgICAgbGV0IGludGVyZXN0ID0gbmV3IEludGVyZXN0KGkpO1xuICAgICAgICAgaW50ZXJlc3Qub24oJ2NoYW5nZScsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdjaGFuZ2UnKSk7XG4gICAgICAgICByZXR1cm4gaW50ZXJlc3Q7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICB0aGlzLm1ha2VFdmVudCA9IHRoaXMubWFrZUV2ZW50LmJpbmQodGhpcyk7XG4gICB9XG4gICBnZXQgc2VsZWN0ZWQoKXtcbiAgICAgIHJldHVybiB0aGlzLmFsbC5maWx0ZXIoZnVuY3Rpb24oaSl7XG4gICAgICAgICByZXR1cm4gaS5zZWxlY3RlZDtcbiAgICAgIH0pO1xuICAgfVxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiBcInN0YXRlLmludGVyZXN0c1wiO1xuICAgfVxuICAgbWFrZUV2ZW50KCl7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAgdmFsOiB7XG4gICAgICAgICAgICBhbGw6IHRoaXMuYWxsLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc2VsZWN0ZWRcbiAgICAgICAgIH1cbiAgICAgIH07XG4gICB9XG59XG5cblxuLyoqKioqKioqKioqKipcXCAgICBcbiAgICAgUm91dGUgICAgXG5cXCoqKioqKioqKioqKiovXG5jbGFzcyBMb2NhdGlvbntcbiAgIGNvbnN0cnVjdG9yKG9iamVjdCl7XG4gICAgICBpZiggb2JqZWN0Lmhhc093blByb3BlcnR5KCdSZWNBcmVhTmFtZScpKXtcbiAgICAgICAgICB0aGlzLnR5cGUgPSAncmVjYXJlYSc7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKG9iamVjdC5oYXNPd25Qcm9wZXJ0eSgncGxhY2VfaWQnKSl7XG4gICAgICAgICAvL2dvb2dsZSBwbGFjZXMgcGxhY2UuLi4gc29tZWhvdyB0ZXN0IGZvciBnb29nbGUgcGxhY2UgYW5kIFxuICAgICAgICAgLy90aHJvdyBlcnJvciBpZiBuZWl0aGVyIFxuICAgICAgICAgdGhpcy50eXBlID0gJ3BsYWNlJztcbiAgICAgIH1cbiAgICAgIC8vbWF5YmUgcmVtb3ZlIGFmdGVyIGRldlxuICAgICAgZWxzZXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvdmlkZWQgbG9jYXRpb24gaXMgbm90IGEgUGxhY2VSZXN1bHQgb3IgUmVjQXJlYScpO1xuICAgICAgfVxuICAgICAgdGhpcy5kYXRhID0gb2JqZWN0O1xuICAgfVxufVxuXG5jbGFzcyBSb3V0ZSBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoKXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5wYXRoID0gW107XG4gICAgICB0aGlzLnNob3VsZFpvb21NYXAgPSB0cnVlO1xuICAgfVxuICAgZ2V0IGxvY2F0aW9uQ291bnQoKXtcbiAgICAgIHJldHVybiB0aGlzLnBhdGgubGVuZ3RoO1xuICAgfVxuXG4gICBnZXQgb3JpZ2luKCl7XG4gICAgICByZXR1cm4gdGhpcy5jb252ZXJ0TG9jYXRpb25Gb3JHb29nbGUodGhpcy5wYXRoWzBdKTtcbiAgIH1cbiAgIGdldCB3YXlwb2ludHMoKXtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPCAzKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHJldHVybiB0aGlzLnBhdGguc2xpY2UoMSwgdGhpcy5sb2NhdGlvbkNvdW50IC0gMSkubWFwKChsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKGwpLFxuICAgICAgICAgICAgICAgc3RvcG92ZXI6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICB9KTtcbiAgICAgIH1cbiAgIH1cbiAgIGdldCBkZXN0aW5hdGlvbigpe1xuICAgICAgaWYoIHRoaXMubG9jYXRpb25Db3VudCA8IDIpe1xuICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKFxuICAgICAgICAgICAgdGhpcy5wYXRoW3RoaXMubG9jYXRpb25Db3VudCAtIDFdXG4gICAgICAgICApO1xuICAgICAgfVxuICAgfVxuXG4gICBjb252ZXJ0TG9jYXRpb25Gb3JHb29nbGUobG9jYXRpb24pe1xuICAgICAgaWYoIWxvY2F0aW9uKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSBpZihsb2NhdGlvbi50eXBlID09PSAncGxhY2UnKXtcbiAgICAgICAgIHJldHVybiB7cGxhY2VJZDogbG9jYXRpb24uZGF0YS5wbGFjZV9pZH07XG4gICAgICB9XG4gICAgICBlbHNlIGlmKGxvY2F0aW9uLnR5cGUgPT09ICdyZWNhcmVhJyl7XG4gICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGF0OiBsb2NhdGlvbi5kYXRhLlJlY0FyZWFMYXRpdHVkZSxcbiAgICAgICAgICAgIGxuZzogbG9jYXRpb24uZGF0YS5SZWNBcmVhTG9uZ2l0dWRlXG4gICAgICAgICB9XG4gICAgICB9XG4gICB9XG5cbiAgIGFkZChsb2NhdGlvbiwgZG9udEVtaXQpe1xuICAgICAgaWYgKCEobG9jYXRpb24gaW5zdGFuY2VvZiBMb2NhdGlvbikpe1xuICAgICAgICAgbG9jYXRpb24gPSBuZXcgTG9jYXRpb24obG9jYXRpb24pO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXRoLnB1c2gobG9jYXRpb24pO1xuICAgICAgaWYoICFkb250RW1pdClcbiAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG4gICBpbnNlcnQobG9jYXRpb24sIGluZGV4KXtcbiAgICAgIGlmICghKGxvY2F0aW9uIGluc3RhbmNlb2YgTG9jYXRpb24pKXtcbiAgICAgICAgIGxvY2F0aW9uID0gbmV3IExvY2F0aW9uKGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGF0aC5zcGxpY2UoaW5kZXgsIDAsIGxvY2F0aW9uKTtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG4gICByZW1vdmUoaW5kZXgsIGRvbnRFbWl0KXtcbiAgICAgIHRoaXMucGF0aC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgaWYoICFkb250RW1pdClcbiAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG4gICBpbnZlcnQoKXtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgIT09IDIpe1xuICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0NhbiBvbmx5IGludmVydCByb3V0ZSBpZiByb3V0ZS5wYXRoIGNvbnRhaW5zIGV4YWN0bHkgdHdvIGxvY2F0aW9ucydcbiAgICAgICAgICk7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgdGhpcy5wYXRoLnB1c2godGhpcy5wYXRoLnNoaWZ0KCkpO1xuICAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgIH1cbiAgIHNldERhdGEoYXJyKXtcbiAgICAgIHRoaXMucGF0aCA9IGFycjtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG5cbiAgIGdldExvY2F0aW9uT2JqZWN0KGxvY2F0aW9uKXtcbiAgICAgIHJldHVybiBuZXcgTG9jYXRpb24obG9jYXRpb24pO1xuICAgfVxuXG4gICBhZGRSZWNBcmVhKGFyZWEpe1xuICAgICAgdGhpcy5zaG91bGRab29tTWFwID0gZmFsc2U7XG4gICAgICB2YXIgYXJlYUxvY2F0aW9uID0gbmV3IExvY2F0aW9uKGFyZWEpO1xuICAgICAgaWYoIHRoaXMubG9jYXRpb25Db3VudCA9PT0gMCl7XG4gICAgICAgICB0aGlzLmFkZChhcmVhTG9jYXRpb24pO1xuICAgICAgfVxuICAgICAgaWYoIHRoaXMubG9jYXRpb25Db3VudCA8PSAxKXsgIFxuICAgICAgICAgbGV0IG9yaWdpbiA9IHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKGFyZWFMb2NhdGlvbik7XG4gICAgICAgICBsZXQgZGVzdGluYXRpb25zID0gW3RoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKHRoaXMucGF0aFswXSldXG4gICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzKXtcbiAgICAgICAgICAgIGlmKHN0YXR1cyA9PT0gJ09LJyl7XG4gICAgICAgICAgICAgICBpZihyZXNwb25zZS5yb3dzWzBdLmVsZW1lbnRzWzBdLnN0YXR1cyA9PT0gJ1pFUk9fUkVTVUxUUycpe1xuICAgICAgICAgICAgICAgICAgYXJlYS5zZXRJblJvdXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgIE1hdGVyaWFsaXplLnRvYXN0KFxuICAgICAgICAgICAgICAgICAgICAgJ0NvdWxkIG5vdCBhZGQgcmVjcmVhdGlvbiBhcmVhIHRvIHJvdXRlLiBUcnkgYWRkaW5nIGl0IG1hbnVhbGx5LidcbiAgICAgICAgICAgICAgICAgICwgNDAwMCk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgdGhpcy5hZGQoYXJlYUxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICAgZGlzdGFuY2VNYXRyaXguZ2V0RGlzdGFuY2VNYXRyaXgoe1xuICAgICAgICAgICAgb3JpZ2luczogW29yaWdpbl0sXG4gICAgICAgICAgICBkZXN0aW5hdGlvbnM6IGRlc3RpbmF0aW9ucyxcbiAgICAgICAgICAgIHRyYXZlbE1vZGU6ICdEUklWSU5HJ1xuICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiggdGhpcy5sb2NhdGlvbkNvdW50ID09PSAyKXtcbiAgICAgICAgIGlmKHRoaXMucGF0aFsxXS50eXBlID09PSAncGxhY2UnKXtcbiAgICAgICAgICAgIGxldCBvcmlnaW4gPSB0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZShhcmVhTG9jYXRpb24pO1xuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9ucyA9IFt0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZSh0aGlzLnBhdGhbMF0pXVxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cyl7XG4gICAgICAgICAgICAgICBpZihzdGF0dXMgPT09ICdPSycpe1xuICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Uucm93c1swXS5lbGVtZW50c1swXS5zdGF0dXMgPT09ICdaRVJPX1JFU1VMVFMnKXtcbiAgICAgICAgICAgICAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICBNYXRlcmlhbGl6ZS50b2FzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb3VsZCBub3QgYWRkIHJlY3JlYXRpb24gYXJlYSB0byByb3V0ZS4gVHJ5IGFkZGluZyBpdCBtYW51YWxseS4nXG4gICAgICAgICAgICAgICAgICAgICAsIDQwMDApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KGFyZWFMb2NhdGlvbiwgMSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgYXJlYS5zZXRJblJvdXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGRpc3RhbmNlTWF0cml4LmdldERpc3RhbmNlTWF0cml4KHtcbiAgICAgICAgICAgICAgIG9yaWdpbnM6IFtvcmlnaW5dLFxuICAgICAgICAgICAgICAgZGVzdGluYXRpb25zOiBkZXN0aW5hdGlvbnMsXG4gICAgICAgICAgICAgICB0cmF2ZWxNb2RlOiAnRFJJVklORydcbiAgICAgICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICAgICAgIH1cbiAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAvL2J1dCB3aGF0IGlmIHBhdGhbMF0gaXMgYSByZWNyZWF0aW9uIGFyZWE/P1xuICAgICAgICAgICAgbGV0IG9yaWdpbiA9IHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKHRoaXMucGF0aFswXSk7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb25zID0gW1xuICAgICAgICAgICAgICAgdGhpcy5jb252ZXJ0TG9jYXRpb25Gb3JHb29nbGUodGhpcy5wYXRoWzFdKSxcbiAgICAgICAgICAgICAgIHRoaXMuY29udmVydExvY2F0aW9uRm9yR29vZ2xlKGFyZWFMb2NhdGlvbilcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHJlc3BvbnNlLCBzdGF0dXMpe1xuICAgICAgICAgICAgICAgaWYoc3RhdHVzID09PSAnT0snKXtcbiAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLnJvd3NbMF0uZWxlbWVudHNbMV0uc3RhdHVzID09PSAnWkVST19SRVNVTFRTJyl7XG4gICAgICAgICAgICAgICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ291bGQgbm90IGFkZCByZWNyZWF0aW9uIGFyZWEgdG8gcm91dGUuIFRyeSBhZGRpbmcgaXQgbWFudWFsbHkuJ1xuICAgICAgICAgICAgICAgICAgICAgLCA0MDAwKTtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmKFxuICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uucm93c1swXS5lbGVtZW50c1swXS5kaXN0YW5jZS52YWx1ZSA+XG4gICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5yb3dzWzBdLmVsZW1lbnRzWzFdLmRpc3RhbmNlLnZhbHVlXG4gICAgICAgICAgICAgICAgICApe1xuICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnQoYXJlYUxvY2F0aW9uLCAxKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZChhcmVhTG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICBkaXN0YW5jZU1hdHJpeC5nZXREaXN0YW5jZU1hdHJpeCh7XG4gICAgICAgICAgICAgICBvcmlnaW5zOiBbb3JpZ2luXSxcbiAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uczogZGVzdGluYXRpb25zLFxuICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogJ0RSSVZJTkcnXG4gICAgICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgbGV0IGRlc3RpbmF0aW9ucyA9IHRoaXMucGF0aC5tYXAoKGwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRMb2NhdGlvbkZvckdvb2dsZShsKTtcbiAgICAgICAgIH0pXG4gICAgICAgICBsZXQgb3JpZ2luID0gdGhpcy5jb252ZXJ0TG9jYXRpb25Gb3JHb29nbGUoYXJlYUxvY2F0aW9uKTtcbiAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHJlc3BvbnNlLCBzdGF0dXMpe1xuICAgICAgICAgICAgaWYoc3RhdHVzID09PSAnT0snKXtcbiAgICAgICAgICAgICAgIGxldCBhcnIgPSByZXNwb25zZS5yb3dzWzBdLmVsZW1lbnRzO1xuICAgICAgICAgICAgICAgbGV0IGNsb3Nlc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICBpZihhcnJbMF0uc3RhdHVzID09PSAnWkVST19SRVNVTFRTJyl7XG4gICAgICAgICAgICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXG4gICAgICAgICAgICAgICAgICAgICAnQ291bGQgbm90IGFkZCByZWNyZWF0aW9uIGFyZWEgdG8gcm91dGUuIFRyeSBhZGRpbmcgaXQgbWFudWFsbHkuJ1xuICAgICAgICAgICAgICAgICAgLCA0MDAwKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgbGV0IHNtYWxsZXN0RGlzdGFuY2UgPSBhcnJbMF0uZGlzdGFuY2UudmFsdWU7XG4gICAgICAgICAgICAgICBmb3IobGV0IGkgPSAxOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgIGlmKCBhcnJbaV0uZGlzdGFuY2UudmFsdWUgPCBzbWFsbGVzdERpc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAvL2lmIGl0J3MgY2xvc2VzdCB0byB0aGUgc3RhcnRpbmcgbG9jYXRpb24sIFxuICAgICAgICAgICAgICAgLy9pbnNlcnQgaXQgcmlnaHQgYWZ0ZXIgdGhlIHN0YXJ0aW5nIGxvY2F0aW9uXG4gICAgICAgICAgICAgICBpZihjbG9zZXN0SW5kZXggPT09IDApe1xuICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnQoYXJlYUxvY2F0aW9uLCAxKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIC8vb3RoZXJ3aXNlLCBpZiBpdCdzIG5vdCBjbG9zZXN0IHRvIHRoZSBmaW5hbCBsb2NhdGlvbi4uLlxuICAgICAgICAgICAgICAgZWxzZSBpZihjbG9zZXN0SW5kZXggIT09IGFyci5sZW5ndGggLSAxKXtcbiAgICAgICAgICAgICAgICAgIC8vaW5zZXJ0IGl0IGJldHdlZW4gdGhlIGxvY2F0aW9uIGl0J3MgY2xvc2VzdCB0byBhbmQgdGhlIFxuICAgICAgICAgICAgICAgICAgLy9uZXh0L3ByZXZpb3VzIGxvY2F0aW9uICh3aGljaGV2ZXIgaXMgY2xvc2VyKVxuICAgICAgICAgICAgICAgICAgaWYoIFxuICAgICAgICAgICAgICAgICAgICAgYXJyW2Nsb3Nlc3RJbmRleCAtIDFdLmRpc3RhbmNlLnZhbHVlIDwgXG4gICAgICAgICAgICAgICAgICAgICBhcnJbY2xvc2VzdEluZGV4ICsgMV0uZGlzdGFuY2UudmFsdWVcbiAgICAgICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydChhcmVhTG9jYXRpb24sIGNsb3Nlc3RJbmRleCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnQoYXJlYUxvY2F0aW9uLCBjbG9zZXN0SW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIC8vb3RoZXJ3aXNlLCBpZiBpdCdzIGNsb3Nlc3QgdG8gdGhlIGxhc3QgbG9jYXRpb25cbiAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAvL2lmIHRoZSBsYXN0IGxvY2F0aW9uIGlzIGEgcmVjYXJlYSwgc2VlIGlmIHRoaXMgYXJlYVxuICAgICAgICAgICAgICAgICAgLy9zaG91bGQgYmUgYmV0d2VlbiB0aGUgbGFzdCBhbmQgc2Vjb25kIHRvIGxhc3QgbG9jYXRpb25zXG4gICAgICAgICAgICAgICAgICAvL29yIGFmdGVyIHRoZSBsYXN0IFxuICAgICAgICAgICAgICAgICAgaWYoIHRoaXMucGF0aFt0aGlzLmxvY2F0aW9uQ291bnQgLSAxXS50eXBlID09PSAncmVjYXJlYScpe1xuICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGlzIGFyZWEgYW5kIHRoZSBzZWNvbmQgdG8gbGFzdCBcbiAgICAgICAgICAgICAgICAgICAgIC8vbG9jYXRpb24gaXMgbGVzcyB0aGFuIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBzZWNvbmRcbiAgICAgICAgICAgICAgICAgICAgIC8vdG8gbGFzdCBsb2NhdGlvbiBhbmQgdGhlIGxhc3QgbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgIGlmKFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyW2Fyci5sZW5ndGggLSAyXS5kaXN0YW5jZS52YWx1ZSA8IFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uucm93c1sxXS5lbGVtZW50c1thcnIubGVuZ3RoIC0gMV0uZGlzdGFuY2UudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydChhcmVhTG9jYXRpb24sIGNsb3Nlc3RJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGQoYXJlYUxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8vb3RoZXJ3aXNlLCBpbnNlcnQgaXQgYmVmb3JlIHRoZSBmaW5hbCBkZXN0aW5hdGlvblxuICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KGFyZWFMb2NhdGlvbiwgdGhpcy5sb2NhdGlvbkNvdW50IC0gMSk7O1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgYXJlYS5zZXRJblJvdXRlKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgIGRpc3RhbmNlTWF0cml4LmdldERpc3RhbmNlTWF0cml4KHtcbiAgICAgICAgICAgIG9yaWdpbnM6IFtvcmlnaW4sIGRlc3RpbmF0aW9uc1tkZXN0aW5hdGlvbnMubGVuZ3RoIC0gMl1dLFxuICAgICAgICAgICAgZGVzdGluYXRpb25zOiBkZXN0aW5hdGlvbnMsXG4gICAgICAgICAgICB0cmF2ZWxNb2RlOiAnRFJJVklORydcbiAgICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgIH1cbiAgIHJlbW92ZVJlY0FyZWEoYXJlYSl7XG4gICAgICB0aGlzLnNob3VsZFpvb21NYXAgPSBmYWxzZTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnBhdGgubGVuZ3RoOyBpKyspe1xuICAgICAgICAgaWYodGhpcy5wYXRoW2ldLmRhdGEgPT09IGFyZWEpe1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoaSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgIH1cbiAgICAgIH07XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHRoaXMucGF0aH1cbiAgIH1cblxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnc3RhdGUucm91dGUnO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuICAgICAgTWFwICAgIFxuXFwqKioqKioqKioqKioqL1xuY2xhc3MgRGlyZWN0aW9ucyBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoKXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgLy9hcnJheSBvZiBjb29yZGluYXRlcyBhbG9uZyBkaXJlY3Rpb25zIHJvdXRlXG4gICAgICB0aGlzLnJvdXRlQ29vcmRzID0gW107XG4gICAgICAvL2FycmF5IG9mIGNvb3JkaW5hdGVzIHRoYXQgd2lsbCBiZSB1c2VkIGZvciByZWMgYXBpIGNhbGxzXG4gICAgICB0aGlzLnNlYXJjaENvb3JkcyA9IFtdO1xuICAgICAgdGhpcy5vcmlnaW4gPSBudWxsO1xuICAgfVxuXG4gICB1cGRhdGUocm91dGUpe1xuICAgICAgaWYocm91dGUgPT0gbnVsbCl7XG4gICAgICAgICB0aGlzLnJvdXRlQ29vcmRzID0gW107XG4gICAgICAgICB0aGlzLnNlYXJjaENvb3JkcyA9IFtdO1xuICAgICAgICAgdGhpcy5vcmlnaW4gPSBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSBpZighcm91dGUubGVncyl7XG4gICAgICAgICB0aGlzLnJvdXRlQ29vcmRzID0gW3JvdXRlXTtcbiAgICAgICAgIHRoaXMuc2VhcmNoQ29vcmRzID0gW3JvdXRlXTtcbiAgICAgICAgIHRoaXMub3JpZ2luID0gcm91dGU7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgdGhpcy5vcmlnaW4gPSByb3V0ZS5sZWdzWzBdLnN0YXJ0X2xvY2F0aW9uO1xuICAgICAgICAgdGhpcy5yb3V0ZUNvb3JkcyA9IHJvdXRlLm92ZXJ2aWV3X3BhdGg7XG5cbiAgICAgICAgIC8vcm91dGUgY29vcmRpbmF0ZXMgc2VwYXJhdGVkIGJ5IDEwMCBtaWxlc1xuICAgICAgICAgdGhpcy5zZWFyY2hDb29yZHMgPSB0aGlzLmdldENvb3Jkc0J5UmFkaXVzKDE2MDkzNCk7XG4gICAgICAgICBsZXQgZGlzdCA9IGdvb2dsZS5tYXBzLmdlb21ldHJ5LnNwaGVyaWNhbC5jb21wdXRlRGlzdGFuY2VCZXR3ZWVuKFxuICAgICAgICAgICAgdGhpcy5zZWFyY2hDb29yZHNbdGhpcy5zZWFyY2hDb29yZHMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICB0aGlzLnJvdXRlQ29vcmRzW3RoaXMucm91dGVDb29yZHMubGVuZ3RoIC0gMV1cbiAgICAgICAgICk7XG4gICAgICAgICBpZihkaXN0ID4gODA0NjcuMil7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvb3Jkcy5wdXNoKHRoaXMucm91dGVDb29yZHNbdGhpcy5yb3V0ZUNvb3Jkcy5sZW5ndGggLSAxXSk7XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuXG4gICBnZXRDb29yZHNCeVJhZGl1cyhyYWRpdXMpe1xuICAgICAgaWYoIXRoaXMucm91dGVDb29yZHMubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIHRoaXMucm91dGVDb29yZHMucmVkdWNlKChhcnIsIGNvb3JkKSA9PiB7XG4gICAgICAgICBsZXQgZGlzdGFuY2UgPSBnb29nbGUubWFwcy5nZW9tZXRyeS5zcGhlcmljYWwuY29tcHV0ZURpc3RhbmNlQmV0d2VlbihcbiAgICAgICAgICAgIGNvb3JkLCBhcnJbYXJyLmxlbmd0aCAtIDFdKTsgXG4gICAgICAgICBpZihkaXN0YW5jZSA+IHJhZGl1cyl7XG4gICAgICAgICAgICByZXR1cm4gYXJyLmNvbmNhdChbY29vcmRdKTtcbiAgICAgICAgIH1cbiAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICAgfVxuICAgICAgfSwgW3RoaXMub3JpZ2luXSk7XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHRoaXN9O1xuICAgfVxufVxuXG5jbGFzcyBNYXB7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgdGhpcy5kaXJlY3Rpb25zID0gbmV3IERpcmVjdGlvbnMoKTtcbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gJ3N0YXRlLm1hcCc7XG4gICB9XG59XG5cbi8qKioqKioqKioqKioqKlxcICAgIFxuICAgUmVjcmVhdGlvbiAgICBcblxcKioqKioqKioqKioqKiovXG5jb25zdCByZXF1aXJlZFByb3BzID0gW1xuICAgJ1JlY0FyZWFOYW1lJyxcbiAgICdSRUNBUkVBQUREUkVTUycsXG4gICAnRkFDSUxJVFknLFxuICAgJ09yZ1JlY0FyZWFJRCcsXG4gICAnR0VPSlNPTicsXG4gICAnTGFzdFVwZGF0ZWREYXRlJyxcbiAgICdFVkVOVCcsXG4gICAnT1JHQU5JWkFUSU9OJyxcbiAgICdSZWNBcmVhRW1haWwnLFxuICAgJ1JlY0FyZWFSZXNlcnZhdGlvblVSTCcsXG4gICAnUmVjQXJlYUxvbmdpdHVkZScsXG4gICAnUmVjQXJlYUlEJyxcbiAgICdSZWNBcmVhUGhvbmUnLFxuICAgJ01FRElBJyxcbiAgICdMSU5LJyxcbiAgICdSZWNBcmVhRGVzY3JpcHRpb24nLFxuICAgJ1JlY0FyZWFNYXBVUkwnLFxuICAgJ1JlY0FyZWFMYXRpdHVkZScsXG4gICAnU3RheUxpbWl0JyxcbiAgICdSZWNBcmVhRmVlRGVzY3JpcHRpb24nLFxuICAgJ1JlY0FyZWFEaXJlY3Rpb25zJyxcbiAgICdLZXl3b3JkcycsXG4gICAnQUNUSVZJVFknXG5dO1xuXG5jbGFzcyBSZWNBcmVhIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3RvcihhcmVhKXtcbiAgICAgIHN1cGVyKFsnYm9va21hcmtlZCcsICdpbnJvdXRlJ10pO1xuICAgICAgdGhpcy5pZCA9IGFyZWEuUmVjQXJlYUlEO1xuICAgICAgdGhpcy5hY3Rpdml0aWVzID0gYXJlYS5BQ1RJVklUWS5tYXAoZnVuY3Rpb24oYSl7IFxuICAgICAgICAgcmV0dXJuIGEuQWN0aXZpdHlJRDsgXG4gICAgICB9KTtcbiAgICAgIHJlcXVpcmVkUHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKXtcbiAgICAgICAgIHRoaXNbcHJvcF0gPSBhcmVhW3Byb3BdO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgdGhpcy5ib29rbWFya2VkID0gZmFsc2U7XG4gICAgICB0aGlzLmluUm91dGUgPSBmYWxzZTtcblxuICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgdGhpcy5tYXJrZXJEaXNwbGF5ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMubWFya2VySGlnaGxpZ2h0ZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5zaG93RGV0YWlscyA9IHRoaXMuc2hvd0RldGFpbHMuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuaGlnaGxpZ2h0TWFya2VyID0gdGhpcy5oaWdobGlnaHRNYXJrZXIuYmluZCh0aGlzKVxuICAgICAgdGhpcy51bkhpZ2hsaWdodE1hcmtlciA9IHRoaXMudW5IaWdobGlnaHRNYXJrZXIuYmluZCh0aGlzKVxuICAgfVxuICAgc2hvd0RldGFpbHMoKXtcbiAgICAgIHJldHJpZXZlU2luZ2xlUmVjQXJlYSh0aGlzKTsvL25lZWQgZnJvbSBlbGl6YWJldGg7IHVzZSBpbXBvcnQgYW5kIGV4cG9ydCBcbiAgIH1cblxuICAgLy9XQVJOSU5HOiBzaG91bGQgb25seSBzZXQgb25lIGV2ZW50IGxpc3RlbmVyIHBlciBSZWNBcmVhXG4gICAvL3RoYXQgdXBkYXRlcyBhbGwgb2YgYSBjZXJ0YWluIGVsZW1lbnQgd2l0aCBkYXRhIG1hdGNoaW5nXG4gICAvL3RoZSBSZWNBcmVhIHRvIGF2b2lkIG1lbW9yeSBsZWFrcyBhbmQgaXNzdWVzIHdpdGggcmVtb3ZlZCBlbGVtZW50cyBcbiAgIHNldEJvb2ttYXJrZWQoLypib29sZWFuKi8gdmFsdWUpe1xuICAgICAgdGhpcy5ib29rbWFya2VkID0gdmFsdWU7XG4gICAgICB0aGlzLmVtaXQoJ2Jvb2ttYXJrZWQnKTtcbiAgIH1cbiAgIHNldEluUm91dGUoLypib29sZWFuKi8gdmFsdWUpe1xuICAgICAgdGhpcy5pblJvdXRlID0gdmFsdWU7XG4gICAgICBpZih0aGlzLm1hcmtlcil7XG4gICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKCF2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2lucm91dGUnKTtcbiAgIH1cbiAgIC8vc2V0Rm9jdXMgPiBjaGFuZ2VcblxuICAgaGlnaGxpZ2h0TWFya2VyKCl7XG4gICAgICBpZih0aGlzLm1hcmtlciAmJiAhdGhpcy5tYXJrZXJIaWdobGlnaHRlZCl7XG4gICAgICAgICB0aGlzLm1hcmtlci5zZXRBbmltYXRpb24oZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkJPVU5DRSk7XG4gICAgICAgICB0aGlzLm1hcmtlckhpZ2hsaWdodGVkID0gdHJ1ZTtcbiAgICAgICAgIGlmKHRoaXMuaW5Sb3V0ZSl7XG4gICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKHRydWUpO1xuICAgICAgICAgfVxuICAgICAgfVxuICAgfVxuICAgdW5IaWdobGlnaHRNYXJrZXIoKXtcbiAgICAgIGlmKHRoaXMubWFya2VyICYmIHRoaXMubWFya2VySGlnaGxpZ2h0ZWQpe1xuICAgICAgICAgdGhpcy5tYXJrZXIuc2V0QW5pbWF0aW9uKG51bGwpO1xuICAgICAgICAgdGhpcy5tYXJrZXJIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgaWYodGhpcy5pblJvdXRlKXtcbiAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUoZmFsc2UpO1xuICAgICAgICAgfVxuICAgICAgfVxuICAgfVxuXG4gICBhZGRNYXJrZXIoKXtcbiAgICAgIGxldCBsYXRMbmcgPSB7XG4gICAgICAgICBsYXQ6IHRoaXMuUmVjQXJlYUxhdGl0dWRlLFxuICAgICAgICAgbG5nOiB0aGlzLlJlY0FyZWFMb25naXR1ZGVcbiAgICAgIH07XG4gICAgICB0aGlzLm1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgcG9zaXRpb246IGxhdExuZyxcbiAgICAgICAgIG1hcDogbWFwXG4gICAgICB9KTtcbiAgICAgIGxldCBpbmZvID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xuICAgICAgICAgY29udGVudDogdGhpcy5tYWtlTWFwUHJldmlldygpXG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFya2VyLmFkZExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZSkgPT4ge1xuICAgICAgICAgaW5mby5vcGVuKG1hcCwgdGhpcy5tYXJrZXIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm1hcmtlci5hZGRMaXN0ZW5lcignbW91c2VvdXQnLCAoZSkgPT4ge1xuICAgICAgICAgaW5mby5jbG9zZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnNob3dEZXRhaWxzKTtcbiAgIH1cblxuICAgbWFrZU1hcFByZXZpZXcoKXtcbiAgICAgIHJldHVybiBgXG4gICAgICA8c3Ryb25nPiR7dGhpcy5SZWNBcmVhTmFtZX08L3N0cm9uZz5cbiAgICAgIGBcbiAgIH1cblxuICAgbWFrZUV2ZW50KGV2ZW50KXtcbiAgICAgIGNvbnNvbGUud2FybihldmVudCk7XG4gICB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdSZWNBcmVhJztcbiAgIH1cbn1cblxuY2xhc3MgUmVjQXJlYUNvbGxlY3Rpb24gZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKG5hbWUpe1xuICAgICAgc3VwZXIoWydjaGFuZ2UnXSk7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gICAgICAvL2FycmF5IG9mIFwiUmVjQXJlYVwicyBcbiAgICAgIHRoaXMuUkVDREFUQSA9IFtdO1xuXG4gICAgICAvL2hhc2ggbWFwIGxpa2Ugc3RvcmFnZSBvZiB3aGljaCByZWMgYXJlYXMgYXJlIGN1cnJlbnRseSBcbiAgICAgIC8vaW4gdGhpcyBjb2xsZWN0aW9uIChieSBpZClcbiAgICAgIHRoaXMuaWRNYXAgPSB7fTtcbiAgIH1cblxuICAgYWRkRGF0YShyZWNkYXRhKXtcbiAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcbiAgICAgIGlmKCAhKHJlY2RhdGEgaW5zdGFuY2VvZiBBcnJheSkpe1xuICAgICAgICAgaWYoICEocmVjZGF0YSBpbnN0YW5jZW9mIFJlY0FyZWEpICl7XG4gICAgICAgICAgICByZWNkYXRhID0gbmV3IFJlY0FyZWEocmVjZGF0YSk7XG4gICAgICAgICB9XG4gICAgICAgICByZWNkYXRhID0gW3JlY2RhdGFdO1xuICAgICAgfVxuICAgICAgcmVjZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGFyZWEpe1xuICAgICAgICAgaWYoIXRoaXMuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuUkVDREFUQS5wdXNoKGFyZWEpO1xuICAgICAgICAgICAgdGhpcy5pZE1hcFthcmVhLmlkXSA9IHRydWU7XG4gICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgaWYoY2hhbmdlKXtcbiAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB9XG4gICB9XG4gICBzZXREYXRhKHJlY2RhdGEpe1xuICAgICAgdGhpcy5pZE1hcCA9IHt9O1xuICAgICAgdGhpcy5SRUNEQVRBID0gW107XG4gICAgICBpZiggIShyZWNkYXRhIGluc3RhbmNlb2YgQXJyYXkpKXtcbiAgICAgICAgIHJlY2RhdGEgPSBbcmVjZGF0YV07XG4gICAgICB9XG4gICAgICByZWNkYXRhLmZvckVhY2goZnVuY3Rpb24oYXJlYSl7XG4gICAgICAgICB0aGlzLlJFQ0RBVEEucHVzaChhcmVhKTtcbiAgICAgICAgIHRoaXMuaWRNYXBbYXJlYS5pZF0gPSB0cnVlO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG4gICAvL2NoYW5nZSB0byBhbGxvdyBhbiBhcnJheSBvciBzb21ldGhpbmc/XG4gICByZW1vdmUoYXJlYSl7XG4gICAgICBpZih0aGlzLmlkTWFwW2FyZWEuaWRdKXtcbiAgICAgICAgIHRoaXMuUkVDREFUQS5zcGxpY2UodGhpcy5SRUNEQVRBLmluZGV4T2YoYXJlYSksIDEpO1xuICAgICAgICAgZGVsZXRlIHRoaXMuaWRNYXBbYXJlYS5pZF07XG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgfVxuICAgfVxuXG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIHJldHVybiB7dmFsOiB0aGlzLlJFQ0RBVEF9XG4gICB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuIGBzdGF0ZS5yZWNyZWF0aW9uLiR7dGhpcy5uYW1lfWA7XG4gICB9XG59XG5cbmNsYXNzIFJlY1N0YXR1cyBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoKXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJywgJ3BlcmNlbnQnXSk7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMucGVyY2VudExvYWRlZCA9IDEwMDtcbiAgICAgIHRoaXMuc2hvdWxkTG9hZCA9IGZhbHNlO1xuICAgICAgdGhpcy5jYW5Mb2FkID0gZmFsc2U7XG4gICAgICB0aGlzLmZpcnN0TG9hZCA9IHRydWU7XG5cbiAgICAgIHRoaXMubG9hZGVkQWN0aXZpdGllcyA9IHt9O1xuICAgICAgdGhpcy5maWx0ZXJlZEFjdGl2aXRpZXMgPSB7fTtcblxuICAgICAgdGhpcy5sb2FkZWRTZWFyY2hDb29yZHMgPSBbXTtcbiAgICAgIC8vaWYgdGhlIHJvdXRlIGNoYW5nZXMsIHRoaXMgc2hvdWxkIGJlIHRydWUuXG4gICAgICB0aGlzLnNob3VsZFJlc2V0TG9hZGVkQWN0aXZpdGllcyA9IGZhbHNlO1xuICAgICAgdGhpcy5zaG91bGRSZXNldExvYWRlZENvb3JkcyA9IGZhbHNlO1xuICAgfVxuICAgdXBkYXRlKHtsb2FkaW5nLCBwZXJjZW50TG9hZGVkLCBzaG91bGRMb2FkLCBjYW5Mb2FkLCBmaXJzdExvYWR9ID0ge30pe1xuICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xuICAgICAgaWYobG9hZGluZyAhPT0gdW5kZWZpbmVkICYmIGxvYWRpbmcgIT09IHRoaXMubG9hZGluZyl7XG4gICAgICAgICB0aGlzLmxvYWRpbmcgPSBsb2FkaW5nO1xuICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKHNob3VsZExvYWQgIT09IHVuZGVmaW5lZCAmJiBzaG91bGRMb2FkICE9PSB0aGlzLnNob3VsZExvYWQpe1xuICAgICAgICAgdGhpcy5zaG91bGRMb2FkID0gc2hvdWxkTG9hZDtcbiAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZihjYW5Mb2FkICE9PSB1bmRlZmluZWQgJiYgY2FuTG9hZCAhPT0gdGhpcy5jYW5Mb2FkKXtcbiAgICAgICAgIHRoaXMuY2FuTG9hZCA9IGNhbkxvYWQ7XG4gICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYoZmlyc3RMb2FkICE9PSB1bmRlZmluZWQgJiYgZmlyc3RMb2FkICE9PSB0aGlzLmZpcnN0TG9hZCl7XG4gICAgICAgICB0aGlzLmZpcnN0TG9hZCA9IGZpcnN0TG9hZDtcbiAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZihjaGFuZ2Upe1xuICAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgICAgIGlmKHBlcmNlbnRMb2FkZWQgIT09IHVuZGVmaW5lZCAmJiBwZXJjZW50TG9hZGVkICE9PSB0aGlzLnBlcmNlbnRMb2FkZWQpe1xuICAgICAgICAgdGhpcy5wZXJjZW50TG9hZGVkID0gcGVyY2VudExvYWRlZDtcbiAgICAgICAgIHRoaXMuZW1pdCgncGVyY2VudCcpO1xuICAgICAgfVxuICAgfVxuXG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIHJldHVybiB7dmFsOiB7XG4gICAgICAgICBsb2FkaW5nOiB0aGlzLmxvYWRpbmcsXG4gICAgICAgICBwZXJjZW50TG9hZGVkOiB0aGlzLnBlcmNlbnRMb2FkZWQsXG4gICAgICAgICBzaG91bGRMb2FkOiB0aGlzLnNob3VsZExvYWQsXG4gICAgICAgICBmaXJzdExvYWQ6IHRoaXMuZmlyc3RMb2FkLFxuICAgICAgICAgY2FuTG9hZDogdGhpcy5jYW5Mb2FkXG4gICAgICB9fTtcbiAgIH1cblxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMnO1xuICAgfVxufVxuXG5jbGFzcyBSZWNyZWF0aW9ue1xuICAgY29uc3RydWN0b3IoKXtcbiAgICAgIHRoaXMuYWxsID0gbmV3IFJlY0FyZWFDb2xsZWN0aW9uKCdhbGwnKTtcbiAgICAgIHRoaXMuZmlsdGVyZWQgPSBuZXcgUmVjQXJlYUNvbGxlY3Rpb24oJ2ZpbHRlcmVkJyk7XG4gICAgICB0aGlzLmJvb2ttYXJrZWQgPSBuZXcgUmVjQXJlYUNvbGxlY3Rpb24oJ2Jvb2ttYXJrZWQnKTtcbiAgICAgIC8vdGhpcy5pblJvdXRlID0gbmV3IFJlY0FyZWFDb2xsZWN0aW9uKCdpblJvdXRlJyk7XG5cbiAgICAgIC8vc2VhcmNoUmFkaXVzIGluIG1ldGVyc1xuICAgICAgdGhpcy5zZWFyY2hSYWRpdXMgPSA4MDQ2Ny4yO1xuXG4gICAgICB0aGlzLmFwaUNhbGwgPSByZWNBcGlRdWVyeTtcblxuICAgICAgdGhpcy5zdGF0dXMgPSBuZXcgUmVjU3RhdHVzO1xuICAgICAgdGhpcy5zZWFyY2ggPSB0aGlzLnNlYXJjaC5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5maWx0ZXJBbGwgPSB0aGlzLmZpbHRlckFsbC5iaW5kKHRoaXMpO1xuICAgfVxuICAgYWRkUmVjQXJlYXMocmVjZGF0YSl7XG4gICAgICB2YXIgZGF0YSA9IHJlY2RhdGEucmVkdWNlKGZ1bmN0aW9uKGFyciwgYXJlYSl7XG4gICAgICAgICBsZXQgdGVtcCA9IFtdO1xuICAgICAgICAgaWYoICF0aGlzLmFsbC5pZE1hcFthcmVhLlJlY0FyZWFJRF0gKXtcbiAgICAgICAgICAgIHRlbXAucHVzaChuZXcgUmVjQXJlYShhcmVhKSk7XG4gICAgICAgICB9XG4gICAgICAgICByZXR1cm4gYXJyLmNvbmNhdCh0ZW1wKTtcbiAgICAgIH0uYmluZCh0aGlzKSwgW10pO1xuICAgICAgdGhpcy5hbGwuYWRkRGF0YShkYXRhKTtcbiAgIH1cblxuICAgYWRkQm9va21hcmsoYXJlYSl7XG4gICAgICBpZighdGhpcy5ib29rbWFya2VkLmlkTWFwW2FyZWEuaWRdKXtcbiAgICAgICAgIGFyZWEuc2V0Qm9va21hcmtlZCh0cnVlKTtcbiAgICAgICAgIHRoaXMuYm9va21hcmtlZC5hZGREYXRhKGFyZWEpO1xuICAgICAgfVxuICAgfVxuICAgcmVtb3ZlQm9va21hcmsoYXJlYSl7XG4gICAgICBpZih0aGlzLmJvb2ttYXJrZWQuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgYXJlYS5zZXRCb29rbWFya2VkKGZhbHNlKTtcbiAgICAgICAgIHRoaXMuYm9va21hcmtlZC5yZW1vdmUoYXJlYSk7XG4gICAgICB9XG4gICB9XG4gICBhZGRUb1JvdXRlKGFyZWEpe1xuICAgICAgaWYoIWFyZWEuaW5Sb3V0ZSl7XG4gICAgICAgICBhcmVhLnNldEluUm91dGUodHJ1ZSk7XG4gICAgICAgICBzdGF0ZS5yb3V0ZS5hZGRSZWNBcmVhKGFyZWEpO1xuICAgICAgfVxuICAgICAgLy9lbHNlIGNvdWxkIHNob3cgdG9hc3Qgc2F5aW5nIGl0J3MgYWxyZWFkeSBpbiByb3V0ZSBcbiAgIH1cbiAgIHJlbW92ZUZyb21Sb3V0ZShhcmVhKXtcbiAgICAgIGlmKGFyZWEuaW5Sb3V0ZSl7XG4gICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgc3RhdGUucm91dGUucmVtb3ZlUmVjQXJlYShhcmVhKTtcbiAgICAgIH1cbiAgIH1cblxuICAgLy9zZW5kcyBhcGkgcmVxdWVzdChzKSBcbiAgIHNlYXJjaCgpe1xuICAgICAgdmFyIHJlcXVlc3RDb3VudCA9IDA7XG4gICAgICBpZih0aGlzLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZEFjdGl2aXRpZXMpe1xuICAgICAgICAgdGhpcy5zdGF0dXMubG9hZGVkQWN0aXZpdGllcyA9IHt9O1xuICAgICAgICAgdGhpcy5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzID0gZmFsc2U7XG4gICAgICAgICAvL2NsZWFyIHRoaXMuYWxsPz8/XG4gICAgICB9XG4gICAgICBpZih0aGlzLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZENvb3Jkcyl7XG4gICAgICAgICB0aGlzLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZENvb3JkcyA9IGZhbHNlO1xuICAgICAgICAgLy9jbGVhciB0aGlzLmFsbD8/P1xuICAgICAgfVxuICAgICAgdGhpcy5zdGF0dXMubG9hZGVkU2VhcmNoQ29vcmRzID0gc3RhdGUubWFwLmRpcmVjdGlvbnMuc2VhcmNoQ29vcmRzO1xuXG4gICAgICB2YXIgbG9hZGVkID0gdGhpcy5zdGF0dXMubG9hZGVkQWN0aXZpdGllcztcbiAgICAgIHZhciBpbnRlcmVzdHMgPSBzdGF0ZS5pbnRlcmVzdHMuc2VsZWN0ZWQucmVkdWNlKChpZFN0cmluZywgaW50ZXJlc3QpID0+IHtcbiAgICAgICAgIC8vaWYgd2UndmUgYWxyZWFkeSBsb2FkZWQgcmVjYXJlYXMgd2l0aCB0aGlzIGFjdGl2aXR5LCBkb24ndCBhZGQgdG8gYWN0aXZpdGllc1xuICAgICAgICAgaWYobG9hZGVkW2ludGVyZXN0LmlkXSl7XG4gICAgICAgICAgICByZXR1cm4gaWRTdHJpbmc7XG4gICAgICAgICB9XG4gICAgICAgICAvL290aGVyd2lzZSwgd2Ugd2lsbCBsb2FkIGl0IGFuZCBrZWVwIHRyYWNrXG4gICAgICAgICBlbHNle1xuICAgICAgICAgICAgbG9hZGVkW2ludGVyZXN0LmlkXSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YXR1cy5maWx0ZXJlZEFjdGl2aXRpZXNbaW50ZXJlc3QuaWRdID0gdHJ1ZTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYoIGlkU3RyaW5nLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBpZFN0cmluZyArICcsJyArIGludGVyZXN0LmlkO1xuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGlkU3RyaW5nICsgaW50ZXJlc3QuaWQ7XG4gICAgICB9LCAnJyk7XG5cblxuICAgICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgdGhpcy5hZGRSZWNBcmVhcyhyZXNwb25zZS5SRUNEQVRBKTtcbiAgICAgICAgIHJlcXVlc3RDb3VudCAtPSAxO1xuICAgICAgICAgaWYocmVxdWVzdENvdW50ID09PSAwICl7XG4gICAgICAgICAgICB0aGlzLnN0YXR1cy51cGRhdGUoe2xvYWRpbmc6IGZhbHNlfSk7XG4gICAgICAgICAgICB0aGlzLmZpbHRlckFsbCh0cnVlKTtcbiAgICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgLy90ZW1wb3JhcnkuLi4gZXZlbnR1YWxseSBjaGFuZ2UgdG8gYWxvbmcgcm91dGVcbiAgICAgIHN0YXRlLm1hcC5kaXJlY3Rpb25zLnNlYXJjaENvb3Jkcy5mb3JFYWNoKChsKSA9PiB7XG4gICAgICAgICByZXF1ZXN0Q291bnQgKz0gMTtcbiAgICAgICAgIHRoaXMuYXBpQ2FsbChcbiAgICAgICAgICAgIGwubGF0KCksXG4gICAgICAgICAgICBsLmxuZygpLFxuICAgICAgICAgICAgMTAwLFxuICAgICAgICAgICAgaW50ZXJlc3RzLFxuICAgICAgICAgICAgY2FsbGJhY2tcbiAgICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zdGF0dXMudXBkYXRlKHtzaG91bGRMb2FkOiBmYWxzZSwgbG9hZGluZzogdHJ1ZSwgZmlyc3RMb2FkOiBmYWxzZX0pO1xuICAgfVxuXG4gICBmaWx0ZXJBbGwoZml0TWFwKXtcbiAgICAgIGNvbnN0IG1hcEJvdW5kcyA9IG1hcC5nZXRCb3VuZHMoKTtcbiAgICAgIGxldCBtYXJrZXJCb3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAgICBtYXJrZXJCb3VuZHMuZXh0ZW5kKG1hcEJvdW5kcy5nZXROb3J0aEVhc3QoKSk7XG4gICAgICBtYXJrZXJCb3VuZHMuZXh0ZW5kKG1hcEJvdW5kcy5nZXRTb3V0aFdlc3QoKSk7XG4gICAgICB2YXIgZGF0YTtcbiAgICAgIGlmKCFzdGF0ZS5pbnRlcmVzdHMuc2VsZWN0ZWQubGVuZ3RoKXtcbiAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYoIXN0YXRlLnJvdXRlLmxvY2F0aW9uQ291bnQpe1xuICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIGRhdGEgPSB0aGlzLmFsbC5SRUNEQVRBO1xuICAgICAgfVxuICAgICAgY29uc3QgZmlsdGVyQ29vcmRzID0gc3RhdGUubWFwLmRpcmVjdGlvbnMuZ2V0Q29vcmRzQnlSYWRpdXModGhpcy5zZWFyY2hSYWRpdXMpO1xuICAgICAgZGF0YSA9IGRhdGEuZmlsdGVyKChhcmVhKSA9PiB7XG4gICAgICAgICB2YXIgY29vcmQgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHtcbiAgICAgICAgICAgIGxhdDogYXJlYS5SZWNBcmVhTGF0aXR1ZGUsXG4gICAgICAgICAgICBsbmc6IGFyZWEuUmVjQXJlYUxvbmdpdHVkZVxuICAgICAgICAgfSk7XG5cbiAgICAgICAgIC8vaWYgaXQncyBub3QgYSBuZXcgbG9hZCwgZmlsdGVyIGJhc2VkIG9uIG1hcCB2aWV3cG9ydFxuICAgICAgICAgaWYoIWZpdE1hcCAmJiAhbWFwQm91bmRzLmNvbnRhaW5zKGNvb3JkKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgfVxuXG4gICAgICAgICAvL2ZpbHRlciBiYXNlZCBvbiBwcm94aW1pdHkgdG8gcm91dGVcbiAgICAgICAgIHZhciBpc0Fsb25nUm91dGUgPSBmYWxzZTtcbiAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBmaWx0ZXJDb29yZHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsLmNvbXB1dGVEaXN0YW5jZUJldHdlZW4oXG4gICAgICAgICAgICAgICBmaWx0ZXJDb29yZHNbaV0sIGNvb3JkKTtcbiAgICAgICAgICAgIGlmKCBkaXN0YW5jZSA8IHRoaXMuc2VhcmNoUmFkaXVzKXtcbiAgICAgICAgICAgICAgIGlzQWxvbmdSb3V0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgICAgIGlmKCFpc0Fsb25nUm91dGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgIH1cblxuXG4gICAgICAgICAvL2ZpbHRlciBiYXNlZCBvbiBzZWxlY3RlZCBhY3Rpdml0aWVzXG4gICAgICAgICB2YXIgaGFzQWN0aXZpdHkgPSBmYWxzZTtcbiAgICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgYXJlYS5hY3Rpdml0aWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IGFyZWEuYWN0aXZpdGllc1tpXTtcbiAgICAgICAgICAgIGlmKHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLmZpbHRlcmVkQWN0aXZpdGllc1thY3Rpdml0eV0pe1xuICAgICAgICAgICAgICAgaGFzQWN0aXZpdHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICBpZighaGFzQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgIH1cblxuICAgICAgICAgbWFya2VyQm91bmRzLmV4dGVuZChjb29yZCk7XG4gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuZmlsdGVyZWQuc2V0RGF0YShkYXRhKTtcblxuICAgICAgLy9pZiB0aGUgZmlsdGVyIGlzIGR1ZSB0byBuZXcgbG9hZCwgYW5kIHRoZXJlIGFyZSBwb2ludHMsXG4gICAgICAvL2FuZCB0aGUgYm91bmRzIHRvIGNvbnRhaW4gdGhlc2UgcG9pbnRzIGFyZSBsYXJnZXIgdGhhbiB0aGUgXG4gICAgICAvL2N1cnJlbnQgdmlld3BvcnQsIGNoYW5nZSB0aGUgbWFwIHZpZXdwb3J0IHRvIHNob3cgZXZlcnl0aGluZ1xuICAgICAgaWYoZml0TWFwICYmIGRhdGEubGVuZ3RoKXtcbiAgICAgICAgIGlmKCBtYXJrZXJCb3VuZHMuZXF1YWxzKG1hcEJvdW5kcykgKVxuICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhtYXJrZXJCb3VuZHMsIDApO1xuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhtYXJrZXJCb3VuZHMpO1xuICAgICAgfVxuICAgfVxuXG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZS5yZWNyZWF0aW9uJztcbiAgIH1cbn1cblxuLyoqKioqKioqKioqKipcXCAgICBcbiBPdmVyYWxsIFN0YXRlXG5cXCoqKioqKioqKioqKiovXG5jbGFzcyBTdGF0ZSBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoKXtcbiAgICAgIHN1cGVyKFsncmVhZHknXSk7XG4gICAgICB0aGlzLnJlY3JlYXRpb24gPSBuZXcgUmVjcmVhdGlvbigpO1xuICAgICAgdGhpcy5yb3V0ZSA9IG5ldyBSb3V0ZSgpO1xuICAgICAgdGhpcy5pbnRlcmVzdHMgPSBuZXcgSW50ZXJlc3RzKGludGVyZXN0TGlzdCk7XG4gICAgICB0aGlzLm1hcCA9IG5ldyBNYXAoKTtcbiAgIH1cbiAgIFxuICAgLy9yZWZhY3RvciB0aGlzLCB1c2UgZXhwb3J0IGFuZCBpbXBvcnQgZnJvbSBhIHNlcGFyYXRlIGZpbGUgKG5vdCByZWNyZWF0aW9uLmpzKVxuICAgLy8gc2V0SW50ZXJlc3RzKGxpc3Qpe1xuICAgLy8gICAgdGhpcy5pbnRlcmVzdHMgPSBuZXcgSW50ZXJlc3RzKGxpc3QpO1xuICAgLy8gfVxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnc3RhdGUnO1xuICAgfVxuICAgbWFrZUV2ZW50KCl7XG4gICAgICByZXR1cm4ge3ZhbDogbnVsbH07XG4gICB9XG59XG5cbmNvbnN0IHN0YXRlID0gbmV3IFN0YXRlO1xuXG5cbmV4cG9ydCBkZWZhdWx0IHN0YXRlO1xuXG5cbi8vU3RhdGUgRGlhZ3JhbVxuXG5cbi8vIHN0YXRlID0ge1xuLy8gICAgc2V0SW50ZXJlc3RzOiBmdW5jdGlvbigpe30sXG4vLyAgICBJTlRFUkVTVFM6IHtcbi8vICAgICAgIGFsbDogW3tcbi8vICAgICAgICAgIG5hbWU6ICdzdHJpbmcnLFxuLy8gICAgICAgICAgaWQ6ICdudW1iZXInLFxuLy8gICAgICAgICAgaWNvbklkOiAnc3RyaW5nJyxcbi8vICAgICAgICAgIHNlbGVjdGVkOiAnYm9vbGVhbicsXG4vLyAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCl7fSxcbi8vICAgICAgICAgIG9uOiBmdW5jdGlvbihldmVudFN0cmluZywgY2FsbGJhY2spe30sXG4vLyAgICAgICAgICBldmVudHM6IHtcbi8vICAgICAgICAgICAgIGNoYW5nZTogWyBmdW5jdGlvbihlKXt9LCBmdW5jdGlvbihlKXt9IF0sXG4vLyAgICAgICAgICB9LFxuLy8gICAgICAgICAgZW1pdDogZnVuY3Rpb24oZXZlbnRTdHJpbmcpOy8vIHRyaWdnZXIgZXZlbnQgbGlzdGVuZXJzIGZvciBnaXZlbiBldmVudFxuLy8gICAgICAgfSwgXG4vLyAgICAgICB7Li4ufSwgXG4vLyAgICAgICB7Li4ufV0sXG4vLyAgICAgICAvL3JldHVybnMgYW4gYXJyYXkgb2Ygb25seSBzZWxlY3RlZCBpbnRlcmVzdHMgKHVzZSBnZXR0ZXIpXG4vLyAgICAgICBzZWxlY3RlZDogW3suLi59LCB7Li4ufV0sXG4vLyAgICAgICBvbjogZnVuY3Rpb24oZXZlbnRTdHJpbmcsIGNhbGxiYWNrKXt9LFxuLy8gICAgICAgZXZlbnRzOiB7XG4vLyAgICAgICAgICBjaGFuZ2U6IFsgZnVuY3Rpb24oKXt9LCBmdW5jdGlvbigpe30gXSxcbi8vICAgICAgIH1cbi8vICAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nKTtcbi8vICAgICAgIC8vbWlnaHQgbmVlZCB0byBzdG9yZSBhY3Rpdml0eSBpZHMgd2UgYXJlIGluY2x1ZGluZyBcbi8vICAgIH0sXG4vLyAgICBST1VURToge1xuLy8gICAgICAgYWRkTG9jYXRpb246IGZ1bmN0aW9uKGxvY2F0aW9uLCBhZnRlcil7fSxcbi8vICAgICAgIGRlbGV0ZUxvY2F0aW9uOiBmdW5jdGlvbihsb2NhdGlvbil7fSwgLy9tYXliZSBsb2NhdGlvbi5kZWxldGUoKT8/XG4vLyAgICAgICBtb3ZlTG9jYXRpb246IGZ1bmN0aW9uKGxvY2F0aW9uLCBhZnRlciksIC8vbWF5YmUgbG9jYXRpb24ubW92ZSgpPz9cbi8vICAgICAgICwvL3BvdGVudGlhbGx5IGludmVydCBkaXJlY3Rpb25cbi8vICAgICAgICwvL3NldCBvcHRpb25zIChlLmcuIGF2b2lkLCBzZWFyY2ggcmFkaXVzLCB0cmFuc3BvcnQgdHlwZSlcbi8vICAgICAgICwvL3JvdXRlIGFycmF5ID4gaGFzIGV2ZW50c1xuLy8gICAgICAgLC8vIG9wdGlvbnMgb2JqZWN0ID4gaGFzIGV2ZW50cyBcbi8vICAgIH0sXG4vLyAgICBNQVA6IHtcbi8vICAgICAgICwvL1xuLy8gICAgfSxcbi8vICAgIFJFQ1JFQVRJT046IHtcbi8vICAgICAgIGFkZEJvb2ttYXJrPiBhZGRzIGJvb2ttYXJrIGFuZCBzZXRzIGl0cyBib29rbWFyayBwcm9wZXJ0eSBcbi8vICAgICAgIGFkZFRvUm91dGUgPiBzaW1pbGFyIHRvIGFib3ZlXG4vLyAgICAgICAsLy9maWx0ZXJlZFN1Z2dlc3Rpb25zID5oYXMgZXZlbnRzXG4vLyAgICAgICAsLy9ib29rbWFya3Ncbi8vICAgICAgICwvL2Jvb2ttYXJrIGZ1bmN0aW9uXG4vLyAgICAgICAsLy9pblJvdXRlXG4vLyAgICAgICAsLy9hZGQgdG8gcm91dGUgZnVuY3Rpb25cbi8vICAgICAgICwvL3N0YXR1c1xuLy8gICAgICAgLC8vc2V0TGVnL2xvY2F0aW9uIChBIHRvIEI7IGp1c3QgQTsgQiB0byBDPz8pXG4vLyAgICB9LFxuLy8gICAgb246IGZ1bmN0aW9uKGV2ZW50U3RyaW5nLCBjYWxsYmFjayl7fSxcbi8vICAgIGV2ZW50czoge1xuLy8gICAgICAgcmVhZHk6IFsgZnVuY3Rpb24oKXt9LCBmdW5jdGlvbigpe30gXSxcbi8vICAgIH1cbi8vICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nKSxcbi8vICAgIC8vKGNoZWNrcyBsb2NhbCBzdG9yYWdlIGFuZCB1cGRhdGVzIGRhdGEgYXBwcm9wcmlhdGVseSlcbi8vICAgIGluaXQ6IGZ1bmN0aW9uKCl7fSxcbi8vIH1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvc3RhdGUvc3RhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cblxudmFyIHN0eWxlc0luRG9tID0ge307XG5cbnZhclx0bWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbztcblxuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0eXBlb2YgbWVtbyA9PT0gXCJ1bmRlZmluZWRcIikgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIG1lbW87XG5cdH07XG59O1xuXG52YXIgaXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xuXHQvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuXHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcblx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuXHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG59KTtcblxudmFyIGdldEVsZW1lbnQgPSAoZnVuY3Rpb24gKGZuKSB7XG5cdHZhciBtZW1vID0ge307XG5cblx0cmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdFx0aWYgKHR5cGVvZiBtZW1vW3NlbGVjdG9yXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0bWVtb1tzZWxlY3Rvcl0gPSBmbi5jYWxsKHRoaXMsIHNlbGVjdG9yKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWVtb1tzZWxlY3Rvcl1cblx0fTtcbn0pKGZ1bmN0aW9uICh0YXJnZXQpIHtcblx0cmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KVxufSk7XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyXHRzaW5nbGV0b25Db3VudGVyID0gMDtcbnZhclx0c3R5bGVzSW5zZXJ0ZWRBdFRvcCA9IFtdO1xuXG52YXJcdGZpeFVybHMgPSByZXF1aXJlKFwiLi91cmxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcblx0aWYgKHR5cGVvZiBERUJVRyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBERUJVRykge1xuXHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdG9wdGlvbnMuYXR0cnMgPSB0eXBlb2Ygb3B0aW9ucy5hdHRycyA9PT0gXCJvYmplY3RcIiA/IG9wdGlvbnMuYXR0cnMgOiB7fTtcblxuXHQvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXHRpZiAoIW9wdGlvbnMuc2luZ2xldG9uKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuXHRpZiAoIW9wdGlvbnMuaW5zZXJ0SW50bykgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKCFvcHRpb25zLmluc2VydEF0KSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXG5cdGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZSAobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0XHRkb21TdHlsZS5yZWZzLS07XG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XG5cdFx0fVxuXG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSBkb21TdHlsZS5wYXJ0c1tqXSgpO1xuXG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20gKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzIChsaXN0LCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcblx0XHR2YXIgY3NzID0gaXRlbVsxXTtcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xuXHRcdHZhciBzb3VyY2VNYXAgPSBpdGVtWzNdO1xuXHRcdHZhciBwYXJ0ID0ge2NzczogY3NzLCBtZWRpYTogbWVkaWEsIHNvdXJjZU1hcDogc291cmNlTWFwfTtcblxuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKSBzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2UgbmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xuXHR9XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50IChvcHRpb25zLCBzdHlsZSkge1xuXHR2YXIgdGFyZ2V0ID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8pXG5cblx0aWYgKCF0YXJnZXQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydEludG8nIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcblx0fVxuXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlc0luc2VydGVkQXRUb3Bbc3R5bGVzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblxuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmICghbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIHRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYgKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdFx0fVxuXHRcdHN0eWxlc0luc2VydGVkQXRUb3AucHVzaChzdHlsZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xuXHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyICdpbnNlcnRBdCcuIE11c3QgYmUgJ3RvcCcgb3IgJ2JvdHRvbScuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudCAoc3R5bGUpIHtcblx0aWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblx0c3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG5cblx0dmFyIGlkeCA9IHN0eWxlc0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZSk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhZGRBdHRycyhzdHlsZSwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZSk7XG5cblx0cmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudCAob3B0aW9ucykge1xuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0b3B0aW9ucy5hdHRycy5yZWwgPSBcInN0eWxlc2hlZXRcIjtcblxuXHRhZGRBdHRycyhsaW5rLCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmspO1xuXG5cdHJldHVybiBsaW5rO1xufVxuXG5mdW5jdGlvbiBhZGRBdHRycyAoZWwsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlIChvYmosIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlLCB1cGRhdGUsIHJlbW92ZSwgcmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cblx0ICAgIGlmIChyZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSByZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cblx0XHRzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcblxuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG5cblx0fSBlbHNlIGlmIChcblx0XHRvYmouc291cmNlTWFwICYmXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5jcmVhdGVPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIlxuXHQpIHtcblx0XHRzdHlsZSA9IGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblxuXHRcdFx0aWYoc3R5bGUuaHJlZikgVVJMLnJldm9rZU9iamVjdFVSTChzdHlsZS5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblx0XHR9O1xuXHR9XG5cblx0dXBkYXRlKG9iaik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlIChuZXdPYmopIHtcblx0XHRpZiAobmV3T2JqKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG5ld09iai5jc3MgPT09IG9iai5jc3MgJiZcblx0XHRcdFx0bmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiZcblx0XHRcdFx0bmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcFxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXG5cdFx0cmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cdH07XG59KSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnIChzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG5cdHZhciBjc3MgPSByZW1vdmUgPyBcIlwiIDogb2JqLmNzcztcblxuXHRpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblxuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuXHRcdFx0c3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcgKHN0eWxlLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsIG1lZGlhKVxuXHR9XG5cblx0aWYoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZS5maXJzdENoaWxkKSB7XG5cdFx0XHRzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcblx0XHR9XG5cblx0XHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rIChsaW5rLCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qXG5cdFx0SWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdFx0YW5kIHRoZXJlIGlzIG5vIHB1YmxpY1BhdGggZGVmaW5lZCB0aGVuIGxldHMgdHVybiBjb252ZXJ0VG9BYnNvbHV0ZVVybHNcblx0XHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0XHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpIHtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZiAoc291cmNlTWFwKSB7XG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjY2MDM4NzVcblx0XHRjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSArIFwiICovXCI7XG5cdH1cblxuXHR2YXIgYmxvYiA9IG5ldyBCbG9iKFtjc3NdLCB7IHR5cGU6IFwidGV4dC9jc3NcIiB9KTtcblxuXHR2YXIgb2xkU3JjID0gbGluay5ocmVmO1xuXG5cdGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKSBVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjb25zdCBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwge1xuICBjZW50ZXI6IHtsYXQ6IDM5Ljc2NDI1NDgsIGxuZzogLTEwNC45OTUxOTM3fSxcbiAgem9vbTogNVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IG1hcDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbWFwL21hcGNvbnN0YW50LmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JlY3JlYXRpb24uY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JlY3JlYXRpb24uY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JlY3JlYXRpb24uY3NzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbi5jc3Ncbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogUmV0cmlldmUgdGhlIGRhdGEgZm9yIGEgcmVjcmVhdGlvbiBhcmVhIFxuKiAgRGlzcGxheSB0aGUgZGF0YSB0byBhIG1vZGFsIG9uIHRoZSB3ZWIgcGFnZSAqL1xuXG5pbXBvcnQgJy4vcmVjcmVhdGlvbi5jc3MnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxudmFyIGJvb2tNYXJrSXRlbTtcbnZhciB1bnNldEJvb2tNYXJrO1xudmFyIGFkZFJlY1RvUm91dGU7XG5cbi8vIGRpc3BsYXkgdGhlIGRhdGEgaW4gYSBtb2RhbCBib3hcbmV4cG9ydCBmdW5jdGlvbiByZXRyaWV2ZVNpbmdsZVJlY0FyZWEocmVjYXJlYSkge1xuICAgICQoJyNtb2RhbDEtY29udGVudCcpLmVtcHR5KCk7XG4gICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgdXNpbmcgcmVjQXJlYUlkXG4gICAgY29uc29sZS5sb2cocmVjYXJlYSk7XG5cbiAgICAvLyBUaGUgcmVjcmVhdGlvbiBBcmVhIFRpdGxlXG4gICAgdmFyIHJlY05hbWVUZXh0ID0gJChcIjxkaXYgaWQ9J3JlY05hbWVNb2RhbCc+XCIpLnRleHQocmVjYXJlYS5SZWNBcmVhTmFtZSk7XG5cbiAgICAvL1RoZSBwdWJsaXNoZWQgcGhvbmUgbnVtYmVyIG9mIHRoZSBhcmVhXG4gICAgdmFyIHJlY1Bob25lVGV4dCA9ICQoXCI8ZGl2IGlkPSdyZWNQaG9uZU1vZGFsJz5cIikudGV4dChyZWNhcmVhLlJlY0FyZWFQaG9uZSk7XG5cbiAgICB2YXIgcmVjQXJlYUVtYWlsID0gJChcIjxkaXYgaWQ9J3JlY0VtYWlsTW9kYWwnPlwiKS50ZXh0KHJlY2FyZWEuUmVjQXJlYUVtYWlsKTtcblxuICAgIC8vIENoZWNrIGFuZCBzZWUgaWYgdGhlIGxpbmsgYXJyYXkgaXMgZW1wdHkgb3Igbm90IFxuICAgIGlmIChyZWNhcmVhLkxJTktbMF0gIT0gbnVsbCkge1xuICAgICAgICB2YXIgcmVjQXJlYUxpbmtUaXRsZSA9IHJlY2FyZWEuTElOS1swXS5UaXRsZTtcbiAgICAgICAgdmFyIHJlY0FyZWFVcmwgPSByZWNhcmVhLkxJTktbMF0uVVJMO1xuICAgICAgICB2YXIgcmVjQXJlYUxpbmsgPSAkKFwiPGEgLz5cIiwge1xuICAgICAgICAgICAgaHJlZjogcmVjQXJlYVVybCxcbiAgICAgICAgICAgIHRleHQ6IHJlY0FyZWFMaW5rVGl0bGUsXG4gICAgICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgICAgICBpZDogXCJyZWNVcmxNb2RhbFwifSk7XG4gICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiB0ZWxlcGhvbmVDaGVjayhzdHJQaG9uZSl7XG4gICAgICAgICAgICAgIC8vIENoZWNrIHRoYXQgdGhlIHZhbHVlIHdlIGdldCBpcyBhIHBob25lIG51bWJlclxuICAgICAgICAgICAgICAgIHZhciBpc1Bob25lID0gbmV3IFJlZ0V4cCgvXlxcKz8xP1xccyo/XFwoP1xcZHszfXxcXHd7M30oPzpcXCl8Wy18XFxzXSk/XFxzKj9cXGR7M318XFx3ezN9Wy18XFxzXT9cXGR7NH18XFx3ezR9JC8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpc1Bob25lLnRlc3Qoc3RyUGhvbmUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUGhvbmUgIyBpczogXCIgKyBpc1Bob25lKTtcbiAgICAgICAgICAgIH1cblxuICAgIC8vIEFwcGVuZCB0aGUgZGV0YWlscyBvZiB0aGUgcmVjYXJlYSB0byB0aGUgbW9kYWxcbiAgICAvLyBDaGVja3Mgd2hldGhlciBhIHBob25lIG51bWJlciBtYXRjaGVzIGEgcGF0dGVybiBiZWZvcmUgYXBwZW5kaW5nIHRvIHRoZSBtb2RhbFxuICAgIGlmICh0ZWxlcGhvbmVDaGVjayhyZWNhcmVhLlJlY0FyZWFQaG9uZSkgPT0gdHJ1ZSl7ICAgIFxuICAgICAgICAkKCcjbW9kYWwxLWNvbnRlbnQnKS5hcHBlbmQocmVjTmFtZVRleHQscmVjUGhvbmVUZXh0LHJlY0FyZWFFbWFpbCxyZWNBcmVhTGluayk7XG4gICAgfSBlbHNlXG4gICAgICAgICQoJyNtb2RhbDEtY29udGVudCcpLmFwcGVuZChyZWNOYW1lVGV4dCxyZWNBcmVhRW1haWwscmVjQXJlYUxpbmspO1xuXG4gICAgLy8gUmVjQXJlYURlc2NyaXB0aW9uXG5cbiAgICAkKCcjbW9kYWwxLWNvbnRlbnQnKS5hcHBlbmQoYDxzdHJvbmc+PGRpdiBpZD0nZGVzY01vZGFsJz5EZXNjcmlwdGlvbjo8L3N0cm9uZz4gJHtyZWNhcmVhLlJlY0FyZWFEZXNjcmlwdGlvbn1gKTtcblxuICAgIC8vIEFwcGVuZCB0aGUgQWN0aXZpdGllcyB0byB0aGUgbW9kYWxcbiAgICAkKCcjbW9kYWwxLWNvbnRlbnQnKS5hcHBlbmQoXCI8c3Ryb25nPjxkaXYgaWQ9J2FjdGl2aXR5TW9kYWxIZWFkJyBjbGFzcz0nY29sbGVjdGlvbi1oZWFkZXInPkFjdGl2aXRpZXM8L2Rpdj5cIik7XG4gICAgcmVjYXJlYS5BQ1RJVklUWS5mb3JFYWNoKGZ1bmN0aW9uKGFjdGl2aXR5KXtcbiAgICAgICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKFwiPHVsPlwiKTtcbiAgICAgICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKFwiPGxpIGlkPSdhY3Rpdml0eVR5cGVNb2RhbCc+XCIgKyBhY3Rpdml0eS5BY3Rpdml0eU5hbWUpO1xuICAgIH0pXG5cbiAgICAvLyBSRUNBUkVBQUREUkVTU1xuICAgIHJlY2FyZWEuUkVDQVJFQUFERFJFU1MuZm9yRWFjaChmdW5jdGlvbihhZGRyZXNzKXtcbiAgICAgICAgJCgnI21vZGFsMS1jb250ZW50JykuYXBwZW5kKFwiPHN0cm9uZz48ZGl2IGlkPSdhZGRyZXNzSGVhZE1vZGFsJz5BZGRyZXNzXCIpO1xuICAgICAgICAkKCcjbW9kYWwxLWNvbnRlbnQnKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdhZGRyZXNzTW9kYWwnPlwiICsgYWRkcmVzcy5SZWNBcmVhU3RyZWV0QWRkcmVzczEpO1xuICAgICAgICAkKCcjbW9kYWwxLWNvbnRlbnQnKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdhZGRyZXNzTW9kYWwnPlwiICsgYWRkcmVzcy5SZWNBcmVhU3RyZWV0QWRkcmVzczIpO1xuICAgICAgICAkKCcjbW9kYWwxLWNvbnRlbnQnKS5hcHBlbmQoYDxkaXYgY2xhc3M9J2FkZHJlc3NNb2RhbCc+ICR7YWRkcmVzcy5DaXR5fSwgJHthZGRyZXNzLkFkZHJlc3NTdGF0ZUNvZGV9ICR7YWRkcmVzcy5Qb3N0YWxDb2RlfWApO1xuICAgIH0pXG5cblxuICAgIC8vIFNldC9VbnNldCB0aGUgYm9va21hcmsgaXRlbVxuICAgIGJvb2tNYXJrSXRlbSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChyZWNhcmVhLmJvb2ttYXJrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgc3RhdGUucmVjcmVhdGlvbi5hZGRCb29rbWFyayhyZWNhcmVhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJyNib29rLW1hcmstYnRuJykudGV4dChcIlVuYm9va21hcmtcIik7ICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXRlLnJlY3JlYXRpb24ucmVtb3ZlQm9va21hcmsocmVjYXJlYSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAgICAgaWYgKHJlY2FyZWEuYm9va21hcmtlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICQoXCIjYm9vay1tYXJrLWJ0blwiKS50ZXh0KFwiQm9va21hcmtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcjYm9vay1tYXJrLWJ0bicpLnRleHQoXCJVbmJvb2ttYXJrXCIpOyAgICAgICAgIFxuICAgICAgICB9XG5cbiAgIC8vIE5lZWQgdG8gYWRkIGEgYnV0dG9uIHRoYXQgYWRkcyB0aGUgcmVjYXJlYSB0byByb3V0ZVxuXG4gICAgYWRkUmVjVG9Sb3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihyZWNhcmVhLmluUm91dGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzdGF0ZS5yZWNyZWF0aW9uLmFkZFRvUm91dGUocmVjYXJlYSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZCB0byB0aGUgcm91dGVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcjYWRkVG9Sb3V0ZUJ0bicpLnRleHQoXCJSZW1vdmUgZnJvbSBSb3V0ZVwiKTtcbiAgICAgICAgICAgIHN0YXRlLnJlY3JlYXRpb24ucmVtb3ZlRnJvbVJvdXRlKHJlY2FyZWEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmVkIGZyb20gcm91dGVcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAgICAgaWYgKHJlY2FyZWEuaW5Sb3V0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICQoJyNhZGRUb1JvdXRlQnRuJykudGV4dChcIkFkZCB0byBSb3V0ZVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJyNhZGRUb1JvdXRlQnRuJykudGV4dChcIlJlbW92ZSBmcm9tIFJvdXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAvLyBMYXN0IHN0ZXAgaXMgdG8gb3BlbiB0aGUgbW9kYWwgYWZ0ZXIgZXZlcnl0aGluZyBpcyBhcHBlbmRlZFxuICAgICAgICAkKCcjbW9kYWwxJykubW9kYWwoJ29wZW4nKTtcblxufVxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cbiAgICAkKCcjbW9kYWwxJykubW9kYWwoe1xuICAgICAgICBpbkR1cmF0aW9uOiAzMDAsXG4gICAgICAgIHN0YXJ0aW5nVG9wOiAnNDAlJywgLy8gU3RhcnRpbmcgdG9wIHN0eWxlIGF0dHJpYnV0ZVxuICAgICAgICBlbmRpbmdUb3A6ICcxMCUnXG4gICAgfSk7XG5cbiAgICAkKCcjYm9vay1tYXJrLWJ0bicpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgICBib29rTWFya0l0ZW0oKTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBidXR0b24gdG8gYWRkIGEgcm91dGUgdG8gdGhlIG1vZGFsIGZvb3RlclxuXG4gICAgICAgIHZhciBhZGRUb1JvdXRlQnV0dG9uID0gJChcIjxhIC8+XCIsIHtcbiAgICAgICAgICAgIGhyZWY6IFwiIyFcIixcbiAgICAgICAgICAgIHRleHQ6IFwiQWRkIHRvIFJvdXRlXCIsXG4gICAgICAgICAgICBjbGFzczogXCJtb2RhbC1hY3Rpb24gbW9kYWwtY2xvc2Ugd2F2ZXMtZWZmZWN0IGJ0biBidG4tZmxhdCByaWdodFwiLFxuICAgICAgICAgICAgc3R5bGU6IFwibWFyZ2luOiA2cHhcIixcbiAgICAgICAgICAgIGlkOiBcImFkZFRvUm91dGVCdG5cIn0pO1xuXG4gICAgICAgICQoJyNyZWMtYXJlYS1kZXRhaWwtbW9kYWwtZm9vdGVyJykuYXBwZW5kKGFkZFRvUm91dGVCdXR0b24pO1xuXG4gICAgJCgnI2FkZFRvUm91dGVCdG4nKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICBhZGRSZWNUb1JvdXRlKCk7XG4gICAgfSlcbiBcbiB9KTtcblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY0FyZWFEZXRhaWxzLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydCB2YXIgaW50ZXJlc3RMaXN0ID0gW1xuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIkJJS0lOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogNSxcbiAgICAgXCJFbW9qaVwiOiBcIvCfmrRcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiQ0xJTUJJTkdcIixcbiAgICAgXCJBY3Rpdml0eUlEXCI6IDcsXG4gICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9LFxuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIkNBTVBJTkdcIixcbiAgICAgXCJBY3Rpdml0eUlEXCI6IDksXG4gICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICAgfSxcbiAgICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiSElLSU5HXCIsXG4gICAgICBcIkFjdGl2aXR5SURcIjogMTQsXG4gICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJQSUNOSUNLSU5HXCIsXG4gICAgICBcIkFjdGl2aXR5SURcIjogMjAsXG4gICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgIH0sXG4gICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIlJFQ1JFQVRJT05BTCBWRUhJQ0xFU1wiLFxuICAgICAgXCJBY3Rpdml0eUlEXCI6IDIzLFxuICAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgICB9LFxuICAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJWSVNJVE9SIENFTlRFUlwiLFxuICAgICAgXCJBY3Rpdml0eUlEXCI6IDI0LFxuICAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiV0FURVIgU1BPUlRTXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiAyNSxcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiV0lMRExJRkUgVklFV0lOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogMjYsXG4gICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9LFxuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIkhPUlNFQkFDSyBSSURJTkdcIixcbiAgICAgXCJBY3Rpdml0eUlEXCI6IDE1LFxuICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfVxuXG5dXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJlY0FwaVF1ZXJ5KGxhdGl0dWRlVmFsLGxvbmdpdHVkZVZhbCxyYWRpdXNWYWwsYWN0aXZpdHlWYWwsY2FsbGJhY2spIHtcblxuICAgIHZhciByZWNRdWVyeVVSTCA9IFwiaHR0cHM6Ly9yaWRiLnJlY3JlYXRpb24uZ292L2FwaS92MS9yZWNhcmVhcy5qc29uP2FwaWtleT0yQzFCMkFDNjlFMTk0NURFODE1QjY5QkJDQzlDN0IxOSZmdWxsJmxhdGl0dWRlPVwiXG4gICAgKyBsYXRpdHVkZVZhbCArIFwiJmxvbmdpdHVkZT1cIiArIGxvbmdpdHVkZVZhbCArIFwiJnJhZGl1cz1cIiArIHJhZGl1c1ZhbCArIFwiJmFjdGl2aXR5PVwiICsgYWN0aXZpdHlWYWw7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogcmVjUXVlcnlVUkwsXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCJcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoY2FsbGJhY2spO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjQXBpQnlJZChpZCwgY2FsbGJhY2spIHtcblxuICAgIHZhciByZWNRdWVyeVVSTCA9IFwiaHR0cHM6Ly9yaWRiLnJlY3JlYXRpb24uZ292L2FwaS92MS9yZWNhcmVhcy9cIiArIGlkICsgXCIuanNvbj9hcGlrZXk9MkMxQjJBQzY5RTE5NDVERTgxNUI2OUJCQ0M5QzdCMTkmZnVsbFwiXG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogcmVjUXVlcnlVUkwsXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCJcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoY2FsbGJhY2spO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL2NvbnN0YW50cy5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJy4vY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY3JlYXRpb24nO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9sb2FkQnV0dG9uJztcbmltcG9ydCAnLi9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMnO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dCc7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9tYXAvbWFwJztcbmltcG9ydCAnLi9jb21wb25lbnRzL3JvdXRlL3JvdXRlJztcbmltcG9ydCAnLi9jb21wb25lbnRzL2xvY2Fsc3RvcmFnZS9sb2NhbHN0b3JhZ2UnO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZSc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAuanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL3JlY3JlYXRpb24uY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5pbXBvcnQgJy4vZGlzcGxheVJlY0FyZWFTdWdnZXN0aW9ucyc7XG5pbXBvcnQgJy4vcmVjQXJlYURldGFpbHMnO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY3JlYXRpb24uanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLnJlY3JlYXRpb257XFxuICAgYmFja2dyb3VuZDogcmVkO1xcbn1cXG5cXG4uc3VnZ2VzdGlvblN1bW1hcnkge1xcbiAgICBmb250LXNpemU6IDFlbTtcXG4gICAgbWFyZ2luLXRvcDogNSU7XFxufVxcblxcbi5zdWdnZXN0aW9uU3VtbWFyeTpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6cmdiYSgwLCAwLCAwLCAwLjEpO1xcblxcbn1cXG5cXG4jcmVjTmFtZU1vZGFsIHtcXG4gICAgZm9udC1zaXplOiAyNXB4O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbiNhY3Rpdml0eVR5cGVNb2RhbCB7XFxuICAgIG1hcmdpbi1sZWZ0OiA1JTtcXG4gICAgbGluZS1oZWlnaHQ6IDUlO1xcbn1cXG5cXG4jYWN0aXZpdHlNb2RhbEhlYWQsICNkZXNjTW9kYWwsICNhZGRyZXNzSGVhZE1vZGFsIHtcXG4gICAgbWFyZ2luLWxlZnQ6IDUlO1xcbiAgICBtYXJnaW4tdG9wOiAyJTsgICAgXFxufVxcblxcbiNyZWNQaG9uZU1vZGFsLCAjcmVjRW1haWxNb2RhbCwgI3JlY1VybE1vZGFsIHtcXG4gICAgbWFyZ2luLWxlZnQ6IDUlO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5hZGRyZXNzTW9kYWwge1xcbiAgICBtYXJnaW4tbGVmdDogNSU7XFxuXFxufVxcblxcbiNub25lRm91bmQge1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMWVtO1xcbiAgICBtYXJnaW4tdG9wOiA1JTtcXG59XCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbi5jc3Ncbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC8pL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBzZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLkRpc3RhbmNlTWF0cml4U2VydmljZSgpO1xuZXhwb3J0IGRlZmF1bHQgc2VydmljZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbWFwL2Rpc3RhbmNlLmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuXG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZGlzcGxheVJlY0FyZWFTdW1tYXJ5KHJlY2RhdGEsIGZpbHRlcmVkVHlwZSkge1xuICAgICAgICAkKGZpbHRlcmVkVHlwZSkuZW1wdHkoKTtcblxuICAgICAgIGZ1bmN0aW9uIHRlbGVwaG9uZUNoZWNrKHN0clBob25lKXtcbiAgICAgICAgICAgIC8vIENoZWNrIHRoYXQgdGhlIHZhbHVlIHdlIGdldCBpcyBhIHBob25lIG51bWJlclxuICAgICAgICAgICAgdmFyIGlzUGhvbmUgPSBuZXcgUmVnRXhwKC9eXFwrPzE/XFxzKj9cXCg/XFxkezN9fFxcd3szfSg/OlxcKXxbLXxcXHNdKT9cXHMqP1xcZHszfXxcXHd7M31bLXxcXHNdP1xcZHs0fXxcXHd7NH0kLyk7XG4gICAgICAgICAgICByZXR1cm4gaXNQaG9uZS50ZXN0KHN0clBob25lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDxyZWNkYXRhLnZhbC5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICB2YXIgcmVjVmFsQWxpYXMgPSByZWNkYXRhLnZhbFtpXTtcblxuICAgICAgICAgICAgdmFyIHN1Z0RpdkNsYXNzID0gJChcIjx1bCBjbGFzcz0nc3VnZ2VzdGlvblN1bW1hcnkgY2FyZCcgaWQ9J2FyZWFJZC1cIiArIHJlY1ZhbEFsaWFzLmlkICsgXCInPlwiKTtcblxuICAgICAgICAgICAgdmFyIHJlY05hbWVUZXh0ID0gJChcIjxzdHJvbmc+PGxpIGNhcmQtdGl0bGU+XCIpLnRleHQocmVjVmFsQWxpYXMuUmVjQXJlYU5hbWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVjUGhvbmVUZXh0ID0gJChcIjxsaSBjYXJkLWNvbnRlbnQ+XCIpLnRleHQocmVjVmFsQWxpYXMuUmVjQXJlYVBob25lKTtcblxuXG4gICAgICAgICAgICBpZiAodGVsZXBob25lQ2hlY2socmVjVmFsQWxpYXMuUmVjQXJlYVBob25lKSA9PSB0cnVlKXtcbiAgICAgICAgICAgICAgICBzdWdEaXZDbGFzcy5hcHBlbmQocmVjTmFtZVRleHQsIHJlY1Bob25lVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBzdWdEaXZDbGFzcy5hcHBlbmQocmVjTmFtZVRleHQpO1xuXG4gICAgICAgICAgICAvL0dldCBib3RoIHRoZSBUaXRsZSBhbmQgVVJMIHZhbHVlcyBhbmQgY3JlYXRlIGEgbGluayB0YWcgb3V0IG9mIHRoZW1cbiAgICAgICAgICAgIC8vIFdlJ3JlIG9ubHkgZ3JhYmJpbmcgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBMSU5LIGFycmF5XG4gICAgICAgICAgICBpZiAocmVjVmFsQWxpYXMuTElOS1swXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlY0FyZWFMaW5rVGl0bGUgPSByZWNWYWxBbGlhcy5MSU5LWzBdLlRpdGxlO1xuICAgICAgICAgICAgICAgIHZhciByZWNBcmVhVXJsID0gcmVjVmFsQWxpYXMuTElOS1swXS5VUkw7XG4gICAgICAgICAgICAgICAgdmFyIHJlY0FyZWFMaW5rID0gJChcIjxhIC8+XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgaHJlZjogcmVjQXJlYVVybCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogcmVjQXJlYUxpbmtUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wifSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVjQXJlYUxpbmtQID0gJChcIjxsaSBjYXJkLWNvbnRlbnQ+XCIpLmFwcGVuZChyZWNBcmVhTGluayk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3VnRGl2Q2xhc3MuYXBwZW5kKHJlY0FyZWFMaW5rUCk7XG4gICAgICAgICAgICB9IGVsc2UgXG4gICAgICAgICAgICAgICAgc3VnRGl2Q2xhc3MuYXBwZW5kKFwiPGxpIGNhcmQtY29udGVudD5cIik7XG5cbiAgICAgICAgICAgICQoZmlsdGVyZWRUeXBlKS5hcHBlbmQoc3VnRGl2Q2xhc3MpO1xuXG4gICAgICAgICAgICBzdWdEaXZDbGFzcy5jbGljayhyZWNWYWxBbGlhcy5zaG93RGV0YWlscyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN1Z0RpdkNsYXNzLmhvdmVyKHJlY1ZhbEFsaWFzLmhpZ2hsaWdodE1hcmtlciwgcmVjVmFsQWxpYXMudW5IaWdobGlnaHRNYXJrZXIpO1xuXG4gICAgICAgfVxuXG4gICAgaWYgKHJlY2RhdGEudmFsLmxlbmd0aCA9PT0gMCl7ICAgXG4gICAgICAgICBpZiAoZmlsdGVyZWRUeXBlID09PSBcIiNmaWx0ZXJlZFwiKXtcbiAgICAgICAgICAgICQoZmlsdGVyZWRUeXBlKS5hcHBlbmQoXCI8ZGl2IGlkPSdub25lRm91bmQnPk5vIHJlY3JlYXRpb24gYXJlYXMgZm91bmQuPC9kaXY+XCIpO1xuICAgICAgICAgfSBlbHNlIGlmIChmaWx0ZXJlZFR5cGUgPT09IFwiI2Jvb2ttYXJrZWRcIikge1xuICAgICAgICAgICAgJChmaWx0ZXJlZFR5cGUpLmFwcGVuZChcIjxkaXYgc3R5bGU9J3RleHQtYWxpZ246Y2VudGVyOyBtYXJnaW46NSU7JyBpZD0nbm8tYm9va21hcmsnPk5vdGhpbmcgYm9va21hcmtlZC48L2Rpdj5cIik7XG4gICAgICAgIH1cbiAgICAgfVxuICAgIH1cblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgICAgICAkKFwiI2Jvb2ttYXJrZWRcIikuYXBwZW5kKFwiPGRpdiBzdHlsZT0ndGV4dC1hbGlnbjpjZW50ZXI7IG1hcmdpbjo1JTsnIGlkPSduby1ib29rbWFyayc+Tm90aGluZyBib29rbWFya2VkLjwvZGl2PlwiKTtcbn0pO1xuXG5zdGF0ZS5yZWNyZWF0aW9uLmZpbHRlcmVkLm9uKFwiY2hhbmdlXCIsICBmdW5jdGlvbihyZWNkYXRhKXtcblxuICAgICAgICB2YXIgZmlsdGVyZWRUeXBlID0gXCIjZmlsdGVyZWRcIjtcbiAgICAgICAgZGlzcGxheVJlY0FyZWFTdW1tYXJ5KHJlY2RhdGEsIGZpbHRlcmVkVHlwZSk7XG5cbn0pO1xuc3RhdGUucmVjcmVhdGlvbi5ib29rbWFya2VkLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKHJlY2RhdGEpe1xuXG4gICAgICAgIHZhciBmaWx0ZXJlZFR5cGUgPSBcIiNib29rbWFya2VkXCI7XG4gICAgICAgIGRpc3BsYXlSZWNBcmVhU3VtbWFyeShyZWNkYXRhLCBmaWx0ZXJlZFR5cGUpO1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vZGlzcGxheVJlY0FyZWFTdWdnZXN0aW9ucy5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxuZnVuY3Rpb24gc2hvd0J1dHRvbihzdGF0dXMpIHtcbiAgIHZhciBjb250YWluZXIgPSAkKCcjYnV0dG9uLWNvbnRhaW5lcicpO1xuICAgdmFyIHRleHQ7XG4gICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cImJ0biBjZW50ZXJcIj4nKVxuICAgICAgLnRleHQoJ0ZpbmQgUmVjcmVhdGlvbicpXG4gICAgICAuY2xpY2soc3RhdGUucmVjcmVhdGlvbi5zZWFyY2gpXG4gICAgICAuY3NzKHtcbiAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICAgICBtYXJnaW46ICcwIGF1dG8nXG4gICAgICB9KTtcbiAgIHZhciBpY29uID0gJCgnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyBwaW5rLXRleHQgdGV4dC1hY2NlbnQzXCI+PC9pPicpLnRleHQoJ3dhcm5pbmcnKTtcblxuICAgdmFyIG5vSW50ZXJlc3QgPSAhc3RhdGUuaW50ZXJlc3RzLnNlbGVjdGVkLmxlbmd0aDtcbiAgIHZhciBub0xvY2F0aW9uID0gIXN0YXRlLnJvdXRlLmxvY2F0aW9uQ291bnQ7XG4gICBpZihzdGF0dXMudmFsLmZpcnN0TG9hZCAmJiBub0ludGVyZXN0ICYmIG5vTG9jYXRpb24pe1xuICAgICAgdGV4dCA9ICdTZWxlY3Qgc29tZSBpbnRlcmVzdHMgYW5kIGNob29zZSBhdCBsZWFzdCBvbmUgbG9jYXRpb24gdG8gZ2V0IHN0YXJ0ZWQnO1xuICAgICAgYnRuLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICB9XG4gICBlbHNlIGlmKHN0YXR1cy52YWwuZmlyc3RMb2FkICYmIG5vSW50ZXJlc3Qpe1xuICAgICAgdGV4dCA9ICdTZWxlY3QgYXQgbGVhc3Qgb25lIGludGVyZXN0IHRvIGdldCBzdGFydGVkJztcbiAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgfVxuICAgZWxzZSBpZihzdGF0dXMudmFsLmZpcnN0TG9hZCAmJiBub0xvY2F0aW9uKXtcbiAgICAgIHRleHQgPSAnU2VsZWN0IGF0IGxlYXN0IG9uZSBsb2NhdGlvbiB0byBnZXQgc3RhcnRlZCc7XG4gICAgICBidG4uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgIH1cbiAgIGVsc2UgaWYoc3RhdHVzLnZhbC5maXJzdExvYWQpe1xuICAgICAgdGV4dCA9ICdDbGljayB0aGUgYnV0dG9uIHRvIGdldCBzdGFydGVkJ1xuICAgICAgaWNvbiA9IG51bGw7XG4gICAgICBidG4uYWRkQ2xhc3MoJ3B1bHNlJyk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICBidG4ucmVtb3ZlQ2xhc3MoJ3B1bHNlJyk7XG4gICAgICB9LCA1MDApO1xuICAgfVxuICAgZWxzZSBpZihub0ludGVyZXN0KXtcbiAgICAgIHRleHQgPSAnU2VsZWN0IGF0IGxlYXN0IG9uZSBpbnRlcmVzdCB0byBzZWFyY2ggZm9yIHJlY3JlYXRpb24gYXJlYXMnO1xuICAgICAgYnRuLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICB9XG4gICBlbHNlIGlmKG5vTG9jYXRpb24pe1xuICAgICAgdGV4dCA9ICdTZWxlY3QgYXQgbGVhc3Qgb25lIGxvY2F0aW9uIHRvIHNlYXJjaCBmb3IgcmVjcmVhdGlvbiBhcmVhcyc7XG4gICAgICBidG4uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgIH1cbiAgIGVsc2V7XG4gICAgICB0ZXh0ID0gJ05ldyByZWNyZWF0aW9uIGFyZWFzIG1heSBiZSBhdmFpbGFibGUuJ1xuICAgICAgaWNvbiA9IG51bGw7XG4gICAgICBidG4uYWRkQ2xhc3MoJ3B1bHNlJyk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICBidG4ucmVtb3ZlQ2xhc3MoJ3B1bHNlJyk7XG4gICAgICB9LCA1MDApO1xuICAgfVxuXG4gICBjb250YWluZXIuZW1wdHkoKTtcbiAgIGlmKCBzdGF0dXMudmFsLnNob3VsZExvYWQgfHwgc3RhdHVzLnZhbC5maXJzdExvYWQgfHwgIXN0YXR1cy52YWwuY2FuTG9hZCl7XG4gICAgICBjb250YWluZXIuYXBwZW5kKCQoJzxwPicpLnRleHQodGV4dCkucHJlcGVuZChpY29uKSwgYnRuKTtcbiAgIH1cbiAgIGVsc2UgaWYoc3RhdHVzLnZhbC5sb2FkaW5nKXtcbiAgICAgIHRleHQgPSAnTG9hZGluZyByZWNyZWF0aW9uIGFyZWFz4oCmJ1xuICAgICAgY29udGFpbmVyLmFwcGVuZCgkKCc8cD4nKS50ZXh0KHRleHQpLCBcbiAgICAgICAgIGA8ZGl2IGNsYXNzPVwicHJlbG9hZGVyLXdyYXBwZXIgYmlnIGFjdGl2ZVwiPlxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLWxheWVyIHNwaW5uZXItYmx1ZS1vbmx5XCI+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlLWNsaXBwZXIgbGVmdFwiPlxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICA8L2Rpdj48ZGl2IGNsYXNzPVwiZ2FwLXBhdGNoXCI+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PjxkaXYgY2xhc3M9XCJjaXJjbGUtY2xpcHBlciByaWdodFwiPlxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgPC9kaXY+YCk7XG4gICB9XG59XG5cbnN0YXRlLmludGVyZXN0cy5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4gICB2YXIgbG9hZGVkID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMubG9hZGVkQWN0aXZpdGllcztcbiAgIHZhciBmaWx0ZXJlZCA9IHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLmZpbHRlcmVkQWN0aXZpdGllcztcbiAgIHZhciBzaG91bGRMb2FkID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzO1xuICAgdmFyIHNob3VsZEZpbHRlciA9IGZhbHNlO1xuICAgdmFyIHJlc2V0Q29vcmRzID0gZmFsc2U7XG4gICBlLnZhbC5hbGwuZm9yRWFjaCgoaW50ZXJlc3QpID0+IHtcbiAgICAgIGlmKCFsb2FkZWRbaW50ZXJlc3QuaWRdICYmIGludGVyZXN0LnNlbGVjdGVkKXtcbiAgICAgICAgIHNob3VsZExvYWQgPSB0cnVlO1xuICAgICAgICAgcmVzZXRDb29yZHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYoaW50ZXJlc3Quc2VsZWN0ZWQgIT09IGZpbHRlcmVkW2ludGVyZXN0LmlkXSl7XG4gICAgICAgICBzaG91bGRGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgZmlsdGVyZWRbaW50ZXJlc3QuaWRdID0gaW50ZXJlc3Quc2VsZWN0ZWQ7XG4gICAgICB9XG4gICB9KTtcbiAgIHZhciBjYW5Mb2FkID0gISFlLnZhbC5zZWxlY3RlZC5sZW5ndGggJiYgISFzdGF0ZS5yb3V0ZS5sb2NhdGlvbkNvdW50O1xuICAgc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRDb29yZHMgPSByZXNldENvb3JkcztcbiAgIHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLnVwZGF0ZSh7c2hvdWxkTG9hZDogc2hvdWxkTG9hZCwgY2FuTG9hZDogY2FuTG9hZH0pO1xuICAgaWYoIHNob3VsZEZpbHRlcil7XG4gICAgICBzdGF0ZS5yZWNyZWF0aW9uLmZpbHRlckFsbCgpO1xuICAgfVxufSk7XG5cbi8vcmV0dXJucyB0cnVlIGlmIHRoZSBhcmVhIG9mIEEgaXMgKG1vc3RseSkgY29udGFpbmVkIGluIHRoZSBhcmVhIG9mIEJcbmZ1bmN0aW9uIGlzQ29udGFpbmVkKGFyckEsIHJhZEEsIGFyckIsIHJhZEIpe1xuICAgbGV0IGFsbENvbnRhaW5lZCA9IHRydWU7XG4gICBmb3IgKGxldCBpID0gMDsgaSA8IGFyckEubGVuZ3RoICYmIGFsbENvbnRhaW5lZDsgaSsrKXtcbiAgICAgIGxldCBjdXJyZW50Q29udGFpbmVkID0gZmFsc2U7XG4gICAgICBmb3IoIGxldCBqID0gMDsgaiA8IGFyckIubGVuZ3RoICYmICFjdXJyZW50Q29udGFpbmVkOyBqKyspe1xuICAgICAgICAgbGV0IGRpc3RhbmNlID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsLmNvbXB1dGVEaXN0YW5jZUJldHdlZW4oXG4gICAgICAgICAgICBhcnJBW2ldLCBhcnJCW2pdKTtcbiAgICAgICAgIGlmKGRpc3RhbmNlIDw9IHJhZEIgLSByYWRBKXtcbiAgICAgICAgICAgIGN1cnJlbnRDb250YWluZWQgPSB0cnVlO1xuICAgICAgICAgfVxuICAgICAgICAgaWYoIWN1cnJlbnRDb250YWluZWQgJiYgaiA8IGFyckIubGVuZ3RoIC0gMSl7XG4gICAgICAgICAgICBsZXQgZDEgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgIGxldCBkMiA9IGdvb2dsZS5tYXBzLmdlb21ldHJ5LnNwaGVyaWNhbC5jb21wdXRlRGlzdGFuY2VCZXR3ZWVuKFxuICAgICAgICAgICAgYXJyQVtpXSwgYXJyQltqICsgMV0pO1xuICAgICAgICAgICAgY3VycmVudENvbnRhaW5lZCA9IGQxIDwgcmFkQiAmJiBkMiA8IHJhZEI7XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgICBhbGxDb250YWluZWQgPSBjdXJyZW50Q29udGFpbmVkO1xuICAgfVxuICAgcmV0dXJuIGFsbENvbnRhaW5lZDtcbn1cblxuc3RhdGUubWFwLmRpcmVjdGlvbnMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgLy9tYWtlIHRoaXMgY29uc3RhbnQgNTAgbWlsZXMhXG4gICB2YXIgcmFkaXVzID0gc3RhdGUucmVjcmVhdGlvbi5zZWFyY2hSYWRpdXM7XG4gICB2YXIgbG9hZGVkU2VhcmNoQ29vcmRzID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMubG9hZGVkU2VhcmNoQ29vcmRzO1xuICAgdmFyIG5ld1JvdXRlQ29vcmRzID0gZS52YWwuZ2V0Q29vcmRzQnlSYWRpdXMocmFkaXVzKTtcbiAgIHZhciBzaG91bGRMb2FkID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRDb29yZHM7XG4gICB2YXIgc2hvdWxkRmlsdGVyID0gdHJ1ZTtcbiAgIHZhciByZXNldEFjdGl2aXRpZXMgPSBmYWxzZTtcblxuICAgLy9pZiB0aGVyZSBpcyBubyBsb2NhdGlvbiBnaXZlblxuICAgaWYobmV3Um91dGVDb29yZHMgPT0gbnVsbCl7XG4gICAgICAvL2RvIG5vdGhpbmc7XG4gICB9XG4gICAvL2lmIG5vdGhpbmcgaGFzIGJlZW4gbG9hZGVkXG4gICBlbHNlIGlmKCFsb2FkZWRTZWFyY2hDb29yZHMubGVuZ3RoKXtcbiAgICAgIHNob3VsZExvYWQgPSB0cnVlO1xuICAgICAgcmVzZXRBY3Rpdml0aWVzID0gdHJ1ZTtcbiAgIH1cbiAgIGVsc2V7XG4gICAgICBsZXQgbmV3QXJlYSA9ICFpc0NvbnRhaW5lZChuZXdSb3V0ZUNvb3JkcywgcmFkaXVzLCBsb2FkZWRTZWFyY2hDb29yZHMsIDE2MDkzNCk7XG4gICAgICBzaG91bGRMb2FkID0gbmV3QXJlYSB8fCBzaG91bGRMb2FkO1xuICAgICAgcmVzZXRBY3Rpdml0aWVzID0gbmV3QXJlYTtcbiAgIH1cblxuICAgdmFyIGNhbkxvYWQgPSAhIXN0YXRlLnJvdXRlLmxvY2F0aW9uQ291bnQgJiYgISFzdGF0ZS5pbnRlcmVzdHMuc2VsZWN0ZWQubGVuZ3RoO1xuICAgc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzID0gcmVzZXRBY3Rpdml0aWVzO1xuXG4gICBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy51cGRhdGUoe3Nob3VsZExvYWQ6IHNob3VsZExvYWQsIGNhbkxvYWQ6IGNhbkxvYWR9KTtcbiAgIGlmKCBzaG91bGRGaWx0ZXIpe1xuICAgICAgc3RhdGUucmVjcmVhdGlvbi5maWx0ZXJBbGwoKTtcbiAgIH1cbn0pO1xuXG4vLyAvL21pZ2h0IGhhdmUgdG8gd2FpdCBmb3IgZGlyZWN0aW9ucyB0byBjb21lIGJhY2sgYW5kIGJlIHByb2Nlc3NlZC4uLlxuLy8gc3RhdGUucm91dGUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuLy8gICAgc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzID0gdHJ1ZTtcbi8vICAgIHZhciBzaG91bGRMb2FkID0gISFlLnZhbC5sZW5ndGg7XG4vLyAgICB2YXIgY2FuTG9hZCA9ICEhZS52YWwubGVuZ3RoICYmICEhc3RhdGUuaW50ZXJlc3RzLnNlbGVjdGVkLmxlbmd0aDtcbi8vICAgIHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLnVwZGF0ZSh7c2hvdWxkTG9hZDogc2hvdWxkTG9hZCwgY2FuTG9hZDogY2FuTG9hZH0pO1xuLy8gfSlcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4gc2hvd0J1dHRvbihzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5tYWtlRXZlbnQoKSkpO1xuc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMub24oJ2NoYW5nZScsIHNob3dCdXR0b24pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL2xvYWRCdXR0b24uanNcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9pbnRlcmVzdHMuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5qc1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vaW50ZXJlc3RzLmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9pbnRlcmVzdHMuY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2ludGVyZXN0cy5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3Ncbi8vIG1vZHVsZSBpZCA9IDE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikodW5kZWZpbmVkKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5pbnRlcmVzdHN7XFxuICAgYmFja2dyb3VuZDogb3JhbmdlO1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3Ncbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9sYXlvdXQuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICQoJ3NlbGVjdCcpLm1hdGVyaWFsX3NlbGVjdCgpO1xuICAgIFxuXHRcbiAgICBmdW5jdGlvbiBhZGRDaGlwKCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGUuaW50ZXJlc3RzLmFsbC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XG5cdFx0XHRsZXQgbmV3Q2hpcCA9ICQoJzxkaXYgY2xhc3M9XCJjaGlwIGNlbnRlclwiPjwvZGl2PicpO1xuXHRcdFx0JChcIiN1bnNlbGVjdGVkLWludGVyZXN0c1wiKS5hcHBlbmQobmV3Q2hpcC50ZXh0KHN0YXRlLmludGVyZXN0cy5hbGxbaV0ubmFtZSkpO1xuXHRcdFx0XG5cdFx0XHQkKG5ld0NoaXApLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzdGF0ZS5pbnRlcmVzdHMuYWxsW2ldLnRvZ2dsZSgpO1xuXHRcdFx0fSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0XHQvLyBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ludGVyZXN0cycpICE9PSBudWxsKSB7XG5cdFx0XHQvLyBcdHN0YXRlLmludGVyZXN0cy5lbWl0KCdjaGFuZ2UnKTtcblx0XHRcdFxuXHRcdFx0Ly8gaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbnRlcmVzdHMnKSAhPT0gbnVsbCkge1xuXHRcdFx0Ly8gXHRsZXQgaW50ZXJlc3RzQXJyYXkgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbnRlcmVzdHMnKSk7XG5cdFx0XHRcdFxuXG5cdFx0XHQvLyBcdGlmIChpbnRlcmVzdHNBcnJheVtzdGF0ZS5pbnRlcmVzdHMuYWxsW2ldLmlkXSA9PT0gdHJ1ZSApIHtcblx0XHRcdC8vIFx0XHRzdGF0ZS5pbnRlcmVzdHMuYWxsW2ldLnNlbGVjdGVkID0gdHJ1ZTtcblx0XHRcdC8vIFx0fVxuXHRcdFx0Ly8gfVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHRzdGF0ZS5pbnRlcmVzdHMuYWxsW2ldLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcblx0XHRcdGlmKGUudmFsKSB7XG5cdFx0XHRcdG5ld0NoaXAuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRcdFx0JChcIiNzZWxlY3RlZC1pbnRlcmVzdHNcIikuYXBwZW5kKG5ld0NoaXApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdCBcdG5ld0NoaXAucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0XHQgXHQkKFwiI3Vuc2VsZWN0ZWQtaW50ZXJlc3RzXCIpLnByZXBlbmQobmV3Q2hpcCk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhZGRDaGlwKCk7XG5cblxuXHQkKFwiI2NsZWFyLWludGVyZXN0c1wiKS5jbGljayhmdW5jdGlvbigpIHtcblx0XG5cdFx0c3RhdGUuaW50ZXJlc3RzLnNlbGVjdGVkLmZvckVhY2goZnVuY3Rpb24oY2xlYXIpIHtcblx0XHRcdGNsZWFyLnVwZGF0ZShmYWxzZSwgdHJ1ZSk7XG5cdFx0fSk7XG5cdFx0c3RhdGUuaW50ZXJlc3RzLmVtaXQoJ2NoYW5nZScpO1xuXHR9KTtcblx0XG5cdCQoXCIuZGVzdGluYXRpb24taW5wdXRcIikub24oJ2ZvY3VzJywgZnVuY3Rpb24oKSB7XG4gXHRcdGlmICgkKFwiI2ludGVyZXN0cy1oZWFkZXJcIikuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XG4gXHRcdFx0JChcIiNpbnRlcmVzdHMtaGVhZGVyXCIpLmNsaWNrKCk7XG4gXHRcdH1cbiBcdH0pO1xuXG5cblx0JCgnI3R1dG9yaWFsLW1vZGFsJykubW9kYWwoe1xuXHQgIGluRHVyYXRpb246IDMwMCxcblx0ICBzdGFydGluZ1RvcDogJzQwJScsIC8vIFN0YXJ0aW5nIHRvcCBzdHlsZSBhdHRyaWJ1dGVcblx0ICBlbmRpbmdUb3A6ICcxMCUnXG5cdH0pO1xuXG59KTtcblxuXG5cblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmpzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9sYXlvdXQuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2xheW91dC5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbGF5b3V0LmNzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmNzc1xuLy8gbW9kdWxlIGlkID0gMThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLnRlc3QtY2xhc3N7XFxuICAgYmFja2dyb3VuZDogbGltZTtcXG59XFxuXFxuLmxheW91dHtcXG4gICBiYWNrZ3JvdW5kOiByZWJlY2NhcHVycGxlO1xcbn1cXG5cXG4uY2hpcCB7XFxuXFx0YmFja2dyb3VuZDogI2U4ZThlODtcXG5cXHRjdXJzb3I6IHBvaW50ZXI7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0bWF4LWhlaWdodDogMmVtO1xcblxcdGxpbmUtaGVpZ2h0OiAyZW07XFxuXFx0cGFkZGluZzogMHB4O1xcblxcdG1hcmdpbi1yaWdodDogMHB4O1xcbn1cXG4uc2VsZWN0ZWR7XFxuXFx0YmFja2dyb3VuZDogcmdiYSgxMTEsIDE3OSwgMTMyLCAwLjQpO1xcbn1cXG5cXG4jbWFwIHtcXG5cXHR0b3A6IDdweDtcXG59XFxuXFxuLm5hdi13cmFwcGVyLCAuYnRuLCAuYnRuLWZsb2F0aW5nIHtcXG5cXHRiYWNrZ3JvdW5kOiAjNmZiMzg0O1xcblxcdGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLmNvbGxhcHNpYmxlLWJvZHkge1xcblxcdHBhZGRpbmc6IDE1cHg7XFxuXFx0bWF4LWhlaWdodDogODB2aDtcXG5cXHRvdmVyZmxvdzogYXV0bztcXG59XFxuXFxuLmNvbGxhcHNpYmxlLWhlYWRlciB7XFxuXFx0YmFja2dyb3VuZDogIzVGOEE5NztcXG5cXHRjb2xvcjogd2hpdGU7XFxufVxcblxcbi5jZW50ZXIge1xcblxcdHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLmJ0bjpob3ZlciB7XFxuXFx0YmFja2dyb3VuZDogIzQ1OTU1RDtcXG59XFxuXFxuLm1vZGFsLWNvbnRlbnQge1xcblxcdGJhY2tncm91bmQ6ICNkZmVhZGY7XFxufVxcblxcbi50YWJzIC50YWIgYSB7XFxuXFx0Y29sb3I6ICM2ZmIzODQ7XFxufVxcblxcbi50YWJzIC50YWIgYS5hY3RpdmUge1xcblxcdGNvbG9yOiAjNmZiMzg0O1xcbn1cXG5cXG4gLnRhYnMgLmluZGljYXRvciB7XFxuIFxcdGJhY2tncm91bmQ6ICM2ZmIzODQ7XFxuIH1cXG5cXG4gLnBhZGRpbmcge1xcbiBcXHRwYWRkaW5nLXRvcDogMTBweDtcXG4gfVxcbi5maXhlZCB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMTBweDtcXG5cXHRyaWdodDogMTBweDtcXG5cXHRjb2xvcjogZ3JheTtcXG59XFxuXFxuI2ZvbnQtc2l6ZS0xMiB7XFxuXFx0Zm9udC1zaXplOiAxMnB4O1xcblxcdG1hcmdpbi1ib3R0b206IDBweDtcXG59XFxuXFxuLnJhbmdlLWZpZWxkIHtcXG5cXHRtYXJnaW4tdG9wOiAwcHg7XFxuXFx0cGFkZGluZzogMCAxNXB4O1xcbn1cXG5cXG4udGFicyB7XFxuXFx0b3ZlcmZsb3cteDogaGlkZGVuO1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9tYXAuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwY29uc3RhbnQnO1xuXG5jb25zdCBkaXJlY3Rpb25zU2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zU2VydmljZSgpO1xuY29uc3QgZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKCk7XG5cblxuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKG1hcCk7XG5kaXJlY3Rpb25zRGlzcGxheS5zZXRQYW5lbChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlyZWN0aW9ucy1jb250YWluZXInKSk7XG5cbmxldCByb3V0ZU1hcmtlcnMgPSBbXTtcblxuc3RhdGUucm91dGUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgLy9yZW1vdmUgYWxsIG1hcmtlcnNcbiAgIHJvdXRlTWFya2Vycy5mb3JFYWNoKChtKSA9PiB7XG4gICAgICBtLnNldE1hcChudWxsKTtcbiAgIH0pO1xuICAgcm91dGVNYXJrZXJzID0gW107XG5cbiAgIC8vIC8vYWRkIG5ldyBtYXJrZXJzXG4gICBpZihzdGF0ZS5yb3V0ZS5sb2NhdGlvbkNvdW50ID09PSAxKXtcbiAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldCgnZGlyZWN0aW9ucycsIG51bGwpO1xuICAgICAgaWYoc3RhdGUucm91dGUucGF0aFswXS5kYXRhLmdlb21ldHJ5KXtcbiAgICAgICAgIG1hcC5maXRCb3VuZHMoZS52YWxbMF0uZGF0YS5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICBhZGRNYXJrZXIoZS52YWxbMF0uZGF0YS5nZW9tZXRyeS5sb2NhdGlvbiwgJ3JvdXRlJyk7XG4gICAgICAgICAvL3VwZGF0ZSByb3V0ZSB3aXRoIG9uZSBsb2NhdGlvblxuICAgICAgICAgc3RhdGUubWFwLmRpcmVjdGlvbnMudXBkYXRlKGUudmFsWzBdLmRhdGEuZ2VvbWV0cnkubG9jYXRpb24pO1xuICAgICAgfVxuICAgICAgZWxzZSBpZihzdGF0ZS5yb3V0ZS5wYXRoWzBdLmRhdGEuUmVjQXJlYU5hbWUpe1xuICAgICAgICAgbGV0IGNvb3JkcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoe1xuICAgICAgICAgICAgbGF0OiBlLnZhbFswXS5kYXRhLlJlY0FyZWFMYXRpdHVkZSxcbiAgICAgICAgICAgIGxuZzogZS52YWxbMF0uZGF0YS5SZWNBcmVhTG9uZ2l0dWRlXG4gICAgICAgICB9KTtcbiAgICAgICAgIHN0YXRlLm1hcC5kaXJlY3Rpb25zLnVwZGF0ZShjb29yZHMpO1xuICAgICAgICAgbWFwLnNldENlbnRlcihjb29yZHMpO1xuICAgICAgICAgbWFwLnNldFpvb20oOCk7XG4gICAgICAgICBhZGRNYXJrZXIoY29vcmRzLCAncm91dGUnKTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICBsZXQgY29vcmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyh7XG4gICAgICAgICAgICBsYXQ6IGUudmFsWzBdLmRhdGEubGF0LFxuICAgICAgICAgICAgbG5nOiBlLnZhbFswXS5kYXRhLmxuZ1xuICAgICAgICAgfSk7XG4gICAgICAgICBzdGF0ZS5tYXAuZGlyZWN0aW9ucy51cGRhdGUoY29vcmRzKTtcbiAgICAgICAgIG1hcC5zZXRDZW50ZXIoY29vcmRzKTtcbiAgICAgICAgIG1hcC5zZXRab29tKDgpO1xuICAgICAgICAgYWRkTWFya2VyKGNvb3JkcywgJ3JvdXRlJyk7XG4gICAgICB9XG4gICB9XG4gICBlbHNlIGlmKHN0YXRlLnJvdXRlLmxvY2F0aW9uQ291bnQpe1xuICAgICAgaWYoc3RhdGUucm91dGUuc2hvdWxkWm9vbU1hcCl7XG4gICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXQoJ3ByZXNlcnZlVmlld3BvcnQnLCBmYWxzZSk7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkuc2V0KCdwcmVzZXJ2ZVZpZXdwb3J0JywgdHJ1ZSk7XG4gICAgICB9XG4gICAgICAvL2dldCBkaXJlY3Rpb25zXG4gICAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgICAgIG9yaWdpbjogc3RhdGUucm91dGUub3JpZ2luLFxuICAgICAgICAgZGVzdGluYXRpb246IHN0YXRlLnJvdXRlLmRlc3RpbmF0aW9uLFxuICAgICAgICAgdHJhdmVsTW9kZTogJ0RSSVZJTkcnXG4gICAgICB9XG4gICAgICBpZihzdGF0ZS5yb3V0ZS53YXlwb2ludHMpXG4gICAgICAgICByZXF1ZXN0LndheXBvaW50cyA9IHN0YXRlLnJvdXRlLndheXBvaW50cztcbiAgICAgIGRpcmVjdGlvbnNTZXJ2aWNlLnJvdXRlKHJlcXVlc3QsIGZ1bmN0aW9uKHJlc3VsdCwgc3RhdHVzKSB7XG4gICAgICAgICBpZiAoc3RhdHVzID09ICdPSycpIHtcbiAgICAgICAgICAgIHN0YXRlLm1hcC5kaXJlY3Rpb25zLnVwZGF0ZShyZXN1bHQucm91dGVzWzBdKTtcbiAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldERpcmVjdGlvbnMocmVzdWx0KTtcbiAgICAgICAgIH1cbiAgICAgICAgIC8vZWxzZSBzaG93IHNvbWUgZXJyb3IgdG9hc3Q/XG4gICAgICAgICBzdGF0ZS5yb3V0ZS5zaG91bGRab29tTWFwID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgfVxuICAgZWxzZXtcbiAgICAgIHN0YXRlLm1hcC5kaXJlY3Rpb25zLnVwZGF0ZShudWxsKTtcbiAgIH1cbn0pXG5cbmxldCByZWNBcmVhTWFya2VycyA9IFtdO1xuXG5zdGF0ZS5yZWNyZWF0aW9uLmZpbHRlcmVkLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKXtcbiAgIGxldCBtYXJrZXJNYXAgPSB7fTtcbiAgIGxldCBuZXdNYXJrZXJzID0gW107XG4gICBlLnZhbC5mb3JFYWNoKChyKSA9PiB7XG4gICAgICBpZighci5tYXJrZXIpe1xuICAgICAgICAgci5hZGRNYXJrZXIoKTtcbiAgICAgICAgIHIubWFya2VyLnNldE1hcChtYXApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZighci5tYXJrZXJEaXNwbGF5ZWQpe1xuICAgICAgICAgci5tYXJrZXIuc2V0TWFwKG1hcCk7XG4gICAgICB9XG4gICAgICByLm1hcmtlckRpc3BsYXllZCA9IHRydWU7XG4gICAgICBtYXJrZXJNYXBbci5pZF0gPSB0cnVlO1xuICAgICAgbmV3TWFya2Vycy5wdXNoKHIpO1xuICAgfSk7XG5cbiAgIC8vcmVtb3ZlIGZpbHRlcmVkIG91dCBtYXJrZXJzXG4gICByZWNBcmVhTWFya2Vycy5mb3JFYWNoKChyKSA9PiB7XG4gICAgICBpZighbWFya2VyTWFwW3IuaWRdKXtcbiAgICAgICAgIHIubWFya2VyLnNldE1hcChudWxsKTtcbiAgICAgICAgIHIubWFya2VyRGlzcGxheWVkID0gZmFsc2U7XG4gICAgICB9XG4gICB9KTtcbiAgIHJlY0FyZWFNYXJrZXJzID0gbmV3TWFya2Vycztcbn0pO1xuXG5cblxuZnVuY3Rpb24gYWRkTWFya2VyKGxvY2F0aW9uLCB0eXBlLCBhcmVhKSB7XG4gICBsZXQga3dhcmdzID0ge1xuICAgICAgcG9zaXRpb246IGxvY2F0aW9uLFxuICAgICAgbWFwOiBtYXBcbiAgIH1cbiAgIGlmKHR5cGUgPT09ICdyb3V0ZScpe1xuICAgICAga3dhcmdzLmxhYmVsID0gJ0EnO1xuICAgfVxuICAgbGV0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoa3dhcmdzKTtcbiAgIGlmKGFyZWEpe1xuICAgICAgbGV0IGluZm8gPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyh7Y29udGVudDogbWFrZVByZXZpZXcoYXJlYSl9KTtcbiAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignbW91c2VvdmVyJywgKGUpID0+IHtcbiAgICAgICAgIGluZm8ub3BlbihtYXAsIG1hcmtlcik7XG4gICAgICB9KTtcbiAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignbW91c2VvdXQnLCAoZSkgPT4ge1xuICAgICAgICAgaW5mby5jbG9zZSgpO1xuICAgICAgfSk7XG4gICAgICBtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgYXJlYS5zaG93RGV0YWlscyk7XG4gICB9XG4gICBpZiggdHlwZSA9PT0gJ3JlYycpe1xuICAgICAgcmVjQXJlYU1hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgfVxuICAgZWxzZSBpZih0eXBlID09PSAncm91dGUnKXtcbiAgICAgIHJvdXRlTWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICB9XG4gICBlbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZXIgdHlwZSBtdXN0IGJlIGVpdGhlciBcInJlY1wiIG9yIFwicm91dGVcIicpO1xuICAgfVxufVxuXG5tYXAuYWRkTGlzdGVuZXIoJ2lkbGUnLCBmdW5jdGlvbigpe1xuICAgc3RhdGUucmVjcmVhdGlvbi5maWx0ZXJBbGwoKTtcbn0pXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICAkKCcjZGlyZWN0aW9ucy1tb2RhbCcpLm1vZGFsKCk7XG4gICB2YXIgZGlyZWN0aW9uc0J0biA9ICQoJzxhIGhyZWY9XCIjXCI+JylcbiAgIC5hcHBlbmQoJCgnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPicpLnRleHQoJ2RpcmVjdGlvbnMnKSlcbiAgIC5jc3Moe1xuICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZmZicsXG4gICAgICBjb2xvcjogJyM3NDc0NzQnLFxuICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnMnB4JyxcbiAgICAgIG1hcmdpbjogJzEwcHgnLFxuICAgICAgcGFkZGluZzogJzAgM3B4JyxcbiAgICAgIGhlaWdodDogJzI1cHgnLFxuICAgICAgJ2xpbmUtaGVpZ2h0JzogJzI1cHgnLFxuICAgICAgJ2JveC1zaGFkb3cnOiAncmdiYSgwLCAwLCAwLCAwLjMpIDBweCAxcHggNHB4IC0xcHgnXG4gICB9KVxuICAgLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAkKCcjZGlyZWN0aW9ucy1tb2RhbCcpLm1vZGFsKCdvcGVuJyk7XG4gICB9KTtcbiAgIG1hcC5jb250cm9sc1tnb29nbGUubWFwcy5Db250cm9sUG9zaXRpb24uVE9QX0NFTlRFUl0ucHVzaChkaXJlY3Rpb25zQnRuWzBdKTtcblxuICAgdmFyIHNsaWRlciA9ICQoJyNyYWRpdXMtc2xpZGVyJyk7XG4gICB2YXIgY2lyY2xlcyA9IFtdO1xuICAgc2xpZGVyLm9uKCdtb3VzZWRvd24gZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgLy9zZXQgcmFkaXVzIGZyb20gc2xpZGVyIHZhbFxuICAgICAgc3RhdGUucmVjcmVhdGlvbi5zZWFyY2hSYWRpdXMgPSBzbGlkZXIudmFsKCkgKiAxNjA5LjM0O1xuICAgICAgbGV0IHJhZCA9IHN0YXRlLnJlY3JlYXRpb24uc2VhcmNoUmFkaXVzO1xuICAgICAgdmFyIGNvb3JkcyA9IHN0YXRlLm1hcC5kaXJlY3Rpb25zLmdldENvb3Jkc0J5UmFkaXVzKHJhZCk7XG4gICAgICBpZihjb29yZHMpe1xuICAgICAgICAgY29vcmRzLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgIGxldCBjaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcbiAgICAgICAgICAgICAgIGNlbnRlcjogYyxcbiAgICAgICAgICAgICAgIHJhZGl1czogcmFkLFxuICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnYmx1ZScsXG4gICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC4zMyxcbiAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmVkJyxcbiAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICBtYXA6IG1hcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaXJjbGVzLnB1c2goY2lyY2xlKTtcbiAgICAgICAgIH0pO1xuICAgICAgfVxuICAgfSk7XG4gICBzbGlkZXIub24oJ21vdXNldXAgZm9jdXNvdXQnLCBmdW5jdGlvbigpe1xuICAgICAgY2lyY2xlcy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICAgICBjLnNldE1hcChudWxsKTtcbiAgICAgIH0pXG4gICAgICBjaXJjbGVzID0gW107XG4gICAgICBzdGF0ZS5yZWNyZWF0aW9uLmZpbHRlckFsbCgpO1xuICAgfSk7XG4gICBzbGlkZXIub24oJ2lucHV0JywgZnVuY3Rpb24oKXtcbiAgICAgIGNpcmNsZXMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgICAgYy5zZXRNYXAobnVsbCk7XG4gICAgICB9KVxuICAgICAgY2lyY2xlcyA9IFtdO1xuICAgICAgc3RhdGUucmVjcmVhdGlvbi5zZWFyY2hSYWRpdXMgPSBzbGlkZXIudmFsKCkgKiAxNjA5LjM0O1xuICAgICAgbGV0IHJhZCA9IHN0YXRlLnJlY3JlYXRpb24uc2VhcmNoUmFkaXVzO1xuICAgICAgdmFyIGNvb3JkcyA9IHN0YXRlLm1hcC5kaXJlY3Rpb25zLmdldENvb3Jkc0J5UmFkaXVzKHJhZCk7XG4gICAgICBpZihjb29yZHMpe1xuICAgICAgICAgY29vcmRzLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgIGxldCBjaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcbiAgICAgICAgICAgICAgIGNlbnRlcjogYyxcbiAgICAgICAgICAgICAgIHJhZGl1czogcmFkLFxuICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnYmx1ZScsXG4gICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC4zMyxcbiAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmVkJyxcbiAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICBtYXA6IG1hcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaXJjbGVzLnB1c2goY2lyY2xlKTtcbiAgICAgICAgIH0pO1xuICAgICAgfVxuICAgfSk7XG59KVxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL21hcC9tYXAuanNcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL21hcC5jc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbWFwLmNzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9tYXAuY3NzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL21hcC9tYXAuY3NzXG4vLyBtb2R1bGUgaWQgPSAyMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCJcXG4jbWFwe1xcbiAgIG1pbi1oZWlnaHQ6IDkwdmg7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwLmNzc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL3JvdXRlLmNzcyc7XG5pbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuXG52YXIgdG9vbHRpcCA9ICQoXG5cdCc8c3BhbiBjbGFzcz0gXCJyb3V0ZS10b29sdGlwXCIgZGF0YS10b29sdGlwPVwiU2VsZWN0IGZyb20gdGhlIGRyb3AtZG93biBtZW51LlwiIGRhdGEtcG9zaXRpb249XCJyaWdodFwiPidcbik7XG50b29sdGlwLnRvb2x0aXAoe2RlbGF5OiA1MH0pO1xuXG4vLyBGdW5jdGlvbiB0byBtYW5hZ2UgdGhlIHNvcnRpbmcgb2YgR29vZ2xlIFBsYWNlcyBsb2NhdGlvbnMuXG4vLyBVc2luZyBqcXVlcnkudWkgZm9yIHNvcnRpbmcgZnVuY3Rpb24uXG4kKGZ1bmN0aW9uKCkge1xuICAkKCBcIi5zb3J0YWJsZVwiICkuc29ydGFibGUoe1xuICAgIHJldmVydDogdHJ1ZSwgXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBpbnB1dFNlY3Rpb24uY2hpbGRyZW4oKTtcbiAgICAgIHZhciBjaGVja2VyID0gMDtcbiAgICAgIHZhciBzdGF0ZUxvY2F0aW9uO1xuICAgICAgdmFyIGxpc3RMb2NhdGlvbjtcbiAgICAgIC8vIExvZ2ljIGNyZWF0ZWQgdG8gZGV0ZXJtaW5lIHdoZXJlIHRoZSBvcmlnaW5hbCBkZXN0aW5hdGlvbiB3YXMgbG9jYXRlZCwgd2hlcmUgaXQgd2FzIG1vdmVkLCBhbmQgdG8gdXBkYXRlIHRoZSBsb2NhdGlvbiBpbiBTdGF0ZS5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIFx0bGlzdExvY2F0aW9uID0gY2hpbGRyZW5baV0uZGF0YXNldC5udW1iZXI7XG4gICAgICBcdGlmIChsaXN0TG9jYXRpb24gIT0gY2hlY2tlcil7XG5cdCAgICAgIFx0aWYgKGxpc3RMb2NhdGlvbiA+IGNoZWNrZXIrMSl7XG5cdFx0XHRcdFx0XHR0b29sdGlwLm1vdXNlbGVhdmUoKTtcblx0XHRcdFx0XHRcdHRvb2x0aXAuZGV0YWNoKCk7XG5cdFx0XHRcdFx0XHRzdGF0ZUxvY2F0aW9uID0gc3RhdGUucm91dGUucGF0aFtsaXN0TG9jYXRpb25dLmRhdGE7XG5cdFx0XHRcdFx0XHRzdGF0ZS5yb3V0ZS5yZW1vdmUobGlzdExvY2F0aW9uLCB0cnVlKTtcblx0XHRcdFx0XHRcdHN0YXRlLnJvdXRlLmluc2VydChzdGF0ZUxvY2F0aW9uLCBpKTtcblx0ICAgICAgXHR9IGVsc2UgaWYgKGxpc3RMb2NhdGlvbiA9PSBjaGVja2VyKzEpe1xuXHQgICAgICBcdFx0Y2hlY2tlcisrO1xuXHQgICAgICBcdH0gZWxzZSBpZiAobGlzdExvY2F0aW9uIDwgY2hlY2tlci0xKXtcblx0XHRcdFx0XHR0b29sdGlwLm1vdXNlbGVhdmUoKTtcblx0XHRcdFx0XHR0b29sdGlwLmRldGFjaCgpO1xuXHQgICAgXHRcdFx0c3RhdGVMb2NhdGlvbiA9IHN0YXRlLnJvdXRlLnBhdGhbbGlzdExvY2F0aW9uXS5kYXRhO1xuXHQgICAgXHRcdFx0c3RhdGUucm91dGUucmVtb3ZlKGxpc3RMb2NhdGlvbiwgdHJ1ZSk7XG5cdFx0XHRcdFx0c3RhdGUucm91dGUuaW5zZXJ0KHN0YXRlTG9jYXRpb24sIGkpO1xuXHQgICAgICBcdH1cblx0ICAgICAgfVxuICAgICAgXHRjaGVja2VyKys7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG4vLyBPcHRpb25zIG9iamVjdCB0aGF0IHdpbGwgYmUgZmVkIGludG8gdGhlIEdvb2dsZSBQbGFjZXMgQVBJIGNhbGwuXG52YXIgb3B0aW9ucyA9IHtcbiAgY29tcG9uZW50UmVzdHJpY3Rpb25zOiB7Y291bnRyeTogJ3VzJ31cbn07XG5cbi8vIFZhcmlhYmxlcyBmb3IgdGhlIG5ldyBzZWN0aW9ucyB3aXRoaW4gdGhlICNkZXN0aW5hdGlvbnMgY29udGFpbmVyIGZvciB0aGUgc29ydGluZyBhbmQgZm9yIHRoZSBidXR0b24vbmV3IGlucHV0cy5cbnZhciBpbnB1dFNlY3Rpb24gPSAkKFwiPGRpdj5cIik7XG52YXIgYnV0dG9uU2VjdGlvbiA9ICQoJzxkaXYgY2xhc3M9XCJyb3V0ZS1idG4tY29udGFpbmVyXCI+Jyk7XG5cbi8vIEFwcGxpZXMgdGhlIFwic29ydGFibGVcIiBjbGFzcyB0byB0aGUgaW5wdXRTZWN0aW9uIGFyZWEgc28gb25seSB0aGF0IHNlY3Rpb24gY2FuIGJlIHNvcnRlZC5cbmlucHV0U2VjdGlvbi5hdHRyKFwiY2xhc3NcIiwgXCJzb3J0YWJsZVwiKTtcblxuLy8gQXBwZW5kaW5nIHRoZSBuZXcgZGl2cyB0byB0aGUgI2Rlc3RpbmF0aW9uIHNlY3Rpb24uXG4kKFwiI2Rlc3RpbmF0aW9uc1wiKS5hcHBlbmQoaW5wdXRTZWN0aW9uKTtcbiQoXCIjZGVzdGluYXRpb25zXCIpLmFwcGVuZChidXR0b25TZWN0aW9uKTtcblxuLy8gT24gcGFnZSBsb2FkLCBjYWxscyB0aGUgbmV3SW5wdXRGaWVsZCBmdW5jdGlvbiB0byBsb2FkIGEgXCJTdGFydGluZyBMb2NhdGlvblwiIGlucHV0IGZpZWxkLlxubmV3SW5wdXRGaWVsZCgpO1xuXG4vLyBGdW5jdGlvbiB0byB1cGRhdGUgdGhlIHN0YXRlIG9iamVjdCB3aGVuIHNvbWV0aGluZyB3aXRoaW4gdGhlIG9iamVjdCBpcyBjaGFuZ2VkLlxuc3RhdGUucm91dGUub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKGUpe1xuXHR2YXIgcGF0aCA9IGUudmFsO1xuXHQvLyBSZXNldHMgdGhlIGlucHV0IGFuZCBidXR0b24gU2VjdGlvbiBkaXZzIHRvIGF2b2lkIGR1cGxpY2F0aW9ucy5cblx0aW5wdXRTZWN0aW9uLmVtcHR5KCk7XG5cdGJ1dHRvblNlY3Rpb24uZW1wdHkoKTtcblx0Ly8gSWYgYWxsIGRlc3RpbmF0aW9ucyBoYXZlIGJlZW4gcmVtb3ZlZCwgY2FsbHMgdGhlIG5ld0lucHV0RmllbGQgZnVuY3Rpb24gdG8gcmUtYWRkIFwiU3RhcnRpbmcgTG9jYXRpb25cIiBpbnB1dCBmaWVsZC5cblx0aWYgKHBhdGgubGVuZ3RoID09IDApIHtcblx0XHRuZXdJbnB1dEZpZWxkKCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gUG9wdWxhdGVzIHRoZSBkZXN0aW5hdGlvbnMgc2VjdGlvbiB3aXRoIHRoZSBsb2NhdGlvbnMgc3RvcmVkIGluIHRoZSBzdGF0ZSBvYmplY3QuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBlLnZhbC5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IGxvY2F0aW9uID0gZS52YWxbaV07XG5cdFx0XHRsZXQgbmV3SW5wdXQ7XG5cdFx0XHR2YXIgaW5wdXRDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XG5cdFx0XHQvLyBBZGRzIHVpLXN0YXRlLWRlZmF1bHQgY2xhc3MgdG8gYWxsb3cgaW5wdXQgYm94ZXMgdG8gYmUgc29ydGFibGUgdmlhIGpxdWVyeS51aS5cblx0XHRcdGlucHV0Q29udGFpbmVyLmF0dHIoXCJjbGFzc1wiLCBcInJvdyBpbnB1dENvbnRhaW5lciB1aS1zdGF0ZS1kZWZhdWx0XCIpO1xuXHRcdFx0Ly8gU3RvcmVzIGRhdGEgbnVtYmVyIGluIHRoZSBpbnB1dENvbnRhaW5lciBmb3IgbWFuaXB1bGF0aW9uIGluIHRoZSBzb3J0YWJsZSBmdW5jdGlvbi5cblx0XHRcdGlucHV0Q29udGFpbmVyLmF0dHIoXCJkYXRhLW51bWJlclwiLCBpKTtcblx0XHRcdC8vIENyZWF0ZXMgYSBjbGVhbiB2aWV3IG9mIEdvb2dsZSBBZGRyZXNzIGZyb20gdGhlIFBsYWNlcyBuYW1lIGFuZCBhZGRyZXNzIHN0b3JlZCBpbiB0aGUgc3RhdGUgb2JqZWN0LlxuXHRcdFx0aWYgKGxvY2F0aW9uLnR5cGUgPT0gXCJwbGFjZVwiKSB7XG5cdFx0XHRcdG5ld0lucHV0ID0gJChcIjxpbnB1dD5cIikudmFsKGxvY2F0aW9uLmRhdGEubmFtZSArICcgKCcgKyBsb2NhdGlvbi5kYXRhLmZvcm1hdHRlZF9hZGRyZXNzICsgJyknKTtcblx0XHRcdH1cblx0XHRcdC8vIENyZWF0ZXMgYSBjbGVhbiB2aWV3IG9mIHRoZSBHb29nbGUgQWRkcmVzcyBmcm9tIHRoZSByZWNyZWF0aW9uIGxpc3QgaW4gY2FzZSB0aGF0IGlzIHRoZSBmaWVsZCB0eXBlIHN0b3JlZCBpbiB0aGUgc3RhdGUgb2JqZWN0LlxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdG5ld0lucHV0ID0gJChcIjxpbnB1dD5cIikudmFsKGxvY2F0aW9uLmRhdGEuUmVjQXJlYU5hbWUpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQWRkcyBhbmQgYXBwZW5kcyBhbGwgY2xhc3NlcywgYnV0dG9ucywgYW5kIGZ1bmN0aW9ucyBpbnNpZGUgdGhlIGlucHV0Q29udGFpbmVyLlxuXHRcdFx0bmV3SW5wdXQuYXR0cihcImNsYXNzXCIsIFwiY29sIHMxMCBtMTAgbDEwIHJvdXRlLWNob2ljZVwiKTtcblx0XHRcdGxldCBjbG9zZUlucHV0ID0gXCI8aSBjbGFzcz0nbWF0ZXJpYWwtaWNvbnMgY2xvc2UtaWNvbic+Y2xvc2U8L2k+XCI7XG5cdFx0XHRsZXQgbW92ZUlucHV0ID0gXCI8aSBjbGFzcz0nbWF0ZXJpYWwtaWNvbnMgbW92ZS1pY29uJz5kZWhhemU8L2k+XCI7XG5cdFx0XHRsZXQgY2xvc2VJbnB1dERpdiA9ICQoXCI8ZGl2IGNsYXNzPSdjb2wgczEgbTEgbDEgY2xvc2VJbnB1dERpdic+XCIpO1xuXHRcdFx0bGV0IG1vdmVJbnB1dERpdiA9ICQoXCI8ZGl2IGNsYXNzPSdjb2wgczEgbTEgbDEgbW92ZUlucHV0RGl2Jz5cIik7XG5cdFx0XHRtb3ZlSW5wdXREaXYuYXBwZW5kKG1vdmVJbnB1dCk7XG5cdFx0XHRpbnB1dENvbnRhaW5lci5hcHBlbmQobW92ZUlucHV0RGl2KTtcblx0XHRcdGlucHV0Q29udGFpbmVyLmFwcGVuZChuZXdJbnB1dCk7XG5cdFx0XHRjbG9zZUlucHV0RGl2LmFwcGVuZChjbG9zZUlucHV0KTtcblx0XHRcdGlucHV0Q29udGFpbmVyLmFwcGVuZChjbG9zZUlucHV0RGl2KTtcblx0XHRcdC8vIEZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgaW5wdXRDb250YWluZXIgaWYgdGhlIGNsb3NlIChYKSBidXR0b24gaXMgcHJlc3NlZC5cdFx0XHRcblx0XHRcdGNsb3NlSW5wdXREaXYuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYgKGxvY2F0aW9uLnR5cGUgPT09IFwicmVjYXJlYVwiKXtcblx0XHRcdCBcdFx0c3RhdGUucm91dGUucGF0aFtpXS5kYXRhLnNldEluUm91dGUoZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRvb2x0aXAubW91c2VsZWF2ZSgpO1xuXHRcdFx0XHR0b29sdGlwLmRldGFjaCgpO1xuXHRcdFx0IFx0c3RhdGUucm91dGUucmVtb3ZlKGkpO1xuXHRcdFx0fSk7XG5cdFx0XHQvLyBGdW5jdGlvbiB0byByZW1vdmUgdGhlIGlucHV0Q29udGFpbmVyIGlmIHRoZSB1c2VyIGZvY3VzZXMgb3V0IG9mIHRoZSBpbnB1dCB3aGlsZSBpdCBpcyBibGFuay5cdFx0XHRcblx0XHRcdG5ld0lucHV0LmZvY3Vzb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHQgXHRpZiAobmV3SW5wdXQudmFsKCkgPT0gXCJcIil7XG5cdFx0XHQgXHRcdGlmIChsb2NhdGlvbi50eXBlID09PSBcInJlY2FyZWFcIil7XG5cdFx0XHQgXHRcdFx0c3RhdGUucm91dGUucGF0aFtpXS5kYXRhLnNldEluUm91dGUoZmFsc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0b29sdGlwLm1vdXNlbGVhdmUoKTtcblx0XHRcdFx0XHR0b29sdGlwLmRldGFjaCgpO1xuXHRcdFx0IFx0XHRzdGF0ZS5yb3V0ZS5yZW1vdmUoaSk7XG5cdFx0XHQgXHR9XG5cdFx0XHR9KTtcblx0XHRcdC8vIEZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgaW5wdXRDb250YWluZXIgaWYgZW50ZXIgaXMgcHJlc3NlZCB3aGlsZSB0aGUgaW5wdXQgaXMgYmxhbmsuXG5cdFx0XHRuZXdJbnB1dC5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRpZiAoZS53aGljaCA9PT0gMTMgJiYgbmV3SW5wdXQudmFsKCkgPT0gXCJcIil7XG5cdFx0XHQgXHRcdGlmIChsb2NhdGlvbi50eXBlID09PSBcInJlY2FyZWFcIil7XG5cdFx0XHQgXHRcdFx0c3RhdGUucm91dGUucGF0aFtpXS5kYXRhLnNldEluUm91dGUoZmFsc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0b29sdGlwLm1vdXNlbGVhdmUoKTtcblx0XHRcdFx0XHR0b29sdGlwLmRldGFjaCgpO1xuXHRcdFx0XHRcdHN0YXRlLnJvdXRlLnJlbW92ZShpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHQvLyBBZGRzIHRoZSBjb21wbGV0ZWQgaW5wdXRDb250YWluZXIgdG8gdGhlIGlucHV0U2VjdGlvbi5cblx0XHRcdGlucHV0U2VjdGlvbi5hcHBlbmQoaW5wdXRDb250YWluZXIpO1xuXHRcdFx0Ly8gU2VuZHMgdGhlIG5ld0lucHV0LCBpbnB1dENvbnRhaW5lciwgYnVsaWFuIHZhbHVlLCBhbmQgc3RhdGUgcG9zaXRpb24gdG8gdGhlIGF1dG9maWxsIGZ1bmN0aW9uLlxuXHRcdFx0YXV0b2ZpbGwobmV3SW5wdXRbMF0sIGlucHV0Q29udGFpbmVyLCBmYWxzZSwgaSk7XG5cdFx0fSBcblx0XHQvLyBDcmVhdGVzIGFuZCBhcHBlbmRzIGJ1dHRvbnMgdG8gdGhlIGJ1dHRvblNlY3Rpb24gd2hlbiBhIGNvbXBsZXRlZCBpbnB1dCBpcyBmaWxsZWQgaW4uXG5cdFx0YnV0dG9uU2VjdGlvbi5hcHBlbmQoXCI8ZGl2IGlkPSduZXdidXR0b25zJz5cIik7XG5cdFx0JChcIiNuZXdidXR0b25zXCIpLmFwcGVuZChcIjxhIGNsYXNzPSdidG4tZmxvYXRpbmcgYnRuLXNtYWxsIHdhdmVzLWVmZmVjdCB3YXZlcy1saWdodCcgaWQ9J3JvdXRlLWFkZEJ0bic+PGkgY2xhc3M9J21hdGVyaWFsLWljb25zJz5hZGQ8L2k+PC9hPlwiKTtcblx0XHQkKFwiI25ld2J1dHRvbnNcIikuYXBwZW5kKFwiPHAgaWQ9J3JvdXRlLW5ld0xvY2F0aW9uVGV4dCc+QWRkIGEgTmV3IFN0b3A8L3A+XCIpO1xuXHRcdCQoXCIjcm91dGUtYWRkQnRuXCIpLmNsaWNrKG5ld0lucHV0RmllbGQpO1xuXHR9XG59KTtcblxuLy8gQXBwbGllZCBhdXRvZmlsbCBjb2RlIHRvIHRoZSBuZXcgaW5wdXQgZmllbGRzIGFuZCBzZW5kcyBpbnB1dCB0byBzdGF0ZSBvYmplY3QuXG4vLyBUYWtlcyB0aGUgbmV3SW5wdXQsIGlucHV0Q29udGFpbmVyLCBidWxpYW4gdmFsdWUsIGFuZCBzdGF0ZSBwb3N0aW9uIGFzIHZhcmlhYmxlIGluIHRoZSBhdXRvZmlsbCBmdW5jdGlvbi5cbi8vIFRvb2x0aXBzIGluY2x1ZGVkIGZvciB1c2VyIGVycm9yIGhhbmRsaW5nLlxuZnVuY3Rpb24gYXV0b2ZpbGwoaW5wdXQsIGNvbnRhaW5lciwgYWRkLCBpbmRleCl7XG5cdHZhciBhdXRvY29tcGxldGUgPSBuZXcgZ29vZ2xlLm1hcHMucGxhY2VzLkF1dG9jb21wbGV0ZShpbnB1dCwgb3B0aW9ucyk7XG5cdC8vIEdvb2dsZSBQbGFjZXMgZnVuY3Rpb24gLSB1c2VzIFwiYXV0b2NvbXBsZXRlXCIgcGxhY2Vob2xkZXIgZGVmaW5lZCBpbiBsaW5lIGFib3ZlLlxuXHRhdXRvY29tcGxldGUuYWRkTGlzdGVuZXIoJ3BsYWNlX2NoYW5nZWQnLCBmdW5jdGlvbiAoKXtcblx0XHR2YXIgcGxhY2UgPSBhdXRvY29tcGxldGUuZ2V0UGxhY2UoKTtcblx0XHRpZiAocGxhY2UucGxhY2VfaWQpe1xuXHRcdFx0aWYgKGFkZCl7XG5cdFx0XHRcdHRvb2x0aXAubW91c2VsZWF2ZSgpO1xuXHRcdFx0XHR0b29sdGlwLmRldGFjaCgpO1xuXHRcdFx0XHRzdGF0ZS5yb3V0ZS5hZGQocGxhY2UpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRvb2x0aXAubW91c2VsZWF2ZSgpO1xuXHRcdFx0XHR0b29sdGlwLmRldGFjaCgpO1xuXHRcdFx0XHRzdGF0ZS5yb3V0ZS5yZW1vdmUoaW5kZXgsIHRydWUpO1xuXHRcdFx0XHRzdGF0ZS5yb3V0ZS5pbnNlcnQocGxhY2UsIGluZGV4KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHBsYWNlLm5hbWUgIT0gXCJcIil7XG5cdFx0XHRcdGNvbnRhaW5lci5hcHBlbmQodG9vbHRpcCk7XG5cdFx0XHRcdHRvb2x0aXAubW91c2VlbnRlcigpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbi8vIEdldCB0aGUgSFRNTCBpbnB1dCBlbGVtZW50IGZvciB0aGUgYXV0b2NvbXBsZXRlIHNlYXJjaCBib3ggYW5kIGNyZWF0ZSB0aGUgYXV0b2NvbXBsZXRlIG9iamVjdC5cbmZ1bmN0aW9uIG5ld0lucHV0RmllbGQoKSB7XG5cdCQoXCIjbmV3YnV0dG9uc1wiKS5yZW1vdmUoKTtcblx0dmFyIGlucHV0ZmllbGQgPSAkKFwiPGlucHV0PlwiKTtcblx0YnV0dG9uU2VjdGlvbi5hcHBlbmQoaW5wdXRmaWVsZCk7XG5cdGlucHV0ZmllbGQuYWRkQ2xhc3MoXCJkZXN0aW5hdGlvbi1pbnB1dFwiKTtcblx0Ly8gQ2hhbmdlcyB0aGUgcGxhY2Vob2xkZXIgdmFsdWUgd2l0aGluIHRoZSBuZXcgaW5wdXQgZmllbGQgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiB0aGUgc3RhdGUgb2JqZWN0LlxuXHRpZiAoc3RhdGUucm91dGUubG9jYXRpb25Db3VudCA9PSAwKSB7XG5cdFx0aW5wdXRmaWVsZC5hdHRyKFwicGxhY2Vob2xkZXJcIiwgXCJTdGFydGluZyBMb2NhdGlvbjogXCIpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGlucHV0ZmllbGQuYXR0cihcInBsYWNlaG9sZGVyXCIsIFwiTmV4dCBTdG9wOiBcIik7XG5cdFx0aW5wdXRmaWVsZC5mb2N1cygpO1xuXHR9XG5cdGF1dG9maWxsKGlucHV0ZmllbGRbMF0sIGJ1dHRvblNlY3Rpb24sIHRydWUpO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcm91dGUvcm91dGUuanNcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JvdXRlLmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9yb3V0ZS5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcm91dGUuY3NzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmNzc1xuLy8gbW9kdWxlIGlkID0gMjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLnJvdXRle1xcbiAgIGJhY2tncm91bmQ6IGxpZ2h0Z3JleTtcXG59XFxuXFxuI3JvdXRlLWFkZEJ0biB7XFxuXFx0ZGlzcGxheTogaW5saW5lLWJsb2NrO1xcblxcdG1hcmdpbi1yaWdodDogMTBweDtcXG5cXHRoZWlnaHQ6IDI1cHg7XFxuXFx0cGFkZGluZy10b3A6IDA7XFxuXFx0d2lkdGg6IDI1cHg7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogIzZmYjM4NDtcXG59XFxuXFxuLmJ0bi1mbG9hdGluZyBpIHtcXG5cXHRsaW5lLWhlaWdodDogMjVweFxcbn1cXG5cXG4jcm91dGUtbmV3TG9jYXRpb25UZXh0IHtcXG5cXHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxufVxcblxcbi5pbnB1dENvbnRhaW5lciB7XFxuXFx0bWFyZ2luLXRvcDogMHB4O1xcblxcdG1hcmdpbi1ib3R0b206IDBweDtcXG5cXHRwYWRkaW5nLWJvdHRvbTogMHB4O1xcblxcdGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuLmlucHV0Q29udGFpbmVyIC5yb3V0ZS1jaG9pY2Uge1xcblxcdG1hcmdpbi1ib3R0b206IDBweDtcXG5cXHRwYWRkaW5nLWxlZnQ6IDBweDtcXG5cXHRwYWRkaW5nLXJpZ2h0OiAwcHg7XFxufVxcblxcbi5pbnB1dENvbnRhaW5lciAubWF0ZXJpYWwtaWNvbnMge1xcblxcdGZvbnQtc2l6ZTogMjBweDtcXG5cXHRjb2xvcjogZ3JheTtcXG59XFxuXFxuLmlucHV0Q29udGFpbmVyIHtcXG5cXHRtYXJnaW4tYm90dG9tOiAwcHg7XFxuXFx0cG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG4uY2xvc2UtaWNvbiB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGxpbmUtaGVpZ2h0OiAzMXB4O1xcblxcdHJpZ2h0OiAtM3B4O1xcblxcdGJvdHRvbTogN3B4O1xcbn1cXG5cXG4ubW92ZS1pY29uIHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0bGluZS1oZWlnaHQ6IDMxcHg7XFxuXFx0bGVmdDogMHB4O1xcblxcdGJvdHRvbTogN3B4O1xcbn1cXG5cXG4uaW5wdXRDb250YWluZXIgLmNsb3NlSW5wdXREaXYsXFxuLmlucHV0Q29udGFpbmVyIC5tb3ZlSW5wdXREaXYge1xcblxcdGN1cnNvcjogcG9pbnRlcjtcXG5cXHRoZWlnaHQ6IDQwcHg7XFxuXFx0cGFkZGluZzogMHB4O1xcbn1cXG5cXG4jZGVzdGluYXRpb25zIHtcXG5cXHRwYWRkaW5nLWxlZnQ6IDE1cHg7XFxuXFx0cGFkZGluZy1yaWdodDogMTVweDtcXG59XFxuXFxuLnRyZXZvcnRvYXN0IHtcXG5cXHRmb250LXNpemU6IDI0cHg7XFxuXFx0cG9zaXRpb246IGZpeGVkO1xcblxcdHRvcDogMTAwcHggIWltcG9ydGFudDtcXG5cXHRsZWZ0OiAzOCU7XFxufVxcblxcbi5yb3V0ZS1idG4tY29udGFpbmVye1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuLnJvdXRlLXRvb2x0aXB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMjBweDtcXG5cXHRyaWdodDogMDtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmNzc1xuLy8gbW9kdWxlIGlkID0gMjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcbmltcG9ydCB7cmVjQXBpQnlJZH0gZnJvbSAnLi4vcmVjcmVhdGlvbi9jb25zdGFudHMnO1xuXG4vL2ludGVyZXN0c1xuc3RhdGUuaW50ZXJlc3RzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG4gICB2YXIgaW50ZXJlc3RzID0ge307XG5cbiAgIGUudmFsLnNlbGVjdGVkLmZvckVhY2goZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIGludGVyZXN0c1tpbnRlcmVzdC5pZF0gPSB0cnVlO1xuICAgfSk7XG4gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW50ZXJlc3RzJywgSlNPTi5zdHJpbmdpZnkoaW50ZXJlc3RzKSk7XG4gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGFzLXN0b3JlZCcsICd0cnVlJyk7XG59KTtcblxuLy9yb3V0ZVxuc3RhdGUucm91dGUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgdmFyIGxvY2F0aW9ucyA9IGUudmFsLm1hcCgobCkgPT4ge1xuICAgICAgaWYobC50eXBlID09PSAncGxhY2UnKXtcbiAgICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHR5cGU6ICdwbGFjZScsXG4gICAgICAgICAgICBwbGFjZV9pZDogbC5kYXRhLnBsYWNlX2lkLFxuICAgICAgICAgICAgbmFtZTogbC5kYXRhLm5hbWUsXG4gICAgICAgICAgICBmb3JtYXR0ZWRfYWRkcmVzczpsLmRhdGEuZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICBsYXQ6IGwuZGF0YS5sYXQgfHwgbC5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLFxuICAgICAgICAgICAgbG5nOiBsLmRhdGEubG5nIHx8IGwuZGF0YS5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKVxuICAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICByZXR1cm57XG4gICAgICAgICAgICB0eXBlOiAncmVjYXJlYScsXG4gICAgICAgICAgICBpZDogbC5kYXRhLmlkLFxuICAgICAgICAgICAgUmVjQXJlYU5hbWU6IGwuZGF0YS5SZWNBcmVhTmFtZSxcbiAgICAgICAgICAgIFJlY0FyZWFMYXRpdHVkZTogbC5kYXRhLlJlY0FyZWFMYXRpdHVkZSxcbiAgICAgICAgICAgIFJlY0FyZWFMb25naXR1ZGU6IGwuZGF0YS5SZWNBcmVhTG9uZ2l0dWRlXG4gICAgICAgICB9O1xuICAgICAgfVxuICAgfSk7XG4gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncm91dGUnLCBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpKTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdoYXMtc3RvcmVkJywgJ3RydWUnKTtcbn0pXG5cbi8vYm9va21hcmtzXG5zdGF0ZS5yZWNyZWF0aW9uLmJvb2ttYXJrZWQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgdmFyIGJvb2ttYXJrZWQgPSBlLnZhbC5tYXAoKHIpID0+IHtcbiAgICAgICAgIHJldHVybiByLmlkO1xuICAgfSk7XG4gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYm9va21hcmtlZCcsIEpTT04uc3RyaW5naWZ5KGJvb2ttYXJrZWQpKTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdoYXMtc3RvcmVkJywgJ3RydWUnKTtcbn0pXG5cbmZ1bmN0aW9uIHJlc2V0U3RvcmFnZSgpe1xuICAgaGFzTG9hZGVkID0gdHJ1ZTtcbiAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdoYXMtc3RvcmVkJywgbnVsbCk7XG4gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYm9va21hcmtlZCcsIG51bGwpO1xuICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JvdXRlJywgbnVsbCk7XG4gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW50ZXJlc3RzJywgbnVsbCk7XG4gICAkKCcjc3RvcmFnZS1tb2RhbCcpLm1vZGFsKCdjbG9zZScpO1xufVxuXG5mdW5jdGlvbiBsb2FkU3RvcmFnZSgpe1xuICAgaWYoaGFzTG9hZGVkKSByZXR1cm47XG4gICB2YXIgaW50ZXJlc3RzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW50ZXJlc3RzJykpIHx8IHt9O1xuICAgc3RhdGUuaW50ZXJlc3RzLmFsbC5mb3JFYWNoKChhKSA9PiB7XG4gICAgICBpZihpbnRlcmVzdHNbYS5pZF0pe1xuICAgICAgICAgYS51cGRhdGUodHJ1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICB9KTtcbiAgIHN0YXRlLmludGVyZXN0cy5lbWl0KCdjaGFuZ2UnKTtcblxuICAgdmFyIHJvdXRlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncm91dGUnKSkgfHwgW107XG4gICB2YXIgcm91dGVBcnIgPSBbXTtcbiAgIGxldCByZXF1ZXN0Q291bnQgPSAwO1xuICAgdmFyIHJvdXRlQ2FsbGJhY2sgPSBmdW5jdGlvbihpbmRleCwgcmVzcG9uc2Upe1xuICAgICAgcmVxdWVzdENvdW50IC09IDE7XG4gICAgICBpZihyZXNwb25zZS5SZWNBcmVhSUQpe1xuICAgICAgICAgc3RhdGUucmVjcmVhdGlvbi5hbGwuYWRkRGF0YShyZXNwb25zZSk7XG4gICAgICAgICBsZXQgYXJlYSA9IHN0YXRlLnJlY3JlYXRpb24uYWxsLlJFQ0RBVEEuZmluZCgocikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHIuaWQgPT0gcmVzcG9uc2UuUmVjQXJlYUlEO1xuICAgICAgICAgfSk7XG4gICAgICAgICBhcmVhLnNldEluUm91dGUodHJ1ZSk7XG4gICAgICAgICByb3V0ZUFycltpbmRleF0gPSBzdGF0ZS5yb3V0ZS5nZXRMb2NhdGlvbk9iamVjdChhcmVhKTtcbiAgICAgIH1cbiAgICAgIGlmKHJlcXVlc3RDb3VudCA9PT0gMCl7XG4gICAgICAgICBzdGF0ZS5yb3V0ZS5zZXREYXRhKHJvdXRlQXJyKTtcbiAgICAgIH1cbiAgIH1cbiAgIHJvdXRlLmZvckVhY2goKGxvY2F0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgaWYobG9jYXRpb24udHlwZSA9PT0gJ3BsYWNlJyl7XG4gICAgICAgICByb3V0ZUFycltpbmRleF0gPSBzdGF0ZS5yb3V0ZS5nZXRMb2NhdGlvbk9iamVjdChsb2NhdGlvbik7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgcmVxdWVzdENvdW50ICs9IDE7XG4gICAgICAgICByZWNBcGlCeUlkKGxvY2F0aW9uLmlkLCByb3V0ZUNhbGxiYWNrLmJpbmQobnVsbCwgaW5kZXgpKTtcbiAgICAgIH1cbiAgIH0pO1xuICAgaWYocmVxdWVzdENvdW50ID09PSAwKXtcbiAgICAgICAgIHN0YXRlLnJvdXRlLnNldERhdGEocm91dGVBcnIpO1xuICAgfVxufVxuXG5mdW5jdGlvbiBnZXRCb29rbWFya3MoKXtcbiAgIGlmKGhhc0xvYWRlZCkgcmV0dXJuO1xuICAgaGFzTG9hZGVkID0gdHJ1ZTtcbiAgICQoJyNzdG9yYWdlLW1vZGFsJykubW9kYWwoJ2Nsb3NlJyk7XG4gICBsZXQgcmVxdWVzdENvdW50ID0gMDtcbiAgIHZhciBib29rbWFya2VkID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYm9va21hcmtlZCcpKSB8fCBbXTtcbiAgIHZhciBib29rbWFya0NhbGxiYWNrID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgcmVxdWVzdENvdW50IC09IDE7XG4gICAgICBpZihyZXNwb25zZS5SZWNBcmVhSUQpe1xuICAgICAgICAgc3RhdGUucmVjcmVhdGlvbi5hbGwuYWRkRGF0YShyZXNwb25zZSk7XG4gICAgICAgICBzdGF0ZS5yZWNyZWF0aW9uLmFkZEJvb2ttYXJrKHN0YXRlLnJlY3JlYXRpb24uYWxsLlJFQ0RBVEEuZmluZCgocikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHIuaWQgPT0gcmVzcG9uc2UuUmVjQXJlYUlEO1xuICAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgaWYocmVxdWVzdENvdW50ID09PSAwKXtcbiAgICAgICAgIC8vbmVlZCB0byB3YWl0IGZvciBkaXJlY3Rpb25zIHRvIGxvYWRcbiAgICAgICAgIHN0YXRlLnJlY3JlYXRpb24uZmlsdGVyQWxsKCk7XG4gICAgICB9XG4gICB9XG4gICBib29rbWFya2VkLmZvckVhY2goKGIpID0+IHtcbiAgICAgIHJlcXVlc3RDb3VudCArPSAxO1xuICAgICAgcmVjQXBpQnlJZChiLCBib29rbWFya0NhbGxiYWNrKTtcbiAgIH0pO1xufVxuXG4vL21ha2Ugc3VyZSB0aGlzIGlzIHNldCBmYWxzZSBpZiB0aGV5IGNob29zZSBub3QgdG8gbG9hZCBzdG9yYWdlIVxudmFyIGhhc1N0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaGFzLXN0b3JlZCcpID09PSAndHJ1ZSc7XG52YXIgaGFzTG9hZGVkID0gZmFsc2U7XG5pZiggaGFzU3RvcmFnZSl7XG4gICBzdGF0ZS5tYXAuZGlyZWN0aW9ucy5vbignY2hhbmdlJywgZ2V0Qm9va21hcmtzKTtcbn1cblxud2luZG93LmxvYWRTdG9yYWdlID0gbG9hZFN0b3JhZ2U7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICAkKCcjc3RvcmFnZS1tb2RhbCcpLm1vZGFsKHtcbiAgICAgIGRpc21pc3NpYmxlOiBmYWxzZSxcbiAgICAgIGluRHVyYXRpb246IDMwMCxcbiAgICAgIHN0YXJ0aW5nVG9wOiAnNDAlJywgLy8gU3RhcnRpbmcgdG9wIHN0eWxlIGF0dHJpYnV0ZVxuICAgICAgZW5kaW5nVG9wOiAnMTAlJ1xuICAgfSk7XG4gICBpZihoYXNTdG9yYWdlKXtcbiAgICAgICQoJyNzdG9yYWdlLW1vZGFsJykubW9kYWwoJ29wZW4nKTtcbiAgICAgICQoJyNuZXctc2Vzc2lvbicpLmNsaWNrKHJlc2V0U3RvcmFnZSk7XG4gICAgICAkKCcjY29udGludWUtc2Vzc2lvbicpLmNsaWNrKGxvYWRTdG9yYWdlKTtcbiAgIH1cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9sb2NhbHN0b3JhZ2UvbG9jYWxzdG9yYWdlLmpzXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJy4vbG9hZGVkY2lyY2xlcyc7XG5pbXBvcnQgc29uZyBmcm9tICcuL2ZpbmFsZS5tcDMnO1xuaW1wb3J0IGFpcmhvcm4gZnJvbSAnLi9haXJob3JuLm1wMyc7XG5pbXBvcnQgJy4vZmluYWxlLmNzcyc7XG5cbmNvbnN0IGN0eCA9IG5ldyAoQXVkaW9Db250ZXh0IHx8IHdlYmtpdEF1ZGlvQ29udGV4dCkoKTtcbmNvbnN0IGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG5jb25zdCBzb3VyY2UgPSBjdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGF1ZGlvKTtcblxuXG4gdmFyIGJ1ZmZlciA9IG51bGw7XG5cbiAvL2lmIGJyb3dzZXIgc3VwcG9ydHMgd2ViIGF1ZGlvLCBjcmVhdGUgYSBuZXcgYXVkaW8gY29udGV4dFxuIC8vYW5kIGxvYWQgdGhlIGJ1dHRvbiB0YXAgc291bmQgXG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBhaXJob3JuLCB0cnVlKTtcblxuICAvL3doZW4gcmVxdWVzdCByZXR1cm5zIHN1Y2Nlc3NmdWxseSwgc3RvcmUgYXVkaW8gZmlsZSBcbiAgLy9hcyBhbiBhcnJheSBidWZmZXIgXG4gIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICBjdHguZGVjb2RlQXVkaW9EYXRhKGF1ZGlvRGF0YSwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgYnVmZmVyID0gZGF0YTtcbiAgICAgIH0pO1xuICB9XG4gXG5cbiAvL3BsYXkgdGFwIHNvdW5kIGlmIHdlYiBhdWRpbyBleGlzdHMgYW5kIHNvdW5kIHdhcyBsb2FkZWQgY29ycmVjdGx5XG4gdmFyIGhvcm47XG4gZnVuY3Rpb24gcGxheUhvcm4oKXtcbiAgICAgaWYgKGJ1ZmZlciAhPT0gbnVsbCl7XG4gICAgICAgICBob3JuID0gY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICAgaG9ybi5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgICBob3JuLmNvbm5lY3QoY3R4LmRlc3RpbmF0aW9uKTtcbiAgICAgICAgIGhvcm4uc3RhcnQoY3R4LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICAgICAkKCcjaG9ua2hvbmsnKS5hZGRDbGFzcygnc2hha2UnKTtcbiAgICAgfVxuIH1cbiBmdW5jdGlvbiBzdG9wSG9ybigpe1xuICAgaWYoaG9ybil7XG4gICAgICBob3JuLnN0b3AoKTtcbiAgICAgICQoJyNob25raG9uaycpLnJlbW92ZUNsYXNzKCdzaGFrZScpO1xuICAgfVxufVxuXG52YXIgd2hvbGVDb250YWluZXI7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICByZXF1ZXN0LnNlbmQoKTtcbiAgICQoJy5vb3BzJykuY2xpY2socGFydHkpO1xuICAgd2hvbGVDb250YWluZXIgPSAkKCcjd2hvbGUtY29udGFpbmVyJyk7XG4gICBhdWRpby5zcmMgPSBzb25nO1xuICAgYXVkaW8ubG9hZFxuICAgJCgnI2hvbmtob25rJykubW91c2Vkb3duKHBsYXlIb3JuKTtcbiAgICQoJyNob25raG9uaycpLm1vdXNldXAoc3RvcEhvcm4pO1xufSlcblxuZnVuY3Rpb24gcGFydHkoKXtcbiAgIGNvbnN0IGFuYWx5c2VyID0gY3R4LmNyZWF0ZUFuYWx5c2VyKCk7XG4gICBhbmFseXNlci5mZnRTaXplID0gMjA0ODtcbiAgIGFuYWx5c2VyLm1heERlY2liZWxzID0gMDtcbiAgIGFuYWx5c2VyLnNtb290aGluZ1RpbWVDb25zdGFudCA9IDAuODtcbiAgIGNvbnN0IGRhdGFBcnJheSA9IG5ldyBVaW50OEFycmF5KGFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50KTtcbiAgIHdpbmRvdy5hbmFseXNlciA9IGFuYWx5c2VyO1xuICAgd2luZG93LmRhdGFBcnJheSA9IGRhdGFBcnJheTtcbiAgIHNvdXJjZS5jb25uZWN0KGFuYWx5c2VyKTtcbiAgIGFuYWx5c2VyLmNvbm5lY3QoY3R4LmRlc3RpbmF0aW9uKTtcbiAgICQoJyN0dXRvcmlhbC1tb2RhbCAubW9kYWwtY29udGVudCcpLmNzcyh7XG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2Zvcm0gMS44cyBjdWJpYy1iZXppZXIoLjYzLC4wMSwxLC40MSknLFxuICAgICAgJ3RyYW5zZm9ybSc6ICdyb3RhdGVaKDBkZWcpIHNjYWxlWCgxKScsXG4gICB9KTtcbiAgICQoJyN0dXRvcmlhbC1tb2RhbCcpLmNzcygnb3ZlcmZsb3cnLCAndmlzaWJsZScpO1xuICAgd2hvbGVDb250YWluZXIuY3NzKHtcbiAgICAgICAndHJhbnNmb3JtLXN0eWxlJzogJ3ByZXNlcnZlLTNkJyxcbiAgICAgICBwZXJzcGVjdGl2ZTogJzUwMHB4J1xuICAgIH0pO1xuICAgJCgnI2Fpcmhvcm4tY29udGFpbmVyJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICQoJyN0aGFua3lvdS1jb250YWluZXInKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuXG4gICBhdWRpby5hZGRFdmVudExpc3RlbmVyKCdwbGF5aW5nJywgYW5pbWF0ZSk7XG4gICBhdWRpby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsICgpID0+IHtcbiAgICAgICQoJyNhaXJob3JuLWNvbnRhaW5lcicpLmNzcygnb3BhY2l0eScsICcwJyk7XG4gICAgICAkKCcjdGhhbmt5b3UtY29udGFpbmVyJykuY3NzKCdvcGFjaXR5JywgJzEnKTtcbiAgIH0pO1xuXG5cbiAgIGF1ZGlvLnBsYXkoKTtcbiAgIGZpbHRlcnMoKTtcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSgpe1xuICAgJCgnI3R1dG9yaWFsLW1vZGFsIC5tb2RhbC1jb250ZW50JykuY3NzKCd0cmFuc2Zvcm0nLCAncm90YXRlWigzNjAwZGVnKSBzY2FsZVgoMSknKTtcbn1cblxuZnVuY3Rpb24gZHJvcCgpe1xuICAgJCgnI3R1dG9yaWFsLW1vZGFsJykubW9kYWwoJ2Nsb3NlJyk7XG4gICB3aG9sZUNvbnRhaW5lci5jc3Moe1xuICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAncmViZWNjYXB1cnBsZScsXG4gICAgICAnbWluLWhlaWdodCc6ICcxMDB2aCdcbiAgIH0pO1xuICAgJCgnI2Fpcmhvcm4tY29udGFpbmVyJykuY3NzKCdvcGFjaXR5JywgJzEnKTtcbiAgIGRvRmlsdGVyID0gdHJ1ZTtcbn1cblxuXG5mdW5jdGlvbiByb3RhdGUoKXtcbiAgIHdob2xlQ29udGFpbmVyLmFkZENsYXNzKCdiaWctcm90YXRlJyk7XG59XG5cblxuZnVuY3Rpb24gc2V0UmFuZG9tUG9zaXRpb24oZWxlbWVudCl7XG4gICBlbGVtZW50LmNzcyh7XG4gICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxuICAgICAgJ3RvcCc6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAndmgnLFxuICAgICAgJ2xlZnQnOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApICsgJ3Z3JyxcbiAgICAgICd3aWR0aCc6IGVsZW1lbnQud2lkdGgoKSxcbiAgICAgICd6LWluZGV4JzogJzEwMDAnXG4gICB9KVxufVxuZnVuY3Rpb24gZmx5KCl7XG4gICAkKCcuc3VnZ2VzdGlvblN1bW1hcnknKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICBzZXRSYW5kb21Qb3NpdGlvbigkKGVsKSk7XG4gICAgICAgICAkKGVsKS5hZGRDbGFzcygnc2hvdWxkLXJvdGF0ZScpO1xuICAgICAgfSwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjAwMCkpO1xuICAgfSk7XG59XG5cbmZ1bmN0aW9uIGJvYigpe1xuICAgJCgnLmNoaXAnKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICBzZXRSYW5kb21Qb3NpdGlvbigkKGVsKSk7XG4gICAgICAgICAkKGVsKS5hZGRDbGFzcygnc2hvdWxkLWJvYicpO1xuICAgICAgfSwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjAwMCkpO1xuICAgfSlcbn1cblxudmFyIGhhc0Ryb3BwZWQgPSBmYWxzZTtcbnZhciBoYXNGbG93biA9IGZhbHNlO1xudmFyIGhhc0JvYmJlZCA9IGZhbHNlO1xudmFyIGhhc1NwdW4gPSBmYWxzZTtcblxudmFyIGh1ZSA9IDA7XG52YXIgYnJpZ2h0bmVzcyA9IDA7XG52YXIgY29udHJhc3QgPSAwO1xudmFyIGZyZXNoU3RhcnQgPSB0cnVlO1xudmFyIGRvRmlsdGVyID0gZmFsc2U7XG5mdW5jdGlvbiBmaWx0ZXJzKCl7ICAgXG4gICBpZighaGFzRHJvcHBlZCAmJiBhdWRpby5jdXJyZW50VGltZSA+IDEuNSl7XG4gICAgICBkcm9wKCk7XG4gICAgICBoYXNEcm9wcGVkID0gdHJ1ZTtcbiAgIH1cbiAgIGlmKGhhc0Ryb3BwZWQgJiYgIWhhc0Zsb3duICYmIGF1ZGlvLmN1cnJlbnRUaW1lID4gOSl7XG4gICAgICBmbHkoKTtcbiAgICAgIGhhc0Zsb3duID0gdHJ1ZTtcbiAgIH1cbiAgIGlmKGhhc0Zsb3duICYmICFoYXNCb2JiZWQgJiYgYXVkaW8uY3VycmVudFRpbWUgPiAxNyl7XG4gICAgICBib2IoKTtcbiAgICAgIGhhc0JvYmJlZCA9IHRydWU7XG4gICB9XG4gICBpZihoYXNCb2JiZWQgJiYgIWhhc1NwdW4gJiYgYXVkaW8uY3VycmVudFRpbWUgPiAyNC41KXtcbiAgICAgIHJvdGF0ZSgpO1xuICAgICAgaGFzU3B1biA9IHRydWU7XG4gICB9XG4gICBpZihkb0ZpbHRlcil7XG4gICAgICBsZXQgbmV3QnJpZ2h0bmVzcztcbiAgICAgIGxldCBuZXdDb250cmFzdDtcbiAgICAgIGFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKGRhdGFBcnJheSk7XG4gICAgICBuZXdDb250cmFzdCA9IGRhdGFBcnJheVsyXTtcbiAgICAgIG5ld0JyaWdodG5lc3MgPSBkYXRhQXJyYXlbMF07XG4gICAgICBcbiAgICAgIGlmKGZyZXNoU3RhcnQpe1xuICAgICAgICAgYnJpZ2h0bmVzcyA9IG5ld0JyaWdodG5lc3M7XG4gICAgICAgICBjb250cmFzdCA9IG5ld0NvbnRyYXN0O1xuICAgICAgICAgZnJlc2hTdGFydCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYoIGZhbHNlICYmIG5ld0JyaWdodG5lc3MgPCBicmlnaHRuZXNzIC0gMSl7XG4gICAgICAgICBicmlnaHRuZXNzID0gYnJpZ2h0bmVzcyAtIDE7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgYnJpZ2h0bmVzcyA9IG5ld0JyaWdodG5lc3M7XG4gICAgICB9XG4gICAgICBpZiggZmFsc2UgJiYgbmV3Q29udHJhc3QgPCBjb250cmFzdCAtIDEpe1xuICAgICAgICAgY29udHJhc3QgPSBjb250cmFzdCAtIDE7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgY29udHJhc3QgPSBuZXdDb250cmFzdDtcbiAgICAgIH1cbiAgICAgIHZhciBiID0gKGJyaWdodG5lc3MgLSA1MCkgLyAxMDAgO1xuICAgICAgdmFyIGMgPSBjb250cmFzdCAvIDEwMCA7XG4gICAgICB3aG9sZUNvbnRhaW5lci5jc3MoJ2ZpbHRlcicsIGBpbnZlcnQoMSkgaHVlLXJvdGF0ZSgke2h1ZSsrfWRlZykgYnJpZ2h0bmVzcygke2J9KSBjb250cmFzdCgkezEuNX0pYCk7XG5cbiAgIH1cbiAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmaWx0ZXJzKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZS5qc1xuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcbmltcG9ydCBtYXAgZnJvbSAnLi4vbWFwL21hcGNvbnN0YW50JztcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcbiAgIHZhciBjaXJjbGVzID0gW107XG4gICB2YXIgc2hvd24gPSBmYWxzZTtcbiAgICQoJy5icmFuZC1sb2dvJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgIGlmKCBzaG93bil7XG4gICAgICAgICBjaXJjbGVzLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgIGMuc2V0TWFwKG51bGwpO1xuICAgICAgICAgfSlcbiAgICAgICAgIGNpcmNsZXMgPSBbXTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5sb2FkZWRTZWFyY2hDb29yZHMuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgIGxldCBjaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcbiAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmQsXG4gICAgICAgICAgICAgICByYWRpdXM6IDE2MDkzNCxcbiAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JlZCcsXG4gICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC4zMyxcbiAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmVkJyxcbiAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICBtYXA6IG1hcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaXJjbGVzLnB1c2goY2lyY2xlKTtcbiAgICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc2hvd24gPSAhc2hvd247XG4gICB9KVxufSlcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9sb2FkZWRjaXJjbGVzLmpzXG4vLyBtb2R1bGUgaWQgPSAyOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCIyNTIwZTA0MjFkZDczNDg1ZjhjZTk3OTg3NjBlNjkwNS5tcDNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9maW5hbGUubXAzXG4vLyBtb2R1bGUgaWQgPSAyOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJjNWNkN2ZhNTVjZGMxYTc3ZmUxOTUxZTE1MWQ0ZjM2OS5tcDNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2ZpbmFsZS9haXJob3JuLm1wM1xuLy8gbW9kdWxlIGlkID0gMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vZmluYWxlLmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9maW5hbGUuY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2ZpbmFsZS5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvZmluYWxlL2ZpbmFsZS5jc3Ncbi8vIG1vZHVsZSBpZCA9IDMxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikodW5kZWZpbmVkKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIlxcbiBAa2V5ZnJhbWVzIHNoYWtle1xcbiAgIDAlIHtcXG4gICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSA7XFxuICAgfVxcbiAgIDI1JSB7XFxuICAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTBkZWcpO1xcbiAgIH1cXG4gICA1MCUge1xcbiAgICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIDtcXG4gICB9XFxuICAgNzUlIHtcXG4gICAgIHRyYW5zZm9ybTogcm90YXRlWigtMTBkZWcpO1xcbiAgIH1cXG4gICAxMDAlIHtcXG4gICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSA7XFxuICAgfVxcbiB9XFxuIEBrZXlmcmFtZXMgYmlncm90YXRle1xcbiAgIGZyb20ge1xcbiAgICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIDtcXG4gICB9XFxuICAgdG8ge1xcbiAgICAgdHJhbnNmb3JtOiBzY2FsZSgyKTtcXG4gICB9XFxuIH1cXG4gQGtleWZyYW1lcyByb3RhdGV7XFxuICAgZnJvbSB7XFxuICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTEwMHZ3KSB0cmFuc2xhdGVaKC0xMDBweCkgcm90YXRlWCgwZGVnKSByb3RhdGVZKDM2MGRlZykgcm90YXRlWigwZGVnKTtcXG4gICB9XFxuICAgdG8ge1xcbiAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMHZ3KSB0cmFuc2xhdGVaKC0xMDBweCkgcm90YXRlWCgzNjBkZWcpIHJvdGF0ZVkoMGRlZykgcm90YXRlWigzNjBkZWcpO1xcbiAgIH1cXG4gfVxcbiBAa2V5ZnJhbWVzIGJvYntcXG4gICAwJSB7XFxuICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMjB2aCkgdHJhbnNsYXRlWigyMDBweCk7XFxuICAgfVxcbiAgIDUwJSB7XFxuICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTIwdmgpIHRyYW5zbGF0ZVooLTIwMHB4KTtcXG4gICB9XFxuICAgMTAwJSB7XFxuICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMjB2aCkgdHJhbnNsYXRlWigyMDBweCk7XFxuICAgfVxcbiB9XFxuXFxuLnNoYWtle1xcbiAgIGFuaW1hdGlvbi1uYW1lOiBzaGFrZTtcXG4gICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBsaW5lYXI7XFxuICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAwLjFzO1xcbiAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlO1xcbn1cXG4uc2hvdWxkLXJvdGF0ZXtcXG4gICBhbmltYXRpb24tbmFtZTogcm90YXRlO1xcbiAgIGFuaW1hdGlvbi1kdXJhdGlvbjogNHM7XFxuICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogbGluZWFyO1xcbiAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlO1xcbiAgIGJhY2tncm91bmQtY29sb3I6IGxpbWU7XFxuIH1cXG4gLnNob3VsZC1ib2J7XFxuICAgYW5pbWF0aW9uLW5hbWU6IGJvYjtcXG4gICBhbmltYXRpb24tZHVyYXRpb246IDJzO1xcbiAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlO1xcbiAgIGJhY2tncm91bmQtY29sb3I6IHJlZDtcXG4gfVxcblxcbiAuYmlnLXJvdGF0ZXtcXG4gICBhbmltYXRpb24tbmFtZTogYmlncm90YXRlO1xcbiAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMTZzO1xcbiAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGxpbmVhcjtcXG4gICBhbmltYXRpb24taXRlcmF0aW9uLWNvdW50OiBpbmZpbml0ZTtcXG4gfVxcblxcbiAjYWlyaG9ybi1jb250YWluZXIsICN0aGFua3lvdS1jb250YWluZXJ7XFxuICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgIHRvcDogMDtcXG4gICByaWdodDogMDtcXG4gICBib3R0b206IDA7XFxuICAgbGVmdDogMDtcXG4gICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgY29sb3I6ICNmZmY7XFxuICAgb3BhY2l0eTogMDtcXG4gfVxcblxcbiAjYWlyaG9ybi1jb250YWluZXIgYnV0dG9ue1xcbiAgIHdpZHRoOiBhdXRvO1xcbiAgIHBhZGRpbmc6IDFlbTtcXG4gICBsaW5lLWhlaWdodDogMTtcXG4gfVxcblxcblxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvY29tcG9uZW50cy9maW5hbGUvZmluYWxlLmNzc1xuLy8gbW9kdWxlIGlkID0gMzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==