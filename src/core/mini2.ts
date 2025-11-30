import { triads } from './chords';
import { modes } from './scales'
import peg from 'pegjs';

// '1 1 1 1' => seq(1,1,1,1) 
// '1 2*3 1' => seq(1, repeat(2,3), 1) 
// '1 . 1 2 3 . 1' => seq(1, seq(1,2,3), 1) 
// '1 1 1 | 1 2 3' => cat(seq(1,1,1), seq(1,2,3)) 
// '1?2?3?4' => choose(1,2,3,4) 
// '1 1?2?3?4 1' => seq(1, choose(1,2,3,4), 1) 
// 'hello world' => seq('hello', 'world') 
// '808bd 808sd 808bd 808sd' => seq('808bd', '808sd', '808bd', '808sd') 
// '080.wav 090.wav' => seq('080.wav', '090.wav') - string with numbers valid 
// '[1,2,3] [4,5,6]' => seq([1,2,3], [4,5,6]) 
// 'C4 D4 E4 F4' => seq(60, 62, 64, 65) - notes to MIDI
// 'Cma' => seq([60,64,67]) - chord to MIDI 
// 'Cma7' => seq([60,64,67,71]) - chord with extension to MIDI - extensions: 6,7,#7,b9,9,11,#11,13,#13 
// 'Clyd' => seq([60,62,64,66,67,69,71,73]) - scale to MIDI
// 'Clyd%8' => seq([60,62,64,66,67,69,71,73]) - scale to MIDI, with 8 notes
// 'Clyd..' => seq(60,62,64,66,67,69,71,73) - spread out scale or chord over time

const channel = new BroadcastChannel('sartori');

// Extensions
export const extensions: Record<string, number[]> = {
  6: [9],
  7: [10],
  "#7": [11],
  b9: [1],
  9: [2],
  11: [5],
  "#11": [6],
  13: [9],
  "#13": [10]
};

// MIDI numbers for root notes
export const noteMap: Record<string, number> = {
  C: 60, "C#":61, Db:61, D:62, "D#":63, Eb:63,
  E:64, F:65, "F#":66, Gb:66, G:67, "G#":68, Ab:68,
  A:69, "A#":70, Bb:70, B:71
};

const grammar = `
{
  // Inject data
  const triads = ${JSON.stringify(triads)};
  const modes = ${JSON.stringify(modes)};
  const extensions = ${JSON.stringify(extensions)};
  const noteMap = ${JSON.stringify(noteMap)};
  function flat(xs) { return xs.filter(Boolean); }

  function expandNotesLinear(notes, length) {
    const originalLen = notes.length;
    const result = [];

    for (let i = 0; i < length; i++) {
        // Determine which note in original
        const note = notes[i % originalLen];
        // Determine which octave increment
        const octaveShift = Math.floor(i / originalLen) * 12;
        result.push(note + octaveShift);
    }

    return result;
  }

  function buildStack(root, type, ext) {
    const rootMidi = noteMap[root];
    if (rootMidi === undefined) throw new Error("Invalid root note: " + root);

    let intervals = [];
    if (triads[type]) intervals = triads[type];
    else if (modes[type]) intervals = modes[type];
    else throw new Error("Unknown chord/scale type: " + type);

    if (ext && extensions[ext]) {
      intervals = intervals.concat(extensions[ext]);
    }

    return intervals.map(i => rootMidi + i);
  }

  const noteSimpleMap = {
    "C":0,"C#":1,"Db":1,"D":2,"D#":3,"Eb":3,
    "E":4,"F":5,"F#":6,"Gb":6,"G":7,"G#":8,"Ab":8,
    "A":9,"A#":10,"Bb":10,"B":11
  };

  function noteToMidi(noteName, octave) {
    if (!(noteName in noteSimpleMap)) throw new Error("Invalid note: " + noteName);
    return 12 + octave*12 + noteSimpleMap[noteName];
  }
}

Start
  = _ expr:Expression _ { return expr; }

Expression = Choice

Choice
  = first:Sequence rest:(_ "|" _ Sequence)* {
      if (rest.length === 0) return first;
      return { type: "cat", items: [first].concat(rest.map(r => r[3])) };
    }

Sequence
  = first:Term rest:(_ Term)* {
      if (rest.length === 0) return first;
      return { type: "seq", items: [first].concat(rest.map(r => r[1])) };
    }

Term
  = Fast
  / Choose
  / Primary

Fast
  = t:Primary _ "*" _ c:Number {
      return { type: "seq", items: Array(c).fill(t) };
    }

Choose
  = first:Primary rest:(_ "?" _ Primary)+ {
      return { type: "choose", items: [first].concat(rest.map(r => r[3])) };
    }

Primary
  = StackArray
  / Spread
  / StackMusic
  / MidiNote
  / StringToken
  / Number
  / Group

Group
  = "(" _ e:Expression _ ")" { return e; }

Spread
  = id:Identifier ".." { return { type: "spread", name: id }; }

StackArray
  = "[" _ elems:NumberList _ "]" {
      return { type: "stack", items: elems };
    }

NumberList
  = head:Number tail:(_ "," _ Number)* {
      return [head].concat(tail.map(t => t[3]));
    }

StackMusic
  = root:[A-G] type:[a-z]+ ext:Extension? mod:ModLength? spread:SpreadModifier? random:RandomModifier? {
      let notes = buildStack(root, type.join(""), ext ? ext.join("") : null);

      // Apply % length modifier
      if (mod) {
        const len = parseInt(mod, 10);
        if (isNaN(len) || len <= 0) throw new Error("Invalid length modifier: " + mod);
        notes = expandNotesLinear(notes, len);
      }

      // Apply spread (flatten)
      if (spread) notes = notes.slice(); // keep as array

      // Apply randomisation
      if (random) {
        return { type: "choose", items: notes.slice() }; // return as choose
      }

      // Decide whether to return seq (spread) or stack
      if (spread) return { type: "seq", items: notes };

      return { type: "stack", name: root + type.join("") + (ext ? ext.join("") : ""), items: notes };
    }

RandomModifier
  = "?"

Extension
  = [0-9#b]+

ModLength
  = "%" digits:[0-9]+ { return digits.join(""); }

SpreadModifier
  = ".."

MidiNote
  = n:NoteName o:Octave {
      return noteToMidi(n, o);
    }

NoteName
  = n:[A-G] acc:("#" / "b")? {
      return n + (acc !== null ? acc : "");
    }

Octave
  = n:[0-9]+ { return parseInt(n.join(""),10); }

Identifier
  = s:[a-zA-Z_./-]+ { return s.join(""); }

StringToken
  = s:[a-zA-Z0-9_./-]+ { return s.join(""); }

Number
  = n:[0-9]+ { return parseInt(n.join(""), 10); }

_ = [ \\t\\n\\r]*
`;

const parser = peg.generate(grammar);

export const parse = (input: string) => {
    try {
        return parser.parse(input);
    } catch (e: any) {
        channel.postMessage({ type: 'error', message: e.message } );
    }
}

export function evalNode(node: {type: string, items: any[], value: any, count: number, name: string}, methods: Record<string, Function>): any {
    if (node == null) return null;
    
    // If it's a primitive (number or string), return as-is
    if (['number', 'string'].includes(typeof node)) return node

    // If it’s an array (shouldn’t happen at top-level), map recursively
    if (Array.isArray(node)) return node.map(n => evalNode(n, methods));

    // Otherwise, it’s an object with `type` and `items` or other fields
    const fn = methods[node.type];
    if (!fn) throw new Error("Unknown type: " + node.type);

    // Determine arguments
    let args;
    if (node.items) {
        // has children, so evaluate them recursively
        args = node.items.map(n => evalNode(n, methods));
    } else if (node.value !== undefined && node.count !== undefined) {
        // has value and count (for seq with repetition)
        args = [evalNode(node.value, methods), node.count];
    // } else if (node.name && node.items) {
    //     // has name and items (for stack with name)
    //     args = node.items.map(n => evalNode(n, methods));
    } else {
        args = [];
    }
    
    // Call the function with the evaluated arguments
    return fn(...args);
}