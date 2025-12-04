// TODO: more pattern functions
// search box in docs
// MIDI integration
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

const toggle = (id: string, displayStyle: string = 'block') => {
    const el = document.getElementById(id);
    if(!el) return;
    el.style.display = el.style.display === 'none'
        ? displayStyle
        : 'none';
}

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') scheduler.play();
    if(e.ctrlKey && e.code === 'Period') scheduler.stop();
    // hide / show console with cmd + 1
    if(e.metaKey && e.key === '1') {
        e.preventDefault();
        toggle('console');
    }
    // hide / show docs with cmd + 2
    if(e.metaKey && e.key === '2') {
        e.preventDefault();
        toggle('help');
    }
});