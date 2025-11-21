// Credit: the main architecture of this was adapted from https://garten.salat.dev/idlecycles/, by Froos
// This outlines the underlying concepts of how Tidal was ported to Strudel. Very many thanks.

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

// unwrap function to handle raw values and nested patterns
const unwrap = <T>(value: Pattern<T>|any, from: number, to: number) => 
    (value instanceof Pattern ? value.query(from, to) : [{from, to, value}])[0].value

/**
 * Fast - speed up a pattern by a given factor
 * @param factor - the factor by which to speed up the pattern
 * @example seq('A', 'B', 'C').fast(3) // A for 1/3 cycle, B for 1/3 cycle, C for 1/3 cycle.
 */
const fast = (factor: number, pattern: Pattern<any>) => 
    P((from, to) => pattern.query(from * factor, to * factor).map(hap => ({
        from: hap.from / factor,
        to: hap.to / factor,
        value: hap.value
    })));

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
 * Set - just an alias for cat, as it reads better when you're setting a single value
 */
const set = (...args: Parameters<typeof cat>) => cat(...args);

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
 * Saw - generate a ramp of values from min to max, once per cycle
 * @param min - start value
 * @param max - end value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example saw(0, 4) // generates a ramp from 0 to 1 over the course of 1 cycle
 * @example saw(0,1,96).slow(2) // generates a ramp from 0 to 1 over the course of 2 cycles, with finer steps to mitigate the slow pattern
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

/** Ramp - alias for saw
 */
const ramp = (...args: Parameters<typeof saw>) => saw(...args);

/**
 * Sine - generate a sine wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example sine(0, 1) // generates a sine wave from 0 to 1 over the course of 1 cycle
 * @example sine(-1, 1, 96).slow(2) // generates a sine wave from -1 to 1 over the course of 2 cycles, with finer steps to mitigate the slow pattern
 */
const sine = (min: number = 0, max: number = 1, q: number = 48) => 
    waveform((i, min, max, q) => {
        const v = i / q;
        const s = Math.sin(v * (360 * (Math.PI / 180))) * 0.5 + 0.5;
        return min + (max - min) * s;
    })(min, max, q);

/**
 * Cosine - generate a cosine wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example cosine(0, 1) // generates a cosine wave from 0 to 1 over the course of 1 cycle
 */
const cosine = (min: number = 0, max: number = 1, q: number = 48) => 
    waveform((i, min, max, q) => {
        const v = i / q;
        const s = Math.cos(v * (360 * (Math.PI / 180))) * 0.5 + 0.5;
        return min + (max - min) * s;
    })(min, max, q);

/**
 * Tri - generate a triangle wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example tri(0, 1) // generates a triangle wave from 0 to 1 over the course of 1 cycle
 */
const tri = (min: number = 0, max: number = 1, q: number = 48) => 
    waveform((i, min, max, q) => {
        const v = i / q;
        const t = v < 0.5 ? (v * 2) : (1 - (v - 0.5) * 2);
        return min + (max - min) * t;
    })(min, max, q);

/**
 * Pulse - same as square but you can set the duty cycle
 * @param min - minimum value
 * @param max - maximum value
 * @param duty - duty cycle (0 to 1)
 * @param q - quantization: steps/cycle. Default 48. Increase for a more fine-grained waveform.
 * @example pulse(0, 1, 0.25) // generates a pulse wave from 0 to 1 with a duty cycle of 25% over the course of 1 cycle
 */
const pulse = (min: number = 0, max: number = 1, duty: number = 0.5, q: number = 48) => 
    waveform((i, min, max, duty, q) => {
        const v = (i / q);
        const s = (v % 1) < duty ? 1 : 0;
        return min + (max - min) * s;
    })(min, max, duty, q);

/**
 * Square - generate a square wave pattern from min to max over one cycle
 * @param min - minimum value
 * @param max - maximum value
 * @example square(0, 4) // generates a square wave from 0 to 4 over the course of 1 cycle
 */
const square = (min: number = 0, max: number = 1, q: number = 48) => pulse(min, max, 0.5, q);

/**
 * Stack - layer given set of values over the same time range
 * @param values - values to layer. Can be patterns or raw values.
 * @example stack(0, sine(), square()) // layers a sine wave and square wave over a constant 0 value.
 */
const stack = (...values: any[]) => cycle((from, to) => values.map((value) => ({ from, to, value })));

/**
 * Interp - interpolate values
 * @param value - value to interpolate with. Can be pattern or raw value.
 * @example sine().interp(saw()) // interpolates between sine and saw waveforms over time 
 */
const interp = (value: number|Pattern<any>, pattern: Pattern<any>) => cycle((from, to) =>
    pattern.query(from, to).map((hap) => ({
        from: hap.from,
        to: hap.to,
        value: hap.value + (unwrap(value, hap.from, hap.to) - hap.value) * ((hap.from + hap.to) / 2 % 1)
    })))

/**
 * Degrade - randomly replace values with 0 based on a given probability
 * @param probability - number between 0 and 1
 * @example sine().degrade(0.3) // randomly replaces 30% of sine wave values with 0
 */
const degrade = (probability: number = 0.5, pattern: Pattern<any>) => cycle((from, to) => {
    return pattern.query(from, to).map(hap => ({
        from: hap.from,
        to: hap.to,
        value: Math.random() < probability ? 0 : hap.value
    }));
});

// base function for probability based Patterns
const weightedCoin = (probability: number = 0.5) => P((from, to) => ([{from, to, value: Math.random() < probability ? 1 : 0}]));

/**
 * Coin - return an equal distribution of 1s and 0s
 * @example coin()
 */
const coin = () => weightedCoin(0.5);

/**
 * Sometimes - alias for coin
 */
const sometimes = coin

/**
 * Rarely - return mostly 0s, occasionally 1s
 * @example rarely()
 */
const rarely = () => weightedCoin(0.25)

/**
 * Often - return mostly 1s, occasionally 0s
 * @example often()
 */
const often = () => weightedCoin(0.75)

// base function for using logical expressions on Patterns
const compare = (callback: (a: any, b: any) => boolean) => (value: number|Pattern<any>, pattern: Pattern<any>) => cycle((from, to) => 
    pattern.query(from, to).map(hap => ({
        from: hap.from,
        to: hap.to,
        value: callback(hap.value, unwrap(value, hap.from, hap.to)) ? 1 : 0
    })));
/**
 * Compare with a value. If both are truthy, return 1, else 0.
 * @param value - can be a Pattern or a raw value
 * @example coin().and(coin()) // returns 1 when both coins() are truthy
 */
const and = compare((a, b) => a && b)

/**
 * Compare with a value. If one of them is truth, return 1, else 0.
 * @param value - can be a Pattern or a raw value
 * @example coin().or(coin()) // returns 1 when either coin() is truthy
 */
const or = compare((a, b) => a || b)

/**
 * Use XOR to compare values.
 * @param - can be a Pattern or a raw value
 * @example set(1).xor(1) // returns 0
 */
const xor = compare((a, b) => a != b)

// base function for handling Math[operation] patterns
const operate = (operator: string) => (...args: (number|Pattern<any>)[]) => cycle((from, to) => {
    // @ts-ignore
    if(!args.length) return [{from, to, value: Math[operator]()}]
    // otherwise, the last arg will always be the pattern
    const p = args[args.length - 1]
    // @ts-ignore - so we can ignore .ts
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
    fast,
    slow,
    set,
    cat,
    seq,
    choose,
    stack,
    saw, range, ramp, sine, cosine, tri, pulse, square,
    interp,
    degrade,
    coin, 
    rarely, 
    sometimes, 
    often,
    and, or, xor,
    // insert all operators from the Math object
    ...operators.reduce((obj, name) => ({
        ...obj,
        [name]: operate(name)
    }), {})
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

const code = "set(1).xor(1)";
const result = new Function(...Object.keys(methods), `return ${code}`)(...Object.values(methods));
// @ts-ignore
console.log(result.query(0, 1).map(h=>h.value));