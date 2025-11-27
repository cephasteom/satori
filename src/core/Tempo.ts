class Tempo {
    cps: number;
    listeners: Set<Function> = new Set();

    constructor(cps = 0.5) {
        this.cps = cps;
    }

    setcps(cps: number) {
        this.cps = cps;
        this.listeners.forEach(fn => fn(cps));
    }

    onChange(callback: (cps: number) => void) {
        this.listeners.add(callback);
    }

    offChange(callback: Function) {
        this.listeners.delete(callback);
    }
}

export const tempo = new Tempo(1);
