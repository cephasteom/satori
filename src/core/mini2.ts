import peg from 'pegjs';

const grammar = `
{
  // Helper function: note name + octave → MIDI number
  const noteMap = {
    "C": 0,  "C#":1,  "Db":1,
    "D":2,   "D#":3,  "Eb":3,
    "E":4,
    "F":5,   "F#":6,  "Gb":6,
    "G":7,   "G#":8,  "Ab":8,
    "A":9,   "A#":10, "Bb":10,
    "B":11
  };

  function noteToMidi(noteName, octave) {
    if (!(noteName in noteMap)) throw new Error("Invalid note: " + noteName);
    return 12 + octave*12 + noteMap[noteName];
  }

  function flat(xs) { return xs.filter(Boolean); }
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
  = MidiNote
  / StackArray
  / Spread
  / StackMusic
  / Number
  / Identifier
  / Group

Group
  = "(" _ e:Expression _ ")" { return e; }

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
  = id:Identifier mod:("%" Number)? {
      return { type: "stack", name: id, length: mod ? mod[2] : null };
    }

Identifier
  = s:[a-zA-Z0-9_./-]+ { return s.join(""); }

IdentChar
  = [a-zA-Z0-9_.-]

Number
  = n:[0-9]+ { return parseInt(n.join(""), 10); }

_ = [ \\t\\n\\r]*
`;

const parser = peg.generate(grammar);

console.log(parser.parse('Ddor'));
