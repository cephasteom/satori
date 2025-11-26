import { Channel } from './Channel';

let channels: Record<string, Channel> = {};

declare type oEvent = {id: string, params: Record<string, any>, time: number};

export function handler(event: oEvent, time: number) {
    const { id, params } = event;
    const { out = 0, cut = [], n } = params;

    // cut specified channels, or all if 'all' is specified
    [cut].flat()
        .flatMap(c => c === 'all' ? Object.keys(channels) : c)
        .forEach((id: string) => channels[id]?.cut(time));
    
    // initialize channel if it doesn't exist
    channels[id] = channels[id] || new Channel(out);
    
    // handle polyphony
    [n].flat()
        .filter(Boolean)
        .forEach((n: number, noteIndex: number) => {
            channels[id].play({
                ...Object.entries(params)
                    .reduce((obj, [key, val]) => ({
                        ...obj,
                        [key]: Array.isArray(val) ? val[noteIndex%val.length] : val
                    }), {}),
                n
            }, time);
        })
}