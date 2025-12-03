import instruments from './instruments.json'
import { sharedKeys } from './utils';
import { marked } from 'marked';

const getMethods = (json: any[]): Record<string, any> => {
    return json
        // remove items where the name starts with an underscore
        .filter((item) => !item.name.startsWith('_'))
        .reduce((obj, item) => ({
            ...obj,
            [item.name]:
            {
                // @ts-ignore
                description: (item.signatures[0]?.comment?.summary || [])
                    // @ts-ignore
                    .filter((comment) => comment.kind === 'text')
                    // @ts-ignore
                    .reduce((desc, comment) => desc + comment.text, ''),
                // @ts-ignore
                examples: (item.signatures[0]?.comment?.blockTags || [])
                    // @ts-ignore
                    .filter((example) => example.tag === '@example')
                    // @ts-ignore
                    .map((example) => example.content[0]?.text || '')
            }
        }), {} as Record<string, any>);
}

const synthMethods = getMethods(instruments.children[0].children[0]?.children || [])
const samplerMethods = getMethods(instruments.children[2].children[0]?.children || [])
const granularMethods = getMethods(instruments.children[1].children[0]?.children || [])
const acidSynthMethods = getMethods(instruments.children[3].children[0]?.children || [])

const sections = {
    Synth: synthMethods,
    Sampler: samplerMethods,
    Granular: granularMethods,
    AcidSynth: acidSynthMethods
}

const sharedMethods = sharedKeys(...Object.values(sections)).reduce((obj, key) => {
    obj[key] = sections.Synth[key]; // Assuming all sections have the same keys, take from Synth
    return obj;
}, {} as Record<string, any>);

export default `
Sartori includes a default Synth, Sampler, Granular, and AcidSynth instrument. You can set the instrument on a stream using the <code>inst</code> parameter:
${marked(`\`\`\`typescript
s0.set({ inst: 'synth' }) // set synth instrument
s1.set({ inst: 'sampler' }) // set sampler instrument
s2.set({ inst: 'granular' }) // set granular instrument
s3.set({ inst: 'acid' }) // set acid synth instrument
\`\`\``)}
<h3>Shared Parameters</h3>
${Object.entries(sharedMethods).map(([name, info]) => `
    <ul class="help__list">
        <li>
            <h4>${name}</h4>
            <p>${info.description}</p>
            ${info.examples.length > 0 ? `
                ${marked(info.examples.join('\n'))}
            ` : ''}
        </li>
    </ul>
`).join('')}
${Object.entries(sections).map(([instrumentName, methods]) => `
    <h3>${instrumentName}</h3>
    <ul class="help__list">
        ${Object.entries(methods)
            .filter(([name]) => !(name in sharedMethods))
            .map(([name, info]) => `
            <li>
                <h4>${name}</h4>
                <p>${info.description}</p>
                ${info.examples.length > 0 ? `
                    ${marked(info.examples.join('\n'))}
                ` : ''}
            </li>
        `).join('')}
    </ul>
`).join('')}
`