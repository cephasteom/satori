import { evaluate } from './core/compile';
import { Scheduler } from './core/Scheduler';
import './editor';
import './normalize.css'
import './style.css'

// console.log(compile(0, 2));
// console.log(compile(2, 4));

window.addEventListener("executeCode", (e) => {
    const customEvent = e as CustomEvent<{ code: string }>;
    evaluate(customEvent.detail.code);
});

const ac = new AudioContext();
const scheduler = new Scheduler(ac, (hap: any) => {
    console.log(hap);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        scheduler.play();
        return false;
    }

    if (e.key === 'Escape') {
        scheduler.stop();
        return false;
    }
});
