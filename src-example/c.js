import render from './render';
import b from './b.js';

render(`=== ${b()} ===`);

export default () => './c: ' + Math.random();

// Change this line and save to force update this module!
