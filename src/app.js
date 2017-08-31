import interests from './components/interests/interests';
import layout from './components/layout/layout';
import map from './components/map/map';
import route from './components/route/route';
import state from './components/state/state';

interests();
layout();
map();
route();

/* TEMPORARY, REMOVE LATER */
window.state = state;
