import './loadedcircles';
import song from './finale.mp3';
import airhorn from './airhorn.mp3';
import './finale.css';

const ctx = new (AudioContext || webkitAudioContext)();
const audio = new Audio();
const source = ctx.createMediaElementSource(audio);


 var buffer = null;

 //if browser supports web audio, create a new audio context
 //and load the button tap sound 

  var request = new XMLHttpRequest();
  request.open('GET', airhorn, true);

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
   audio.src = song;
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
      if( false && newBrightness < brightness - 1){
         brightness = brightness - 1;
      }
      else{
         brightness = newBrightness;
      }
      if( false && newContrast < contrast - 1){
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
