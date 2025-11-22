// TODO: everything!
import { Pattern, methods } from '../Pattern/Pattern';
// import { formatEventParams, formatMutationParams } from '../utils/syntax';

export interface Stream extends Record<string, any> {
    id: string;
    query: (from: number, to: number) => void;
    __reset: () => void;
}

/**
 * A Stream is a musical layer. You can think of it as a track in a DAW, or a channel in a mixer.
 * It can be used to control multiple instruments, effects, and routing.
 * Streams are available within Zen as `s0`, `s1`, `s2`, `s3`, `s4`, `s5`, `s6`, `s7` and are simply objects whose properties return a `Pattern` instance.
 * @example
 * s0.set({inst:0,cut:0,reverb:.5,delay:.25,vol:.5,modi:1.25,mods:0.1})
 * s0.n.set('Cpro%16..*16 | Cpro%16..?*16').sub(12),
 * s0.s.noise(.25,0.05,0.5)
 * s0.e.every(4).or(every(3))
 */
export class Stream {
    constructor(id: string) {
        const handler = {
            get: (target: Stream, key: string) => {
                if (key in target) return target[key as keyof typeof target];

                // wrap Pattern instance in callable proxy
                const pattern = new Pattern();
                
                target[key] = pattern;
                return pattern;
            }
        };

        const init: Stream = { 
            id,
            set: (params: Record<string, any>) => {
                Object.entries(params)
                    .filter(([key]) => !['id', 'query', '__reset', '__clear'].includes(key))
                    .forEach(([key, value]) => init[key] = methods.set(value));
            },
            query: (from: number, to: number) => {
                return {from, to};
                // query .e so that we get a list of event haps
                // then map over those haps to get the parameters at each time
            },
            // get: (time: number, q: number, bpm: number) => {
            //     const t = +(init.t && init.t.has() ? init.t.get(time, q) || 0 : time);
            //     const mute = init.mute?.get(t, q)
            //     const solo = init.solo?.get(t, q)
            //     const e = !mute && init.e?.get(t, q)
            //     const m = !mute && init.m?.get(t, q)
            //     const lag = (60000/bpm)/q // ms per division

            //     const params = (e || m) 
            //         ? Object.entries(init)
            //             .filter(([key]) => !['id', 'set', 'get', 't', '__reset', '__clear', 'e', 'm', 'mute', 'solo'].includes(key))
            //             .reduce((acc, [key, pattern]) => ({
            //                 ...acc,
            //                 [key]: pattern.get(t, q, bpm)
            //             }), {} as Dictionary)
            //         : {};

            //     // compile all parameters
            //     const compiled = (e || m) ? {
            //         track: +id.slice(1),
            //         _track: +id.slice(1),
            //         ...params,
            //         bpm, // bpm
            //         q, // divisions
            //     } : {}
                    
            //     // return the stream's parameters
            //     return {
            //         id,
            //         t, q, bpm,
            //         e, m, solo, mute,
            //         eparams: formatEventParams(compiled, {}), 
            //         mparams: formatMutationParams(compiled, {}, lag) 
            //     }
            // },
            __clear: (persist: string[] = []) => {
                Object.keys(init)
                    .filter(key => !['id','set','get','__reset','__clear', ...persist].includes(key))
                    .map(key => delete init[key]);
            },
            __reset: (persist: string[] = []) => {
                Object.entries(init)
                    .filter(([key]) => !['id','set','get','reset','__clear', ...persist].includes(key))
                    .map(([_, pattern]) => pattern.reset());
            }
        };

        return new Proxy(init, handler);
    }
}

const s = new Stream('s0');
s.set({inst:0,cut:0,reverb:.5,delay:.25,vol:.5,modi:1.25,mods:0.1});
console.log(s.query(0,10));