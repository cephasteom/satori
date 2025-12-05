import { immediate } from 'tone';
import { WebMidi } from 'webmidi';
import { formatCCParams } from './utils';
declare type Event = {id: string, params: Record<string, any>, time: number, type: string};

const sartori = new BroadcastChannel('sartori');

WebMidi.enable().then(() => sartori.postMessage({ type: 'success', message: 'MIDI enabled' }));

export function handler(event: Event, time: number) {
    const { params } = event;
    const { midi, midichan, mididelay = 0, amp = 0.5, n = 60, dur = 500 } = params;
    
    // If no MIDI param, ignore
    if(midi === undefined) return

    const device = WebMidi.getOutputByName(midi);
    
    // If invalid MIDI device, error
    if(!device) return sartori.postMessage({ 
        type: 'error', 
        message: 'Invalid MIDI device' 
    });

    // playnote expects timestamp in ms from now
    const delta = time - immediate()
    const timestamp = (delta * 1000) + +mididelay;

    // determine channels to play on
    const channels = midichan ? (Array.isArray(midichan) ? midichan : [+midichan]) : undefined;

    const options = {
        time: `+${timestamp}`,
        attack: +amp,
        duration: +dur,
        channels,
    }

    // if an event, trigger notes
    event.type === 'e' && device.playNote(n, {...options, time: `+${timestamp}`});

    // if an event or mutation, send CC params
    Object.entries(formatCCParams(params))
        .forEach(([cc, val]) => 
            device.sendControlChange(+cc, +val, {...options, time: `+${timestamp}`}));
}