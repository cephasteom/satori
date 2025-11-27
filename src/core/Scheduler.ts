import { getTransport, immediate, Loop } from 'tone'
import { compile } from "./compile";

export class Scheduler {
    ac: AudioContext;
    cps: number = 0.5;
    transport;
    divisions: number = 4; // how many times / cycle to query
    t: number = 0; // time pointer in cycles
    loop: Loop;

    constructor(ac: AudioContext, handler: Function) {
        this.ac = ac;
        this.transport = getTransport()
        this.loop = new Loop(time => {
            const from = this.t;
            const to = this.t + (1 / this.divisions);
            
            // compile code between from and to
            const { global, streams } = compile(from, to);

            const cpsEvents = global
                .filter((hap: any) => Object.keys(hap.params).includes('cps'))
                .map((hap: any) => ({time: hap.time, value: hap.params.cps}));
            
            global.forEach((hap: any) => {
                if(hap.params.cps) {
                    // set transport bpm at the time of the event
                    this.transport.bpm.setValueAtTime(240 * hap.params.cps, time);
                    // update scheduler cps
                    this.cps = hap.params.cps;
                }
            });

            streams.forEach((hap) => handler(
                hap, 
                time + // time from transport
                (hap.time - from) / // add delta value from start of this tick
                (cpsEvents.find(({time}: any) => time >= hap.time)?.value || this.cps) // scaled by cps at that time
            ));

            // update time pointer for next tick
            this.t = to;
        }, `${this.divisions}n`).start(0);
    }
    
    play() {
        this.transport.start('+0.1');
    }

    stop() {
        this.transport.stop(immediate())
    }
}