// docs don't show fx methods
// midi docs
// search('...') utility function
// host my samples / files
// Parsing: Bbmi / A#mi7 not working
// Make FXChannel slimmer - just dist, hpf, and lpf
// READMEs in each folder
// refactor sartori init...
import { init, handler as otoHandler } from './oto';
import { handler as midiHandler } from './core/MIDI';
import { Scheduler } from './core/Scheduler';

import './normalize.css'
import './style.css'

import './editor';
import './docs';
import './console';
    
// Init oto
init();

// Create a new scheduler and pass in and handlers
const scheduler = new Scheduler(otoHandler, midiHandler);

// Toggle display of help components
const toggleHelpComponent = (id: string, displayStyle: string = 'block') => {
    const el = document.getElementById(id);
    if(!el) return;
    el.style.display = el.style.display === 'none'
        ? displayStyle
        : 'none';

    // When all help components are hidden, hide the parent container too
    const help: HTMLElement | null = document.querySelector('.help');
    if(!help) return;
    help.style.display = Array.from(help?.children || [])
        // @ts-ignore
        .map((c: Element) => c.style.display)
        .every(style => style === 'none')
        ? 'none'
        : 'flex';
}

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') scheduler.play();
    if(e.ctrlKey && e.code === 'Period') scheduler.stop();
    
    if(e.metaKey && e.key === '1') {
        e.preventDefault();
        toggleHelpComponent('console');
    }
    
    if(e.metaKey && e.key === '2') {
        e.preventDefault();
        toggleHelpComponent('docs');
    }
    
    if(e.metaKey && e.key === '3') {
        e.preventDefault();
        toggleHelpComponent('circuit');
    }
});