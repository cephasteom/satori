import { getTransport } from 'tone';

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