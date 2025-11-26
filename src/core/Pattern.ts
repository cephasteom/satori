// TODO: is it possible for fast and slow to accept a pattern?

// Credit: the main architecture of this was adapted from https://garten.salat.dev/idlecycles/, by Froos
// This outlines the underlying concepts of how Tidal was ported to Strudel. Very many thanks.

/**
 * Hap type - represents a single event in a Pattern
 * @ignore - internal use only
 */
export declare type Hap<T> = { from: number; to: number; value: T };

// Util: Pattern creation shortcut
const P = <T>(q: (from: number, to: number) => Hap<T>[]) => new Pattern(q);

// Util: unwrap function to handle raw values and nested patterns
const unwrap = <T>(value: Pattern<T>|any, from: number, to: number) => 
    value instanceof Pattern ? value.query(from, to)[0].value : value

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
 * Edit the Hap values in a pattern using a callback function
 * @param callback - function to edit each Hap value @param v - current Hap value, w - value to edit with, from - start time, to - end time
 * @ignore - internal use only
 */
const withValue = (callback: (...args: any[]) => any) => 
    (...args: (number|Pattern<any>)[]) => cycle((from, to) => {
        const pattern = args[args.length - 1] as Pattern<any>;
        return pattern.query(from, to).map((hap) => ({
            ...hap,
            // args to the callback are all args except the last (pattern), unwrapped, plus hap.value, hap.from, hap.to
            value: callback(...args.slice(0, -1).map(v => unwrap(v, hap.from, hap.to)), hap.value, hap.from, hap.to)
        }))
    })

/**
 * Add a value or pattern.
 * @param value - value or pattern to add.
 * @example seq(1,2,3).add(2) // 3,4,5
 * @example seq(1,2,3).add(saw(0,3,3)) // 1, 3, 5
 */ 
const add = withValue((next, prev) => next + prev);

/** 
 * Subtract a value or pattern from the current pattern.
 * @param value - value or pattern to subtract.
 * @example seq(5,6,7).sub(2) // 3,4,5
 * @example seq(5,6,7).sub(saw(0,3,3)) // 5, 5, 5
 */
const sub = withValue((next, prev) => prev - next);

/** 
 * Multiply the current pattern by a value or pattern.
 * @param value - value or pattern to multiply by.
 * @example seq(1,2,3).mul(2) // 2,4,6
 * @example seq(1,2,3).mul(saw(1,3,3)) // 1, 4, 9
 */
const mul = withValue((next, prev) => next * prev);
   
/** 
 * Divide the current pattern by a value or pattern.
 * @param value - value or pattern to divide by.
 * @example seq(2,4,6).div(2) // 1,2,3
 * @example seq(2,4,6).div(saw(1,3,3)) // 2, 2, 2
 */
const div = withValue((next, prev) => prev / next);

/**
 * Modulo the current pattern by a value or pattern.
 * @param value - value or pattern to modulo by.
 * @example seq(5,6,7).mod(4) // 1,2,3
 * @example seq(5,6,7).mod(saw(1,4,3)) // 5%1, 6%2, 7%3
 */
const mod = withValue((next, prev) => prev % next);

/**
 * Map from one range to another.
 * @param outMin - output minimum
 * @param outMax - output maximum
 * @param inMin - input minimum, default 0
 * @param inMax - input maximum, default 1
 * @example random().mtr(50, 100) // from 0-1 to 50-100
 */
const mtr = withValue((outMin, outMax, ...rest) => {
    rest = rest.slice(0, -2); // remove from and to
    const value = rest.pop() as number; // last arg is the value
    const inMin = rest[0] ?? 0; // default 0
    const inMax = rest[1] ?? 1; // default 1
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin))
});

/**
 * Alias for mtr.
 */
const scale = (...args: Parameters<typeof mtr>) => mtr(...args);

/**
 * Clamp pattern values to a given range.
 * @param min - minimum value, default 0
 * @param max - maximum value, default 1
 * @example random().mul(10).clamp(2, 4) // clamps random()*10 values to between 2 and 4
 */
const clamp = withValue((...args) => {
    args = args.slice(0, -2); // remove from and to
    const value = args.pop() as number; // last arg is the value
    const min = args[0] ?? 0; // default 0
    const max = args[1] ?? 1; // default 1
    return Math.min(Math.max(value, min), max);
});

/**
 * Speed up a pattern by a given factor.
 * @param factor
 * @example seq('A', 'B', 'C').fast(3) // A for 1/3 cycle, B for 1/3 cycle, C for 1/3 cycle.
 */
const fast = (factor: number, pattern: Pattern<any>) => 
    P((from, to) => pattern.query(from * factor, to * factor).map(hap => ({
        from: hap.from / factor,
        to: hap.to / factor,
        value: hap.value
    })));

/**
 * Slow down a pattern by a given factor
 * @param factor 
 * @example seq('A', 'B', 'C').slow(2) // A for 2 cycles, B for 2 cycles, C for 2 cycles.
 */
const slow = (factor: number, pattern: Pattern<any>) => fast(1 / factor, pattern);

/**
 * Concatenate values, one per cycle.
 * @param values
 * @example cat('A', 'B', 'C') // A for 1 cycle, B for 1 cycle, C for 1 cycle.
 */
const cat = (...values: any[]) => 
    cycle((from, to) => [{ from, to, value: values[from % values.length] }]);

/**
 * Alias for cat.
 */
const set = (...args: Parameters<typeof cat>) => cat(...args);

/**
 * Sequence values into a single cycle.
 * @param values
 * @example seq('A', 'B', 'C', 'D') // A for .25 cycle, B for .25 cycle ... D for .25 cycle
 */
const seq = (...values: any[]) => fast(values.length, cat(...values));

/**
 * Randomly choose from a set of values.
 * @param values
 * @example choose('A', 'B', 'C') // randomly chooses A, B, or C each cycle.
 */
const choose = (...values: (any[])) => 
    cycle((from, to) => ([{ from, to, value: values[Math.floor(Math.random() * values.length)]}]))

// base function for generating continuous waveform patterns
const waveform = (callback: (i: number, ...args: number[]) => number) => 
    (...args: number[]) =>
        fast(
            args[args.length - 1], 
            cat(...Array.from({ length: args[args.length - 1] }, (_, i) => callback(i, ...args)))
        );

/**
 * Generate a ramp of values from min to max, once per cycle.
 * @param min - start value
 * @param max - end value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example saw(0, 4) // a ramp from 0 to 4 over the course of 1 cycle
 * @example saw(0,1,96).slow(2) // a ramp from 0 to 1 over the course of 2 cycles, with finer steps to mitigate the slow pattern
 */
const saw = (min: number = 0, max: number = 1, q: number = 48) => 
    waveform((i, min, max, q) => {
        const v = i / (q - 1);
        return min + (max - min) * v;
    })(min, max, q);

/**
 * Alias for saw
 */
const range = (...args: Parameters<typeof saw>) => saw(...args);

/** Alias for saw
 */
const ramp = (...args: Parameters<typeof saw>) => saw(...args);

/**
 * Generate a sine wave pattern from min to max over one cycle/
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example sine(0, 1) // a sine wave from 0 to 1 over the course of 1 cycle
 * @example sine(-1, 1, 96).slow(2) // a sine wave from -1 to 1 over the course of 2 cycles, with finer steps to mitigate the slow pattern
 */
const sine = (min: number = 0, max: number = 1, q: number = 48) => 
    waveform((i, min, max, q) => {
        const v = i / q;
        const s = Math.sin(v * (360 * (Math.PI / 180))) * 0.5 + 0.5;
        return min + (max - min) * s;
    })(min, max, q);

/**
 * Generate a cosine wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example cosine(0, 1) // a cosine wave from 0 to 1 over the course of 1 cycle
 */
const cosine = (min: number = 0, max: number = 1, q: number = 48) => 
    waveform((i, min, max, q) => {
        const v = i / q;
        const s = Math.cos(v * (360 * (Math.PI / 180))) * 0.5 + 0.5;
        return min + (max - min) * s;
    })(min, max, q);

/**
 * Generate a triangle wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example tri(0, 1) // a triangle wave from 0 to 1 over the course of 1 cycle
 */
const tri = (min: number = 0, max: number = 1, q: number = 48) => 
    waveform((i, min, max, q) => {
        const v = i / q;
        const t = v < 0.5 ? (v * 2) : (1 - (v - 0.5) * 2);
        return min + (max - min) * t;
    })(min, max, q);

/**
 * Generate a pulse wave pattern from min to max over one cycle.
 * @param min - minimum value
 * @param max - maximum value
 * @param duty - duty cycle (0 to 1)
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example pulse(0, 1, 0.25) // a pulse wave from 0 to 1 with a duty cycle of 25% over the course of 1 cycle
 */
const pulse = (min: number = 0, max: number = 1, duty: number = 0.5, q: number = 48) => 
    waveform((i, min, max, duty, q) => {
        const v = (i / q);
        const s = (v % 1) < duty ? 1 : 0;
        return min + (max - min) * s;
    })(min, max, duty, q);

/**
 * Alias for pulse with a duty cycle of 0.5.
 * @param min - minimum value
 * @param max - maximum value
 * @example square(0, 4) // a square wave from 0 to 4 over the course of 1 cycle
 */
const square = (min: number = 0, max: number = 1, q: number = 48) => pulse(min, max, 0.5, q);

/**
 * Layer values over the same time range.
 * @param values
 * @example stack(0, sine(), square()) // layers a sine wave and square wave over a constant 0 value.
 */
const stack = (...values: any[]) => cycle((from, to) => values.map((value) => ({ from, to, value })));

/**
 * Interpolate values.
 * @param value
 * @example sine().interp(saw()) // interpolates between sine and saw waveforms over time 
 */
const interp = withValue((v, w, from, to) => v + (w - v) * ((from + to) / 2 % 1));

/**
 * Randomly replace values with 0 based on a given probability.
 * @param probability
 * @example sine().degrade(0.3) // randomly replaces 30% of sine wave values with 0
 */
const degrade = withValue((v, w) => Math.random() < w ? 0 : v);

// base function for probability based Patterns
const weightedCoin = (probability: number|Pattern<any> = 0.5) => 
    P((from, to) => ([{from, to, value: Math.random() < unwrap(probability, from, to) ? 1 : 0}]));

/**
 * Return an equal distribution of 1s and 0s.
 * @example coin()
 */
const coin = () => weightedCoin(0.5);

/**
 * Alias for coin
 */
const sometimes = coin

/**
 * Return mostly 0s, occasionally 1s
 * @example rarely()
 */
const rarely = () => weightedCoin(0.25)

/**
 * Return mostly 1s, occasionally 0s.
 * @example often()
 */
const often = () => weightedCoin(0.75)

/**
 * Compare values. If both are truthy, return 1, else 0.
 * @param value
 * @example coin().and(coin()) // returns 1 when both coins() are truthy
 */
const and = withValue((v, w) => v && w);

/**
 * Compare values. If one of them is truthy, return 1, else 0.
 * @param value
 * @example coin().or(coin()) // returns 1 when either coin() is truthy
 */
const or = withValue((v, w) => v || w);

/**
 * Compare values. If one is truthy and the other is falsy, return 1, else 0.
 * @param value
 * @example set(1).xor(1) // returns 0
 */
const xor = withValue((v, w) => v != w ? 1 : 0);

// base function for handling Math[operation] patterns
const operate = (operator: string) => (...args: (number|Pattern<any>)[]) => cycle((from, to) => {
    // @ts-ignore
    if(!args.length) return [{from, to, value: Math[operator]()}]

    const p = args[args.length - 1] as Pattern<any>;
    return p.query(from, to).map(hap => ({
        from: hap.from,
        to: hap.to,
        // @ts-ignore
        value: Math[operator](hap.value, ...args)
    }))
});

/**
 * Operators - all operators from the JS Math object can be used as functions or Pattern methods.
 * @example random() // return a random number between 0 and 1 every cycle
 * @example set(2).pow(2) // returns 4 every cycle
 * @example seq(1,2,3).pow(2) // returns the sine of 1, then 2, then 3 over successive cycles
 */
const operators = Object.getOwnPropertyNames(Math).filter(prop => typeof (Math as any)[prop] === 'function')

export const methods = {
    withValue,
    add, sub, mul, div,
    mod,
    set,
    cat,
    seq,
    fast,
    slow,
    stack,
    saw, range, ramp, sine, cosine, tri, pulse, square,
    mtr, scale, clamp,
    interp,
    degrade,
    choose, coin, rarely, sometimes, often,
    and, or, xor,
    // insert all operators from the Math object
    ...operators.reduce((obj, name) => ({
        ...obj,
        [name]: operate(name)
    }), {})
};

/**
 * Pattern class.
 * The core building block of Sartori. Patterns represent time-varying values over cycles.
 * @example s0.set({
 *  freq: sine(100,1000) // use a Pattern to set frequency
 *  e: seq(1,1,0,1) // use a Pattern to trigger events
 * })
 */
export class Pattern<T> {
    /**
     * Query function - returns Haps for a given time range
     * @param from - start time
     * @param to - end time
     * @ignore - internal use only
     */
    query: (from: number, to: number) => Hap<T>[];

    /**
     * Create a new Pattern instance
     * @param query - function that returns Haps for a given time range
     * @ignore - internal use only
     */
    constructor(query: (from: number, to: number) => Hap<T>[] = () => []) {
        this.query = query;

        // bind methods to this pattern instance
        Object.entries(methods).forEach(([name, method]) => {
            // @ts-ignore
            this[name] = (...args: any[]) => method(...args, this);
        } );
    }
}