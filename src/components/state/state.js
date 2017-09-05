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
      ;//need from elizabeth; use import and export 
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
      this.shouldLoad = true;
      this.firstLoad = true;
   }
   update({loading, percentLoaded, shouldLoad, firstLoad} = {}){
      let change = false;
      if(loading !== undefined){
         this.loading = loading;
         change = true;
      }
      if(shouldLoad !== undefined){
         this.shouldLoad = shouldLoad;
         change = true;
      }
      if(firstLoad !== undefined){
         this.firstLoad = firstLoad;
         change = true;
      }
      if(change){
         this.emit('change');
      }
      if(percentLoaded !== undefined){
         this.percentLoaded = percentLoaded;
         this.emit('percent');
      }
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

      this.apiCall = null;

      //temporary
      this.all.on('change', function(e){this.filtered.setData(e.val)}.bind(this));

      this.status = new RecStatus;
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

   search(){
      ;//sends api request(s) 
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
      this.interests = null;
      this.recreation = new Recreation();
      this.route = new Route();
   }
   
   //refactor this, use export and import from a separate file (not recreation.js)
   setInterests(list){
      this.interests = new Interests(list);
   }
   toString(){
      return 'state';
   }
   makeEvent(){
      return {val: null};
   }
}

const STATE = new State;

/* TEMPORARY, REMOVE LATER */
window.state = STATE;

export default STATE;


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

