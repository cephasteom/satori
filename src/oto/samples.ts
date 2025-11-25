const sartori = new BroadcastChannel('sartori');

export const result = fetch('https://raw.githubusercontent.com/tidalcycles/dirt-samples/main/strudel.json')
    .then(res => res.json())
    .then((json: Record<string, Array<string>>) => {
        if(!json) return
        
        const samplesWithPath = Object.entries(json)
            .reduce((obj, [bank, samples]: [string, Array<string>]) => ({
                ...obj,
                [bank]: [samples].flat().map((sample: string) => `https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/${sample}`)
            }), {});

        sartori.postMessage({ type: 'success', message: 'Loaded samples ->\n' });
        sartori.postMessage({ type: 'info', message: Object.keys(samplesWithPath).filter(key => key !== '_base').join(',\n') });
        return samplesWithPath;
    })
    .catch(_ => sartori.postMessage({ type: 'error', message: 'No samples loaded' }));

export const samples = await result || {};