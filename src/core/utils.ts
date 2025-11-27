import { scales } from './scales'
import { chords } from './chords'

// memoize multiple argument function - use sparingly as we're creating strings as keys
export function memoize(fn: (...args: any[]) => any) {
    let cache: Record<string, any> = {};
    return (...args: any[]) => {
        let n = args.map(a => JSON.stringify(a)).join('-');
        return n in cache 
            ? cache[n]
            : (cache[n] = fn(...args));
        }
    }

// loop items in array until array is of length n
export function loopArray(arr: any[], n: number) {
    let i = 0
    while(arr.length < n) {
        arr.push(arr[i])
        i++
    }
    return arr
}



export function letterToInteger(letter: string) {
    return { 
        cf: -1,
        c: 0, 
        cs: 1, df: 1, 
        d: 2, 
        ds: 3, ef: 3, 
        e: 4, 
        es: 5, f: 5, 
        fs: 6, gf:6, 
        g: 7, 
        gs: 8, af: 8,
        a: 9,
        as: 10, bf: 10,
        b: 11, bs: 12
    }[letter] || 0
}

// note name to midi number
export function ntom(letter: string, octave: number = 4) {
    return letterToInteger(letter) + (+octave * 12)
}

export const getScale = memoize((name: string) => {
    const [root = 'c', scale = 'major'] = name.split("-")
    const notes = scales[scale] || []
    const rootIndex = letterToInteger(root)
    return Array(8).fill(notes)
        .map((notes: number[], octave: number) => notes.map((n: number) => (n + rootIndex + (octave * 12))))
        .flat()
})

export const getChord = memoize((name: string) => {
    const [root = 'c', chord = 'major'] = name.split("-")
    const notes = chords[chord] || []
    const rootIndex = letterToInteger(root)
    return notes.map((n: number) => n + rootIndex)
})

// when passed an array containing 1 octave of a scale, repeat the scale until it reaches the specified length
export function repeatScale(arr: number[], n: number): number[] {
    const repetitions = Math.ceil(n / arr.length);
    return Array(repetitions)
        .fill(arr)
        .map((arr: number[], i: number) => arr.map((n: number) => n + (i * 12)))
        .flat().slice(0, n);
}

// Take a bar of values and return an array of sub-bars, with the original bar stretched to fit the specified number of bars
export function stretchBar(bar: number[], numBars: number): number[][] {
    const beats = bar.length;
    const lcd = beats * numBars;
    const arr = new Array(lcd).fill(0).map((_, i) => bar[Math.floor(i / numBars)]);
    return new Array(numBars).fill(0)
        .map((_, i) => arr.slice(i * beats, (i + 1) * beats));
}

// From https://github.com/mkontogiannis/euclidean-rhythms/
// copied in here rather installed as a dependency due to a node version mismatch
// N.B. Ensure credit is given to the original author

/**
 *  Returns the calculated pattern of equally distributed pulses in total steps
 *  based on the euclidean rhythms algorithm described by Godfried Toussaint
 *
 *  @method euclid
 *  @param {Number} pulses Number of pulses in the pattern
 *  @param {Number} steps  Number of steps in the pattern (pattern length)
 */
function euclid(pulses: number, steps: number) {
    if (pulses < 0 || steps < 0 || steps < pulses) {
        return [];
    }
  
    // Create the two arrays
    let first = new Array(pulses).fill([1]);
    let second = new Array(steps - pulses).fill([0]);
  
    let firstLength = first.length;
    let minLength = Math.min(firstLength, second.length);
  
    let loopThreshold = 0;
    // Loop until at least one array has length gt 2 (1 for first loop)
    while (minLength > loopThreshold) {
        // Allow only loopThreshold to be zero on the first loop
        if (loopThreshold === 0) {
            loopThreshold = 1;
        }
    
        // For the minimum array loop and concat
        for (let x = 0; x < minLength; x++) {
            first[x] = [...first[x], ...second[x]];
        }
    
        // if the second was the bigger array, slice the remaining elements/arrays and update
        if (minLength === firstLength) {
            second = second.slice(minLength);
        }
        // Otherwise update the second (smallest array) with the remainders of the first
        // and update the first array to include only the extended sub-arrays
        else {
            second = first.slice(minLength);
            first = first.slice(0, minLength);
        }
        firstLength = first.length;
        minLength = Math.min(firstLength, second.length);
    }
  
    // Build the final array
    const pattern: number[] = [...first.flat(), ...second.flat()];
  
    return pattern;
  }

export function euclidean(pulses: number, steps: number) {
    return memoize(euclid)(pulses, steps);
}