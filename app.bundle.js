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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_recAreaDetails__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recreation_constants__ = __webpack_require__(9);



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
   emit(event){
      if(this.events[event] == undefined){
         throw new Error(`"${event}" event does not exist on ${this}`)
      }
      else{
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

      this.makeEvent = this.makeEvent.bind(this);
   }
   //toggles selected property
   toggle(){
      this.selected = !this.selected;
      this.emit('change');
   }
   toString(){
      return "Interest";
   }
   makeEvent(){
      return {val: this.selected};
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
      return this.path[0] || null;
   }
   get waypoints(){
      if( this.locationCount < 3){
         return null;
      }
      else{
         return this.path.slice(1, this.locationCount - 1);
      }
   }
   get destination(){
      if( this.locationCount < 2){
         return null;
      }
      else{
         return this.path[this.locationCount - 1];
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
   remove(index){
      this.path.splice(index, 1);
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
class Map{
   constructor(){
      ;
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
      //if the route changes, this should be true.
      this.shouldResetLoadedActivities = false;
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

      this.apiCall = __WEBPACK_IMPORTED_MODULE_1__recreation_constants__["b" /* recApiQuery */];

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
      }
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
      state.route.path.forEach((l) => {
         requestCount += 1;
         this.apiCall(
            l.data.geometry.location.lat(),
            l.data.geometry.location.lng(),
            50,
            interests,
            callback
         );
      });

      this.status.update({shouldLoad: false, loading: true, firstLoad: false});
   }

   filterAll(){
      this.filtered.setData(this.all.RECDATA.filter((area) => {
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
      this.interests = new Interests(__WEBPACK_IMPORTED_MODULE_1__recreation_constants__["a" /* interestList */]);
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

var	fixUrls = __webpack_require__(8);

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
/* harmony export (immutable) */ __webpack_exports__["a"] = retrieveSingleRecArea;
/* Retrieve the data for a recreation area based on RecAreaID
*  Display the data to a modal on the web page */


function retrieveSingleRecArea(recarea) {
    $('.modal').empty();
    // retrieve the data using recAreaId
    console.log(recarea);

    var recAreaName = recarea.RecAreaName;
    var recNameText = $("<div>").text(recAreaName);

    var recAreaPhone = recarea.RecAreaPhone;
    var recPhoneText = $("<p>").text(recAreaPhone);

    $('.modal').append(recNameText,recPhoneText);

    recarea.ACTIVITY.forEach(function(activity){
        $('.modal').append(activity.ActivityName);
    })

        $('#modal1').modal('open');
    // display the data in a modal box
// state.recreation.filtered.RECDATA[0].showDetails(recAreaId);

}

$(document).ready(function(){

    $('.modal').modal();

 });

 // export function displayRecAreaOnClick(recAreaId) {
 //    // var suggestSumId = $(".suggestionSummary").attr("id");
 //    // console.log(suggestSumId);
 //
 //       console.log(recAreaId);
 //     $(".suggestionSummary").on("click", function(){
 //         // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
 //         $('.modal').modal('open');
 //         $('.modal').append(retrieveSingleRecArea(recAreaId));
 //     })
 // }


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_recreation_recreation__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_recreation_loadButton__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_interests_interests__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_layout_layout__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_map_map__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_route_route__ = __webpack_require__(21);








/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_css__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recreation_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__recreation_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__displayRecAreaSuggestions__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recAreaDetails__ = __webpack_require__(3);






/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".recreation{\n   background: red;\n}\n\n.suggestionSummary {\n    font-size: 1em;\n}\n\n.suggestionSummary:hover {\n    background-color:rgba(0, 0, 0, 0.1);\n\n}\n", ""]);

// exports


/***/ }),
/* 8 */
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
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return interestList; });
/* harmony export (immutable) */ __webpack_exports__["b"] = recApiQuery;
var interestList = [
    {"ActivityName": "BIKING",
     "ActivityID": 5,
     "Emoji": "A"
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
    {"ActivityName": "SWIMMING",
     "ActivityID": 106,
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


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export displayRecAreaSummary */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state_state__ = __webpack_require__(0);


    function displayRecAreaSummary(recdata, filteredType) {
        $(filteredType).empty();

        for (var i = 0; i <recdata.val.length; i++) {

            var recValAlias = recdata.val[i];

            var recResults = JSON.stringify(recdata);

            var sugDivClass = $("<div class='suggestionSummary' id='areaId-" + recValAlias.id + "'>");
            var recAreaName = recValAlias.RecAreaName;
            var recNameText = $("<div>").text(recAreaName);

            var recAreaPhone = recValAlias.RecAreaPhone;
            var recPhoneText = $("<p>").text(recAreaPhone);

            //Get both the Title and URL values and create a link tag out of them
            // We're only grabbing the first instance of the LINK array
            var recAreaLinkTitle = recValAlias.LINK[0].Title;
            var recAreaUrl = recValAlias.LINK[0].URL;
            var recAreaLink = $("<a />", {
                href: recAreaUrl,
                text: recAreaLinkTitle,
                target: "_blank"});

            var recAreaLinkP = $("<p>").append(recAreaLink);
            sugDivClass.append(recNameText, recAreaPhone, recAreaLinkP);

            $(filteredType).append(sugDivClass);

            sugDivClass.click(recValAlias.showDetails);
        }
    }



__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.filtered.on("change",  function(recdata){

        var filteredType = "#filtered";
        displayRecAreaSummary(recdata, filteredType);
});
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.bookmarked.on("change", function(recdata){

        var filteredType = "#bookmarked";
        displayRecAreaSummary(recdata, filteredType);
});
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.inRoute.on("change",  function(recdata){

        var filteredType = "#added-to-route";
        displayRecAreaSummary(recdata, filteredType);
});


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state_state__ = __webpack_require__(0);


function showButton(status) {
   var container = $('#button-container');
   var text;
   var btn = $('<button class="btn">')
      .text('Find Recreation')
      .click(__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.search);

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
   }

   container.empty();
   if( status.val.shouldLoad || status.val.firstLoad || !status.val.canLoad){
      container.append($('<p>').text(text), btn);
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
   e.val.all.forEach((interest) => {
      if(!loaded[interest.id] && interest.selected){
         shouldLoad = true;
      }
      if(loaded[interest.id] && interest.selected !== filtered[interest.id]){
         shouldFilter = true;
         filtered[interest.id] = interest.selected;
      }
   });
   var canLoad = !!e.val.selected.length && !!__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.locationCount;
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
   if( shouldFilter){
      __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.filterAll();
   }
});

//might have to wait for directions to come back and be processed...
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].route.on('change', function(e){
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.shouldResetLoadedActivities = true;
   var shouldLoad = !!e.val.length;
   var canLoad = !!e.val.length && !!__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].interests.selected.length;
   __WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.update({shouldLoad: shouldLoad, canLoad: canLoad});
})

$(document).ready(() => showButton(__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.makeEvent()));
__WEBPACK_IMPORTED_MODULE_0__state_state__["a" /* default */].recreation.status.on('change', showButton);


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interests_css__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interests_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__interests_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);





/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(14);
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".interests{\n   background: orange;\n}\n", ""]);

// exports


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layout_css__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layout_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__layout_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);



$(document).ready(function() {
    $('select').material_select();
    
	for (let i = 0; i < __WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all.length; i++) {
		let newChip = $('<div class="chip"></div>');
		$("#interests").append(newChip.text(__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all[i].name));
		$(newChip).click(function() {
			__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all[i].toggle();
		});
	__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].interests.all[i].on('change', function(e) {
		console.log(e);
		if(e.val) {
			newChip.addClass("selected");
			$("#selected-interests").append(newChip);
		} else {
		 	newChip.removeClass('selected');
		 	$("#unselected-interests").prepend(newChip);
		}

	});
	}
  });

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(17);
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".test-class{\n   background: lime;\n}\n\n.layout{\n   background: rebeccapurple;\n}\n.selected{color: blue;}\n\n.chip {\n\tcursor: pointer;\n\tdisplay: block;\n}", ""]);

// exports


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__map_css__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__map_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__map_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);



const map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 39.7642548, lng: -104.9951937},
  zoom: 5
});

let routeMarkers = [];
let recAreaMarkers = [];

__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.on('change', function(e){
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


__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].recreation.filtered.on('change', function(e){
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


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(20);
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
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, "\n#map{\n   min-height: 90vh;\n}\n", ""]);

// exports


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__route_css__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__route_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__route_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state_state__ = __webpack_require__(0);



var stopcount = 0;

var options = {
  componentRestrictions: {country: 'us'}
};

newInputField();

__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.on("change", function (e){
	var path = e.val;
	$("#destinations").empty();
	if (path.length == 0) {
		newInputField();
	} else {
		for (let i = 0; i < e.val.length; i++) {
			var location = e.val[i];
			let newInput = $("<input>").val(location.data.name + ' (' + location.data.formatted_address + ')');
			newInput.focusout(function(){
				if (newInput.val() == ""){
					__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(i);
				}
			});
			$("#destinations").append(newInput);
			autofill(newInput[0], false, i);
			$("#destinations").append("<br>");
		} 
	}
	$("#destinations").append("<div id='newbuttons'>");
	$("#newbuttons").append("<a class='btn-floating btn-small waves-effect waves-light red' id='route-addBtn'><i class='material-icons'>add</i></a>");
	$("#newbuttons").append("<p id='route-newLocationText'>Add a New Stop</p>");
	$("#route-addBtn").click(newInputField);
});

// Applied autofill code to the new input fields and sends input to state object
function autofill(input, add, index){
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	autocomplete.addListener('place_changed', function (){
		var place = autocomplete.getPlace();
		if (add){
			__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.add(place);
		}
		else {
			__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.remove(index);
			__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.insert(place, index);
		}
	});
}

// Get the HTML input element for the autocompelte search box and create the autocomplete object
// Translates address to lat/long coordinates for using on the map
function newInputField() {
	$("#newbuttons").remove();	
	var inputfield = $("<input>");
	$("#destinations").append(inputfield);
	inputfield.addClass("destination-input");
	if (stopcount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
	}
	autofill(inputfield[0], true);
	stopcount++;
}

// create event listener for path in state object.
// what is path?
//    an array of location objects
// need to fill state -> path with the name and address of 

// for returning users (where path is filled), pre-fill previous route options to the input fields

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(23);
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
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".route{\n   background: lightgrey;\n}\n\n#route-addBtn {\n\tdisplay: inline-block;\n\tmargin-right: 10px;\n\theight: 25px;\n\tpadding-top: 0;\n\twidth: 25px;\n}\n\n.btn-floating i {\n\tline-height: 25px\n}\n\n#route-newLocationText {\n\tdisplay: inline-block;\n}", ""]);

// exports


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTcyYjRiZTFmYThhYjA1MTQ5MzIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvc3RhdGUvc3RhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY0FyZWFEZXRhaWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbi5jc3M/M2JjNiIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY3JlYXRpb24uY3NzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9kaXNwbGF5UmVjQXJlYVN1Z2dlc3Rpb25zLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vbG9hZEJ1dHRvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMuY3NzP2FkNjgiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmNzcz8yZjMwIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2xheW91dC9sYXlvdXQuY3NzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL21hcC9tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5jc3M/MzQ2NyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5jc3M/ZTA2NSIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7O0FDN0Q4QjtBQUNJOztBQUVsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLE1BQU0sNEJBQTRCLEtBQUs7QUFDcEU7QUFDQTtBQUNBLGdEQUFnRCxLQUFLO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLE1BQU0sNEJBQTRCLEtBQUs7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQSwrQ0FBK0M7QUFDL0M7QUFDQSxpREFBaUQsS0FBSztBQUN0RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FB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OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7O0FBRUEsNkJBQTZCLG1CQUFtQjs7QUFFaEQ7O0FBRUE7O0FBRUE7QUFDQTs7Ozs7Ozs7QUNoV0E7QUFBQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEVBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOzs7Ozs7Ozs7Ozs7Ozs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNIQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFO0FBQzVDLEM7Ozs7OztBQ3pCQTtBQUNBOzs7QUFHQTtBQUNBLHFDQUFzQyxxQkFBcUIsR0FBRyx3QkFBd0IscUJBQXFCLEdBQUcsOEJBQThCLDBDQUEwQyxLQUFLOztBQUUzTDs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsV0FBVyxFQUFFO0FBQ3JELHdDQUF3QyxXQUFXLEVBQUU7O0FBRXJEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esc0NBQXNDO0FBQ3RDLEdBQUc7QUFDSDtBQUNBLDhEQUE4RDtBQUM5RDs7QUFFQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUN4RkE7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQU07QUFDTixNQUFNO0FBQ047QUFDQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQU07QUFDTixNQUFNO0FBQ047QUFDQTtBQUNBLE1BQU07QUFDTixNQUFNO0FBQ047QUFDQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOzs7Ozs7Ozs7O0FDdkRBOztBQUVBO0FBQ0E7O0FBRUEsdUJBQXVCLHVCQUF1Qjs7QUFFOUM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7O0FBRWpDO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOzs7O0FBSUE7O0FBRUE7QUFDQTtBQUNBLENBQUM7QUFDRDs7QUFFQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7QUNwREQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrRzs7Ozs7O0FDekVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLEVBQUU7QUFDNUMsQzs7Ozs7O0FDekJBO0FBQ0E7OztBQUdBO0FBQ0EsZ0NBQWlDLDJCQUEyQixHQUFHLG1CQUFtQiwwQkFBMEIsdUJBQXVCLGlCQUFpQixtQkFBbUIsZ0JBQWdCLEdBQUcscUJBQXFCLHdCQUF3Qiw0QkFBNEIsMEJBQTBCLEdBQUc7O0FBRWhTIiwiZmlsZSI6ImFwcC5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA0KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBlNzJiNGJlMWZhOGFiMDUxNDkzMiIsImltcG9ydCB7cmV0cmlldmVTaW5nbGVSZWNBcmVhfSBmcm9tICcuLi9yZWNyZWF0aW9uL3JlY0FyZWFEZXRhaWxzJztcbmltcG9ydCB7cmVjQXBpUXVlcnksIGludGVyZXN0TGlzdH0gZnJvbSAnLi4vcmVjcmVhdGlvbi9jb25zdGFudHMnO1xuXG5jbGFzcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKGV2ZW50c0Fycil7XG4gICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHMgPSB7fTtcbiAgICAgIGV2ZW50c0Fyci5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgLy90aGlzIGFycmF5IHdpbGwgY29udGFpbiBjYWxsYmFjayBmdW5jdGlvbnNcbiAgICAgICAgIGV2ZW50c1tlXSA9IFtdO1xuICAgICAgfSk7XG4gICB9XG5cbiAgIC8vc2V0IGV2ZW50IGxpc3RlbmVyXG4gICBvbihldmVudCwgY2FsbGJhY2spe1xuICAgICAgaWYodGhpcy5ldmVudHNbZXZlbnRdID09IHVuZGVmaW5lZCl7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtldmVudH1cIiBldmVudCBkb2VzIG5vdCBleGlzdCBvbiAke3RoaXN9YClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IHRvIFwiJHt0aGlzfS5vbigpXCIgbXVzdCBiZSBhIGZ1bmN0aW9uLmApXG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgfVxuXG4gICAvL3RyaWdnZXIgZXZlbnQgbGlzdGVuZXJzIGZvciBnaXZlbiBldmVudFxuICAgZW1pdChldmVudCl7XG4gICAgICBpZih0aGlzLmV2ZW50c1tldmVudF0gPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke2V2ZW50fVwiIGV2ZW50IGRvZXMgbm90IGV4aXN0IG9uICR7dGhpc31gKVxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIGxldCBjYWxsYmFja3MgPSB0aGlzLmV2ZW50c1tldmVudF07XG4gICAgICAgICBsZXQgZSA9IHRoaXMubWFrZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgIC8vZXhlY3V0ZSBhbGwgY2FsbGJhY2tzXG4gICAgICAgICBjYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGMoZSk7XG4gICAgICAgICB9KVxuICAgICAgfVxuICAgfVxuXG4gICAvL3Byb3ZpZGVzIGV2ZW50IG9iamVjdCBmb3IgZXZlbnQgbGlzdGVuZXJzOyBzaG91bGQgYmUgb3ZlcndyaXR0ZW4gYnkgaW5oZXJpdG9yXG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIGNvbnNvbGUud2FybihgTm8gbWFrZUV2ZW50IG1ldGhvZCBzZXQgb24gJHt0aGlzfWApO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuICAgSW50ZXJlc3RzICAgIFxuXFwqKioqKioqKioqKioqL1xuY2xhc3MgSW50ZXJlc3QgZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKGludGVyZXN0KXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5uYW1lID0gaW50ZXJlc3QuQWN0aXZpdHlOYW1lO1xuICAgICAgdGhpcy5pZCA9IGludGVyZXN0LkFjdGl2aXR5SUQ7XG4gICAgICB0aGlzLmljb25JZCA9IGludGVyZXN0LkVtb2ppXG5cbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5tYWtlRXZlbnQgPSB0aGlzLm1ha2VFdmVudC5iaW5kKHRoaXMpO1xuICAgfVxuICAgLy90b2dnbGVzIHNlbGVjdGVkIHByb3BlcnR5XG4gICB0b2dnbGUoKXtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSAhdGhpcy5zZWxlY3RlZDtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuIFwiSW50ZXJlc3RcIjtcbiAgIH1cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHRoaXMuc2VsZWN0ZWR9O1xuICAgfVxufVxuXG5jbGFzcyBJbnRlcmVzdHMgZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIC8vbGlzdCBpcyBsaXN0IG9mIGludGVyZXN0cywgdG8gYmUgcHJvdmlkZWQgYnkgcmVjcmVhdGlvbiBtb2R1bGUgXG4gICBjb25zdHJ1Y3RvcihsaXN0KXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5hbGwgPSBsaXN0Lm1hcChmdW5jdGlvbihpKXtcbiAgICAgICAgIGxldCBpbnRlcmVzdCA9IG5ldyBJbnRlcmVzdChpKTtcbiAgICAgICAgIGludGVyZXN0Lm9uKCdjaGFuZ2UnLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnY2hhbmdlJykpO1xuICAgICAgICAgcmV0dXJuIGludGVyZXN0O1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgdGhpcy5tYWtlRXZlbnQgPSB0aGlzLm1ha2VFdmVudC5iaW5kKHRoaXMpO1xuICAgfVxuICAgZ2V0IHNlbGVjdGVkKCl7XG4gICAgICByZXR1cm4gdGhpcy5hbGwuZmlsdGVyKGZ1bmN0aW9uKGkpe1xuICAgICAgICAgcmV0dXJuIGkuc2VsZWN0ZWQ7XG4gICAgICB9KTtcbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gXCJzdGF0ZS5pbnRlcmVzdHNcIjtcbiAgIH1cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgIHZhbDoge1xuICAgICAgICAgICAgYWxsOiB0aGlzLmFsbCxcbiAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkXG4gICAgICAgICB9XG4gICAgICB9O1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuICAgICBSb3V0ZSAgICBcblxcKioqKioqKioqKioqKi9cbmNsYXNzIExvY2F0aW9ue1xuICAgY29uc3RydWN0b3Iob2JqZWN0KXtcbiAgICAgIGlmKCBvYmplY3QgaW5zdGFuY2VvZiBSZWNBcmVhKXtcbiAgICAgICAgICB0aGlzLnR5cGUgPSAncmVjYXJlYSc7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKG9iamVjdC5oYXNPd25Qcm9wZXJ0eSgncGxhY2VfaWQnKSl7XG4gICAgICAgICAvL2dvb2dsZSBwbGFjZXMgcGxhY2UuLi4gc29tZWhvdyB0ZXN0IGZvciBnb29nbGUgcGxhY2UgYW5kIFxuICAgICAgICAgLy90aHJvdyBlcnJvciBpZiBuZWl0aGVyIFxuICAgICAgICAgdGhpcy50eXBlID0gJ3BsYWNlJztcbiAgICAgIH1cbiAgICAgIC8vbWF5YmUgcmVtb3ZlIGFmdGVyIGRldlxuICAgICAgZWxzZXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvdmlkZWQgbG9jYXRpb24gaXMgbm90IGEgUGxhY2VSZXN1bHQgb3IgUmVjQXJlYScpO1xuICAgICAgfVxuICAgICAgdGhpcy5kYXRhID0gb2JqZWN0O1xuICAgfVxufVxuXG5jbGFzcyBSb3V0ZSBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoKXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5wYXRoID0gW107XG4gICB9XG4gICBnZXQgbG9jYXRpb25Db3VudCgpe1xuICAgICAgcmV0dXJuIHRoaXMucGF0aC5sZW5ndGg7XG4gICB9XG5cbiAgIGdldCBvcmlnaW4oKXtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhbMF0gfHwgbnVsbDtcbiAgIH1cbiAgIGdldCB3YXlwb2ludHMoKXtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPCAzKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHJldHVybiB0aGlzLnBhdGguc2xpY2UoMSwgdGhpcy5sb2NhdGlvbkNvdW50IC0gMSk7XG4gICAgICB9XG4gICB9XG4gICBnZXQgZGVzdGluYXRpb24oKXtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPCAyKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHJldHVybiB0aGlzLnBhdGhbdGhpcy5sb2NhdGlvbkNvdW50IC0gMV07XG4gICAgICB9XG4gICB9XG5cbiAgIGFkZChsb2NhdGlvbil7XG4gICAgICBpZiAoIShsb2NhdGlvbiBpbnN0YW5jZW9mIExvY2F0aW9uKSl7XG4gICAgICAgICBsb2NhdGlvbiA9IG5ldyBMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnBhdGgucHVzaChsb2NhdGlvbik7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuICAgaW5zZXJ0KGxvY2F0aW9uLCBpbmRleCl7XG4gICAgICBpZiAoIShsb2NhdGlvbiBpbnN0YW5jZW9mIExvY2F0aW9uKSl7XG4gICAgICAgICBsb2NhdGlvbiA9IG5ldyBMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnBhdGguc3BsaWNlKGluZGV4LCAwLCBsb2NhdGlvbik7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuICAgcmVtb3ZlKGluZGV4KXtcbiAgICAgIHRoaXMucGF0aC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIGludmVydCgpe1xuICAgICAgaWYoIHRoaXMubG9jYXRpb25Db3VudCAhPT0gMil7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnQ2FuIG9ubHkgaW52ZXJ0IHJvdXRlIGlmIHJvdXRlLnBhdGggY29udGFpbnMgZXhhY3RseSB0d28gbG9jYXRpb25zJ1xuICAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICB0aGlzLnBhdGgucHVzaCh0aGlzLnBhdGguc2hpZnQoKSk7XG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgfVxuICAgfVxuXG4gICBhZGRSZWNBcmVhKGFyZWEpe1xuICAgICAgO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIHJlbW92ZVJlY0FyZWEoaWQpe1xuICAgICAgO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cblxuICAgLy93aWxsIFwiaGlnaGxpZ2h0XCIgbG9jYXRpb24gYXQgZ2l2ZW4gaW5kZXggb2YgcGF0aCBvbiB0aGUgbWFwXG4gICBoaWdobGlnaHQoaW5kZXgpe1xuICAgICAgO1xuICAgfVxuXG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIHJldHVybiB7dmFsOiB0aGlzLnBhdGh9XG4gICB9XG5cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gJ3N0YXRlLnJvdXRlJztcbiAgIH1cbn1cblxuLyoqKioqKioqKioqKipcXCAgICBcbiAgICAgIE1hcCAgICBcblxcKioqKioqKioqKioqKi9cbmNsYXNzIE1hcHtcbiAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICA7XG4gICB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZS5tYXAnO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKipcXCAgICBcbiAgIFJlY3JlYXRpb24gICAgXG5cXCoqKioqKioqKioqKioqL1xuY29uc3QgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICdSZWNBcmVhTmFtZScsXG4gICAnUkVDQVJFQUFERFJFU1MnLFxuICAgJ0ZBQ0lMSVRZJyxcbiAgICdPcmdSZWNBcmVhSUQnLFxuICAgJ0dFT0pTT04nLFxuICAgJ0xhc3RVcGRhdGVkRGF0ZScsXG4gICAnRVZFTlQnLFxuICAgJ09SR0FOSVpBVElPTicsXG4gICAnUmVjQXJlYUVtYWlsJyxcbiAgICdSZWNBcmVhUmVzZXJ2YXRpb25VUkwnLFxuICAgJ1JlY0FyZWFMb25naXR1ZGUnLFxuICAgJ1JlY0FyZWFJRCcsXG4gICAnUmVjQXJlYVBob25lJyxcbiAgICdNRURJQScsXG4gICAnTElOSycsXG4gICAnUmVjQXJlYURlc2NyaXB0aW9uJyxcbiAgICdSZWNBcmVhTWFwVVJMJyxcbiAgICdSZWNBcmVhTGF0aXR1ZGUnLFxuICAgJ1N0YXlMaW1pdCcsXG4gICAnUmVjQXJlYUZlZURlc2NyaXB0aW9uJyxcbiAgICdSZWNBcmVhRGlyZWN0aW9ucycsXG4gICAnS2V5d29yZHMnLFxuICAgJ0FDVElWSVRZJ1xuXTtcblxuY2xhc3MgUmVjQXJlYSBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoYXJlYSl7XG4gICAgICBzdXBlcihbJ2Jvb2ttYXJrZWQnLCAnaW5yb3V0ZSddKTtcbiAgICAgIHRoaXMuaWQgPSBhcmVhLlJlY0FyZWFJRDtcbiAgICAgIHRoaXMuYWN0aXZpdGllcyA9IGFyZWEuQUNUSVZJVFkubWFwKGZ1bmN0aW9uKGEpeyBcbiAgICAgICAgIHJldHVybiBhLkFjdGl2aXR5SUQ7IFxuICAgICAgfSk7XG4gICAgICByZXF1aXJlZFByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcCl7XG4gICAgICAgICB0aGlzW3Byb3BdID0gYXJlYVtwcm9wXTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHRoaXMuYm9va21hcmtlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pblJvdXRlID0gZmFsc2U7XG4gICAgICB0aGlzLmZvY3VzZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5zaG93RGV0YWlscyA9IHRoaXMuc2hvd0RldGFpbHMuYmluZCh0aGlzKTtcbiAgIH1cbiAgIHNob3dEZXRhaWxzKCl7XG4gICAgICByZXRyaWV2ZVNpbmdsZVJlY0FyZWEodGhpcyk7Ly9uZWVkIGZyb20gZWxpemFiZXRoOyB1c2UgaW1wb3J0IGFuZCBleHBvcnQgXG4gICB9XG5cbiAgIC8vV0FSTklORzogc2hvdWxkIG9ubHkgc2V0IG9uZSBldmVudCBsaXN0ZW5lciBwZXIgUmVjQXJlYVxuICAgLy90aGF0IHVwZGF0ZXMgYWxsIG9mIGEgY2VydGFpbiBlbGVtZW50IHdpdGggZGF0YSBtYXRjaGluZ1xuICAgLy90aGUgUmVjQXJlYSB0byBhdm9pZCBtZW1vcnkgbGVha3MgYW5kIGlzc3VlcyB3aXRoIHJlbW92ZWQgZWxlbWVudHMgXG4gICBzZXRCb29rbWFya2VkKC8qYm9vbGVhbiovIHZhbHVlKXtcbiAgICAgIHRoaXMuYm9va21hcmtlZCA9IHZhbHVlO1xuICAgICAgdGhpcy5lbWl0KCdib29rbWFya2VkJyk7XG4gICB9XG4gICBzZXRJblJvdXRlKC8qYm9vbGVhbiovIHZhbHVlKXtcbiAgICAgIHRoaXMuaW5Sb3V0ZSA9IHZhbHVlO1xuICAgICAgdGhpcy5lbWl0KCdpbnJvdXRlJyk7XG4gICB9XG4vL3NldEZvY3VzID4gY2hhbmdlXG5cbiAgIG1ha2VFdmVudChldmVudCl7XG4gICAgICBjb25zb2xlLndhcm4oZXZlbnQpO1xuICAgfVxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnUmVjQXJlYSc7XG4gICB9XG59XG5cbmNsYXNzIFJlY0FyZWFDb2xsZWN0aW9uIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3RvcihuYW1lKXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgICAgLy9hcnJheSBvZiBcIlJlY0FyZWFcInMgXG4gICAgICB0aGlzLlJFQ0RBVEEgPSBbXTtcblxuICAgICAgLy9oYXNoIG1hcCBsaWtlIHN0b3JhZ2Ugb2Ygd2hpY2ggcmVjIGFyZWFzIGFyZSBjdXJyZW50bHkgXG4gICAgICAvL2luIHRoaXMgY29sbGVjdGlvbiAoYnkgaWQpXG4gICAgICB0aGlzLmlkTWFwID0ge307XG4gICB9XG5cbiAgIGFkZERhdGEocmVjZGF0YSl7XG4gICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG4gICAgICBpZiggIShyZWNkYXRhIGluc3RhbmNlb2YgQXJyYXkpKXtcbiAgICAgICAgIHJlY2RhdGEgPSBbcmVjZGF0YV07XG4gICAgICB9XG4gICAgICByZWNkYXRhLmZvckVhY2goZnVuY3Rpb24oYXJlYSl7XG4gICAgICAgICBpZighdGhpcy5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5SRUNEQVRBLnB1c2goYXJlYSk7XG4gICAgICAgICAgICB0aGlzLmlkTWFwW2FyZWEuaWRdID0gdHJ1ZTtcbiAgICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICBpZihjaGFuZ2Upe1xuICAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgIH1cbiAgIHNldERhdGEocmVjZGF0YSl7XG4gICAgICB0aGlzLmlkTWFwID0ge307XG4gICAgICB0aGlzLlJFQ0RBVEEgPSBbXTtcbiAgICAgIGlmKCAhKHJlY2RhdGEgaW5zdGFuY2VvZiBBcnJheSkpe1xuICAgICAgICAgcmVjZGF0YSA9IFtyZWNkYXRhXTtcbiAgICAgIH1cbiAgICAgIHJlY2RhdGEuZm9yRWFjaChmdW5jdGlvbihhcmVhKXtcbiAgICAgICAgIHRoaXMuUkVDREFUQS5wdXNoKGFyZWEpO1xuICAgICAgICAgdGhpcy5pZE1hcFthcmVhLmlkXSA9IHRydWU7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIC8vY2hhbmdlIHRvIGFsbG93IGFuIGFycmF5IG9yIHNvbWV0aGluZz9cbiAgIHJlbW92ZShhcmVhKXtcbiAgICAgIGlmKHRoaXMuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgdGhpcy5SRUNEQVRBLnNwbGljZSh0aGlzLlJFQ0RBVEEuaW5kZXhPZihhcmVhKSwgMSk7XG4gICAgICAgICBkZWxldGUgdGhpcy5pZE1hcFthcmVhLmlkXTtcbiAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB9XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHRoaXMuUkVDREFUQX1cbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gYHN0YXRlLnJlY3JlYXRpb24uJHt0aGlzLm5hbWV9YDtcbiAgIH1cbn1cblxuY2xhc3MgUmVjU3RhdHVzIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgc3VwZXIoWydjaGFuZ2UnLCAncGVyY2VudCddKTtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5wZXJjZW50TG9hZGVkID0gMTAwO1xuICAgICAgdGhpcy5zaG91bGRMb2FkID0gZmFsc2U7XG4gICAgICB0aGlzLmNhbkxvYWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZmlyc3RMb2FkID0gdHJ1ZTtcblxuICAgICAgdGhpcy5sb2FkZWRBY3Rpdml0aWVzID0ge307XG4gICAgICB0aGlzLmZpbHRlcmVkQWN0aXZpdGllcyA9IHt9O1xuICAgICAgLy9pZiB0aGUgcm91dGUgY2hhbmdlcywgdGhpcyBzaG91bGQgYmUgdHJ1ZS5cbiAgICAgIHRoaXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzID0gZmFsc2U7XG4gICB9XG4gICB1cGRhdGUoe2xvYWRpbmcsIHBlcmNlbnRMb2FkZWQsIHNob3VsZExvYWQsIGNhbkxvYWQsIGZpcnN0TG9hZH0gPSB7fSl7XG4gICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG4gICAgICBpZihsb2FkaW5nICE9PSB1bmRlZmluZWQgJiYgbG9hZGluZyAhPT0gdGhpcy5sb2FkaW5nKXtcbiAgICAgICAgIHRoaXMubG9hZGluZyA9IGxvYWRpbmc7XG4gICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYoc2hvdWxkTG9hZCAhPT0gdW5kZWZpbmVkICYmIHNob3VsZExvYWQgIT09IHRoaXMuc2hvdWxkTG9hZCl7XG4gICAgICAgICB0aGlzLnNob3VsZExvYWQgPSBzaG91bGRMb2FkO1xuICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKGNhbkxvYWQgIT09IHVuZGVmaW5lZCAmJiBjYW5Mb2FkICE9PSB0aGlzLmNhbkxvYWQpe1xuICAgICAgICAgdGhpcy5jYW5Mb2FkID0gY2FuTG9hZDtcbiAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZihmaXJzdExvYWQgIT09IHVuZGVmaW5lZCAmJiBmaXJzdExvYWQgIT09IHRoaXMuZmlyc3RMb2FkKXtcbiAgICAgICAgIHRoaXMuZmlyc3RMb2FkID0gZmlyc3RMb2FkO1xuICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKGNoYW5nZSl7XG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgfVxuICAgICAgaWYocGVyY2VudExvYWRlZCAhPT0gdW5kZWZpbmVkICYmIHBlcmNlbnRMb2FkZWQgIT09IHRoaXMucGVyY2VudExvYWRlZCl7XG4gICAgICAgICB0aGlzLnBlcmNlbnRMb2FkZWQgPSBwZXJjZW50TG9hZGVkO1xuICAgICAgICAgdGhpcy5lbWl0KCdwZXJjZW50Jyk7XG4gICAgICB9XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHtcbiAgICAgICAgIGxvYWRpbmc6IHRoaXMubG9hZGluZyxcbiAgICAgICAgIHBlcmNlbnRMb2FkZWQ6IHRoaXMucGVyY2VudExvYWRlZCxcbiAgICAgICAgIHNob3VsZExvYWQ6IHRoaXMuc2hvdWxkTG9hZCxcbiAgICAgICAgIGZpcnN0TG9hZDogdGhpcy5maXJzdExvYWQsXG4gICAgICAgICBjYW5Mb2FkOiB0aGlzLmNhbkxvYWRcbiAgICAgIH19O1xuICAgfVxuXG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cyc7XG4gICB9XG59XG5cbmNsYXNzIFJlY3JlYXRpb257XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgdGhpcy5hbGwgPSBuZXcgUmVjQXJlYUNvbGxlY3Rpb24oJ2FsbCcpO1xuICAgICAgdGhpcy5maWx0ZXJlZCA9IG5ldyBSZWNBcmVhQ29sbGVjdGlvbignZmlsdGVyZWQnKTtcbiAgICAgIHRoaXMuYm9va21hcmtlZCA9IG5ldyBSZWNBcmVhQ29sbGVjdGlvbignYm9va21hcmtlZCcpO1xuICAgICAgdGhpcy5pblJvdXRlID0gbmV3IFJlY0FyZWFDb2xsZWN0aW9uKCdpblJvdXRlJyk7XG5cbiAgICAgIHRoaXMuYXBpQ2FsbCA9IHJlY0FwaVF1ZXJ5O1xuXG4gICAgICB0aGlzLnN0YXR1cyA9IG5ldyBSZWNTdGF0dXM7XG4gICAgICB0aGlzLnNlYXJjaCA9IHRoaXMuc2VhcmNoLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLmZpbHRlckFsbCA9IHRoaXMuZmlsdGVyQWxsLmJpbmQodGhpcyk7XG4gICB9XG4gICBhZGRSZWNBcmVhcyhyZWNkYXRhKXtcbiAgICAgIHZhciBkYXRhID0gcmVjZGF0YS5yZWR1Y2UoZnVuY3Rpb24oYXJyLCBhcmVhKXtcbiAgICAgICAgIGxldCB0ZW1wID0gW107XG4gICAgICAgICBpZiggIXRoaXMuYWxsLmlkTWFwW2FyZWEuUmVjQXJlYUlEXSApe1xuICAgICAgICAgICAgdGVtcC5wdXNoKG5ldyBSZWNBcmVhKGFyZWEpKTtcbiAgICAgICAgIH1cbiAgICAgICAgIHJldHVybiBhcnIuY29uY2F0KHRlbXApO1xuICAgICAgfS5iaW5kKHRoaXMpLCBbXSk7XG4gICAgICB0aGlzLmFsbC5hZGREYXRhKGRhdGEpO1xuICAgfVxuXG4gICBhZGRCb29rbWFyayhhcmVhKXtcbiAgICAgIGlmKCF0aGlzLmJvb2ttYXJrZWQuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgYXJlYS5zZXRCb29rbWFya2VkKHRydWUpO1xuICAgICAgICAgdGhpcy5ib29rbWFya2VkLmFkZERhdGEoYXJlYSk7XG4gICAgICB9XG4gICB9XG4gICByZW1vdmVCb29rbWFyayhhcmVhKXtcbiAgICAgIGlmKHRoaXMuYm9va21hcmtlZC5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICBhcmVhLnNldEJvb2ttYXJrZWQoZmFsc2UpO1xuICAgICAgICAgdGhpcy5ib29rbWFya2VkLnJlbW92ZShhcmVhKTtcbiAgICAgIH1cbiAgIH1cbiAgIGFkZFRvUm91dGUoYXJlYSl7XG4gICAgICBpZighdGhpcy5pblJvdXRlLmlkTWFwW2FyZWEuaWRdKXtcbiAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZSh0cnVlKTtcbiAgICAgICAgIHRoaXMuaW5Sb3V0ZS5hZGREYXRhKGFyZWEpO1xuICAgICAgICAgLy9kbyBzdHVmZiB3aXRoIHJvdXRlIGhlcmVcbiAgICAgIH1cbiAgIH1cbiAgIHJlbW92ZUZyb21Sb3V0ZShhcmVhKXtcbiAgICAgIGlmKHRoaXMuaW5Sb3V0ZS5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgdGhpcy5pblJvdXRlLnJlbW92ZShhcmVhKTtcbiAgICAgICAgIC8vZG8gc3R1ZmYgd2l0aCByb3V0ZSBoZXJlXG4gICAgICB9XG4gICB9XG5cbiAgIC8vc2VuZHMgYXBpIHJlcXVlc3QocykgXG4gICBzZWFyY2goKXtcbiAgICAgIHZhciByZXF1ZXN0Q291bnQgPSAwO1xuICAgICAgaWYodGhpcy5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzKXtcbiAgICAgICAgIHRoaXMuc3RhdHVzLmxvYWRlZEFjdGl2aXRpZXMgPSB7fTtcbiAgICAgICAgIHRoaXMuc3RhdHVzLnNob3VsZFJlc2V0TG9hZGVkQWN0aXZpdGllcyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGxvYWRlZCA9IHRoaXMuc3RhdHVzLmxvYWRlZEFjdGl2aXRpZXM7XG4gICAgICB2YXIgaW50ZXJlc3RzID0gc3RhdGUuaW50ZXJlc3RzLnNlbGVjdGVkLnJlZHVjZSgoaWRTdHJpbmcsIGludGVyZXN0KSA9PiB7XG4gICAgICAgICAvL2lmIHdlJ3ZlIGFscmVhZHkgbG9hZGVkIHJlY2FyZWFzIHdpdGggdGhpcyBhY3Rpdml0eSwgZG9uJ3QgYWRkIHRvIGFjdGl2aXRpZXNcbiAgICAgICAgIGlmKGxvYWRlZFtpbnRlcmVzdC5pZF0pe1xuICAgICAgICAgICAgcmV0dXJuIGlkU3RyaW5nO1xuICAgICAgICAgfVxuICAgICAgICAgLy9vdGhlcndpc2UsIHdlIHdpbGwgbG9hZCBpdCBhbmQga2VlcCB0cmFja1xuICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIGxvYWRlZFtpbnRlcmVzdC5pZF0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXMuZmlsdGVyZWRBY3Rpdml0aWVzW2ludGVyZXN0LmlkXSA9IHRydWU7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmKCBpZFN0cmluZy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gaWRTdHJpbmcgKyAnLCcgKyBpbnRlcmVzdC5pZDtcbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpZFN0cmluZyArIGludGVyZXN0LmlkO1xuICAgICAgfSwgJycpO1xuXG4gICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICB0aGlzLmFkZFJlY0FyZWFzKHJlc3BvbnNlLlJFQ0RBVEEpO1xuICAgICAgICAgcmVxdWVzdENvdW50IC09IDE7XG4gICAgICAgICBpZihyZXF1ZXN0Q291bnQgPT09IDAgKXtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzLnVwZGF0ZSh7bG9hZGluZzogZmFsc2V9KTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyQWxsKCk7XG4gICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgIC8vdGVtcG9yYXJ5Li4uIGV2ZW50dWFsbHkgY2hhbmdlIHRvIGFsb25nIHJvdXRlXG4gICAgICBzdGF0ZS5yb3V0ZS5wYXRoLmZvckVhY2goKGwpID0+IHtcbiAgICAgICAgIHJlcXVlc3RDb3VudCArPSAxO1xuICAgICAgICAgdGhpcy5hcGlDYWxsKFxuICAgICAgICAgICAgbC5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLFxuICAgICAgICAgICAgbC5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICAgICAgNTAsXG4gICAgICAgICAgICBpbnRlcmVzdHMsXG4gICAgICAgICAgICBjYWxsYmFja1xuICAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnN0YXR1cy51cGRhdGUoe3Nob3VsZExvYWQ6IGZhbHNlLCBsb2FkaW5nOiB0cnVlLCBmaXJzdExvYWQ6IGZhbHNlfSk7XG4gICB9XG5cbiAgIGZpbHRlckFsbCgpe1xuICAgICAgdGhpcy5maWx0ZXJlZC5zZXREYXRhKHRoaXMuYWxsLlJFQ0RBVEEuZmlsdGVyKChhcmVhKSA9PiB7XG4gICAgICAgICB2YXIgaGFzQWN0aXZpdHkgPSBmYWxzZTtcbiAgICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgYXJlYS5hY3Rpdml0aWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IGFyZWEuYWN0aXZpdGllc1tpXTtcbiAgICAgICAgICAgIGlmKHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLmZpbHRlcmVkQWN0aXZpdGllc1thY3Rpdml0eV0pe1xuICAgICAgICAgICAgICAgaGFzQWN0aXZpdHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICBpZighaGFzQWN0aXZpdHkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KSk7XG4gICB9XG5cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gJ3N0YXRlLnJlY3JlYXRpb24nO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuIE92ZXJhbGwgU3RhdGVcblxcKioqKioqKioqKioqKi9cbmNsYXNzIFN0YXRlIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgc3VwZXIoWydyZWFkeSddKTtcbiAgICAgIHRoaXMucmVjcmVhdGlvbiA9IG5ldyBSZWNyZWF0aW9uKCk7XG4gICAgICB0aGlzLnJvdXRlID0gbmV3IFJvdXRlKCk7XG4gICAgICB0aGlzLmludGVyZXN0cyA9IG5ldyBJbnRlcmVzdHMoaW50ZXJlc3RMaXN0KTtcbiAgIH1cbiAgIFxuICAgLy9yZWZhY3RvciB0aGlzLCB1c2UgZXhwb3J0IGFuZCBpbXBvcnQgZnJvbSBhIHNlcGFyYXRlIGZpbGUgKG5vdCByZWNyZWF0aW9uLmpzKVxuICAgLy8gc2V0SW50ZXJlc3RzKGxpc3Qpe1xuICAgLy8gICAgdGhpcy5pbnRlcmVzdHMgPSBuZXcgSW50ZXJlc3RzKGxpc3QpO1xuICAgLy8gfVxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnc3RhdGUnO1xuICAgfVxuICAgbWFrZUV2ZW50KCl7XG4gICAgICByZXR1cm4ge3ZhbDogbnVsbH07XG4gICB9XG59XG5cbmNvbnN0IHN0YXRlID0gbmV3IFN0YXRlO1xuXG4vKiBURU1QT1JBUlksIFJFTU9WRSBMQVRFUiAqL1xud2luZG93LnN0YXRlID0gc3RhdGU7XG5cbmV4cG9ydCBkZWZhdWx0IHN0YXRlO1xuXG5cbi8vU3RhdGUgRGlhZ3JhbVxuXG5cbi8vIHN0YXRlID0ge1xuLy8gICAgc2V0SW50ZXJlc3RzOiBmdW5jdGlvbigpe30sXG4vLyAgICBJTlRFUkVTVFM6IHtcbi8vICAgICAgIGFsbDogW3tcbi8vICAgICAgICAgIG5hbWU6ICdzdHJpbmcnLFxuLy8gICAgICAgICAgaWQ6ICdudW1iZXInLFxuLy8gICAgICAgICAgaWNvbklkOiAnc3RyaW5nJyxcbi8vICAgICAgICAgIHNlbGVjdGVkOiAnYm9vbGVhbicsXG4vLyAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCl7fSxcbi8vICAgICAgICAgIG9uOiBmdW5jdGlvbihldmVudFN0cmluZywgY2FsbGJhY2spe30sXG4vLyAgICAgICAgICBldmVudHM6IHtcbi8vICAgICAgICAgICAgIGNoYW5nZTogWyBmdW5jdGlvbihlKXt9LCBmdW5jdGlvbihlKXt9IF0sXG4vLyAgICAgICAgICB9LFxuLy8gICAgICAgICAgZW1pdDogZnVuY3Rpb24oZXZlbnRTdHJpbmcpOy8vIHRyaWdnZXIgZXZlbnQgbGlzdGVuZXJzIGZvciBnaXZlbiBldmVudFxuLy8gICAgICAgfSwgXG4vLyAgICAgICB7Li4ufSwgXG4vLyAgICAgICB7Li4ufV0sXG4vLyAgICAgICAvL3JldHVybnMgYW4gYXJyYXkgb2Ygb25seSBzZWxlY3RlZCBpbnRlcmVzdHMgKHVzZSBnZXR0ZXIpXG4vLyAgICAgICBzZWxlY3RlZDogW3suLi59LCB7Li4ufV0sXG4vLyAgICAgICBvbjogZnVuY3Rpb24oZXZlbnRTdHJpbmcsIGNhbGxiYWNrKXt9LFxuLy8gICAgICAgZXZlbnRzOiB7XG4vLyAgICAgICAgICBjaGFuZ2U6IFsgZnVuY3Rpb24oKXt9LCBmdW5jdGlvbigpe30gXSxcbi8vICAgICAgIH1cbi8vICAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nKTtcbi8vICAgICAgIC8vbWlnaHQgbmVlZCB0byBzdG9yZSBhY3Rpdml0eSBpZHMgd2UgYXJlIGluY2x1ZGluZyBcbi8vICAgIH0sXG4vLyAgICBST1VURToge1xuLy8gICAgICAgYWRkTG9jYXRpb246IGZ1bmN0aW9uKGxvY2F0aW9uLCBhZnRlcil7fSxcbi8vICAgICAgIGRlbGV0ZUxvY2F0aW9uOiBmdW5jdGlvbihsb2NhdGlvbil7fSwgLy9tYXliZSBsb2NhdGlvbi5kZWxldGUoKT8/XG4vLyAgICAgICBtb3ZlTG9jYXRpb246IGZ1bmN0aW9uKGxvY2F0aW9uLCBhZnRlciksIC8vbWF5YmUgbG9jYXRpb24ubW92ZSgpPz9cbi8vICAgICAgICwvL3BvdGVudGlhbGx5IGludmVydCBkaXJlY3Rpb25cbi8vICAgICAgICwvL3NldCBvcHRpb25zIChlLmcuIGF2b2lkLCBzZWFyY2ggcmFkaXVzLCB0cmFuc3BvcnQgdHlwZSlcbi8vICAgICAgICwvL3JvdXRlIGFycmF5ID4gaGFzIGV2ZW50c1xuLy8gICAgICAgLC8vIG9wdGlvbnMgb2JqZWN0ID4gaGFzIGV2ZW50cyBcbi8vICAgIH0sXG4vLyAgICBNQVA6IHtcbi8vICAgICAgICwvL1xuLy8gICAgfSxcbi8vICAgIFJFQ1JFQVRJT046IHtcbi8vICAgICAgIGFkZEJvb2ttYXJrPiBhZGRzIGJvb2ttYXJrIGFuZCBzZXRzIGl0cyBib29rbWFyayBwcm9wZXJ0eSBcbi8vICAgICAgIGFkZFRvUm91dGUgPiBzaW1pbGFyIHRvIGFib3ZlXG4vLyAgICAgICAsLy9maWx0ZXJlZFN1Z2dlc3Rpb25zID5oYXMgZXZlbnRzXG4vLyAgICAgICAsLy9ib29rbWFya3Ncbi8vICAgICAgICwvL2Jvb2ttYXJrIGZ1bmN0aW9uXG4vLyAgICAgICAsLy9pblJvdXRlXG4vLyAgICAgICAsLy9hZGQgdG8gcm91dGUgZnVuY3Rpb25cbi8vICAgICAgICwvL3N0YXR1c1xuLy8gICAgICAgLC8vc2V0TGVnL2xvY2F0aW9uIChBIHRvIEI7IGp1c3QgQTsgQiB0byBDPz8pXG4vLyAgICB9LFxuLy8gICAgb246IGZ1bmN0aW9uKGV2ZW50U3RyaW5nLCBjYWxsYmFjayl7fSxcbi8vICAgIGV2ZW50czoge1xuLy8gICAgICAgcmVhZHk6IFsgZnVuY3Rpb24oKXt9LCBmdW5jdGlvbigpe30gXSxcbi8vICAgIH1cbi8vICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nKSxcbi8vICAgIC8vKGNoZWNrcyBsb2NhbCBzdG9yYWdlIGFuZCB1cGRhdGVzIGRhdGEgYXBwcm9wcmlhdGVseSlcbi8vICAgIGluaXQ6IGZ1bmN0aW9uKCl7fSxcbi8vIH1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvc3RhdGUvc3RhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cblxudmFyIHN0eWxlc0luRG9tID0ge307XG5cbnZhclx0bWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbztcblxuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0eXBlb2YgbWVtbyA9PT0gXCJ1bmRlZmluZWRcIikgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIG1lbW87XG5cdH07XG59O1xuXG52YXIgaXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xuXHQvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuXHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcblx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuXHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG59KTtcblxudmFyIGdldEVsZW1lbnQgPSAoZnVuY3Rpb24gKGZuKSB7XG5cdHZhciBtZW1vID0ge307XG5cblx0cmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdFx0aWYgKHR5cGVvZiBtZW1vW3NlbGVjdG9yXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0bWVtb1tzZWxlY3Rvcl0gPSBmbi5jYWxsKHRoaXMsIHNlbGVjdG9yKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWVtb1tzZWxlY3Rvcl1cblx0fTtcbn0pKGZ1bmN0aW9uICh0YXJnZXQpIHtcblx0cmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KVxufSk7XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyXHRzaW5nbGV0b25Db3VudGVyID0gMDtcbnZhclx0c3R5bGVzSW5zZXJ0ZWRBdFRvcCA9IFtdO1xuXG52YXJcdGZpeFVybHMgPSByZXF1aXJlKFwiLi91cmxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcblx0aWYgKHR5cGVvZiBERUJVRyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBERUJVRykge1xuXHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdG9wdGlvbnMuYXR0cnMgPSB0eXBlb2Ygb3B0aW9ucy5hdHRycyA9PT0gXCJvYmplY3RcIiA/IG9wdGlvbnMuYXR0cnMgOiB7fTtcblxuXHQvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXHRpZiAoIW9wdGlvbnMuc2luZ2xldG9uKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuXHRpZiAoIW9wdGlvbnMuaW5zZXJ0SW50bykgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKCFvcHRpb25zLmluc2VydEF0KSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXG5cdGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZSAobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0XHRkb21TdHlsZS5yZWZzLS07XG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XG5cdFx0fVxuXG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSBkb21TdHlsZS5wYXJ0c1tqXSgpO1xuXG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20gKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzIChsaXN0LCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcblx0XHR2YXIgY3NzID0gaXRlbVsxXTtcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xuXHRcdHZhciBzb3VyY2VNYXAgPSBpdGVtWzNdO1xuXHRcdHZhciBwYXJ0ID0ge2NzczogY3NzLCBtZWRpYTogbWVkaWEsIHNvdXJjZU1hcDogc291cmNlTWFwfTtcblxuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKSBzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2UgbmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xuXHR9XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50IChvcHRpb25zLCBzdHlsZSkge1xuXHR2YXIgdGFyZ2V0ID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8pXG5cblx0aWYgKCF0YXJnZXQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydEludG8nIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcblx0fVxuXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlc0luc2VydGVkQXRUb3Bbc3R5bGVzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblxuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmICghbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIHRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYgKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdFx0fVxuXHRcdHN0eWxlc0luc2VydGVkQXRUb3AucHVzaChzdHlsZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xuXHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyICdpbnNlcnRBdCcuIE11c3QgYmUgJ3RvcCcgb3IgJ2JvdHRvbScuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudCAoc3R5bGUpIHtcblx0aWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblx0c3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG5cblx0dmFyIGlkeCA9IHN0eWxlc0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZSk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhZGRBdHRycyhzdHlsZSwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZSk7XG5cblx0cmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudCAob3B0aW9ucykge1xuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0b3B0aW9ucy5hdHRycy5yZWwgPSBcInN0eWxlc2hlZXRcIjtcblxuXHRhZGRBdHRycyhsaW5rLCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmspO1xuXG5cdHJldHVybiBsaW5rO1xufVxuXG5mdW5jdGlvbiBhZGRBdHRycyAoZWwsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlIChvYmosIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlLCB1cGRhdGUsIHJlbW92ZSwgcmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cblx0ICAgIGlmIChyZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSByZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cblx0XHRzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcblxuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG5cblx0fSBlbHNlIGlmIChcblx0XHRvYmouc291cmNlTWFwICYmXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5jcmVhdGVPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIlxuXHQpIHtcblx0XHRzdHlsZSA9IGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblxuXHRcdFx0aWYoc3R5bGUuaHJlZikgVVJMLnJldm9rZU9iamVjdFVSTChzdHlsZS5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblx0XHR9O1xuXHR9XG5cblx0dXBkYXRlKG9iaik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlIChuZXdPYmopIHtcblx0XHRpZiAobmV3T2JqKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG5ld09iai5jc3MgPT09IG9iai5jc3MgJiZcblx0XHRcdFx0bmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiZcblx0XHRcdFx0bmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcFxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXG5cdFx0cmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cdH07XG59KSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnIChzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG5cdHZhciBjc3MgPSByZW1vdmUgPyBcIlwiIDogb2JqLmNzcztcblxuXHRpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblxuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuXHRcdFx0c3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcgKHN0eWxlLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsIG1lZGlhKVxuXHR9XG5cblx0aWYoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZS5maXJzdENoaWxkKSB7XG5cdFx0XHRzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcblx0XHR9XG5cblx0XHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rIChsaW5rLCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qXG5cdFx0SWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdFx0YW5kIHRoZXJlIGlzIG5vIHB1YmxpY1BhdGggZGVmaW5lZCB0aGVuIGxldHMgdHVybiBjb252ZXJ0VG9BYnNvbHV0ZVVybHNcblx0XHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0XHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpIHtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZiAoc291cmNlTWFwKSB7XG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjY2MDM4NzVcblx0XHRjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSArIFwiICovXCI7XG5cdH1cblxuXHR2YXIgYmxvYiA9IG5ldyBCbG9iKFtjc3NdLCB7IHR5cGU6IFwidGV4dC9jc3NcIiB9KTtcblxuXHR2YXIgb2xkU3JjID0gbGluay5ocmVmO1xuXG5cdGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKSBVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBSZXRyaWV2ZSB0aGUgZGF0YSBmb3IgYSByZWNyZWF0aW9uIGFyZWEgYmFzZWQgb24gUmVjQXJlYUlEXG4qICBEaXNwbGF5IHRoZSBkYXRhIHRvIGEgbW9kYWwgb24gdGhlIHdlYiBwYWdlICovXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlU2luZ2xlUmVjQXJlYShyZWNhcmVhKSB7XG4gICAgJCgnLm1vZGFsJykuZW1wdHkoKTtcbiAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSB1c2luZyByZWNBcmVhSWRcbiAgICBjb25zb2xlLmxvZyhyZWNhcmVhKTtcblxuICAgIHZhciByZWNBcmVhTmFtZSA9IHJlY2FyZWEuUmVjQXJlYU5hbWU7XG4gICAgdmFyIHJlY05hbWVUZXh0ID0gJChcIjxkaXY+XCIpLnRleHQocmVjQXJlYU5hbWUpO1xuXG4gICAgdmFyIHJlY0FyZWFQaG9uZSA9IHJlY2FyZWEuUmVjQXJlYVBob25lO1xuICAgIHZhciByZWNQaG9uZVRleHQgPSAkKFwiPHA+XCIpLnRleHQocmVjQXJlYVBob25lKTtcblxuICAgICQoJy5tb2RhbCcpLmFwcGVuZChyZWNOYW1lVGV4dCxyZWNQaG9uZVRleHQpO1xuXG4gICAgcmVjYXJlYS5BQ1RJVklUWS5mb3JFYWNoKGZ1bmN0aW9uKGFjdGl2aXR5KXtcbiAgICAgICAgJCgnLm1vZGFsJykuYXBwZW5kKGFjdGl2aXR5LkFjdGl2aXR5TmFtZSk7XG4gICAgfSlcblxuICAgICAgICAkKCcjbW9kYWwxJykubW9kYWwoJ29wZW4nKTtcbiAgICAvLyBkaXNwbGF5IHRoZSBkYXRhIGluIGEgbW9kYWwgYm94XG4vLyBzdGF0ZS5yZWNyZWF0aW9uLmZpbHRlcmVkLlJFQ0RBVEFbMF0uc2hvd0RldGFpbHMocmVjQXJlYUlkKTtcblxufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG4gICAgJCgnLm1vZGFsJykubW9kYWwoKTtcblxuIH0pO1xuXG4gLy8gZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlSZWNBcmVhT25DbGljayhyZWNBcmVhSWQpIHtcbiAvLyAgICAvLyB2YXIgc3VnZ2VzdFN1bUlkID0gJChcIi5zdWdnZXN0aW9uU3VtbWFyeVwiKS5hdHRyKFwiaWRcIik7XG4gLy8gICAgLy8gY29uc29sZS5sb2coc3VnZ2VzdFN1bUlkKTtcbiAvL1xuIC8vICAgICAgIGNvbnNvbGUubG9nKHJlY0FyZWFJZCk7XG4gLy8gICAgICQoXCIuc3VnZ2VzdGlvblN1bW1hcnlcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuIC8vICAgICAgICAgLy8gdGhlIFwiaHJlZlwiIGF0dHJpYnV0ZSBvZiB0aGUgbW9kYWwgdHJpZ2dlciBtdXN0IHNwZWNpZnkgdGhlIG1vZGFsIElEIHRoYXQgd2FudHMgdG8gYmUgdHJpZ2dlcmVkXG4gLy8gICAgICAgICAkKCcubW9kYWwnKS5tb2RhbCgnb3BlbicpO1xuIC8vICAgICAgICAgJCgnLm1vZGFsJykuYXBwZW5kKHJldHJpZXZlU2luZ2xlUmVjQXJlYShyZWNBcmVhSWQpKTtcbiAvLyAgICAgfSlcbiAvLyB9XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjQXJlYURldGFpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uJztcbmltcG9ydCAnLi9jb21wb25lbnRzL3JlY3JlYXRpb24vbG9hZEJ1dHRvbic7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzJztcbmltcG9ydCAnLi9jb21wb25lbnRzL2xheW91dC9sYXlvdXQnO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvbWFwL21hcCc7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9yb3V0ZS9yb3V0ZSc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL3JlY3JlYXRpb24uY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5pbXBvcnQgJy4vZGlzcGxheVJlY0FyZWFTdWdnZXN0aW9ucyc7XG5pbXBvcnQgJy4vcmVjQXJlYURldGFpbHMnO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY3JlYXRpb24uanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcmVjcmVhdGlvbi5jc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcmVjcmVhdGlvbi5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcmVjcmVhdGlvbi5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIucmVjcmVhdGlvbntcXG4gICBiYWNrZ3JvdW5kOiByZWQ7XFxufVxcblxcbi5zdWdnZXN0aW9uU3VtbWFyeSB7XFxuICAgIGZvbnQtc2l6ZTogMWVtO1xcbn1cXG5cXG4uc3VnZ2VzdGlvblN1bW1hcnk6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMCwgMCwgMCwgMC4xKTtcXG5cXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbi5jc3Ncbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC8pL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0IHZhciBpbnRlcmVzdExpc3QgPSBbXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiQklLSU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiA1LFxuICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJDTElNQklOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogNyxcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiQ0FNUElOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogOSxcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgICB9LFxuICAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJISUtJTkdcIixcbiAgICAgIFwiQWN0aXZpdHlJRFwiOiAxNCxcbiAgICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9LFxuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIlBJQ05JQ0tJTkdcIixcbiAgICAgIFwiQWN0aXZpdHlJRFwiOiAyMCxcbiAgICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICAgfSxcbiAgICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiUkVDUkVBVElPTkFMIFZFSElDTEVTXCIsXG4gICAgICBcIkFjdGl2aXR5SURcIjogMjMsXG4gICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgIH0sXG4gICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIlZJU0lUT1IgQ0VOVEVSXCIsXG4gICAgICBcIkFjdGl2aXR5SURcIjogMjQsXG4gICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJTV0lNTUlOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogMTA2LFxuICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJXSUxETElGRSBWSUVXSU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiAyNixcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiSE9SU0VCQUNLIFJJRElOR1wiLFxuICAgICBcIkFjdGl2aXR5SURcIjogMTUsXG4gICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9XG5cbl1cblxuXG5leHBvcnQgZnVuY3Rpb24gcmVjQXBpUXVlcnkobGF0aXR1ZGVWYWwsbG9uZ2l0dWRlVmFsLHJhZGl1c1ZhbCxhY3Rpdml0eVZhbCxjYWxsYmFjaykge1xuXG4gICAgdmFyIHJlY1F1ZXJ5VVJMID0gXCJodHRwczovL3JpZGIucmVjcmVhdGlvbi5nb3YvYXBpL3YxL3JlY2FyZWFzLmpzb24/YXBpa2V5PTJDMUIyQUM2OUUxOTQ1REU4MTVCNjlCQkNDOUM3QjE5JmZ1bGwmbGF0aXR1ZGU9XCJcbiAgICArIGxhdGl0dWRlVmFsICsgXCImbG9uZ2l0dWRlPVwiICsgbG9uZ2l0dWRlVmFsICsgXCImcmFkaXVzPVwiICsgcmFkaXVzVmFsICsgXCImYWN0aXZpdHk9XCIgKyBhY3Rpdml0eVZhbDtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiByZWNRdWVyeVVSTCxcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIlxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShjYWxsYmFjayk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vY29uc3RhbnRzLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZGlzcGxheVJlY0FyZWFTdW1tYXJ5KHJlY2RhdGEsIGZpbHRlcmVkVHlwZSkge1xuICAgICAgICAkKGZpbHRlcmVkVHlwZSkuZW1wdHkoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8cmVjZGF0YS52YWwubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgdmFyIHJlY1ZhbEFsaWFzID0gcmVjZGF0YS52YWxbaV07XG5cbiAgICAgICAgICAgIHZhciByZWNSZXN1bHRzID0gSlNPTi5zdHJpbmdpZnkocmVjZGF0YSk7XG5cbiAgICAgICAgICAgIHZhciBzdWdEaXZDbGFzcyA9ICQoXCI8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uU3VtbWFyeScgaWQ9J2FyZWFJZC1cIiArIHJlY1ZhbEFsaWFzLmlkICsgXCInPlwiKTtcbiAgICAgICAgICAgIHZhciByZWNBcmVhTmFtZSA9IHJlY1ZhbEFsaWFzLlJlY0FyZWFOYW1lO1xuICAgICAgICAgICAgdmFyIHJlY05hbWVUZXh0ID0gJChcIjxkaXY+XCIpLnRleHQocmVjQXJlYU5hbWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVjQXJlYVBob25lID0gcmVjVmFsQWxpYXMuUmVjQXJlYVBob25lO1xuICAgICAgICAgICAgdmFyIHJlY1Bob25lVGV4dCA9ICQoXCI8cD5cIikudGV4dChyZWNBcmVhUGhvbmUpO1xuXG4gICAgICAgICAgICAvL0dldCBib3RoIHRoZSBUaXRsZSBhbmQgVVJMIHZhbHVlcyBhbmQgY3JlYXRlIGEgbGluayB0YWcgb3V0IG9mIHRoZW1cbiAgICAgICAgICAgIC8vIFdlJ3JlIG9ubHkgZ3JhYmJpbmcgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBMSU5LIGFycmF5XG4gICAgICAgICAgICB2YXIgcmVjQXJlYUxpbmtUaXRsZSA9IHJlY1ZhbEFsaWFzLkxJTktbMF0uVGl0bGU7XG4gICAgICAgICAgICB2YXIgcmVjQXJlYVVybCA9IHJlY1ZhbEFsaWFzLkxJTktbMF0uVVJMO1xuICAgICAgICAgICAgdmFyIHJlY0FyZWFMaW5rID0gJChcIjxhIC8+XCIsIHtcbiAgICAgICAgICAgICAgICBocmVmOiByZWNBcmVhVXJsLFxuICAgICAgICAgICAgICAgIHRleHQ6IHJlY0FyZWFMaW5rVGl0bGUsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wifSk7XG5cbiAgICAgICAgICAgIHZhciByZWNBcmVhTGlua1AgPSAkKFwiPHA+XCIpLmFwcGVuZChyZWNBcmVhTGluayk7XG4gICAgICAgICAgICBzdWdEaXZDbGFzcy5hcHBlbmQocmVjTmFtZVRleHQsIHJlY0FyZWFQaG9uZSwgcmVjQXJlYUxpbmtQKTtcblxuICAgICAgICAgICAgJChmaWx0ZXJlZFR5cGUpLmFwcGVuZChzdWdEaXZDbGFzcyk7XG5cbiAgICAgICAgICAgIHN1Z0RpdkNsYXNzLmNsaWNrKHJlY1ZhbEFsaWFzLnNob3dEZXRhaWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbnN0YXRlLnJlY3JlYXRpb24uZmlsdGVyZWQub24oXCJjaGFuZ2VcIiwgIGZ1bmN0aW9uKHJlY2RhdGEpe1xuXG4gICAgICAgIHZhciBmaWx0ZXJlZFR5cGUgPSBcIiNmaWx0ZXJlZFwiO1xuICAgICAgICBkaXNwbGF5UmVjQXJlYVN1bW1hcnkocmVjZGF0YSwgZmlsdGVyZWRUeXBlKTtcbn0pO1xuc3RhdGUucmVjcmVhdGlvbi5ib29rbWFya2VkLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKHJlY2RhdGEpe1xuXG4gICAgICAgIHZhciBmaWx0ZXJlZFR5cGUgPSBcIiNib29rbWFya2VkXCI7XG4gICAgICAgIGRpc3BsYXlSZWNBcmVhU3VtbWFyeShyZWNkYXRhLCBmaWx0ZXJlZFR5cGUpO1xufSk7XG5zdGF0ZS5yZWNyZWF0aW9uLmluUm91dGUub24oXCJjaGFuZ2VcIiwgIGZ1bmN0aW9uKHJlY2RhdGEpe1xuXG4gICAgICAgIHZhciBmaWx0ZXJlZFR5cGUgPSBcIiNhZGRlZC10by1yb3V0ZVwiO1xuICAgICAgICBkaXNwbGF5UmVjQXJlYVN1bW1hcnkocmVjZGF0YSwgZmlsdGVyZWRUeXBlKTtcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL2Rpc3BsYXlSZWNBcmVhU3VnZ2VzdGlvbnMuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cbmZ1bmN0aW9uIHNob3dCdXR0b24oc3RhdHVzKSB7XG4gICB2YXIgY29udGFpbmVyID0gJCgnI2J1dHRvbi1jb250YWluZXInKTtcbiAgIHZhciB0ZXh0O1xuICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJidG5cIj4nKVxuICAgICAgLnRleHQoJ0ZpbmQgUmVjcmVhdGlvbicpXG4gICAgICAuY2xpY2soc3RhdGUucmVjcmVhdGlvbi5zZWFyY2gpO1xuXG4gICB2YXIgbm9JbnRlcmVzdCA9ICFzdGF0ZS5pbnRlcmVzdHMuc2VsZWN0ZWQubGVuZ3RoO1xuICAgdmFyIG5vTG9jYXRpb24gPSAhc3RhdGUucm91dGUubG9jYXRpb25Db3VudDtcbiAgIGlmKHN0YXR1cy52YWwuZmlyc3RMb2FkICYmIG5vSW50ZXJlc3QgJiYgbm9Mb2NhdGlvbil7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBzb21lIGludGVyZXN0cyBhbmQgY2hvb3NlIGF0IGxlYXN0IG9uZSBsb2NhdGlvbiB0byBnZXQgc3RhcnRlZCc7XG4gICAgICBidG4uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgIH1cbiAgIGVsc2UgaWYoc3RhdHVzLnZhbC5maXJzdExvYWQgJiYgbm9JbnRlcmVzdCl7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBhdCBsZWFzdCBvbmUgaW50ZXJlc3QgdG8gZ2V0IHN0YXJ0ZWQnO1xuICAgICAgYnRuLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICB9XG4gICBlbHNlIGlmKHN0YXR1cy52YWwuZmlyc3RMb2FkICYmIG5vTG9jYXRpb24pe1xuICAgICAgdGV4dCA9ICdTZWxlY3QgYXQgbGVhc3Qgb25lIGxvY2F0aW9uIHRvIGdldCBzdGFydGVkJztcbiAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgfVxuICAgZWxzZSBpZihzdGF0dXMudmFsLmZpcnN0TG9hZCl7XG4gICAgICB0ZXh0ID0gJ0NsaWNrIHRoZSBidXR0b24gdG8gZ2V0IHN0YXJ0ZWQnXG4gICB9XG4gICBlbHNlIGlmKG5vSW50ZXJlc3Qpe1xuICAgICAgdGV4dCA9ICdTZWxlY3QgYXQgbGVhc3Qgb25lIGludGVyZXN0IHRvIHNlYXJjaCBmb3IgcmVjcmVhdGlvbiBhcmVhcyc7XG4gICAgICBidG4uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgIH1cbiAgIGVsc2UgaWYobm9Mb2NhdGlvbil7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBhdCBsZWFzdCBvbmUgbG9jYXRpb24gdG8gc2VhcmNoIGZvciByZWNyZWF0aW9uIGFyZWFzJztcbiAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgfVxuICAgZWxzZXtcbiAgICAgIHRleHQgPSAnTmV3IHJlY3JlYXRpb24gYXJlYXMgbWF5IGJlIGF2YWlsYWJsZS4nXG4gICB9XG5cbiAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgaWYoIHN0YXR1cy52YWwuc2hvdWxkTG9hZCB8fCBzdGF0dXMudmFsLmZpcnN0TG9hZCB8fCAhc3RhdHVzLnZhbC5jYW5Mb2FkKXtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQoJCgnPHA+JykudGV4dCh0ZXh0KSwgYnRuKTtcbiAgIH1cbiAgIGVsc2UgaWYoc3RhdHVzLnZhbC5sb2FkaW5nKXtcbiAgICAgIHRleHQgPSAnTG9hZGluZyByZWNyZWF0aW9uIGFyZWFz4oCmJ1xuICAgICAgY29udGFpbmVyLmFwcGVuZCgkKCc8cD4nKS50ZXh0KHRleHQpLCBcbiAgICAgICAgIGA8ZGl2IGNsYXNzPVwicHJlbG9hZGVyLXdyYXBwZXIgYmlnIGFjdGl2ZVwiPlxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLWxheWVyIHNwaW5uZXItYmx1ZS1vbmx5XCI+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlLWNsaXBwZXIgbGVmdFwiPlxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICA8L2Rpdj48ZGl2IGNsYXNzPVwiZ2FwLXBhdGNoXCI+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PjxkaXYgY2xhc3M9XCJjaXJjbGUtY2xpcHBlciByaWdodFwiPlxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgPC9kaXY+YCk7XG4gICB9XG59XG5cbnN0YXRlLmludGVyZXN0cy5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4gICB2YXIgbG9hZGVkID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMubG9hZGVkQWN0aXZpdGllcztcbiAgIHZhciBmaWx0ZXJlZCA9IHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLmZpbHRlcmVkQWN0aXZpdGllcztcbiAgIHZhciBzaG91bGRMb2FkID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzO1xuICAgdmFyIHNob3VsZEZpbHRlciA9IGZhbHNlO1xuICAgZS52YWwuYWxsLmZvckVhY2goKGludGVyZXN0KSA9PiB7XG4gICAgICBpZighbG9hZGVkW2ludGVyZXN0LmlkXSAmJiBpbnRlcmVzdC5zZWxlY3RlZCl7XG4gICAgICAgICBzaG91bGRMb2FkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKGxvYWRlZFtpbnRlcmVzdC5pZF0gJiYgaW50ZXJlc3Quc2VsZWN0ZWQgIT09IGZpbHRlcmVkW2ludGVyZXN0LmlkXSl7XG4gICAgICAgICBzaG91bGRGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgZmlsdGVyZWRbaW50ZXJlc3QuaWRdID0gaW50ZXJlc3Quc2VsZWN0ZWQ7XG4gICAgICB9XG4gICB9KTtcbiAgIHZhciBjYW5Mb2FkID0gISFlLnZhbC5zZWxlY3RlZC5sZW5ndGggJiYgISFzdGF0ZS5yb3V0ZS5sb2NhdGlvbkNvdW50O1xuICAgc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMudXBkYXRlKHtzaG91bGRMb2FkOiBzaG91bGRMb2FkLCBjYW5Mb2FkOiBjYW5Mb2FkfSk7XG4gICBpZiggc2hvdWxkRmlsdGVyKXtcbiAgICAgIHN0YXRlLnJlY3JlYXRpb24uZmlsdGVyQWxsKCk7XG4gICB9XG59KTtcblxuLy9taWdodCBoYXZlIHRvIHdhaXQgZm9yIGRpcmVjdGlvbnMgdG8gY29tZSBiYWNrIGFuZCBiZSBwcm9jZXNzZWQuLi5cbnN0YXRlLnJvdXRlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKXtcbiAgIHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLnNob3VsZFJlc2V0TG9hZGVkQWN0aXZpdGllcyA9IHRydWU7XG4gICB2YXIgc2hvdWxkTG9hZCA9ICEhZS52YWwubGVuZ3RoO1xuICAgdmFyIGNhbkxvYWQgPSAhIWUudmFsLmxlbmd0aCAmJiAhIXN0YXRlLmludGVyZXN0cy5zZWxlY3RlZC5sZW5ndGg7XG4gICBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy51cGRhdGUoe3Nob3VsZExvYWQ6IHNob3VsZExvYWQsIGNhbkxvYWQ6IGNhbkxvYWR9KTtcbn0pXG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHNob3dCdXR0b24oc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMubWFrZUV2ZW50KCkpKTtcbnN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLm9uKCdjaGFuZ2UnLCBzaG93QnV0dG9uKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9sb2FkQnV0dG9uLmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJy4vaW50ZXJlc3RzLmNzcyc7XG5pbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2ludGVyZXN0cy5jc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vaW50ZXJlc3RzLmNzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9pbnRlcmVzdHMuY3NzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMuY3NzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuaW50ZXJlc3Rze1xcbiAgIGJhY2tncm91bmQ6IG9yYW5nZTtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMuY3NzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJy4vbGF5b3V0LmNzcyc7XG5pbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAkKCdzZWxlY3QnKS5tYXRlcmlhbF9zZWxlY3QoKTtcbiAgICBcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0ZS5pbnRlcmVzdHMuYWxsLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IG5ld0NoaXAgPSAkKCc8ZGl2IGNsYXNzPVwiY2hpcFwiPjwvZGl2PicpO1xuXHRcdCQoXCIjaW50ZXJlc3RzXCIpLmFwcGVuZChuZXdDaGlwLnRleHQoc3RhdGUuaW50ZXJlc3RzLmFsbFtpXS5uYW1lKSk7XG5cdFx0JChuZXdDaGlwKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHRcdHN0YXRlLmludGVyZXN0cy5hbGxbaV0udG9nZ2xlKCk7XG5cdFx0fSk7XG5cdHN0YXRlLmludGVyZXN0cy5hbGxbaV0ub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRpZihlLnZhbCkge1xuXHRcdFx0bmV3Q2hpcC5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdFx0JChcIiNzZWxlY3RlZC1pbnRlcmVzdHNcIikuYXBwZW5kKG5ld0NoaXApO1xuXHRcdH0gZWxzZSB7XG5cdFx0IFx0bmV3Q2hpcC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHQgXHQkKFwiI3Vuc2VsZWN0ZWQtaW50ZXJlc3RzXCIpLnByZXBlbmQobmV3Q2hpcCk7XG5cdFx0fVxuXG5cdH0pO1xuXHR9XG4gIH0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5qc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbGF5b3V0LmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9sYXlvdXQuY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2xheW91dC5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikodW5kZWZpbmVkKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi50ZXN0LWNsYXNze1xcbiAgIGJhY2tncm91bmQ6IGxpbWU7XFxufVxcblxcbi5sYXlvdXR7XFxuICAgYmFja2dyb3VuZDogcmViZWNjYXB1cnBsZTtcXG59XFxuLnNlbGVjdGVke2NvbG9yOiBibHVlO31cXG5cXG4uY2hpcCB7XFxuXFx0Y3Vyc29yOiBwb2ludGVyO1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcbn1cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9tYXAuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cbmNvbnN0IG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCB7XG4gIGNlbnRlcjoge2xhdDogMzkuNzY0MjU0OCwgbG5nOiAtMTA0Ljk5NTE5Mzd9LFxuICB6b29tOiA1XG59KTtcblxubGV0IHJvdXRlTWFya2VycyA9IFtdO1xubGV0IHJlY0FyZWFNYXJrZXJzID0gW107XG5cbnN0YXRlLnJvdXRlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKXtcbiAgIC8vcmVtb3ZlIGFsbCBtYXJrZXJzXG4gICByb3V0ZU1hcmtlcnMuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgbS5zZXRNYXAobnVsbCk7XG4gICB9KTtcbiAgIHJvdXRlTWFya2VycyA9IFtdO1xuXG4gICAvL2FkZCBuZXcgbWFya2Vyc1xuICAgaWYoZS52YWwubGVuZ3RoID09PSAxKXtcbiAgICAgIG1hcC5maXRCb3VuZHMoZS52YWxbMF0uZGF0YS5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAvL2FkZE1hcmtlcihlLnZhbFswXS5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uKTtcbiAgIH1cbiAgIGVsc2UgaWYoZS52YWwubGVuZ3RoKXtcbiAgICAgIC8vIGUudmFsLmZvckVhY2goKGwpID0+IHtcbiAgICAgIC8vICAgIGFkZE1hcmtlcihsLmRhdGEuZ2VvbWV0cnkubG9jYXRpb24pO1xuICAgICAgLy8gfSlcbiAgIH1cbn0pXG5cblxuc3RhdGUucmVjcmVhdGlvbi5maWx0ZXJlZC5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG4gICBjb25zb2xlLmxvZyhlKTtcbiAgIGxldCBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAvL3JlbW92ZSBhbGwgbWFya2Vyc1xuICAgcmVjQXJlYU1hcmtlcnMuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgbS5zZXRNYXAobnVsbCk7XG4gICB9KTtcbiAgIHJlY0FyZWFNYXJrZXJzID0gW107XG5cbiAgIGUudmFsLmZvckVhY2goKHIpID0+IHtcbiAgICAgIGxldCBsYXRMbmcgPSB7XG4gICAgICAgICBsYXQ6IHIuUmVjQXJlYUxhdGl0dWRlLFxuICAgICAgICAgbG5nOiByLlJlY0FyZWFMb25naXR1ZGVcbiAgICAgIH07XG4gICAgICBhZGRNYXJrZXIobGF0TG5nLCAncmVjJywgcik7XG4gICAgICBib3VuZHMuZXh0ZW5kKGxhdExuZyk7XG4gICB9KTtcbiAgIGlmKCBlLnZhbC5sZW5ndGgpe1xuICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgfVxufSlcblxuXG5cbmZ1bmN0aW9uIGFkZE1hcmtlcihsb2NhdGlvbiwgdHlwZSwgYXJlYSkge1xuICAgbGV0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgcG9zaXRpb246IGxvY2F0aW9uLFxuICAgICAgbWFwOiBtYXBcbiAgIH0pO1xuICAgaWYoYXJlYSl7XG4gICAgICBsZXQgaW5mbyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtjb250ZW50OiBtYWtlUHJldmlldyhhcmVhKX0pO1xuICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZSkgPT4ge1xuICAgICAgICAgaW5mby5vcGVuKG1hcCwgbWFya2VyKTtcbiAgICAgIH0pO1xuICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdtb3VzZW91dCcsIChlKSA9PiB7XG4gICAgICAgICBpbmZvLmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBhcmVhLnNob3dEZXRhaWxzKTtcbiAgIH1cbiAgIGlmKCB0eXBlID09PSAncmVjJyl7XG4gICAgICByZWNBcmVhTWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICB9XG4gICBlbHNlIGlmKHR5cGUgPT09ICdyb3V0ZScpe1xuICAgICAgcm91dGVNYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgIH1cbiAgIGVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlciB0eXBlIG11c3QgYmUgZWl0aGVyIFwicmVjXCIgb3IgXCJyb3V0ZVwiJyk7XG4gICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VQcmV2aWV3KHJlY0FyZWEpe1xuICAgcmV0dXJuIGBcbiAgIDxzdHJvbmc+JHtyZWNBcmVhLlJlY0FyZWFOYW1lfTwvc3Ryb25nPlxuICAgYFxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwLmpzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9tYXAuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL21hcC5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbWFwLmNzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwLmNzc1xuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiXFxuI21hcHtcXG4gICBtaW4taGVpZ2h0OiA5MHZoO1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9yb3V0ZS5jc3MnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxudmFyIHN0b3Bjb3VudCA9IDA7XG5cbnZhciBvcHRpb25zID0ge1xuICBjb21wb25lbnRSZXN0cmljdGlvbnM6IHtjb3VudHJ5OiAndXMnfVxufTtcblxubmV3SW5wdXRGaWVsZCgpO1xuXG5zdGF0ZS5yb3V0ZS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoZSl7XG5cdHZhciBwYXRoID0gZS52YWw7XG5cdCQoXCIjZGVzdGluYXRpb25zXCIpLmVtcHR5KCk7XG5cdGlmIChwYXRoLmxlbmd0aCA9PSAwKSB7XG5cdFx0bmV3SW5wdXRGaWVsZCgpO1xuXHR9IGVsc2Uge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZS52YWwubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBsb2NhdGlvbiA9IGUudmFsW2ldO1xuXHRcdFx0bGV0IG5ld0lucHV0ID0gJChcIjxpbnB1dD5cIikudmFsKGxvY2F0aW9uLmRhdGEubmFtZSArICcgKCcgKyBsb2NhdGlvbi5kYXRhLmZvcm1hdHRlZF9hZGRyZXNzICsgJyknKTtcblx0XHRcdG5ld0lucHV0LmZvY3Vzb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmIChuZXdJbnB1dC52YWwoKSA9PSBcIlwiKXtcblx0XHRcdFx0XHRzdGF0ZS5yb3V0ZS5yZW1vdmUoaSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0JChcIiNkZXN0aW5hdGlvbnNcIikuYXBwZW5kKG5ld0lucHV0KTtcblx0XHRcdGF1dG9maWxsKG5ld0lucHV0WzBdLCBmYWxzZSwgaSk7XG5cdFx0XHQkKFwiI2Rlc3RpbmF0aW9uc1wiKS5hcHBlbmQoXCI8YnI+XCIpO1xuXHRcdH0gXG5cdH1cblx0JChcIiNkZXN0aW5hdGlvbnNcIikuYXBwZW5kKFwiPGRpdiBpZD0nbmV3YnV0dG9ucyc+XCIpO1xuXHQkKFwiI25ld2J1dHRvbnNcIikuYXBwZW5kKFwiPGEgY2xhc3M9J2J0bi1mbG9hdGluZyBidG4tc21hbGwgd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IHJlZCcgaWQ9J3JvdXRlLWFkZEJ0bic+PGkgY2xhc3M9J21hdGVyaWFsLWljb25zJz5hZGQ8L2k+PC9hPlwiKTtcblx0JChcIiNuZXdidXR0b25zXCIpLmFwcGVuZChcIjxwIGlkPSdyb3V0ZS1uZXdMb2NhdGlvblRleHQnPkFkZCBhIE5ldyBTdG9wPC9wPlwiKTtcblx0JChcIiNyb3V0ZS1hZGRCdG5cIikuY2xpY2sobmV3SW5wdXRGaWVsZCk7XG59KTtcblxuLy8gQXBwbGllZCBhdXRvZmlsbCBjb2RlIHRvIHRoZSBuZXcgaW5wdXQgZmllbGRzIGFuZCBzZW5kcyBpbnB1dCB0byBzdGF0ZSBvYmplY3RcbmZ1bmN0aW9uIGF1dG9maWxsKGlucHV0LCBhZGQsIGluZGV4KXtcblx0dmFyIGF1dG9jb21wbGV0ZSA9IG5ldyBnb29nbGUubWFwcy5wbGFjZXMuQXV0b2NvbXBsZXRlKGlucHV0LCBvcHRpb25zKTtcblx0YXV0b2NvbXBsZXRlLmFkZExpc3RlbmVyKCdwbGFjZV9jaGFuZ2VkJywgZnVuY3Rpb24gKCl7XG5cdFx0dmFyIHBsYWNlID0gYXV0b2NvbXBsZXRlLmdldFBsYWNlKCk7XG5cdFx0aWYgKGFkZCl7XG5cdFx0XHRzdGF0ZS5yb3V0ZS5hZGQocGxhY2UpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHN0YXRlLnJvdXRlLnJlbW92ZShpbmRleCk7XG5cdFx0XHRzdGF0ZS5yb3V0ZS5pbnNlcnQocGxhY2UsIGluZGV4KTtcblx0XHR9XG5cdH0pO1xufVxuXG4vLyBHZXQgdGhlIEhUTUwgaW5wdXQgZWxlbWVudCBmb3IgdGhlIGF1dG9jb21wZWx0ZSBzZWFyY2ggYm94IGFuZCBjcmVhdGUgdGhlIGF1dG9jb21wbGV0ZSBvYmplY3Rcbi8vIFRyYW5zbGF0ZXMgYWRkcmVzcyB0byBsYXQvbG9uZyBjb29yZGluYXRlcyBmb3IgdXNpbmcgb24gdGhlIG1hcFxuZnVuY3Rpb24gbmV3SW5wdXRGaWVsZCgpIHtcblx0JChcIiNuZXdidXR0b25zXCIpLnJlbW92ZSgpO1x0XG5cdHZhciBpbnB1dGZpZWxkID0gJChcIjxpbnB1dD5cIik7XG5cdCQoXCIjZGVzdGluYXRpb25zXCIpLmFwcGVuZChpbnB1dGZpZWxkKTtcblx0aW5wdXRmaWVsZC5hZGRDbGFzcyhcImRlc3RpbmF0aW9uLWlucHV0XCIpO1xuXHRpZiAoc3RvcGNvdW50ID09IDApIHtcblx0XHRpbnB1dGZpZWxkLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBcIlN0YXJ0aW5nIExvY2F0aW9uOiBcIik7XG5cdH1cblx0ZWxzZSB7XG5cdFx0aW5wdXRmaWVsZC5hdHRyKFwicGxhY2Vob2xkZXJcIiwgXCJOZXh0IFN0b3A6IFwiKTtcblx0fVxuXHRhdXRvZmlsbChpbnB1dGZpZWxkWzBdLCB0cnVlKTtcblx0c3RvcGNvdW50Kys7XG59XG5cbi8vIGNyZWF0ZSBldmVudCBsaXN0ZW5lciBmb3IgcGF0aCBpbiBzdGF0ZSBvYmplY3QuXG4vLyB3aGF0IGlzIHBhdGg/XG4vLyAgICBhbiBhcnJheSBvZiBsb2NhdGlvbiBvYmplY3RzXG4vLyBuZWVkIHRvIGZpbGwgc3RhdGUgLT4gcGF0aCB3aXRoIHRoZSBuYW1lIGFuZCBhZGRyZXNzIG9mIFxuXG4vLyBmb3IgcmV0dXJuaW5nIHVzZXJzICh3aGVyZSBwYXRoIGlzIGZpbGxlZCksIHByZS1maWxsIHByZXZpb3VzIHJvdXRlIG9wdGlvbnMgdG8gdGhlIGlucHV0IGZpZWxkc1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcm91dGUvcm91dGUuanNcbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JvdXRlLmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9yb3V0ZS5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcm91dGUuY3NzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JvdXRlL3JvdXRlLmNzc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLnJvdXRle1xcbiAgIGJhY2tncm91bmQ6IGxpZ2h0Z3JleTtcXG59XFxuXFxuI3JvdXRlLWFkZEJ0biB7XFxuXFx0ZGlzcGxheTogaW5saW5lLWJsb2NrO1xcblxcdG1hcmdpbi1yaWdodDogMTBweDtcXG5cXHRoZWlnaHQ6IDI1cHg7XFxuXFx0cGFkZGluZy10b3A6IDA7XFxuXFx0d2lkdGg6IDI1cHg7XFxufVxcblxcbi5idG4tZmxvYXRpbmcgaSB7XFxuXFx0bGluZS1oZWlnaHQ6IDI1cHhcXG59XFxuXFxuI3JvdXRlLW5ld0xvY2F0aW9uVGV4dCB7XFxuXFx0ZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbn1cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvcm91dGUvcm91dGUuY3NzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9