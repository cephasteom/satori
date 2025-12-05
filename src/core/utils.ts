import { getTransport } from 'tone';
import { scales } from './scales';
import { WebMidi } from 'webmidi';

const channel = new BroadcastChannel('sartori');

// memoize multiple argument function - use sparingly as we're creating strings as keys
export function memoize(fn: (...args: any[]) => any) {
    let cache: Record<string, any> = {};
    return (...args: any[]) => {
        let n = args.map(a => JSON.stringify(a)).join('-');
        return n in cache 
            ? cache[n]
            : (cache[n] = fn(...args));
        }
    }

export function cyclesToSeconds(cycles: number): number {
    const transport = getTransport();
    const bpm = transport.bpm.value;
    const secondsPerBeat = 60 / bpm;
    return cycles * 4 * secondsPerBeat;
}

export function cyclesToMilliseconds(cycles: number): number {
    return cyclesToSeconds(cycles) * 1000;
}

export function cyclesPerSecond(): number {
    const transport = getTransport();
    const bpm = transport.bpm.value;
    return bpm / 60 / 4;
}

export function transposeOctave(note: number, octaves: number): number {
    return note + (octaves * 12);
}

// Utility functions accessible in user code
export const utilities = {
    scales: () => {
        channel.postMessage({ type: 'success', message: 'Scales ->\n' });
        channel.postMessage({ type: 'info', message: Object.keys(scales).join(', ') } );
    },
    print: (message: any) => {
        channel.postMessage({ type: 'credit', message: String(message) } );
    },
    clear: () => {
        channel.postMessage({ type: 'clear' } );
    },
    instruments: () => {
        channel.postMessage({ type: 'success', message: 'Instruments ->\n' });
        channel.postMessage({ type: 'info', message: 'synth, sampler, granular, acid, tone.synth, tone.am, tone.fm, tone.mono' } );
    },
    effects: () => {
        channel.postMessage({ type: 'success', message: 'Effects ->\n' });
        channel.postMessage({ type: 'info', message: 'reverb, delay, dist, hpf, lpf' } );
    },
    midi: () => {
        channel.postMessage({ type: 'success', message: 'MIDI outs ->\n' });
        channel.postMessage({ type: 'info', message: WebMidi.outputs.map(i => i.name).join(', ') } );
    }
}