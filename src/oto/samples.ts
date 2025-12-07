const sartori = new BroadcastChannel('sartori');

// or https://raw.githubusercontent.com/tidalcycles/dirt-samples/main/strudel.json

export const result = fetch('https://raw.githubusercontent.com/cephasteom/samples/main/samples.json')
    .then(res => res.json())
    .then((json: Record<string, Array<string>>) => {
        if(!json) return
        
        const samplesWithPath = Object.entries(json)
            .reduce((obj, [bank, samples]: [string, Array<string>]) => ({
                ...obj,
                [bank]: [samples].flat().map((sample: string) => `${json._base}${sample}`)
            }), {});

        // delay messages slightly
        setTimeout(() => {
            sartori.postMessage({ type: 'success', message: 'Sample banks ->\n' });
            sartori.postMessage({ type: 'info', message: Object.keys(samplesWithPath).filter(key => key !== '_base').join(',\n') });
        }, 50);
        return samplesWithPath;
    })
    .catch(_ => sartori.postMessage({ type: 'error', message: 'No samples loaded' }));

export const samples = await result || {};