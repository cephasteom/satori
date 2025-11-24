import { evaluate } from './core/compile';
import { Scheduler } from './core/Scheduler';
import './editor';
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
    (event: any, time: number) => console.log(event, time) // handle scheduled events here. For now, we just log them.
);

// Play / Stop controls
window.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && e.ctrlKey) scheduler.play();
    if(e.key === 'Escape') scheduler.stop();
});