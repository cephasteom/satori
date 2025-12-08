import { marked } from 'marked';
import fx from './fx.json'

const getMethods = (json: any[]): Record<string, any> => {
    return json
        .filter((item) => !item.name.startsWith('_') && !['defaults'].includes(item.name))
        .reduce((obj, item) => ({
            ...obj,
            [item.name]:
            {
                description: (item.signatures[0]?.comment?.summary || [])
                    .filter((comment: Record<string, string>) => comment.kind === 'text')
                    .reduce((desc: string, comment: Record<string, string>) => desc + comment.text, ''),
                examples: (item.signatures[0]?.comment?.blockTags || [])
                    .filter((example: Record<string, string>) => example.tag === '@example')
                    .map((example: Record<string, string[]>) => example.content[0]?.text || '')
            }
        }), {} as Record<string, any>);
}

const delayMethods = getMethods(fx.children[0].children[0]?.children || [])
const reverbMethods = getMethods(fx.children[2].children[0]?.children || [])
const fxChannelMethods = getMethods(fx.children[1].children[0]?.children || [])

export const effects = {
    FXChannel: fxChannelMethods,
    Delay: delayMethods,
    Reverb: reverbMethods,
}

export default `
Satori includes filters and effects that can be applied to each stream's output, or used on a separate effect stream. Effects remain inactive until their wet/dry parameters are set to a value greater than 0. 
${marked(`\`\`\`typescript
s0.set({ reverb: 0.5 }) // set reverb effect on stream 0
s1.set({ delay: 0.3 }) // set delay effect on stream 1
s2.set({ fx0: 0.5 }) // route s2 to fx0 effect stream
fx0.set({ delay: 0.7, reverb: 0.4, e: '1*16' }) // set delay and reverb on effect stream fx0
\`\`\``)}
${Object.entries(effects).map(([name, methods]) => `
    <h3>${name}</h3>
    <ul class="docs__list">
        ${Object.entries(methods)
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