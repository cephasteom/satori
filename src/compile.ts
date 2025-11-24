import { Stream } from './classes/Stream/Stream';
import { methods } from './classes/Pattern/Pattern';

const streams = Array(16).fill(0).map((_, i) => new Stream('s' + i))

// everything the user should be able to access in their code
const scope = {
    streams,
    ...streams.reduce((obj, stream) => ({
        ...obj,
        [stream.id]: stream
    }), {}),
    ...methods
}

export const compile = (code: string) => {
    try {
        new Function(...Object.keys(scope), `${code}`)(...Object.values(scope));
    } catch (e) {
        console.error('Compilation error:', e);
    }

    console.log(streams[0].query(0, 1));
}