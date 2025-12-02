// TODO: Note values not working C4 D4 etc
// TODO: more pattern functions
// TODO: docs - instruments, fx, routing
// TODO: better typing throughout
// TODO: documentation on all modules
// MIDI integration
// Utility functions scales etc
// Tone synths aren't working well

import { evaluate } from './core/compile';
import { Scheduler } from './core/Scheduler';
import { handler } from './oto';
import './editor';
import './docs';
import './console';
import './normalize.css'
import './style.css'
import './core/mini.ts';

// Listen for 'evaluateCode' events from the editor and evaluate the code
window.addEventListener("evaluateCode", (e) => {
    const customEvent = e as CustomEvent<{ code: string }>;
    evaluate(customEvent.detail.code);
});

// Init Scheduler
const scheduler = new Scheduler(
    (event: any, time: number) => handler(event, time) // handle scheduled events here.
);

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(!e.ctrlKey) return;
    if(e.key === 'Enter') scheduler.play();
    if(e.code === 'Period') scheduler.stop();
});