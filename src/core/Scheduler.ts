import { compile } from "./compile";

class Clock {
    ac: AudioContext;
    runs: boolean;
    onTick: Function;
    dummyGain: GainNode;
    constructor(ac: AudioContext, onTick: Function) {
        this.ac = ac;
        this.runs = false;
        this.onTick = onTick;
        // we need this for safari: https://stackoverflow.com/questions/61101474/onended-does-not-fire-in-safari-or-on-ios
        // thanks Joni Korpi for the bug report
        this.dummyGain = this.ac.createGain();
        this.dummyGain.gain.value = 0;
        this.dummyGain.connect(this.ac.destination);
        return this;
    }
    timeout(onComplete, startTime, stopTime) {
        const constantNode = this.ac.createConstantSource();
        constantNode.connect(this.dummyGain);
        constantNode.start(startTime);
        constantNode.stop(stopTime);
        constantNode.onended = () => {
        onComplete();
            constantNode.disconnect();
        };
  }
    stop() {
        this.runs = false;
    }
    start(begin = this.ac.currentTime + 0.01, duration = 0.1) {
        if (this.runs) {
        return;
        }
        this.runs = true;
        this.tick(begin, duration);
    }
    tick(begin, duration) {
        this.runs = true;
        this.onTick(begin);
        const end = begin + duration;
        this.timeout(
            () => {
                this.runs && this.tick(end, duration);
            },
            begin,
            end
        );
    }
}

export class Scheduler {
    duration = 0.125; // how many cycles / seconds we're querying per tick
    origin: number = 0; // absolute time of first cycle (phase 0)
    phase = 0; // from origin to last tick
    ac: AudioContext; // audio context
    clock: Clock; // clock to drive the scheduler
    handler: Function; // function to call for each hap
    constructor(ac: AudioContext, handler: Function) {
        this.ac = ac; // audio context
        this.handler = handler; // will be called for each hap
        this.clock = new Clock(ac, () => {
            const from = this.phase;
            const to = Math.round((this.phase + this.duration) * 1000) / 1000;
            compile(from, to).forEach((hap) => {
                const time = this.origin + hap.from;
                this.handler(hap, time)
            });
            this.phase = to;
        });
    }
    play() {
        this.phase = 0;
        this.origin = this.ac.currentTime;
        this.clock.start(undefined, this.duration);
    }
    stop() {
        this.clock.stop();
    }
}