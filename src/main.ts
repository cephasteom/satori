import { Sartori } from './core/Sartori';
import { init as initOto } from './oto';
import { handler as midiHandler } from './core/MIDI';

import { toggle, init as initDocs } from './docs';
import { init as initEditor } from './editor';
import { init as initConsole } from './console';
    
initDocs();
initEditor();
initConsole();

// Create a new sartori instance and pass in handlers
const sartori = new Sartori(initOto(), midiHandler);

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') sartori.play();
    if(e.ctrlKey && e.code === 'Period') sartori.stop();
    
    const components = ['console', 'docs', 'circuit'];
    if(e.metaKey && parseInt(e.key) < components.length + 1) {
        e.preventDefault();
        toggle(components[parseInt(e.key) - 1]);
    }
});