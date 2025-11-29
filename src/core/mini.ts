import peg from 'pegjs';
import { 
    memoize,
    loopArray,
    ntom, repeatScale, stretchBar,
    euclidean
} from './utils'
import { modes } from './scales'
import { triads } from './chords'

// Add functions to window for so that it can be accessed by parser syntax
typeof window !== 'undefined'
&& [euclidean, loopArray, ntom, repeatScale, stretchBar].forEach((fn: any) => window[fn.name] = fn)

const scaleTypes: string = Object.entries(modes).reduce((grammar: string, [key, scale], i, arr) => {
    return grammar + `"${key}" { return [${scale.join()}]; } ` + (i === arr.length - 1 ? '' : '/ ')
},'')

const chordTypes: string = Object.entries(triads).reduce((grammar: string, [key, chord], i, arr) => {
    return grammar + `"${key}" { return [${chord.join()}]; } ` + (i === arr.length - 1 ? '' : '/ ')
},'')

/*
* Simple pattern parser for generating music patterns
* @returns {any[]} Array of bars, each bar is an array of events
* @example '0 1 2 3' => [[0, 1, 2, 3]] // one bar
* @example '0 1 2 3 | 4 5 6 7' => [[0, 1, 2, 3], [4, 5, 6, 7]] // two bars
* @example '0---- 1-- 2--' => [[0, 0, 0, 0, 1, 1, 2, 2]] // marking out the beats
* @example '0*4 1*2 2*2' => [[0, 0, 0, 0, 1, 1, 2, 2]] // marking out the beats alternative syntax
* @example '0?1----' => [[1, 0, 0, 1]] // random choice for four beats
* @example '0?1?2----' => [[2, 1, 2, 0]] 
* @example '0,1----' => [[0, 1, 0, 1]] // alternate for four measures
* @example '0,1,2----' => [[0, 1, 2, 0]]
* @example '[0,1,2,3]' => [[0, 1, 2, 3]] // array of values, useful for chords
* @example '[0,1,2,3]?[4,5,6,7]----' => [[4,5,6,7],[4,5,6,7],[0,1,2,3],[0,1,2,3]] // can be used with random choice
* @example '[0,1,2,3],[4,5,6,7]----' => [[0,1,2,3],[4,5,6,7],[0,1,2,3],[4,5,6,7]] // can be used with alternate
* @example '0..2----' => [[0, 1, 2, 0]] // sequence from 0 to 3
* @example '3..0----' => [[3, 2, 1, 0]] // sequence from 3 to 0
* @example '0..8' => [[0, 1, 2, 3, 4, 5, 6, 7, 8]] // doesn't take the duration from the sequence, you need to specify a duration
* @example '0..10?----' => [[1, 7, 6, 2]] // sequence with random choice
* @example '4:16' => [[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]] // euclidean rhythm
* @example '3:8*2' => [[1, 0, 0, 1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0]] // euclidean rhythm
* @example 'D4 E4 F#4 G4 A4 B4 C#5 D5' => [[62, 64, 66, 67, 69, 71, 73, 74]] // notes - always use capital letters for notes to distinguish them from sample names
* @example 'Cma7' => [[60, 64, 67, 71]] // chords - root,type (ma,mi,di,au,su),extension (7,#7,b9,9). Again, always capitalise the root note
* @example 'Cma7..*16' => [[60, 64, 67, 71, 60, 64, 67, 71, 60, 64, 67, 71, 60, 64, 67, 71]] // turn chord into a sequence and specify duration
* @example 'Cma7..?*16' => [[60, 64, 67, 71, 60, 64, 67, 71, 60, 64, 67, 71, 60, 64, 67, 71]] // turn chord into a sequence and specify duration and random choice
* @example 'Cma69' => you can use any combination of extensions
* @example 'Clyd..*16' => [[60, 62, 64, 66, 67, 69, 71, 73, 60, 62, 64, 66, 67, 69, 71, 73]] // turn scale into a sequence and specify duration. Treat scales and chords the same, both return an array which can be turned into a sequence or played in unison
* @example 'Clyd%4..?*16' => take first 4 notes from scale, turn into a sequence, random choice, repeat 16 times. You can do the same with chords
* @example '1 1 1?0--; b:8' // set the amount of bars generated to 8. Default is 1 or length of your pattern.
* @example 'Dlyd..*16 |^3' // stretch a bar over 3 bars
*/
const parser = peg.generate(`
    // PARSING
    result 
        = bs:bars args:args? {
            const patternLength = args?.bars || bs.length || 1

            return loopArray(bs, patternLength).map(bar => bar
                .map(s => Array.isArray(s) ? s.map(s => !isNaN(+s) ? +s : s) : !isNaN(+s) ? +s : s)
            )
    }

    args
        = space* ";"? space* bars:("b:" number)? space* ";"? space* { return {
            bars: bars && (bars[1])
        }; }

    bars 
        = bars:bar+ { 
            const format = ({val, dur, type, repeats}) => {
                if (type === 'group') return new Array(repeats).fill(0).map(() => val.map(format).flat()).flat()
                if (type === 'choices') return new Array(dur).fill(0).map((_,i) => val[Math.floor(Math.random() * val.length)])
                if (type === 'alternatives') return new Array(dur).fill(0).map((_, i) => val[i % val.length])
                if (type === 'single') return new Array(dur).fill(0).map(() => val)
                
                return val
            }

            return bars.map(({bar, repeats, stretch}) => {
                return new Array(repeats).fill(0)
                    .map(() => bar.map(format).flat())
                    .map(bar => stretch ? stretchBar(bar, stretch) : [bar]).flat()
            })
            .flat()
        }
    
    bar 
        = space* values:(event+) divider? repeats:duration? stretch:stretch? space* { return {bar: values, repeats: repeats || 1, stretch: stretch || 1}; }    
    
    // GROUPING
    

    // COMPLEX TYPES
    event 
        = scale / absolute_chord / single  / euclidean / sequence / choices / alternatives

    choices 
        = arr:choice+ dur:duration space* { return {val: arr, dur: dur || 1, type: 'choices'}; }

    choice
        = !alternate val:value !alternate choose? { return val }

    alternatives
        = arr:alternative+ dur:duration space* { return {val: arr, dur: dur || 1, type: 'alternatives'}; }

    alternative
        = !choose val:value !choose alternate? { return val }

    single
        = !choose !alternate !seq !"^" !":" val:value dur:duration? !choose !alternate !seq !"^" !":" space* { return {val, dur: dur || 1, type: 'single'}; }
        
    sequence
        = start:$[0-9]+ seq end:$[0-9]+ type:(choose?) dur:duration? space* { 
        let step = +start < +end ? 1 : -1
        let size = Math.abs(+end - +start + step)
        return {
            val: new Array(size).fill(0).map((_, i) => +start + i * step), 
            dur: dur || 1, 
            type: type === '?' ? 'choices' : 'alternatives'
        }
    }

    euclidean
        = pulses:$[0-9]+ ":" steps:$[0-9]+ dur:duration? space* { 
            const val = euclidean(+pulses, +steps).map(v => ({val: v, dur: 1, type: 'single'}))
            return {
                val,
                repeats: dur || 1,
                type: 'group'
            }
        }
    
    // TIME
    stretch
        = "^" val:number { return val; }

    duration
        = count:(ticks / tick) { return count }

    ticks 
        = "*" t:$[0-9]+ { return parseInt(t); }

    tick 
        = "-"* { return text().length; }

    // HARMONY
    absolute_chord = base:note chord:chord_extended l:length? seq:seq? type:(choose?) dur:duration? space*  {
        const arr = repeatScale(chord.map(n => n + base), l || chord.length)
        return seq ? 
        {
            val: arr, 
            dur: dur || 1, 
            type: type === '?' ? 'choices' : 'alternatives'
        }
        : {
            val: arr, 
            dur: dur || 1, 
            type: 'single'
        }
    }
    
    chord_extended = chord:chord variants:chord_variant* {
        const root = chord[0]
        for (var v of variants) {
            chord.push(root + v);
        }
        return chord;
    }
    
    chord_variant 
        = "6" { return 9; }
        / "7" { return 10; }
        / "#7" { return 11; }
        / "b9" { return 13; }
        / "9" { return 14; }
        / "11" { return 17; }
        / "#11" { return 18; }
        / "13" { return 21; }
        / "#13" { return 22; } 
    
    chord
        = ` + chordTypes + `

    scale
        = base:note scale:scale_type l:length? seq:seq? type:(choose?) dur:duration? space* { 
            const arr = repeatScale(scale.map(n => n + base), l || scale.length)
            return seq ? 
            {
                val: arr, 
                dur: dur || 1, 
                type: type === '?' ? 'choices' : 'alternatives'
            }
            : {
                val: arr, 
                dur: dur || 1, 
                type: 'single'
            }
        }

    scale_type
        = ` + scaleTypes + `
    
    note = c:chroma a1:accidental a2:accidental o:octave { return c + a1 + a2 + o; }
    
    // notes/chords roots are always capitalised, to distinguish them from sample names
    chroma = c:[A-G] { 
        // return MIDI note offset from C:
        switch(c) {
            case "C": return 0; 
            case "D": return 2; 
            case "E": return 4; 
            case "F": return 5; 
            case "G": return 7; 
            case "A": return 9; 
            case "B": return 11; 
        }
    }
    
    // sharps and flats
    accidental = a:[#b]? {
        // return MIDI note offset:
        switch(a) {
            case "#": return +1;
            case "b": return -1;
            default: return 0;
        }
    }
    
    octave = n:$("-"? [0-9]+)? { 
        return n 
            ? 12 + (+n) * 12
            : 60; // default to middle C
    }

    // BASIC TYPES
    value 
        = note / string / $number+ / array 

    array 
        = "[" val:$(space* v:value space* ","?)+ "]" { return val.split(',').map(s => s.trim()) }

    number 
        = "-"? (([0-9]+ !seq "." [0-9]*) / ("."? [0-9]+)) { return +text() }

    // must start with a letter, can contain numbers, ., -, _
    string
        = [a-zA-Z]+ [a-zA-Z0-9._-]* { return text(); }
        
    // SYMBOLS
    length
        = "%" l:number { return l; }
    seq
        = ".." { return text(); }

    choose
        = "?" { return text(); }

    alternate
        = "," { return text(); }

    divider 
        = "|" 

    space 
        = " "
`);

let parse = memoize((pattern: string): string|number|[][] => parser.parse(pattern))

export const mini = (pattern: string): any[][] => {
    try {
        console.log(parse(pattern))
        return parse(pattern)
    } catch (error) {
        // if we can't parse the pattern, return the original string, so it can be handled elsewhere
        return [[pattern]]
    }
}

export const isMini = (pattern: any): boolean => {
    if(typeof pattern !== 'string') return false
    try {
        const parsed = parse(pattern)
        return !(parsed.flat().length === 1 && parsed.flat()[0] === pattern)
    } catch (error) {
        return false
    }
}