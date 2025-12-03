// TODO: docs - fx
// TODO: more pattern functions
// TODO: can we add methods to numbers
// check Granular2 looks like other params referenced bpm
// MIDI integration
// Utility functions scales etc
// Tone synths aren't working well
// customise display (sidebar)
// solo and mute
// bug: global.set({cps: sine(0.5,2).slow(2), e: '1*16'})

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

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(!e.ctrlKey) return;
    if(e.key === 'Enter') scheduler.play();
    if(e.code === 'Period') scheduler.stop();
});