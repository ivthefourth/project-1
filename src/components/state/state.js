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
         let e = this.makeEvent();
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
   constructor(){
      ;
   }
}

class Route{
   constructor(){
      ;
   }
   addLocation(){
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
   'RecAreaPhone',
   'LINK'
];

class RecArea extends EventObject{
   constructor(area){
      super(['change']);
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

   }
//togglebookmark> change
//toggleonroute> change
//setFocus > change
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
   removeData(recdata){
      if( !(recdata instanceof Array)){
         recdata = [recdata];
      }
      //only emit if data has changed... i.e., not all duplicates 
   }
   setData(recdata){
      this.idMap = {};
      if( !(recdata instanceof Array)){
         recdata = [recdata];
      }
      recdata.forEach(function(area){
         this.RECDATA.push(area);
         this.idMap[area.id] = true;
      }.bind(this));
      this.emit('change');
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
      this.addedToRoute = new RecAreaCollection('addedToRoute');

      //temporary
      this.all.on('change', function(e){this.filtered.setData(e.val)}.bind(this));

      this.status = new RecStatus;
   }
   addRecAreas(recdata){
      var data = recdata.reduce(function(arr, area){
         let temp = []
         if( !this.all.idMap[area.RecAreaID] ){
            temp.push(new RecArea(area));
         }
         return arr.concat(temp);
      }.bind(this), []);
      this.all.addData(data);
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
   }
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
//       ,//filteredSuggestions >has events
//       ,//bookmarks
//       ,//bookmark function
//       ,//inRoute
//       ,//add to route function
//       ,//initialLoad > has event
//       ,//refreshNeeded > has event.... should load more/has loaded???
//       ,//loadSuggestions / apiCall function (on button click)
//       ,//setAPIrequest < adds a function for a single api request 
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

