import { compile } from "./compile";
import { tempo } from "./Tempo";

/**
 * A Clock class to drive the scheduler. Lifted from https://garten.salat.dev/webaudio/clock.html. Ta!
 */
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
    timeout(onComplete: Function, startTime: number, stopTime: number) {
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
        if (this.runs) return;
        this.runs = true;
        this.tick(begin, duration);
    }
    tick(begin: number, duration: number) {
        this.runs = true;
        this.onTick(begin);
        const end = begin + duration;
        this.timeout(
            () => this.runs && this.tick(end, duration),
            begin,
            end
        );
    }
}

/**
 * Scheduler class to manage timing and event dispatching. Adapted from https://garten.salat.dev/idlecycles/chapter6.html. Ta!
 */
export class Scheduler {
    duration = 0.125; // how many cycles / seconds we're querying per tick
    cps = 0.5; // cycles per second
    origin: number = 0; // absolute time of first cycle (phase 0)
    phase = 0; // from origin to last tick
    ac: AudioContext; // audio context
    clock: Clock; // clock to drive the scheduler
    isPlaying: boolean = false;
    latency = 0.1; // latency compensation in seconds
    constructor(ac: AudioContext, handler: Function) {
        this.ac = ac; // audio context
        this.clock = new Clock(ac, () => {
            const from = this.phase;
            const to = Math.round((this.phase + this.duration) * 1000) / 1000;
            const { 
                // global, 
                streams 
            } = compile(from, to);
            // TODO: handle global settings
            streams.forEach((hap) => handler(
                hap, 
                this.origin + (hap.time / this.cps) + this.latency
            ));
            this.phase = to;
        });
        tempo.onChange(cps => {
            this.stop();
            this.cps = cps;
            this.play();
        });
    }
    play() {
        if (this.isPlaying) return;
        this.phase = 0;
        this.origin = this.ac.currentTime;
        this.clock.start(undefined, (this.duration / this.cps));
        this.isPlaying = true;
    }
    stop() {
        this.clock.stop();
        this.isPlaying = false;
    }
}