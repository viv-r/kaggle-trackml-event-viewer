import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

window.THREE = require('three');
require('../node_modules/three/examples/js/controls/OrbitControls');
require('../node_modules/three/examples/js/controls/FlyControls');
const App = require('./App').default;


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
