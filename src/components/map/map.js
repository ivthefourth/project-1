import './map.css';
import state from '../state/state';

const map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 39.7642548, lng: -104.9951937},
  zoom: 5
});
