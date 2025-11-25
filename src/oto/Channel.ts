import { Gain, Split, Merge, getDestination } from 'tone'


const destination = getDestination() // system audio output
destination.channelCount = destination.maxChannelCount // set to max channels

const output = new Merge({channels: destination.maxChannelCount}) // create output merger
output.connect(destination) // connect to system audio output

export class Channel {
    input: Gain
    _out: number
    _fx: any
    _reverb: any
    _delay: any
    _fader: Gain
    _output
    
    constructor(out: number = 0) {
        this._out = out

        this.input = new Gain(1)
        this._fader = new Gain(1)
        this._output = new Split({channels: 2})
        
        this._fader.connect(this._output)
        this.input.fan(this._fader)
        
        this._output.connect(output, 0, out)
        this._output.connect(output, 1, out+1)
    }

    play(params: any, time: number) {
        console.log('play channel', params, time)
    }
}