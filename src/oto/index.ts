import { Channel } from './Channel'

let channels: Record<string, Channel> = {};

// TODO: typing of event
// TODO: cut
export function handler(event: any, time: number) {
    const { id, params } = event;
    const { out = 0 } = params;
    
    // initialize channel if it doesn't exist
    channels[id] = channels[id] || new Channel(out);
    channels[id].play(params, time)
}