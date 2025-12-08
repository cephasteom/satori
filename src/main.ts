import { Satori } from './core/Satori';
import { init as initOto } from './oto';
import { handler as midiHandler } from './core/MIDI';

import { toggle, init as initDocs } from './docs';
import { init as initEditor } from './editor';
import { init as initConsole } from './console';

('serviceWorker' in navigator && import.meta.env.PROD) && window.addEventListener('load', () => 
    navigator.serviceWorker.register('/service-worker.js'));

// initialize UI components
initDocs();
initEditor();
initConsole();

// Create a new Satori instance and pass in handlers
const satori = new Satori(initOto(), midiHandler);

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') satori.play();
    if(e.ctrlKey && e.code === 'Period') satori.stop();
    
    const components = ['console', 'docs', 'circuit'];
    if(e.metaKey && parseInt(e.key) < components.length + 1) {
        e.preventDefault();
        toggle(components[parseInt(e.key) - 1]);
    }
});