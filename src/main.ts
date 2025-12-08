// docs don't show fx methods
// Make FXChannel slimmer - just dist, hpf, and lpf
import { init as initOto } from './oto';
import { handler as midiHandler } from './core/MIDI';
import { toggle, init as initDocs } from './docs';
import { Sartori } from './core/Sartori';

import { Pattern } from './core/Pattern';
import './editor';
import './console';

import './normalize.css'
import './style.css'
    
initDocs();
const otoHandler = initOto();

// Create a new sartori instance and pass in handlers
const sartori = new Sartori(otoHandler, midiHandler);

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') sartori.play();
    if(e.ctrlKey && e.code === 'Period') sartori.stop();
    
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