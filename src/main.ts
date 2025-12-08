// docs don't show fx methods
// Make FXChannel slimmer - just dist, hpf, and lpf
// Update README
import { init as initOto } from './oto';
import { toggle, init as initDocs } from './docs';
import { handler as midiHandler } from './core/MIDI';
import { Scheduler } from './core/Scheduler';
import './editor';
import './console';

import './normalize.css'
import './style.css'
    
initDocs();
const otoHandler = initOto();

// Create a new scheduler and pass in and handlers
const scheduler = new Scheduler(otoHandler, midiHandler);

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') scheduler.play();
    if(e.ctrlKey && e.code === 'Period') scheduler.stop();
    
    if(e.metaKey && e.key === '1') {
        e.preventDefault();
        toggle('console');
    }
    
    if(e.metaKey && e.key === '2') {
        e.preventDefault();
        toggle('docs');
    }
    
    if(e.metaKey && e.key === '3') {
        e.preventDefault();
        toggle('circuit');
    }
});