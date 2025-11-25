import { Gain, Split, Merge, getDestination } from 'tone'


const destination = getDestination() // system audio output
destination.channelCount = destination.maxChannelCount // set to max channels

const output = new Merge({channels: destination.maxChannelCount}) // create output merger
output.connect(destination) // connect to system audio output

const synthTypes = [
    'synth', 'sampler', 'granular', 'additive', 'acid', 'drone', 'sub', 'superfm', 'wavetable', 
    'zmod', 
    'tone.synth', 'tone.mono', 'tone.fm', 'tone.am'
];

const console = new BroadcastChannel('sartori');

export class Channel {
    out: number // output channel index
    input: Gain // input gain
    output: Split // output splitter
    fader: Gain // volume control
    instruments: Record<string, any> = {}
    
    constructor(out: number = 0) {
        this.out = out

        this.input = new Gain(1)
        this.fader = new Gain(1)
        this.output = new Split({channels: 2})
        
        this.fader.connect(this.output)
        this.input.fan(this.fader)
        
        this.output.connect(output, 0, out)
        this.output.connect(output, 1, out+1)
    }

    play(params: any, time: number) {
        const { inst } = params;
        
        if(!synthTypes.includes(inst)) {
            return console.postMessage({ 
                type: 'error', 
                message: `Instrument type "${inst}" not recognized.` 
            });
        }
    }
}