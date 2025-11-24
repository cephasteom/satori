// TODO: everything!
import { Pattern, methods, type Hap } from '../Pattern/Pattern';
const {sine, seq, set} = methods;
export interface Stream extends Record<string, any> {
    id: string;
}


/**
 * A Stream is a musical layer. You can think of it as a track in a DAW, or a channel in a mixer.
 * It can be used to control multiple instruments, effects, and routing.
 * Stream instances are stored as `s0`, `s1`, `s2`, `s3`, `s4`, `s5`, `s6`, `s7` etc.
 * @example
 * s0.set({
    inst: 0, 
    reverb: sine(),
    e: seq(1,0,1) })
 */
export class Stream {
    constructor(id: string) {
        this.id = id;
    }

    set(params: Record<string, any>) {
        Object.entries(params)
            .filter(([key]) => !['id', 'set', 'query'].includes(key))
            // @ts-ignore
            .forEach(([key, value]) => this[key] = (value instanceof Pattern 
                ? value 
                : set(value)));
    }
    
    query(from: number, to: number) {
        // gather the events from .e pattern
        const events = this.e?.query(from, to) || [];
        return events
            // only keep events with a value
            .filter((e: Hap<any>) => !!e.value)
            // iterate over events and build param sets
            .map((e: Hap<any>) => ({
                time: e.from,
                params: Object.fromEntries(Object.entries(this)
                    // only keep Patterns
                    .filter(([_, value]) => value instanceof Pattern)
                    // query each Pattern and keep the closest Hap to the event start time
                    .map(([key, pattern]) => [key, (pattern as Pattern<any>).query(e.from, e.to)[0]?.value ])
                )
            }));
    }
}

const s0 = new Stream('s0');
const s1 = new Stream('s1');


s0.set({
    inst: 0, 
    reverb: sine(),
    e: seq(1,0,1) })

s1.set({
    e: s0.e.degrade() })
    
    
// nice! because everything is immutable, we can reference patterns from other streams


console.log(s0.query(0,1)); // but the results aren't as expected

// TODO: s0.reverb.sine() not working.
// We should be able to do something like this s0.e.coin().repeat(8), or repeat(8, coin()).