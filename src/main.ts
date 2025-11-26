// TODO: how to handle dynamic cps changes?
// TODO: mutations
// TODO: test language - are we getting back what we expect?
// TODO: mini lang
// TODO: more pattern functions
// TODO: fx and fx busses
// TODO: docs - instruments, fx

import { evaluate } from './core/compile';
import { Scheduler } from './core/Scheduler';
import { handler } from './oto';
import './editor';
import './docs';
import './console';
import './normalize.css'
import './style.css'

// Listen for 'evaluateCode' events from the editor and evaluate the code
window.addEventListener("evaluateCode", (e) => {
    const customEvent = e as CustomEvent<{ code: string }>;
    evaluate(customEvent.detail.code);
});

// Init Scheduler
const scheduler = new Scheduler(
    new AudioContext(), // requires an AudioContext
    (event: any, time: number) => handler(event, time) // handle scheduled events here.
);

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(!e.ctrlKey) return;
    if(e.key === 'Enter') scheduler.play();
    if(e.code === 'Period') scheduler.stop();
});