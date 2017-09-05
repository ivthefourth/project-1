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

    // retrieve the data using recAreaId
    console.log(recarea);

    // display the data in a modal box

}


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
exports.push([module.i, ".recreation{\n   background: red;\n}\n", ""]);

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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state_state__ = __webpack_require__(0);


    function displayRecAreaSummary(recdata, filteredType) {
        $(filteredType).empty();

        for (var i = 0; i <recdata.val.length; i++) {

            var recResults = JSON.stringify(recdata);

            var sugDivClass = $("<div class='suggestionSummary'>");
            var recAreaName = recdata.val[i].RecAreaName;
            var recNameText = $("<p>").text(recAreaName);

            var recAreaPhone = recdata.val[i].RecAreaPhone;
            var recPhoneText = $("<p>").text(recAreaPhone);

            //Get both the Title and URL values and create a link tag out of them
            // We're only grabbing the first instance of the LINK array
            var recAreaLinkTitle = recdata.val[i].LINK[0].Title;
            var recAreaUrl = recdata.val[i].LINK[0].URL;
            var recAreaLink = $("<a />", {
                href: recAreaUrl,
                text: recAreaLinkTitle,
                target: "_blank"});

            var recAreaLinkP = $("<p>").append(recAreaLink);
            sugDivClass.append(recNameText, recAreaPhone, recAreaLinkP);

            $(filteredType).append(sugDivClass);
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
  center: {lat: -34.397, lng: 150.644},
  zoom: 5
});


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

newInputField();

var options = {
  componentRestrictions: {country: 'us'}
};

// Applied autofill code to the new input fields
function autofill(input){
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	autocomplete.addListener('place_changed', function () {getAddress(autocomplete);});
}

// Return values to state object
function getAddress(autocomplete) {
	var place = autocomplete.getPlace();
	__WEBPACK_IMPORTED_MODULE_1__state_state__["a" /* default */].route.add(place);
	console.log(place.geometry.location.lat());
	console.log(place.geometry.location.lng());
	$("#destinations").append("<div id='newbuttons'>");
	$("#newbuttons").append("<a class='btn-floating btn-small waves-effect waves-light red' id='route-addBtn'><i class='material-icons'>add</i></a>");
	$("#newbuttons").append("<p id='route-newLocationText'>Add a New Stop</p>");
	$("#route-addBtn").click(newInputField);
}

// Get the HTML input element for the autocompelte search box and create the autocomplete object
// Translates address to lat/long coordinates for using on the map
function newInputField() {
	$("#newbuttons").remove();	
	var inputfield = $("<input>");
	$("#destinations").append(inputfield);
	inputfield.addClass("destination-input");
	inputfield.attr("id", "stopnumber" + stopcount);
	if (stopcount == 0) {
		inputfield.attr("placeholder", "Starting Location: ");
	}
	else {
		inputfield.attr("placeholder", "Next Stop: ");
	}
	autofill(inputfield[0]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMGQ4OWY3YmQzZjU3MmY1MWY5N2QiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvc3RhdGUvc3RhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY0FyZWFEZXRhaWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbi5jc3M/M2JjNiIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY3JlYXRpb24uY3NzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9kaXNwbGF5UmVjQXJlYVN1Z2dlc3Rpb25zLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vbG9hZEJ1dHRvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9pbnRlcmVzdHMvaW50ZXJlc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2ludGVyZXN0cy9pbnRlcmVzdHMuY3NzP2FkNjgiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbGF5b3V0L2xheW91dC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmNzcz8yZjMwIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2xheW91dC9sYXlvdXQuY3NzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL21hcC9tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5jc3M/MzQ2NyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tYXAvbWFwLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5jc3M/ZTA2NSIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7O0FDN0Q4QjtBQUNJOztBQUVsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLE1BQU0sNEJBQTRCLEtBQUs7QUFDcEU7QUFDQTtBQUNBLGdEQUFnRCxLQUFLO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLE1BQU0sNEJBQTRCLEtBQUs7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQSwrQ0FBK0M7QUFDL0M7QUFDQSxpREFBaUQsS0FBSztBQUN0RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FB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OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7O0FBRUEsNkJBQTZCLG1CQUFtQjs7QUFFaEQ7O0FBRUE7O0FBRUE7QUFDQTs7Ozs7Ozs7QUNoV0E7QUFBQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7QUNYQTtBQUNB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QUFpQyxzQkFBc0IsR0FBRzs7QUFFMUQ7Ozs7Ozs7Ozs7O0FDUEE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsMEJBQTBCO0FBQ2xGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrRzs7Ozs7O0FDcERBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLEVBQUU7QUFDNUMsQzs7Ozs7O0FDekJBO0FBQ0E7OztBQUdBO0FBQ0EsZ0NBQWlDLDJCQUEyQixHQUFHLG1CQUFtQiwwQkFBMEIsdUJBQXVCLGlCQUFpQixtQkFBbUIsZ0JBQWdCLEdBQUcscUJBQXFCLHdCQUF3Qiw0QkFBNEIsMEJBQTBCLEdBQUc7O0FBRWhTIiwiZmlsZSI6ImFwcC5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA0KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAwZDg5ZjdiZDNmNTcyZjUxZjk3ZCIsImltcG9ydCB7cmV0cmlldmVTaW5nbGVSZWNBcmVhfSBmcm9tICcuLi9yZWNyZWF0aW9uL3JlY0FyZWFEZXRhaWxzJztcbmltcG9ydCB7cmVjQXBpUXVlcnksIGludGVyZXN0TGlzdH0gZnJvbSAnLi4vcmVjcmVhdGlvbi9jb25zdGFudHMnO1xuXG5jbGFzcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKGV2ZW50c0Fycil7XG4gICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHMgPSB7fTtcbiAgICAgIGV2ZW50c0Fyci5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgLy90aGlzIGFycmF5IHdpbGwgY29udGFpbiBjYWxsYmFjayBmdW5jdGlvbnNcbiAgICAgICAgIGV2ZW50c1tlXSA9IFtdO1xuICAgICAgfSk7XG4gICB9XG5cbiAgIC8vc2V0IGV2ZW50IGxpc3RlbmVyXG4gICBvbihldmVudCwgY2FsbGJhY2spe1xuICAgICAgaWYodGhpcy5ldmVudHNbZXZlbnRdID09IHVuZGVmaW5lZCl7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtldmVudH1cIiBldmVudCBkb2VzIG5vdCBleGlzdCBvbiAke3RoaXN9YClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IHRvIFwiJHt0aGlzfS5vbigpXCIgbXVzdCBiZSBhIGZ1bmN0aW9uLmApXG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgfVxuXG4gICAvL3RyaWdnZXIgZXZlbnQgbGlzdGVuZXJzIGZvciBnaXZlbiBldmVudFxuICAgZW1pdChldmVudCl7XG4gICAgICBpZih0aGlzLmV2ZW50c1tldmVudF0gPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke2V2ZW50fVwiIGV2ZW50IGRvZXMgbm90IGV4aXN0IG9uICR7dGhpc31gKVxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIGxldCBjYWxsYmFja3MgPSB0aGlzLmV2ZW50c1tldmVudF07XG4gICAgICAgICBsZXQgZSA9IHRoaXMubWFrZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgIC8vZXhlY3V0ZSBhbGwgY2FsbGJhY2tzXG4gICAgICAgICBjYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGMoZSk7XG4gICAgICAgICB9KVxuICAgICAgfVxuICAgfVxuXG4gICAvL3Byb3ZpZGVzIGV2ZW50IG9iamVjdCBmb3IgZXZlbnQgbGlzdGVuZXJzOyBzaG91bGQgYmUgb3ZlcndyaXR0ZW4gYnkgaW5oZXJpdG9yXG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIGNvbnNvbGUud2FybihgTm8gbWFrZUV2ZW50IG1ldGhvZCBzZXQgb24gJHt0aGlzfWApO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuICAgSW50ZXJlc3RzICAgIFxuXFwqKioqKioqKioqKioqL1xuY2xhc3MgSW50ZXJlc3QgZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIGNvbnN0cnVjdG9yKGludGVyZXN0KXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5uYW1lID0gaW50ZXJlc3QuQWN0aXZpdHlOYW1lO1xuICAgICAgdGhpcy5pZCA9IGludGVyZXN0LkFjdGl2aXR5SUQ7XG4gICAgICB0aGlzLmljb25JZCA9IGludGVyZXN0LkVtb2ppXG5cbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5tYWtlRXZlbnQgPSB0aGlzLm1ha2VFdmVudC5iaW5kKHRoaXMpO1xuICAgfVxuICAgLy90b2dnbGVzIHNlbGVjdGVkIHByb3BlcnR5XG4gICB0b2dnbGUoKXtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSAhdGhpcy5zZWxlY3RlZDtcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuIFwiSW50ZXJlc3RcIjtcbiAgIH1cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHRoaXMuc2VsZWN0ZWR9O1xuICAgfVxufVxuXG5jbGFzcyBJbnRlcmVzdHMgZXh0ZW5kcyBFdmVudE9iamVjdHtcbiAgIC8vbGlzdCBpcyBsaXN0IG9mIGludGVyZXN0cywgdG8gYmUgcHJvdmlkZWQgYnkgcmVjcmVhdGlvbiBtb2R1bGUgXG4gICBjb25zdHJ1Y3RvcihsaXN0KXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5hbGwgPSBsaXN0Lm1hcChmdW5jdGlvbihpKXtcbiAgICAgICAgIGxldCBpbnRlcmVzdCA9IG5ldyBJbnRlcmVzdChpKTtcbiAgICAgICAgIGludGVyZXN0Lm9uKCdjaGFuZ2UnLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnY2hhbmdlJykpO1xuICAgICAgICAgcmV0dXJuIGludGVyZXN0O1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgdGhpcy5tYWtlRXZlbnQgPSB0aGlzLm1ha2VFdmVudC5iaW5kKHRoaXMpO1xuICAgfVxuICAgZ2V0IHNlbGVjdGVkKCl7XG4gICAgICByZXR1cm4gdGhpcy5hbGwuZmlsdGVyKGZ1bmN0aW9uKGkpe1xuICAgICAgICAgcmV0dXJuIGkuc2VsZWN0ZWQ7XG4gICAgICB9KTtcbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gXCJzdGF0ZS5pbnRlcmVzdHNcIjtcbiAgIH1cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgIHZhbDoge1xuICAgICAgICAgICAgYWxsOiB0aGlzLmFsbCxcbiAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkXG4gICAgICAgICB9XG4gICAgICB9O1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuICAgICBSb3V0ZSAgICBcblxcKioqKioqKioqKioqKi9cbmNsYXNzIExvY2F0aW9ue1xuICAgY29uc3RydWN0b3Iob2JqZWN0KXtcbiAgICAgIGlmKCBvYmplY3QgaW5zdGFuY2VvZiBSZWNBcmVhKXtcbiAgICAgICAgICB0aGlzLnR5cGUgPSAncmVjYXJlYSc7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKG9iamVjdC5oYXNPd25Qcm9wZXJ0eSgncGxhY2VfaWQnKSl7XG4gICAgICAgICAvL2dvb2dsZSBwbGFjZXMgcGxhY2UuLi4gc29tZWhvdyB0ZXN0IGZvciBnb29nbGUgcGxhY2UgYW5kIFxuICAgICAgICAgLy90aHJvdyBlcnJvciBpZiBuZWl0aGVyIFxuICAgICAgICAgdGhpcy50eXBlID0gJ3BsYWNlJztcbiAgICAgIH1cbiAgICAgIC8vbWF5YmUgcmVtb3ZlIGFmdGVyIGRldlxuICAgICAgZWxzZXtcbiAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvdmlkZWQgbG9jYXRpb24gaXMgbm90IGEgUGxhY2VSZXN1bHQgb3IgUmVjQXJlYScpO1xuICAgICAgfVxuICAgICAgdGhpcy5kYXRhID0gb2JqZWN0O1xuICAgfVxufVxuXG5jbGFzcyBSb3V0ZSBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoKXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5wYXRoID0gW107XG4gICB9XG4gICBnZXQgbG9jYXRpb25Db3VudCgpe1xuICAgICAgcmV0dXJuIHRoaXMucGF0aC5sZW5ndGg7XG4gICB9XG5cbiAgIGdldCBvcmlnaW4oKXtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhbMF0gfHwgbnVsbDtcbiAgIH1cbiAgIGdldCB3YXlwb2ludHMoKXtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPCAzKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHJldHVybiB0aGlzLnBhdGguc2xpY2UoMSwgdGhpcy5sb2NhdGlvbkNvdW50IC0gMSk7XG4gICAgICB9XG4gICB9XG4gICBnZXQgZGVzdGluYXRpb24oKXtcbiAgICAgIGlmKCB0aGlzLmxvY2F0aW9uQ291bnQgPCAyKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgIHJldHVybiB0aGlzLnBhdGhbdGhpcy5sb2NhdGlvbkNvdW50IC0gMV07XG4gICAgICB9XG4gICB9XG5cbiAgIGFkZChsb2NhdGlvbil7XG4gICAgICBpZiAoIShsb2NhdGlvbiBpbnN0YW5jZW9mIExvY2F0aW9uKSl7XG4gICAgICAgICBsb2NhdGlvbiA9IG5ldyBMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnBhdGgucHVzaChsb2NhdGlvbik7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuICAgaW5zZXJ0KGxvY2F0aW9uLCBpbmRleCl7XG4gICAgICBpZiAoIShsb2NhdGlvbiBpbnN0YW5jZW9mIExvY2F0aW9uKSl7XG4gICAgICAgICBsb2NhdGlvbiA9IG5ldyBMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnBhdGguc3BsaWNlKGluZGV4LCAwLCBsb2NhdGlvbik7XG4gICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgfVxuICAgcmVtb3ZlKGluZGV4KXtcbiAgICAgIHRoaXMucGF0aC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIGludmVydCgpe1xuICAgICAgaWYoIHRoaXMubG9jYXRpb25Db3VudCAhPT0gMil7XG4gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnQ2FuIG9ubHkgaW52ZXJ0IHJvdXRlIGlmIHJvdXRlLnBhdGggY29udGFpbnMgZXhhY3RseSB0d28gbG9jYXRpb25zJ1xuICAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgICB0aGlzLnBhdGgucHVzaCh0aGlzLnBhdGguc2hpZnQoKSk7XG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgfVxuICAgfVxuXG4gICBhZGRSZWNBcmVhKGFyZWEpe1xuICAgICAgO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIHJlbW92ZVJlY0FyZWEoaWQpe1xuICAgICAgO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cblxuICAgLy93aWxsIFwiaGlnaGxpZ2h0XCIgbG9jYXRpb24gYXQgZ2l2ZW4gaW5kZXggb2YgcGF0aCBvbiB0aGUgbWFwXG4gICBoaWdobGlnaHQoaW5kZXgpe1xuICAgICAgO1xuICAgfVxuXG4gICBtYWtlRXZlbnQoKXtcbiAgICAgIHJldHVybiB7dmFsOiB0aGlzLnBhdGh9XG4gICB9XG5cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gJ3N0YXRlLnJvdXRlJztcbiAgIH1cbn1cblxuLyoqKioqKioqKioqKipcXCAgICBcbiAgICAgIE1hcCAgICBcblxcKioqKioqKioqKioqKi9cbmNsYXNzIE1hcHtcbiAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICA7XG4gICB9XG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZS5tYXAnO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKipcXCAgICBcbiAgIFJlY3JlYXRpb24gICAgXG5cXCoqKioqKioqKioqKioqL1xuY29uc3QgcmVxdWlyZWRQcm9wcyA9IFtcbiAgICdSZWNBcmVhTmFtZScsXG4gICAnUkVDQVJFQUFERFJFU1MnLFxuICAgJ0ZBQ0lMSVRZJyxcbiAgICdPcmdSZWNBcmVhSUQnLFxuICAgJ0dFT0pTT04nLFxuICAgJ0xhc3RVcGRhdGVkRGF0ZScsXG4gICAnRVZFTlQnLFxuICAgJ09SR0FOSVpBVElPTicsXG4gICAnUmVjQXJlYUVtYWlsJyxcbiAgICdSZWNBcmVhUmVzZXJ2YXRpb25VUkwnLFxuICAgJ1JlY0FyZWFMb25naXR1ZGUnLFxuICAgJ1JlY0FyZWFJRCcsXG4gICAnUmVjQXJlYVBob25lJyxcbiAgICdNRURJQScsXG4gICAnTElOSycsXG4gICAnUmVjQXJlYURlc2NyaXB0aW9uJyxcbiAgICdSZWNBcmVhTWFwVVJMJyxcbiAgICdSZWNBcmVhTGF0aXR1ZGUnLFxuICAgJ1N0YXlMaW1pdCcsXG4gICAnUmVjQXJlYUZlZURlc2NyaXB0aW9uJyxcbiAgICdSZWNBcmVhRGlyZWN0aW9ucycsXG4gICAnS2V5d29yZHMnLFxuICAgJ0FDVElWSVRZJ1xuXTtcblxuY2xhc3MgUmVjQXJlYSBleHRlbmRzIEV2ZW50T2JqZWN0e1xuICAgY29uc3RydWN0b3IoYXJlYSl7XG4gICAgICBzdXBlcihbJ2Jvb2ttYXJrZWQnLCAnaW5yb3V0ZSddKTtcbiAgICAgIHRoaXMuaWQgPSBhcmVhLlJlY0FyZWFJRDtcbiAgICAgIHRoaXMuYWN0aXZpdGllcyA9IGFyZWEuQUNUSVZJVFkubWFwKGZ1bmN0aW9uKGEpeyBcbiAgICAgICAgIHJldHVybiBhLkFjdGl2aXR5SUQ7IFxuICAgICAgfSk7XG4gICAgICByZXF1aXJlZFByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcCl7XG4gICAgICAgICB0aGlzW3Byb3BdID0gYXJlYVtwcm9wXTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHRoaXMuYm9va21hcmtlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pblJvdXRlID0gZmFsc2U7XG4gICAgICB0aGlzLmZvY3VzZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5zaG93RGV0YWlscyA9IHRoaXMuc2hvd0RldGFpbHMuYmluZCh0aGlzKTtcbiAgIH1cbiAgIHNob3dEZXRhaWxzKCl7XG4gICAgICByZXRyaWV2ZVNpbmdsZVJlY0FyZWEodGhpcyk7Ly9uZWVkIGZyb20gZWxpemFiZXRoOyB1c2UgaW1wb3J0IGFuZCBleHBvcnQgXG4gICB9XG5cbiAgIC8vV0FSTklORzogc2hvdWxkIG9ubHkgc2V0IG9uZSBldmVudCBsaXN0ZW5lciBwZXIgUmVjQXJlYVxuICAgLy90aGF0IHVwZGF0ZXMgYWxsIG9mIGEgY2VydGFpbiBlbGVtZW50IHdpdGggZGF0YSBtYXRjaGluZ1xuICAgLy90aGUgUmVjQXJlYSB0byBhdm9pZCBtZW1vcnkgbGVha3MgYW5kIGlzc3VlcyB3aXRoIHJlbW92ZWQgZWxlbWVudHMgXG4gICBzZXRCb29rbWFya2VkKC8qYm9vbGVhbiovIHZhbHVlKXtcbiAgICAgIHRoaXMuYm9va21hcmtlZCA9IHZhbHVlO1xuICAgICAgdGhpcy5lbWl0KCdib29rbWFya2VkJyk7XG4gICB9XG4gICBzZXRJblJvdXRlKC8qYm9vbGVhbiovIHZhbHVlKXtcbiAgICAgIHRoaXMuaW5Sb3V0ZSA9IHZhbHVlO1xuICAgICAgdGhpcy5lbWl0KCdpbnJvdXRlJyk7XG4gICB9XG4vL3NldEZvY3VzID4gY2hhbmdlXG5cbiAgIG1ha2VFdmVudChldmVudCl7XG4gICAgICBjb25zb2xlLndhcm4oZXZlbnQpO1xuICAgfVxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnUmVjQXJlYSc7XG4gICB9XG59XG5cbmNsYXNzIFJlY0FyZWFDb2xsZWN0aW9uIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3RvcihuYW1lKXtcbiAgICAgIHN1cGVyKFsnY2hhbmdlJ10pO1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgICAgLy9hcnJheSBvZiBcIlJlY0FyZWFcInMgXG4gICAgICB0aGlzLlJFQ0RBVEEgPSBbXTtcblxuICAgICAgLy9oYXNoIG1hcCBsaWtlIHN0b3JhZ2Ugb2Ygd2hpY2ggcmVjIGFyZWFzIGFyZSBjdXJyZW50bHkgXG4gICAgICAvL2luIHRoaXMgY29sbGVjdGlvbiAoYnkgaWQpXG4gICAgICB0aGlzLmlkTWFwID0ge307XG4gICB9XG5cbiAgIGFkZERhdGEocmVjZGF0YSl7XG4gICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG4gICAgICBpZiggIShyZWNkYXRhIGluc3RhbmNlb2YgQXJyYXkpKXtcbiAgICAgICAgIHJlY2RhdGEgPSBbcmVjZGF0YV07XG4gICAgICB9XG4gICAgICByZWNkYXRhLmZvckVhY2goZnVuY3Rpb24oYXJlYSl7XG4gICAgICAgICBpZighdGhpcy5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5SRUNEQVRBLnB1c2goYXJlYSk7XG4gICAgICAgICAgICB0aGlzLmlkTWFwW2FyZWEuaWRdID0gdHJ1ZTtcbiAgICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICBpZihjaGFuZ2Upe1xuICAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgIH1cbiAgIHNldERhdGEocmVjZGF0YSl7XG4gICAgICB0aGlzLmlkTWFwID0ge307XG4gICAgICB0aGlzLlJFQ0RBVEEgPSBbXTtcbiAgICAgIGlmKCAhKHJlY2RhdGEgaW5zdGFuY2VvZiBBcnJheSkpe1xuICAgICAgICAgcmVjZGF0YSA9IFtyZWNkYXRhXTtcbiAgICAgIH1cbiAgICAgIHJlY2RhdGEuZm9yRWFjaChmdW5jdGlvbihhcmVhKXtcbiAgICAgICAgIHRoaXMuUkVDREFUQS5wdXNoKGFyZWEpO1xuICAgICAgICAgdGhpcy5pZE1hcFthcmVhLmlkXSA9IHRydWU7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbiAgIH1cbiAgIC8vY2hhbmdlIHRvIGFsbG93IGFuIGFycmF5IG9yIHNvbWV0aGluZz9cbiAgIHJlbW92ZShhcmVhKXtcbiAgICAgIGlmKHRoaXMuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgdGhpcy5SRUNEQVRBLnNwbGljZSh0aGlzLlJFQ0RBVEEuaW5kZXhPZihhcmVhKSwgMSk7XG4gICAgICAgICBkZWxldGUgdGhpcy5pZE1hcFthcmVhLmlkXTtcbiAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB9XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHRoaXMuUkVDREFUQX1cbiAgIH1cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gYHN0YXRlLnJlY3JlYXRpb24uJHt0aGlzLm5hbWV9YDtcbiAgIH1cbn1cblxuY2xhc3MgUmVjU3RhdHVzIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgc3VwZXIoWydjaGFuZ2UnLCAncGVyY2VudCddKTtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5wZXJjZW50TG9hZGVkID0gMTAwO1xuICAgICAgdGhpcy5zaG91bGRMb2FkID0gZmFsc2U7XG4gICAgICB0aGlzLmNhbkxvYWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZmlyc3RMb2FkID0gdHJ1ZTtcblxuICAgICAgdGhpcy5sb2FkZWRBY3Rpdml0aWVzID0ge307XG4gICAgICB0aGlzLmZpbHRlcmVkQWN0aXZpdGllcyA9IHt9O1xuICAgICAgLy9pZiB0aGUgcm91dGUgY2hhbmdlcywgdGhpcyBzaG91bGQgYmUgdHJ1ZS5cbiAgICAgIHRoaXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzID0gZmFsc2U7XG4gICB9XG4gICB1cGRhdGUoe2xvYWRpbmcsIHBlcmNlbnRMb2FkZWQsIHNob3VsZExvYWQsIGNhbkxvYWQsIGZpcnN0TG9hZH0gPSB7fSl7XG4gICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG4gICAgICBpZihsb2FkaW5nICE9PSB1bmRlZmluZWQgJiYgbG9hZGluZyAhPT0gdGhpcy5sb2FkaW5nKXtcbiAgICAgICAgIHRoaXMubG9hZGluZyA9IGxvYWRpbmc7XG4gICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYoc2hvdWxkTG9hZCAhPT0gdW5kZWZpbmVkICYmIHNob3VsZExvYWQgIT09IHRoaXMuc2hvdWxkTG9hZCl7XG4gICAgICAgICB0aGlzLnNob3VsZExvYWQgPSBzaG91bGRMb2FkO1xuICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKGNhbkxvYWQgIT09IHVuZGVmaW5lZCAmJiBjYW5Mb2FkICE9PSB0aGlzLmNhbkxvYWQpe1xuICAgICAgICAgdGhpcy5jYW5Mb2FkID0gY2FuTG9hZDtcbiAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZihmaXJzdExvYWQgIT09IHVuZGVmaW5lZCAmJiBmaXJzdExvYWQgIT09IHRoaXMuZmlyc3RMb2FkKXtcbiAgICAgICAgIHRoaXMuZmlyc3RMb2FkID0gZmlyc3RMb2FkO1xuICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmKGNoYW5nZSl7XG4gICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgfVxuICAgICAgaWYocGVyY2VudExvYWRlZCAhPT0gdW5kZWZpbmVkICYmIHBlcmNlbnRMb2FkZWQgIT09IHRoaXMucGVyY2VudExvYWRlZCl7XG4gICAgICAgICB0aGlzLnBlcmNlbnRMb2FkZWQgPSBwZXJjZW50TG9hZGVkO1xuICAgICAgICAgdGhpcy5lbWl0KCdwZXJjZW50Jyk7XG4gICAgICB9XG4gICB9XG5cbiAgIG1ha2VFdmVudCgpe1xuICAgICAgcmV0dXJuIHt2YWw6IHtcbiAgICAgICAgIGxvYWRpbmc6IHRoaXMubG9hZGluZyxcbiAgICAgICAgIHBlcmNlbnRMb2FkZWQ6IHRoaXMucGVyY2VudExvYWRlZCxcbiAgICAgICAgIHNob3VsZExvYWQ6IHRoaXMuc2hvdWxkTG9hZCxcbiAgICAgICAgIGZpcnN0TG9hZDogdGhpcy5maXJzdExvYWQsXG4gICAgICAgICBjYW5Mb2FkOiB0aGlzLmNhbkxvYWRcbiAgICAgIH19O1xuICAgfVxuXG4gICB0b1N0cmluZygpe1xuICAgICAgcmV0dXJuICdzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cyc7XG4gICB9XG59XG5cbmNsYXNzIFJlY3JlYXRpb257XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgdGhpcy5hbGwgPSBuZXcgUmVjQXJlYUNvbGxlY3Rpb24oJ2FsbCcpO1xuICAgICAgdGhpcy5maWx0ZXJlZCA9IG5ldyBSZWNBcmVhQ29sbGVjdGlvbignZmlsdGVyZWQnKTtcbiAgICAgIHRoaXMuYm9va21hcmtlZCA9IG5ldyBSZWNBcmVhQ29sbGVjdGlvbignYm9va21hcmtlZCcpO1xuICAgICAgdGhpcy5pblJvdXRlID0gbmV3IFJlY0FyZWFDb2xsZWN0aW9uKCdpblJvdXRlJyk7XG5cbiAgICAgIHRoaXMuYXBpQ2FsbCA9IHJlY0FwaVF1ZXJ5O1xuXG4gICAgICB0aGlzLnN0YXR1cyA9IG5ldyBSZWNTdGF0dXM7XG4gICAgICB0aGlzLnNlYXJjaCA9IHRoaXMuc2VhcmNoLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLmZpbHRlckFsbCA9IHRoaXMuZmlsdGVyQWxsLmJpbmQodGhpcyk7XG4gICB9XG4gICBhZGRSZWNBcmVhcyhyZWNkYXRhKXtcbiAgICAgIHZhciBkYXRhID0gcmVjZGF0YS5yZWR1Y2UoZnVuY3Rpb24oYXJyLCBhcmVhKXtcbiAgICAgICAgIGxldCB0ZW1wID0gW107XG4gICAgICAgICBpZiggIXRoaXMuYWxsLmlkTWFwW2FyZWEuUmVjQXJlYUlEXSApe1xuICAgICAgICAgICAgdGVtcC5wdXNoKG5ldyBSZWNBcmVhKGFyZWEpKTtcbiAgICAgICAgIH1cbiAgICAgICAgIHJldHVybiBhcnIuY29uY2F0KHRlbXApO1xuICAgICAgfS5iaW5kKHRoaXMpLCBbXSk7XG4gICAgICB0aGlzLmFsbC5hZGREYXRhKGRhdGEpO1xuICAgfVxuXG4gICBhZGRCb29rbWFyayhhcmVhKXtcbiAgICAgIGlmKCF0aGlzLmJvb2ttYXJrZWQuaWRNYXBbYXJlYS5pZF0pe1xuICAgICAgICAgYXJlYS5zZXRCb29rbWFya2VkKHRydWUpO1xuICAgICAgICAgdGhpcy5ib29rbWFya2VkLmFkZERhdGEoYXJlYSk7XG4gICAgICB9XG4gICB9XG4gICByZW1vdmVCb29rbWFyayhhcmVhKXtcbiAgICAgIGlmKHRoaXMuYm9va21hcmtlZC5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICBhcmVhLnNldEJvb2ttYXJrZWQoZmFsc2UpO1xuICAgICAgICAgdGhpcy5ib29rbWFya2VkLnJlbW92ZShhcmVhKTtcbiAgICAgIH1cbiAgIH1cbiAgIGFkZFRvUm91dGUoYXJlYSl7XG4gICAgICBpZighdGhpcy5pblJvdXRlLmlkTWFwW2FyZWEuaWRdKXtcbiAgICAgICAgIGFyZWEuc2V0SW5Sb3V0ZSh0cnVlKTtcbiAgICAgICAgIHRoaXMuaW5Sb3V0ZS5hZGREYXRhKGFyZWEpO1xuICAgICAgICAgLy9kbyBzdHVmZiB3aXRoIHJvdXRlIGhlcmVcbiAgICAgIH1cbiAgIH1cbiAgIHJlbW92ZUZyb21Sb3V0ZShhcmVhKXtcbiAgICAgIGlmKHRoaXMuaW5Sb3V0ZS5pZE1hcFthcmVhLmlkXSl7XG4gICAgICAgICBhcmVhLnNldEluUm91dGUoZmFsc2UpO1xuICAgICAgICAgdGhpcy5pblJvdXRlLnJlbW92ZShhcmVhKTtcbiAgICAgICAgIC8vZG8gc3R1ZmYgd2l0aCByb3V0ZSBoZXJlXG4gICAgICB9XG4gICB9XG5cbiAgIC8vc2VuZHMgYXBpIHJlcXVlc3QocykgXG4gICBzZWFyY2goKXtcbiAgICAgIHZhciByZXF1ZXN0Q291bnQgPSAwO1xuICAgICAgaWYodGhpcy5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzKXtcbiAgICAgICAgIHRoaXMuc3RhdHVzLmxvYWRlZEFjdGl2aXRpZXMgPSB7fTtcbiAgICAgICAgIHRoaXMuc3RhdHVzLnNob3VsZFJlc2V0TG9hZGVkQWN0aXZpdGllcyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGxvYWRlZCA9IHRoaXMuc3RhdHVzLmxvYWRlZEFjdGl2aXRpZXM7XG4gICAgICB2YXIgaW50ZXJlc3RzID0gc3RhdGUuaW50ZXJlc3RzLnNlbGVjdGVkLnJlZHVjZSgoaWRTdHJpbmcsIGludGVyZXN0KSA9PiB7XG4gICAgICAgICAvL2lmIHdlJ3ZlIGFscmVhZHkgbG9hZGVkIHJlY2FyZWFzIHdpdGggdGhpcyBhY3Rpdml0eSwgZG9uJ3QgYWRkIHRvIGFjdGl2aXRpZXNcbiAgICAgICAgIGlmKGxvYWRlZFtpbnRlcmVzdC5pZF0pe1xuICAgICAgICAgICAgcmV0dXJuIGlkU3RyaW5nO1xuICAgICAgICAgfVxuICAgICAgICAgLy9vdGhlcndpc2UsIHdlIHdpbGwgbG9hZCBpdCBhbmQga2VlcCB0cmFja1xuICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIGxvYWRlZFtpbnRlcmVzdC5pZF0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXMuZmlsdGVyZWRBY3Rpdml0aWVzW2ludGVyZXN0LmlkXSA9IHRydWU7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmKCBpZFN0cmluZy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gaWRTdHJpbmcgKyAnLCcgKyBpbnRlcmVzdC5pZDtcbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpZFN0cmluZyArIGludGVyZXN0LmlkO1xuICAgICAgfSwgJycpO1xuXG4gICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICB0aGlzLmFkZFJlY0FyZWFzKHJlc3BvbnNlLlJFQ0RBVEEpO1xuICAgICAgICAgcmVxdWVzdENvdW50IC09IDE7XG4gICAgICAgICBpZihyZXF1ZXN0Q291bnQgPT09IDAgKXtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzLnVwZGF0ZSh7bG9hZGluZzogZmFsc2V9KTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyQWxsKCk7XG4gICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgIC8vdGVtcG9yYXJ5Li4uIGV2ZW50dWFsbHkgY2hhbmdlIHRvIGFsb25nIHJvdXRlXG4gICAgICBzdGF0ZS5yb3V0ZS5wYXRoLmZvckVhY2goKGwpID0+IHtcbiAgICAgICAgIHJlcXVlc3RDb3VudCArPSAxO1xuICAgICAgICAgdGhpcy5hcGlDYWxsKFxuICAgICAgICAgICAgbC5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLFxuICAgICAgICAgICAgbC5kYXRhLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICAgICAgNTAsXG4gICAgICAgICAgICBpbnRlcmVzdHMsXG4gICAgICAgICAgICBjYWxsYmFja1xuICAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnN0YXR1cy51cGRhdGUoe3Nob3VsZExvYWQ6IGZhbHNlLCBsb2FkaW5nOiB0cnVlLCBmaXJzdExvYWQ6IGZhbHNlfSk7XG4gICB9XG5cbiAgIGZpbHRlckFsbCgpe1xuICAgICAgdGhpcy5maWx0ZXJlZC5zZXREYXRhKHRoaXMuYWxsLlJFQ0RBVEEuZmlsdGVyKChhcmVhKSA9PiB7XG4gICAgICAgICB2YXIgaGFzQWN0aXZpdHkgPSBmYWxzZTtcbiAgICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgYXJlYS5hY3Rpdml0aWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IGFyZWEuYWN0aXZpdGllc1tpXTtcbiAgICAgICAgICAgIGlmKHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLmZpbHRlcmVkQWN0aXZpdGllc1thY3Rpdml0eV0pe1xuICAgICAgICAgICAgICAgaGFzQWN0aXZpdHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICBpZighaGFzQWN0aXZpdHkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KSk7XG4gICB9XG5cbiAgIHRvU3RyaW5nKCl7XG4gICAgICByZXR1cm4gJ3N0YXRlLnJlY3JlYXRpb24nO1xuICAgfVxufVxuXG4vKioqKioqKioqKioqKlxcICAgIFxuIE92ZXJhbGwgU3RhdGVcblxcKioqKioqKioqKioqKi9cbmNsYXNzIFN0YXRlIGV4dGVuZHMgRXZlbnRPYmplY3R7XG4gICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgc3VwZXIoWydyZWFkeSddKTtcbiAgICAgIHRoaXMucmVjcmVhdGlvbiA9IG5ldyBSZWNyZWF0aW9uKCk7XG4gICAgICB0aGlzLnJvdXRlID0gbmV3IFJvdXRlKCk7XG4gICAgICB0aGlzLmludGVyZXN0cyA9IG5ldyBJbnRlcmVzdHMoaW50ZXJlc3RMaXN0KTtcbiAgIH1cbiAgIFxuICAgLy9yZWZhY3RvciB0aGlzLCB1c2UgZXhwb3J0IGFuZCBpbXBvcnQgZnJvbSBhIHNlcGFyYXRlIGZpbGUgKG5vdCByZWNyZWF0aW9uLmpzKVxuICAgLy8gc2V0SW50ZXJlc3RzKGxpc3Qpe1xuICAgLy8gICAgdGhpcy5pbnRlcmVzdHMgPSBuZXcgSW50ZXJlc3RzKGxpc3QpO1xuICAgLy8gfVxuICAgdG9TdHJpbmcoKXtcbiAgICAgIHJldHVybiAnc3RhdGUnO1xuICAgfVxuICAgbWFrZUV2ZW50KCl7XG4gICAgICByZXR1cm4ge3ZhbDogbnVsbH07XG4gICB9XG59XG5cbmNvbnN0IHN0YXRlID0gbmV3IFN0YXRlO1xuXG4vKiBURU1QT1JBUlksIFJFTU9WRSBMQVRFUiAqL1xud2luZG93LnN0YXRlID0gc3RhdGU7XG5cbmV4cG9ydCBkZWZhdWx0IHN0YXRlO1xuXG5cbi8vU3RhdGUgRGlhZ3JhbVxuXG5cbi8vIHN0YXRlID0ge1xuLy8gICAgc2V0SW50ZXJlc3RzOiBmdW5jdGlvbigpe30sXG4vLyAgICBJTlRFUkVTVFM6IHtcbi8vICAgICAgIGFsbDogW3tcbi8vICAgICAgICAgIG5hbWU6ICdzdHJpbmcnLFxuLy8gICAgICAgICAgaWQ6ICdudW1iZXInLFxuLy8gICAgICAgICAgaWNvbklkOiAnc3RyaW5nJyxcbi8vICAgICAgICAgIHNlbGVjdGVkOiAnYm9vbGVhbicsXG4vLyAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCl7fSxcbi8vICAgICAgICAgIG9uOiBmdW5jdGlvbihldmVudFN0cmluZywgY2FsbGJhY2spe30sXG4vLyAgICAgICAgICBldmVudHM6IHtcbi8vICAgICAgICAgICAgIGNoYW5nZTogWyBmdW5jdGlvbihlKXt9LCBmdW5jdGlvbihlKXt9IF0sXG4vLyAgICAgICAgICB9LFxuLy8gICAgICAgICAgZW1pdDogZnVuY3Rpb24oZXZlbnRTdHJpbmcpOy8vIHRyaWdnZXIgZXZlbnQgbGlzdGVuZXJzIGZvciBnaXZlbiBldmVudFxuLy8gICAgICAgfSwgXG4vLyAgICAgICB7Li4ufSwgXG4vLyAgICAgICB7Li4ufV0sXG4vLyAgICAgICAvL3JldHVybnMgYW4gYXJyYXkgb2Ygb25seSBzZWxlY3RlZCBpbnRlcmVzdHMgKHVzZSBnZXR0ZXIpXG4vLyAgICAgICBzZWxlY3RlZDogW3suLi59LCB7Li4ufV0sXG4vLyAgICAgICBvbjogZnVuY3Rpb24oZXZlbnRTdHJpbmcsIGNhbGxiYWNrKXt9LFxuLy8gICAgICAgZXZlbnRzOiB7XG4vLyAgICAgICAgICBjaGFuZ2U6IFsgZnVuY3Rpb24oKXt9LCBmdW5jdGlvbigpe30gXSxcbi8vICAgICAgIH1cbi8vICAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nKTtcbi8vICAgICAgIC8vbWlnaHQgbmVlZCB0byBzdG9yZSBhY3Rpdml0eSBpZHMgd2UgYXJlIGluY2x1ZGluZyBcbi8vICAgIH0sXG4vLyAgICBST1VURToge1xuLy8gICAgICAgYWRkTG9jYXRpb246IGZ1bmN0aW9uKGxvY2F0aW9uLCBhZnRlcil7fSxcbi8vICAgICAgIGRlbGV0ZUxvY2F0aW9uOiBmdW5jdGlvbihsb2NhdGlvbil7fSwgLy9tYXliZSBsb2NhdGlvbi5kZWxldGUoKT8/XG4vLyAgICAgICBtb3ZlTG9jYXRpb246IGZ1bmN0aW9uKGxvY2F0aW9uLCBhZnRlciksIC8vbWF5YmUgbG9jYXRpb24ubW92ZSgpPz9cbi8vICAgICAgICwvL3BvdGVudGlhbGx5IGludmVydCBkaXJlY3Rpb25cbi8vICAgICAgICwvL3NldCBvcHRpb25zIChlLmcuIGF2b2lkLCBzZWFyY2ggcmFkaXVzLCB0cmFuc3BvcnQgdHlwZSlcbi8vICAgICAgICwvL3JvdXRlIGFycmF5ID4gaGFzIGV2ZW50c1xuLy8gICAgICAgLC8vIG9wdGlvbnMgb2JqZWN0ID4gaGFzIGV2ZW50cyBcbi8vICAgIH0sXG4vLyAgICBNQVA6IHtcbi8vICAgICAgICwvL1xuLy8gICAgfSxcbi8vICAgIFJFQ1JFQVRJT046IHtcbi8vICAgICAgIGFkZEJvb2ttYXJrPiBhZGRzIGJvb2ttYXJrIGFuZCBzZXRzIGl0cyBib29rbWFyayBwcm9wZXJ0eSBcbi8vICAgICAgIGFkZFRvUm91dGUgPiBzaW1pbGFyIHRvIGFib3ZlXG4vLyAgICAgICAsLy9maWx0ZXJlZFN1Z2dlc3Rpb25zID5oYXMgZXZlbnRzXG4vLyAgICAgICAsLy9ib29rbWFya3Ncbi8vICAgICAgICwvL2Jvb2ttYXJrIGZ1bmN0aW9uXG4vLyAgICAgICAsLy9pblJvdXRlXG4vLyAgICAgICAsLy9hZGQgdG8gcm91dGUgZnVuY3Rpb25cbi8vICAgICAgICwvL3N0YXR1c1xuLy8gICAgICAgLC8vc2V0TGVnL2xvY2F0aW9uIChBIHRvIEI7IGp1c3QgQTsgQiB0byBDPz8pXG4vLyAgICB9LFxuLy8gICAgb246IGZ1bmN0aW9uKGV2ZW50U3RyaW5nLCBjYWxsYmFjayl7fSxcbi8vICAgIGV2ZW50czoge1xuLy8gICAgICAgcmVhZHk6IFsgZnVuY3Rpb24oKXt9LCBmdW5jdGlvbigpe30gXSxcbi8vICAgIH1cbi8vICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nKSxcbi8vICAgIC8vKGNoZWNrcyBsb2NhbCBzdG9yYWdlIGFuZCB1cGRhdGVzIGRhdGEgYXBwcm9wcmlhdGVseSlcbi8vICAgIGluaXQ6IGZ1bmN0aW9uKCl7fSxcbi8vIH1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvc3RhdGUvc3RhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cblxudmFyIHN0eWxlc0luRG9tID0ge307XG5cbnZhclx0bWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbztcblxuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0eXBlb2YgbWVtbyA9PT0gXCJ1bmRlZmluZWRcIikgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIG1lbW87XG5cdH07XG59O1xuXG52YXIgaXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xuXHQvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuXHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcblx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuXHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG59KTtcblxudmFyIGdldEVsZW1lbnQgPSAoZnVuY3Rpb24gKGZuKSB7XG5cdHZhciBtZW1vID0ge307XG5cblx0cmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdFx0aWYgKHR5cGVvZiBtZW1vW3NlbGVjdG9yXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0bWVtb1tzZWxlY3Rvcl0gPSBmbi5jYWxsKHRoaXMsIHNlbGVjdG9yKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWVtb1tzZWxlY3Rvcl1cblx0fTtcbn0pKGZ1bmN0aW9uICh0YXJnZXQpIHtcblx0cmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KVxufSk7XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyXHRzaW5nbGV0b25Db3VudGVyID0gMDtcbnZhclx0c3R5bGVzSW5zZXJ0ZWRBdFRvcCA9IFtdO1xuXG52YXJcdGZpeFVybHMgPSByZXF1aXJlKFwiLi91cmxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcblx0aWYgKHR5cGVvZiBERUJVRyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBERUJVRykge1xuXHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdG9wdGlvbnMuYXR0cnMgPSB0eXBlb2Ygb3B0aW9ucy5hdHRycyA9PT0gXCJvYmplY3RcIiA/IG9wdGlvbnMuYXR0cnMgOiB7fTtcblxuXHQvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXHRpZiAoIW9wdGlvbnMuc2luZ2xldG9uKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuXHRpZiAoIW9wdGlvbnMuaW5zZXJ0SW50bykgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKCFvcHRpb25zLmluc2VydEF0KSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXG5cdGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZSAobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0XHRkb21TdHlsZS5yZWZzLS07XG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XG5cdFx0fVxuXG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSBkb21TdHlsZS5wYXJ0c1tqXSgpO1xuXG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20gKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzIChsaXN0LCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcblx0XHR2YXIgY3NzID0gaXRlbVsxXTtcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xuXHRcdHZhciBzb3VyY2VNYXAgPSBpdGVtWzNdO1xuXHRcdHZhciBwYXJ0ID0ge2NzczogY3NzLCBtZWRpYTogbWVkaWEsIHNvdXJjZU1hcDogc291cmNlTWFwfTtcblxuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKSBzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2UgbmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xuXHR9XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50IChvcHRpb25zLCBzdHlsZSkge1xuXHR2YXIgdGFyZ2V0ID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8pXG5cblx0aWYgKCF0YXJnZXQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydEludG8nIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcblx0fVxuXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlc0luc2VydGVkQXRUb3Bbc3R5bGVzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblxuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmICghbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIHRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYgKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdFx0fVxuXHRcdHN0eWxlc0luc2VydGVkQXRUb3AucHVzaChzdHlsZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xuXHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyICdpbnNlcnRBdCcuIE11c3QgYmUgJ3RvcCcgb3IgJ2JvdHRvbScuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudCAoc3R5bGUpIHtcblx0aWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblx0c3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG5cblx0dmFyIGlkeCA9IHN0eWxlc0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZSk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhZGRBdHRycyhzdHlsZSwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZSk7XG5cblx0cmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudCAob3B0aW9ucykge1xuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0b3B0aW9ucy5hdHRycy5yZWwgPSBcInN0eWxlc2hlZXRcIjtcblxuXHRhZGRBdHRycyhsaW5rLCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmspO1xuXG5cdHJldHVybiBsaW5rO1xufVxuXG5mdW5jdGlvbiBhZGRBdHRycyAoZWwsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlIChvYmosIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlLCB1cGRhdGUsIHJlbW92ZSwgcmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cblx0ICAgIGlmIChyZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSByZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cblx0XHRzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcblxuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG5cblx0fSBlbHNlIGlmIChcblx0XHRvYmouc291cmNlTWFwICYmXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5jcmVhdGVPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIlxuXHQpIHtcblx0XHRzdHlsZSA9IGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblxuXHRcdFx0aWYoc3R5bGUuaHJlZikgVVJMLnJldm9rZU9iamVjdFVSTChzdHlsZS5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblx0XHR9O1xuXHR9XG5cblx0dXBkYXRlKG9iaik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlIChuZXdPYmopIHtcblx0XHRpZiAobmV3T2JqKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG5ld09iai5jc3MgPT09IG9iai5jc3MgJiZcblx0XHRcdFx0bmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiZcblx0XHRcdFx0bmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcFxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXG5cdFx0cmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cdH07XG59KSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnIChzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG5cdHZhciBjc3MgPSByZW1vdmUgPyBcIlwiIDogb2JqLmNzcztcblxuXHRpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblxuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuXHRcdFx0c3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcgKHN0eWxlLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsIG1lZGlhKVxuXHR9XG5cblx0aWYoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZS5maXJzdENoaWxkKSB7XG5cdFx0XHRzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcblx0XHR9XG5cblx0XHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rIChsaW5rLCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qXG5cdFx0SWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdFx0YW5kIHRoZXJlIGlzIG5vIHB1YmxpY1BhdGggZGVmaW5lZCB0aGVuIGxldHMgdHVybiBjb252ZXJ0VG9BYnNvbHV0ZVVybHNcblx0XHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0XHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpIHtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZiAoc291cmNlTWFwKSB7XG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjY2MDM4NzVcblx0XHRjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSArIFwiICovXCI7XG5cdH1cblxuXHR2YXIgYmxvYiA9IG5ldyBCbG9iKFtjc3NdLCB7IHR5cGU6IFwidGV4dC9jc3NcIiB9KTtcblxuXHR2YXIgb2xkU3JjID0gbGluay5ocmVmO1xuXG5cdGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKSBVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBSZXRyaWV2ZSB0aGUgZGF0YSBmb3IgYSByZWNyZWF0aW9uIGFyZWEgYmFzZWQgb24gUmVjQXJlYUlEXG4qICBEaXNwbGF5IHRoZSBkYXRhIHRvIGEgbW9kYWwgb24gdGhlIHdlYiBwYWdlICovXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlU2luZ2xlUmVjQXJlYShyZWNhcmVhKSB7XG5cbiAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSB1c2luZyByZWNBcmVhSWRcbiAgICBjb25zb2xlLmxvZyhyZWNhcmVhKTtcblxuICAgIC8vIGRpc3BsYXkgdGhlIGRhdGEgaW4gYSBtb2RhbCBib3hcblxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL3JlY0FyZWFEZXRhaWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbic7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9yZWNyZWF0aW9uL2xvYWRCdXR0b24nO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cyc7XG5pbXBvcnQgJy4vY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0JztcbmltcG9ydCAnLi9jb21wb25lbnRzL21hcC9tYXAnO1xuaW1wb3J0ICcuL2NvbXBvbmVudHMvcm91dGUvcm91dGUnO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXBwLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9yZWNyZWF0aW9uLmNzcyc7XG5pbXBvcnQgc3RhdGUgZnJvbSAnLi4vc3RhdGUvc3RhdGUnO1xuaW1wb3J0ICcuL2Rpc3BsYXlSZWNBcmVhU3VnZ2VzdGlvbnMnO1xuaW1wb3J0ICcuL3JlY0FyZWFEZXRhaWxzJztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JlY3JlYXRpb24uY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JlY3JlYXRpb24uY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JlY3JlYXRpb24uY3NzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vcmVjcmVhdGlvbi5jc3Ncbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLnJlY3JlYXRpb257XFxuICAgYmFja2dyb3VuZDogcmVkO1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9yZWNyZWF0aW9uLmNzc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8qKlxuICogV2hlbiBzb3VyY2UgbWFwcyBhcmUgZW5hYmxlZCwgYHN0eWxlLWxvYWRlcmAgdXNlcyBhIGxpbmsgZWxlbWVudCB3aXRoIGEgZGF0YS11cmkgdG9cbiAqIGVtYmVkIHRoZSBjc3Mgb24gdGhlIHBhZ2UuIFRoaXMgYnJlYWtzIGFsbCByZWxhdGl2ZSB1cmxzIGJlY2F1c2Ugbm93IHRoZXkgYXJlIHJlbGF0aXZlIHRvIGFcbiAqIGJ1bmRsZSBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IHBhZ2UuXG4gKlxuICogT25lIHNvbHV0aW9uIGlzIHRvIG9ubHkgdXNlIGZ1bGwgdXJscywgYnV0IHRoYXQgbWF5IGJlIGltcG9zc2libGUuXG4gKlxuICogSW5zdGVhZCwgdGhpcyBmdW5jdGlvbiBcImZpeGVzXCIgdGhlIHJlbGF0aXZlIHVybHMgdG8gYmUgYWJzb2x1dGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHBhZ2UgbG9jYXRpb24uXG4gKlxuICogQSBydWRpbWVudGFyeSB0ZXN0IHN1aXRlIGlzIGxvY2F0ZWQgYXQgYHRlc3QvZml4VXJscy5qc2AgYW5kIGNhbiBiZSBydW4gdmlhIHRoZSBgbnBtIHRlc3RgIGNvbW1hbmQuXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcykge1xuICAvLyBnZXQgY3VycmVudCBsb2NhdGlvblxuICB2YXIgbG9jYXRpb24gPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5sb2NhdGlvbjtcblxuICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZml4VXJscyByZXF1aXJlcyB3aW5kb3cubG9jYXRpb25cIik7XG4gIH1cblxuXHQvLyBibGFuayBvciBudWxsP1xuXHRpZiAoIWNzcyB8fCB0eXBlb2YgY3NzICE9PSBcInN0cmluZ1wiKSB7XG5cdCAgcmV0dXJuIGNzcztcbiAgfVxuXG4gIHZhciBiYXNlVXJsID0gbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0O1xuICB2YXIgY3VycmVudERpciA9IGJhc2VVcmwgKyBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qJC8sIFwiL1wiKTtcblxuXHQvLyBjb252ZXJ0IGVhY2ggdXJsKC4uLilcblx0Lypcblx0VGhpcyByZWd1bGFyIGV4cHJlc3Npb24gaXMganVzdCBhIHdheSB0byByZWN1cnNpdmVseSBtYXRjaCBicmFja2V0cyB3aXRoaW5cblx0YSBzdHJpbmcuXG5cblx0IC91cmxcXHMqXFwoICA9IE1hdGNoIG9uIHRoZSB3b3JkIFwidXJsXCIgd2l0aCBhbnkgd2hpdGVzcGFjZSBhZnRlciBpdCBhbmQgdGhlbiBhIHBhcmVuc1xuXHQgICAoICA9IFN0YXJ0IGEgY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgKD86ICA9IFN0YXJ0IGEgbm9uLWNhcHR1cmluZyBncm91cFxuXHQgICAgICAgICBbXikoXSAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKD86ICA9IFN0YXJ0IGFub3RoZXIgbm9uLWNhcHR1cmluZyBncm91cHNcblx0ICAgICAgICAgICAgICAgICBbXikoXSsgID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgICAgIFteKShdKiAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICBcXCkgID0gTWF0Y2ggYSBlbmQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICkgID0gRW5kIEdyb3VwXG4gICAgICAgICAgICAgICpcXCkgPSBNYXRjaCBhbnl0aGluZyBhbmQgdGhlbiBhIGNsb3NlIHBhcmVuc1xuICAgICAgICAgICkgID0gQ2xvc2Ugbm9uLWNhcHR1cmluZyBncm91cFxuICAgICAgICAgICogID0gTWF0Y2ggYW55dGhpbmdcbiAgICAgICApICA9IENsb3NlIGNhcHR1cmluZyBncm91cFxuXHQgXFwpICA9IE1hdGNoIGEgY2xvc2UgcGFyZW5zXG5cblx0IC9naSAgPSBHZXQgYWxsIG1hdGNoZXMsIG5vdCB0aGUgZmlyc3QuICBCZSBjYXNlIGluc2Vuc2l0aXZlLlxuXHQgKi9cblx0dmFyIGZpeGVkQ3NzID0gY3NzLnJlcGxhY2UoL3VybFxccypcXCgoKD86W14pKF18XFwoKD86W14pKF0rfFxcKFteKShdKlxcKSkqXFwpKSopXFwpL2dpLCBmdW5jdGlvbihmdWxsTWF0Y2gsIG9yaWdVcmwpIHtcblx0XHQvLyBzdHJpcCBxdW90ZXMgKGlmIHRoZXkgZXhpc3QpXG5cdFx0dmFyIHVucXVvdGVkT3JpZ1VybCA9IG9yaWdVcmxcblx0XHRcdC50cmltKClcblx0XHRcdC5yZXBsYWNlKC9eXCIoLiopXCIkLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pXG5cdFx0XHQucmVwbGFjZSgvXicoLiopJyQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSk7XG5cblx0XHQvLyBhbHJlYWR5IGEgZnVsbCB1cmw/IG5vIGNoYW5nZVxuXHRcdGlmICgvXigjfGRhdGE6fGh0dHA6XFwvXFwvfGh0dHBzOlxcL1xcL3xmaWxlOlxcL1xcL1xcLykvaS50ZXN0KHVucXVvdGVkT3JpZ1VybCkpIHtcblx0XHQgIHJldHVybiBmdWxsTWF0Y2g7XG5cdFx0fVxuXG5cdFx0Ly8gY29udmVydCB0aGUgdXJsIHRvIGEgZnVsbCB1cmxcblx0XHR2YXIgbmV3VXJsO1xuXG5cdFx0aWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiLy9cIikgPT09IDApIHtcblx0XHQgIFx0Ly9UT0RPOiBzaG91bGQgd2UgYWRkIHByb3RvY29sP1xuXHRcdFx0bmV3VXJsID0gdW5xdW90ZWRPcmlnVXJsO1xuXHRcdH0gZWxzZSBpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byB0aGUgYmFzZSB1cmxcblx0XHRcdG5ld1VybCA9IGJhc2VVcmwgKyB1bnF1b3RlZE9yaWdVcmw7IC8vIGFscmVhZHkgc3RhcnRzIHdpdGggJy8nXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG5cdFx0XHRuZXdVcmwgPSBjdXJyZW50RGlyICsgdW5xdW90ZWRPcmlnVXJsLnJlcGxhY2UoL15cXC5cXC8vLCBcIlwiKTsgLy8gU3RyaXAgbGVhZGluZyAnLi8nXG5cdFx0fVxuXG5cdFx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCB1cmwoLi4uKVxuXHRcdHJldHVybiBcInVybChcIiArIEpTT04uc3RyaW5naWZ5KG5ld1VybCkgKyBcIilcIjtcblx0fSk7XG5cblx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCBjc3Ncblx0cmV0dXJuIGZpeGVkQ3NzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvdXJscy5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnQgdmFyIGludGVyZXN0TGlzdCA9IFtcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJCSUtJTkdcIixcbiAgICAgXCJBY3Rpdml0eUlEXCI6IDUsXG4gICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9LFxuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIkNMSU1CSU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiA3LFxuICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJDQU1QSU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiA5LFxuICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgIH0sXG4gICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIkhJS0lOR1wiLFxuICAgICAgXCJBY3Rpdml0eUlEXCI6IDE0LFxuICAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH0sXG4gICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiUElDTklDS0lOR1wiLFxuICAgICAgXCJBY3Rpdml0eUlEXCI6IDIwLFxuICAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgICB9LFxuICAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJSRUNSRUFUSU9OQUwgVkVISUNMRVNcIixcbiAgICAgIFwiQWN0aXZpdHlJRFwiOiAyMyxcbiAgICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICAgfSxcbiAgICAge1wiQWN0aXZpdHlOYW1lXCI6IFwiVklTSVRPUiBDRU5URVJcIixcbiAgICAgIFwiQWN0aXZpdHlJRFwiOiAyNCxcbiAgICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9LFxuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIlNXSU1NSU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiAxMDYsXG4gICAgIFwiRW1vamlcIjogXCJBXCJcbiAgICB9LFxuICAgIHtcIkFjdGl2aXR5TmFtZVwiOiBcIldJTERMSUZFIFZJRVdJTkdcIixcbiAgICAgXCJBY3Rpdml0eUlEXCI6IDI2LFxuICAgICBcIkVtb2ppXCI6IFwiQVwiXG4gICAgfSxcbiAgICB7XCJBY3Rpdml0eU5hbWVcIjogXCJIT1JTRUJBQ0sgUklESU5HXCIsXG4gICAgIFwiQWN0aXZpdHlJRFwiOiAxNSxcbiAgICAgXCJFbW9qaVwiOiBcIkFcIlxuICAgIH1cblxuXVxuXG5cbmV4cG9ydCBmdW5jdGlvbiByZWNBcGlRdWVyeShsYXRpdHVkZVZhbCxsb25naXR1ZGVWYWwscmFkaXVzVmFsLGFjdGl2aXR5VmFsLGNhbGxiYWNrKSB7XG5cbiAgICB2YXIgcmVjUXVlcnlVUkwgPSBcImh0dHBzOi8vcmlkYi5yZWNyZWF0aW9uLmdvdi9hcGkvdjEvcmVjYXJlYXMuanNvbj9hcGlrZXk9MkMxQjJBQzY5RTE5NDVERTgxNUI2OUJCQ0M5QzdCMTkmZnVsbCZsYXRpdHVkZT1cIlxuICAgICsgbGF0aXR1ZGVWYWwgKyBcIiZsb25naXR1ZGU9XCIgKyBsb25naXR1ZGVWYWwgKyBcIiZyYWRpdXM9XCIgKyByYWRpdXNWYWwgKyBcIiZhY3Rpdml0eT1cIiArIGFjdGl2aXR5VmFsO1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IHJlY1F1ZXJ5VVJMLFxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5kb25lKGNhbGxiYWNrKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcmVjcmVhdGlvbi9jb25zdGFudHMuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxuICAgIGZ1bmN0aW9uIGRpc3BsYXlSZWNBcmVhU3VtbWFyeShyZWNkYXRhLCBmaWx0ZXJlZFR5cGUpIHtcbiAgICAgICAgJChmaWx0ZXJlZFR5cGUpLmVtcHR5KCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPHJlY2RhdGEudmFsLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciByZWNSZXN1bHRzID0gSlNPTi5zdHJpbmdpZnkocmVjZGF0YSk7XG5cbiAgICAgICAgICAgIHZhciBzdWdEaXZDbGFzcyA9ICQoXCI8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uU3VtbWFyeSc+XCIpO1xuICAgICAgICAgICAgdmFyIHJlY0FyZWFOYW1lID0gcmVjZGF0YS52YWxbaV0uUmVjQXJlYU5hbWU7XG4gICAgICAgICAgICB2YXIgcmVjTmFtZVRleHQgPSAkKFwiPHA+XCIpLnRleHQocmVjQXJlYU5hbWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVjQXJlYVBob25lID0gcmVjZGF0YS52YWxbaV0uUmVjQXJlYVBob25lO1xuICAgICAgICAgICAgdmFyIHJlY1Bob25lVGV4dCA9ICQoXCI8cD5cIikudGV4dChyZWNBcmVhUGhvbmUpO1xuXG4gICAgICAgICAgICAvL0dldCBib3RoIHRoZSBUaXRsZSBhbmQgVVJMIHZhbHVlcyBhbmQgY3JlYXRlIGEgbGluayB0YWcgb3V0IG9mIHRoZW1cbiAgICAgICAgICAgIC8vIFdlJ3JlIG9ubHkgZ3JhYmJpbmcgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBMSU5LIGFycmF5XG4gICAgICAgICAgICB2YXIgcmVjQXJlYUxpbmtUaXRsZSA9IHJlY2RhdGEudmFsW2ldLkxJTktbMF0uVGl0bGU7XG4gICAgICAgICAgICB2YXIgcmVjQXJlYVVybCA9IHJlY2RhdGEudmFsW2ldLkxJTktbMF0uVVJMO1xuICAgICAgICAgICAgdmFyIHJlY0FyZWFMaW5rID0gJChcIjxhIC8+XCIsIHtcbiAgICAgICAgICAgICAgICBocmVmOiByZWNBcmVhVXJsLFxuICAgICAgICAgICAgICAgIHRleHQ6IHJlY0FyZWFMaW5rVGl0bGUsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wifSk7XG5cbiAgICAgICAgICAgIHZhciByZWNBcmVhTGlua1AgPSAkKFwiPHA+XCIpLmFwcGVuZChyZWNBcmVhTGluayk7XG4gICAgICAgICAgICBzdWdEaXZDbGFzcy5hcHBlbmQocmVjTmFtZVRleHQsIHJlY0FyZWFQaG9uZSwgcmVjQXJlYUxpbmtQKTtcblxuICAgICAgICAgICAgJChmaWx0ZXJlZFR5cGUpLmFwcGVuZChzdWdEaXZDbGFzcyk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuc3RhdGUucmVjcmVhdGlvbi5maWx0ZXJlZC5vbihcImNoYW5nZVwiLCAgZnVuY3Rpb24ocmVjZGF0YSl7XG5cbiAgICAgICAgdmFyIGZpbHRlcmVkVHlwZSA9IFwiI2ZpbHRlcmVkXCI7XG4gICAgICAgIGRpc3BsYXlSZWNBcmVhU3VtbWFyeShyZWNkYXRhLCBmaWx0ZXJlZFR5cGUpO1xufSk7XG5zdGF0ZS5yZWNyZWF0aW9uLmJvb2ttYXJrZWQub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24ocmVjZGF0YSl7XG5cbiAgICAgICAgdmFyIGZpbHRlcmVkVHlwZSA9IFwiI2Jvb2ttYXJrZWRcIjtcbiAgICAgICAgZGlzcGxheVJlY0FyZWFTdW1tYXJ5KHJlY2RhdGEsIGZpbHRlcmVkVHlwZSk7XG59KTtcbnN0YXRlLnJlY3JlYXRpb24uaW5Sb3V0ZS5vbihcImNoYW5nZVwiLCAgZnVuY3Rpb24ocmVjZGF0YSl7XG5cbiAgICAgICAgdmFyIGZpbHRlcmVkVHlwZSA9IFwiI2FkZGVkLXRvLXJvdXRlXCI7XG4gICAgICAgIGRpc3BsYXlSZWNBcmVhU3VtbWFyeShyZWNkYXRhLCBmaWx0ZXJlZFR5cGUpO1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jb21wb25lbnRzL3JlY3JlYXRpb24vZGlzcGxheVJlY0FyZWFTdWdnZXN0aW9ucy5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxuZnVuY3Rpb24gc2hvd0J1dHRvbihzdGF0dXMpIHtcbiAgIHZhciBjb250YWluZXIgPSAkKCcjYnV0dG9uLWNvbnRhaW5lcicpO1xuICAgdmFyIHRleHQ7XG4gICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cImJ0blwiPicpXG4gICAgICAudGV4dCgnRmluZCBSZWNyZWF0aW9uJylcbiAgICAgIC5jbGljayhzdGF0ZS5yZWNyZWF0aW9uLnNlYXJjaCk7XG5cbiAgIHZhciBub0ludGVyZXN0ID0gIXN0YXRlLmludGVyZXN0cy5zZWxlY3RlZC5sZW5ndGg7XG4gICB2YXIgbm9Mb2NhdGlvbiA9ICFzdGF0ZS5yb3V0ZS5sb2NhdGlvbkNvdW50O1xuICAgaWYoc3RhdHVzLnZhbC5maXJzdExvYWQgJiYgbm9JbnRlcmVzdCAmJiBub0xvY2F0aW9uKXtcbiAgICAgIHRleHQgPSAnU2VsZWN0IHNvbWUgaW50ZXJlc3RzIGFuZCBjaG9vc2UgYXQgbGVhc3Qgb25lIGxvY2F0aW9uIHRvIGdldCBzdGFydGVkJztcbiAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgfVxuICAgZWxzZSBpZihzdGF0dXMudmFsLmZpcnN0TG9hZCAmJiBub0ludGVyZXN0KXtcbiAgICAgIHRleHQgPSAnU2VsZWN0IGF0IGxlYXN0IG9uZSBpbnRlcmVzdCB0byBnZXQgc3RhcnRlZCc7XG4gICAgICBidG4uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgIH1cbiAgIGVsc2UgaWYoc3RhdHVzLnZhbC5maXJzdExvYWQgJiYgbm9Mb2NhdGlvbil7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBhdCBsZWFzdCBvbmUgbG9jYXRpb24gdG8gZ2V0IHN0YXJ0ZWQnO1xuICAgICAgYnRuLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICB9XG4gICBlbHNlIGlmKHN0YXR1cy52YWwuZmlyc3RMb2FkKXtcbiAgICAgIHRleHQgPSAnQ2xpY2sgdGhlIGJ1dHRvbiB0byBnZXQgc3RhcnRlZCdcbiAgIH1cbiAgIGVsc2UgaWYobm9JbnRlcmVzdCl7XG4gICAgICB0ZXh0ID0gJ1NlbGVjdCBhdCBsZWFzdCBvbmUgaW50ZXJlc3QgdG8gc2VhcmNoIGZvciByZWNyZWF0aW9uIGFyZWFzJztcbiAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgfVxuICAgZWxzZSBpZihub0xvY2F0aW9uKXtcbiAgICAgIHRleHQgPSAnU2VsZWN0IGF0IGxlYXN0IG9uZSBsb2NhdGlvbiB0byBzZWFyY2ggZm9yIHJlY3JlYXRpb24gYXJlYXMnO1xuICAgICAgYnRuLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICB9XG4gICBlbHNle1xuICAgICAgdGV4dCA9ICdOZXcgcmVjcmVhdGlvbiBhcmVhcyBtYXkgYmUgYXZhaWxhYmxlLidcbiAgIH1cblxuICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICBpZiggc3RhdHVzLnZhbC5zaG91bGRMb2FkIHx8IHN0YXR1cy52YWwuZmlyc3RMb2FkIHx8ICFzdGF0dXMudmFsLmNhbkxvYWQpe1xuICAgICAgY29udGFpbmVyLmFwcGVuZCgkKCc8cD4nKS50ZXh0KHRleHQpLCBidG4pO1xuICAgfVxuICAgZWxzZSBpZihzdGF0dXMudmFsLmxvYWRpbmcpe1xuICAgICAgdGV4dCA9ICdMb2FkaW5nIHJlY3JlYXRpb24gYXJlYXPigKYnXG4gICAgICBjb250YWluZXIuYXBwZW5kKCQoJzxwPicpLnRleHQodGV4dCksIFxuICAgICAgICAgYDxkaXYgY2xhc3M9XCJwcmVsb2FkZXItd3JhcHBlciBiaWcgYWN0aXZlXCI+XG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItbGF5ZXIgc3Bpbm5lci1ibHVlLW9ubHlcIj5cbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGUtY2xpcHBlciBsZWZ0XCI+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PjxkaXYgY2xhc3M9XCJnYXAtcGF0Y2hcIj5cbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgPC9kaXY+PGRpdiBjbGFzcz1cImNpcmNsZS1jbGlwcGVyIHJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICA8L2Rpdj5gKTtcbiAgIH1cbn1cblxuc3RhdGUuaW50ZXJlc3RzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKXtcbiAgIHZhciBsb2FkZWQgPSBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5sb2FkZWRBY3Rpdml0aWVzO1xuICAgdmFyIGZpbHRlcmVkID0gc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuZmlsdGVyZWRBY3Rpdml0aWVzO1xuICAgdmFyIHNob3VsZExvYWQgPSBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5zaG91bGRSZXNldExvYWRlZEFjdGl2aXRpZXM7XG4gICB2YXIgc2hvdWxkRmlsdGVyID0gZmFsc2U7XG4gICBlLnZhbC5hbGwuZm9yRWFjaCgoaW50ZXJlc3QpID0+IHtcbiAgICAgIGlmKCFsb2FkZWRbaW50ZXJlc3QuaWRdICYmIGludGVyZXN0LnNlbGVjdGVkKXtcbiAgICAgICAgIHNob3VsZExvYWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYobG9hZGVkW2ludGVyZXN0LmlkXSAmJiBpbnRlcmVzdC5zZWxlY3RlZCAhPT0gZmlsdGVyZWRbaW50ZXJlc3QuaWRdKXtcbiAgICAgICAgIHNob3VsZEZpbHRlciA9IHRydWU7XG4gICAgICAgICBmaWx0ZXJlZFtpbnRlcmVzdC5pZF0gPSBpbnRlcmVzdC5zZWxlY3RlZDtcbiAgICAgIH1cbiAgIH0pO1xuICAgdmFyIGNhbkxvYWQgPSAhIWUudmFsLnNlbGVjdGVkLmxlbmd0aCAmJiAhIXN0YXRlLnJvdXRlLmxvY2F0aW9uQ291bnQ7XG4gICBzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy51cGRhdGUoe3Nob3VsZExvYWQ6IHNob3VsZExvYWQsIGNhbkxvYWQ6IGNhbkxvYWR9KTtcbiAgIGlmKCBzaG91bGRGaWx0ZXIpe1xuICAgICAgc3RhdGUucmVjcmVhdGlvbi5maWx0ZXJBbGwoKTtcbiAgIH1cbn0pO1xuXG4vL21pZ2h0IGhhdmUgdG8gd2FpdCBmb3IgZGlyZWN0aW9ucyB0byBjb21lIGJhY2sgYW5kIGJlIHByb2Nlc3NlZC4uLlxuc3RhdGUucm91dGUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMuc2hvdWxkUmVzZXRMb2FkZWRBY3Rpdml0aWVzID0gdHJ1ZTtcbiAgIHZhciBzaG91bGRMb2FkID0gISFlLnZhbC5sZW5ndGg7XG4gICB2YXIgY2FuTG9hZCA9ICEhZS52YWwubGVuZ3RoICYmICEhc3RhdGUuaW50ZXJlc3RzLnNlbGVjdGVkLmxlbmd0aDtcbiAgIHN0YXRlLnJlY3JlYXRpb24uc3RhdHVzLnVwZGF0ZSh7c2hvdWxkTG9hZDogc2hvdWxkTG9hZCwgY2FuTG9hZDogY2FuTG9hZH0pO1xufSlcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4gc2hvd0J1dHRvbihzdGF0ZS5yZWNyZWF0aW9uLnN0YXR1cy5tYWtlRXZlbnQoKSkpO1xuc3RhdGUucmVjcmVhdGlvbi5zdGF0dXMub24oJ2NoYW5nZScsIHNob3dCdXR0b24pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yZWNyZWF0aW9uL2xvYWRCdXR0b24uanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9pbnRlcmVzdHMuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vaW50ZXJlc3RzLmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9pbnRlcmVzdHMuY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2ludGVyZXN0cy5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3Ncbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikodW5kZWZpbmVkKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5pbnRlcmVzdHN7XFxuICAgYmFja2dyb3VuZDogb3JhbmdlO1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvaW50ZXJlc3RzL2ludGVyZXN0cy5jc3Ncbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnLi9sYXlvdXQuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICQoJ3NlbGVjdCcpLm1hdGVyaWFsX3NlbGVjdCgpO1xuICAgIFxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmludGVyZXN0cy5hbGwubGVuZ3RoOyBpKyspIHtcblx0XHRsZXQgbmV3Q2hpcCA9ICQoJzxkaXYgY2xhc3M9XCJjaGlwXCI+PC9kaXY+Jyk7XG5cdFx0JChcIiNpbnRlcmVzdHNcIikuYXBwZW5kKG5ld0NoaXAudGV4dChzdGF0ZS5pbnRlcmVzdHMuYWxsW2ldLm5hbWUpKTtcblx0XHQkKG5ld0NoaXApLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0c3RhdGUuaW50ZXJlc3RzLmFsbFtpXS50b2dnbGUoKTtcblx0XHR9KTtcblx0c3RhdGUuaW50ZXJlc3RzLmFsbFtpXS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuXHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdGlmKGUudmFsKSB7XG5cdFx0XHRuZXdDaGlwLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XG5cdFx0XHQkKFwiI3NlbGVjdGVkLWludGVyZXN0c1wiKS5hcHBlbmQobmV3Q2hpcCk7XG5cdFx0fSBlbHNlIHtcblx0XHQgXHRuZXdDaGlwLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdCBcdCQoXCIjdW5zZWxlY3RlZC1pbnRlcmVzdHNcIikucHJlcGVuZChuZXdDaGlwKTtcblx0XHR9XG5cblx0fSk7XG5cdH1cbiAgfSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmpzXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9sYXlvdXQuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL2xheW91dC5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbGF5b3V0LmNzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmNzc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLnRlc3QtY2xhc3N7XFxuICAgYmFja2dyb3VuZDogbGltZTtcXG59XFxuXFxuLmxheW91dHtcXG4gICBiYWNrZ3JvdW5kOiByZWJlY2NhcHVycGxlO1xcbn1cXG4uc2VsZWN0ZWR7Y29sb3I6IGJsdWU7fVxcblxcbi5jaGlwIHtcXG5cXHRjdXJzb3I6IHBvaW50ZXI7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxufVwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvY29tcG9uZW50cy9sYXlvdXQvbGF5b3V0LmNzc1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICcuL21hcC5jc3MnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4uL3N0YXRlL3N0YXRlJztcblxuY29uc3QgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIHtcbiAgY2VudGVyOiB7bGF0OiAtMzQuMzk3LCBsbmc6IDE1MC42NDR9LFxuICB6b29tOiA1XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5qc1xuLy8gbW9kdWxlIGlkID0gMThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbWFwLmNzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9tYXAuY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL21hcC5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvbWFwL21hcC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikodW5kZWZpbmVkKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIlxcbiNtYXB7XFxuICAgbWluLWhlaWdodDogOTB2aDtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9jb21wb25lbnRzL21hcC9tYXAuY3NzXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJy4vcm91dGUuY3NzJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuLi9zdGF0ZS9zdGF0ZSc7XG5cbnZhciBzdG9wY291bnQgPSAwO1xuXG5uZXdJbnB1dEZpZWxkKCk7XG5cbnZhciBvcHRpb25zID0ge1xuICBjb21wb25lbnRSZXN0cmljdGlvbnM6IHtjb3VudHJ5OiAndXMnfVxufTtcblxuLy8gQXBwbGllZCBhdXRvZmlsbCBjb2RlIHRvIHRoZSBuZXcgaW5wdXQgZmllbGRzXG5mdW5jdGlvbiBhdXRvZmlsbChpbnB1dCl7XG5cdHZhciBhdXRvY29tcGxldGUgPSBuZXcgZ29vZ2xlLm1hcHMucGxhY2VzLkF1dG9jb21wbGV0ZShpbnB1dCwgb3B0aW9ucyk7XG5cdGF1dG9jb21wbGV0ZS5hZGRMaXN0ZW5lcigncGxhY2VfY2hhbmdlZCcsIGZ1bmN0aW9uICgpIHtnZXRBZGRyZXNzKGF1dG9jb21wbGV0ZSk7fSk7XG59XG5cbi8vIFJldHVybiB2YWx1ZXMgdG8gc3RhdGUgb2JqZWN0XG5mdW5jdGlvbiBnZXRBZGRyZXNzKGF1dG9jb21wbGV0ZSkge1xuXHR2YXIgcGxhY2UgPSBhdXRvY29tcGxldGUuZ2V0UGxhY2UoKTtcblx0c3RhdGUucm91dGUuYWRkKHBsYWNlKTtcblx0Y29uc29sZS5sb2cocGxhY2UuZ2VvbWV0cnkubG9jYXRpb24ubGF0KCkpO1xuXHRjb25zb2xlLmxvZyhwbGFjZS5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSk7XG5cdCQoXCIjZGVzdGluYXRpb25zXCIpLmFwcGVuZChcIjxkaXYgaWQ9J25ld2J1dHRvbnMnPlwiKTtcblx0JChcIiNuZXdidXR0b25zXCIpLmFwcGVuZChcIjxhIGNsYXNzPSdidG4tZmxvYXRpbmcgYnRuLXNtYWxsIHdhdmVzLWVmZmVjdCB3YXZlcy1saWdodCByZWQnIGlkPSdyb3V0ZS1hZGRCdG4nPjxpIGNsYXNzPSdtYXRlcmlhbC1pY29ucyc+YWRkPC9pPjwvYT5cIik7XG5cdCQoXCIjbmV3YnV0dG9uc1wiKS5hcHBlbmQoXCI8cCBpZD0ncm91dGUtbmV3TG9jYXRpb25UZXh0Jz5BZGQgYSBOZXcgU3RvcDwvcD5cIik7XG5cdCQoXCIjcm91dGUtYWRkQnRuXCIpLmNsaWNrKG5ld0lucHV0RmllbGQpO1xufVxuXG4vLyBHZXQgdGhlIEhUTUwgaW5wdXQgZWxlbWVudCBmb3IgdGhlIGF1dG9jb21wZWx0ZSBzZWFyY2ggYm94IGFuZCBjcmVhdGUgdGhlIGF1dG9jb21wbGV0ZSBvYmplY3Rcbi8vIFRyYW5zbGF0ZXMgYWRkcmVzcyB0byBsYXQvbG9uZyBjb29yZGluYXRlcyBmb3IgdXNpbmcgb24gdGhlIG1hcFxuZnVuY3Rpb24gbmV3SW5wdXRGaWVsZCgpIHtcblx0JChcIiNuZXdidXR0b25zXCIpLnJlbW92ZSgpO1x0XG5cdHZhciBpbnB1dGZpZWxkID0gJChcIjxpbnB1dD5cIik7XG5cdCQoXCIjZGVzdGluYXRpb25zXCIpLmFwcGVuZChpbnB1dGZpZWxkKTtcblx0aW5wdXRmaWVsZC5hZGRDbGFzcyhcImRlc3RpbmF0aW9uLWlucHV0XCIpO1xuXHRpbnB1dGZpZWxkLmF0dHIoXCJpZFwiLCBcInN0b3BudW1iZXJcIiArIHN0b3Bjb3VudCk7XG5cdGlmIChzdG9wY291bnQgPT0gMCkge1xuXHRcdGlucHV0ZmllbGQuYXR0cihcInBsYWNlaG9sZGVyXCIsIFwiU3RhcnRpbmcgTG9jYXRpb246IFwiKTtcblx0fVxuXHRlbHNlIHtcblx0XHRpbnB1dGZpZWxkLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBcIk5leHQgU3RvcDogXCIpO1xuXHR9XG5cdGF1dG9maWxsKGlucHV0ZmllbGRbMF0pO1xuXHRzdG9wY291bnQrKztcbn1cblxuLy8gY3JlYXRlIGV2ZW50IGxpc3RlbmVyIGZvciBwYXRoIGluIHN0YXRlIG9iamVjdC5cbi8vIHdoYXQgaXMgcGF0aD9cbi8vICAgIGFuIGFycmF5IG9mIGxvY2F0aW9uIG9iamVjdHNcbi8vIG5lZWQgdG8gZmlsbCBzdGF0ZSAtPiBwYXRoIHdpdGggdGhlIG5hbWUgYW5kIGFkZHJlc3Mgb2YgXG5cbi8vIGZvciByZXR1cm5pbmcgdXNlcnMgKHdoZXJlIHBhdGggaXMgZmlsbGVkKSwgcHJlLWZpbGwgcHJldmlvdXMgcm91dGUgb3B0aW9ucyB0byB0aGUgaW5wdXQgZmllbGRzXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vcm91dGUuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3JvdXRlLmNzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9yb3V0ZS5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvbXBvbmVudHMvcm91dGUvcm91dGUuY3NzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIucm91dGV7XFxuICAgYmFja2dyb3VuZDogbGlnaHRncmV5O1xcbn1cXG5cXG4jcm91dGUtYWRkQnRuIHtcXG5cXHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuXFx0bWFyZ2luLXJpZ2h0OiAxMHB4O1xcblxcdGhlaWdodDogMjVweDtcXG5cXHRwYWRkaW5nLXRvcDogMDtcXG5cXHR3aWR0aDogMjVweDtcXG59XFxuXFxuLmJ0bi1mbG9hdGluZyBpIHtcXG5cXHRsaW5lLWhlaWdodDogMjVweFxcbn1cXG5cXG4jcm91dGUtbmV3TG9jYXRpb25UZXh0IHtcXG5cXHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxufVwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvY29tcG9uZW50cy9yb3V0ZS9yb3V0ZS5jc3Ncbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=