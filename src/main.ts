// TODO: more pattern functions
// MIDI integration
// host my samples / files
// zmod

import { evaluate } from './core/compile';
import { Scheduler } from './core/Scheduler';
import { handler } from './oto';

import './normalize.css'
import './style.css'

import './editor';
import './docs';
import './console';

// Listen for 'evaluateCode' events from the editor and evaluate the code
window.addEventListener("evaluateCode", (e) => {
    const customEvent = e as CustomEvent<{ code: string }>;
    evaluate(customEvent.detail.code);
});

// Init Scheduler
const scheduler = new Scheduler(
    (event: any, time: number) => handler(event, time) // handle scheduled events here.
);

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