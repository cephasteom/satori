const sartori = new BroadcastChannel('sartori');

// https://raw.githubusercontent.com/cephasteom/samples/main/samples.json
// https://raw.githubusercontent.com/cephasteom/samples/main/samples.json
// or https://raw.githubusercontent.com/tidalcycles/dirt-samples/main/strudel.json

// get ?samples= URL parameter
const urlParams = new URLSearchParams(window.location.search);
const samplesParam = urlParams.get('samples');
const samplesURL = samplesParam && decodeURIComponent(samplesParam)

let repos = [
    'https://raw.githubusercontent.com/cephasteom/sartori-samples/main/samples.json' // basic Sartori samples
]

// handle more than one url in the param
samplesURL && (repos = [...repos, ...samplesURL.split(',').map(u => u.trim())])

const result = repos.map(url => 
    fetch(url)
        .then(res => res.json())
        .then((json: Record<string, Array<string>>) => {
            if(!json) return
            
            return Object.entries(json)
                .filter(([bank]) => bank !== '_base')
                .reduce((obj, [bank, samples]: [string, Array<string>]) => ({
                    ...obj,
                    [bank]: [samples].flat().map((sample: string) => `${json._base}${sample}`)
                }), {} as Record<string, Array<string>>);
        })
        .catch(_ => sartori.postMessage({ type: 'error', message: `Couldn't load samples from ${url}` }))
    )
    .reduce(async (all, repo) => {
        const acc = await all;
        const banks = await repo;
        return { ...acc, ...banks };
    }, Promise.resolve({} as Record<string, Array<string>>));

export const samples = await result || {};

if(Object.keys(samples).length > 0) {
    sartori.postMessage({ type: 'success', message: 'Sample banks ->\n' });
    sartori.postMessage({ type: 'info', message: Object.keys(samples).join(',\n') });
} else {
    sartori.postMessage({ type: 'warning', message: 'No sample banks loaded' });
}