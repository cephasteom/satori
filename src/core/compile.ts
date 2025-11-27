import { Stream } from './Stream';
import { methods, type Hap } from './Pattern';
import { tempo } from './Tempo';

// keep track of the last successfully evaluated code
let lastCode: string = '';

// create 16 streams: s0, s1, s2, ... s15
const streams = Array(16).fill(0).map((_, i) => new Stream('s' + i))

const global = new Stream('global');

// Util: reset all streams to initial state
export const reset = () => streams.forEach(stream => stream.__reset());

const channel = new BroadcastChannel('sartori');

// everything the user should be able to access in their code
const scope = {
    streams,
    ...[...streams, global].reduce((obj, stream) => ({
        ...obj,
        [stream.id]: stream
    }), {}),
    ...methods,
}

/**
 * Evaluate user code within a controlled scope. If an error occurs, the last successfully evaluated code is re-applied.
 * @param code - The user code to evaluate.
 */
export function evaluate(code: string) {
    try {
        // Reset all streams before evaluating new code
        reset();
        // Evaluate the user code within the defined scope
        new Function(...Object.keys(scope), `${code}`)(...Object.values(scope));
        // Store the last successfully evaluated code
        lastCode = code;
        
    } catch (e: any) {
        // if we have a last successfully evaluated code, re-evaluate it
        lastCode && evaluate(lastCode);
        // and broadcast the error for anyone who wants to consume it
        channel.postMessage({ type: 'error', message: e.message } );
    }
}

export const compile = (from: number, to: number) => ({
    global: global.query(from, to).map((event: Hap<any>) => ({...event, id: 'global'})),
    streams: streams.reduce((compiled, stream) => {
        const events = stream.query(from, to);
        if (events.length === 0) return compiled;
        return [
            ...compiled,
            ...events.map((event: Hap<any>) => ({...event, id: stream.id }))
        ]
    }, [] as Array<Hap<any> & { id: string }>),
})