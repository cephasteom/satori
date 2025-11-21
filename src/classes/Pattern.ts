// Credit: the main architecture of this was adapted from https://garten.salat.dev/idlecycles/, which outlines the underlying concepts of how Tidal was ported to Strudel. Very many thanks.

// Happening type, representing a value occurring over a time range.
declare type Hap<T> = { from: number; to: number; value: T };

// Pattern creation shortcut:
const P = <T>(q: (from: number, to: number) => Hap<T>[]) => new Pattern(q);

// base cycle function, returning a Pattern instance
const cycle = (callback: (from: number, to: number) => Hap<any>[]) => P((from,to) => {
    from = Math.floor(from);
    to = Math.ceil(to);
    let bag: Hap<any>[] = [];
    while (from < to) {
        const haps = callback(from, from + 1);
        // handle raw values and nested patterns
        for(let hap of haps) {
            bag = bag.concat(hap.value instanceof Pattern 
                ? hap.value.query(hap.from, hap.to) 
                : [hap]
            );
        }
        from++;
    }
    return bag;
})

/**
 * Fast - speed up a pattern by a given factor
 * @param factor - the factor by which to speed up the pattern
 * @example seq('A', 'B', 'C').fast(3) // A for 1/3 cycle, B for 1/3 cycle, C for 1/3 cycle.
 */
const fast = (factor: number, pattern: Pattern<any>) => P((from, to) => 
    pattern.query(from * factor, to * factor).map(hap => ({
        from: hap.from / factor,
        to: hap.to / factor,
        value: hap.value
    }))
);

/**
 * Slow - slow down a pattern by a given factor
 * @param factor 
 * @example seq('A', 'B', 'C').slow(2) // A for 2 cycles, B for 2 cycles, C for 2 cycles.
 */
const slow = (factor: number, pattern: Pattern<any>) => fast(1 / factor, pattern);

/**
 * Cat - concatenate values into a pattern, one per cycle
 * @param values - values to concatenate, Can be patterns or raw values.
 * @example cat('A', 'B', 'C') // A for 1 cycle, B for 1 cycle, C for 1 cycle.
 */
const cat = (...values: any[]) => cycle((from, to) => {
    let value = values[from % values.length];
    return [{ from, to, value }];
})

/**
 * Seq - sequence values into a single cycle
 * @param values - values to sequence. Can be patterns or raw values.
 * @example seq('A', 'B', 'C', 'D') // A for .25 cycle, B for .25 cycle ... D for .25 cycle
 */
const seq = (...values: any[]) => fast(values.length, cat(...values));

/**
 * Choose - randomly choose from a set of values
 * @param values - values to choose from. Can be patterns or raw values.
 * @example choose('A', 'B', 'C') // randomly chooses A, B, or C each cycle.
 */
const choose = (...values: any[]) => cycle((from, to) => {
    let value = values[Math.floor(Math.random() * values.length)];
    return [{ from, to, value }];
});

// base function for generating continuous waveform patterns
const waveform = (callback: (i: number, ...args: number[]) => number) => 
    (min: number = 0, max: number = 1, q: number = 48) => 
        fast(q, cat(...Array.from({ length: q }, (_, i) => callback(i, min, max, q))));

/**
 * Saw - generate a ramp of values from min to max, once per cycle
 * @param min - start value
 * @param max - end value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example saw(0, 1) // generates a ramp from 0 to 1 over the course of 1 cycle
 */
const saw = (min: number = 0, max: number = 1, q: number = 48) => waveform((i, min, max, q) => {
    const v = i / (q - 1);
    return min + (max - min) * v;
})(min, max, q);

/**
 * Alias for saw
 */
const range = (...args: Parameters<typeof saw>) => saw(...args);

/** Ramp - alias for saw
 */
const ramp = (...args: Parameters<typeof saw>) => saw(...args);

/**
 * Sine - generate a sine wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 */
const sine = (min: number = 0, max: number = 1, q: number = 48) => waveform((i, min, max, q) => {
    const v = i / q;
    const s = Math.sin(v * (360 * (Math.PI / 180))) * 0.5 + 0.5;
    return min + (max - min) * s;
})(min, max, q);

/**
 * Cosine - generate a cosine wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 */
const cosine = (min: number = 0, max: number = 1, q: number = 48) => waveform((i, min, max, q) => {
    const v = i / q;
    const s = Math.cos(v * (360 * (Math.PI / 180))) * 0.5 + 0.5;
    return min + (max - min) * s;
})(min, max, q);

/**
 * Tri - generate a triangle wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 */
const tri = (min: number = 0, max: number = 1, q: number = 48) => waveform((i, min, max, q) => {
    const v = i / q;
    const t = v < 0.5 ? (v * 2) : (1 - (v - 0.5) * 2);
    return min + (max - min) * t;
})(min, max, q);

/**
 * Square - generate a square wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 */
const square = (min: number = 0, max: number = 1) => waveform((i, min, max) => {
    const v = i % 2;
    const s = v === 0 ? 1 : 0;
    return min + (max - min) * s;
})(min, max, 2);

// /**
//  * Pulse - same as square but you can set the duty cycle
//  * @param min - minimum value
//  * @param max - maximum value
//  * @param duty - duty cycle (0 to 1)
//  * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
//  */
// const pulse = (min: number = 0, max: number = 1, duty: number = 0.5, q: number = 48) => waveform((i, min, max, q) => {
//     const v = (i / q);
//     const s = (v % 1) < duty ? 1 : 0;
//     return min + (max - min) * s;
// })(min, max, q);

export const methods = {
    fast,
    slow,
    cat,
    seq,
    choose,
    saw, range, ramp,
    sine, cosine,
    tri,
    // pulse, 
    square
};

/**
 * Pattern class.
 * Holds a query function and binds all methods to the instance.
 */
class Pattern<T> {
    query: (from: number, to: number) => Hap<T>[];
    constructor(query: (from: number, to: number) => Hap<T>[]) {
        this.query = query;

        // bind methods to this pattern instance
        Object.entries(methods).forEach(([name, method]) => {
            // @ts-ignore
            this[name] = (...args: any[]) => method(...args, this);
        } );
    }
}

const code = "saw(0,1,4)";
const result = new Function(...Object.keys(methods), `return ${code}`)(...Object.values(methods));
console.log(result.query(0, 1));