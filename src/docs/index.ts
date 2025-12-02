// TODO: grab comments from the class - e.g. a Stream is x.

import { marked } from 'marked';
import 'highlight.js/styles/github-dark.min.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

import Pattern from './Pattern.json'
import Stream from './Stream.json'
import './style.css';

import miniNotation from './mini-notation';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);

// extract all Pattern methods
const patternMethods: Record<string, any> = (Pattern.children.find((item) => item.name === 'methods')?.type?.declaration?.children || [])
    .reduce((obj, item) => ({
        ...obj,
        [item.name]: {
            description: item.comment?.summary
                .filter((comment) => comment.kind === 'text')
                .reduce((desc, comment) => desc + comment.text, '') || '',
            examples: (item.comment?.blockTags || [])
                .filter((example) => example.tag === '@example')
                .map((example) => example.content[0]?.text || '')
        }
    }), {} as Record<string, any>);

const streamMethods: Record<string, any> = (Stream.children[0]?.children?.filter((item) => ['set'].includes(item.name)) || [])
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

// get element with id 'help
const helpElement = document.getElementById('help');
let currentArticle = 'docs__quick-start';

const renderDocs = (streamMethods: Record<string, any>, patternMethods: Record<string, any>) => {
    // fill with pattern methods
    if (helpElement) {
        helpElement.innerHTML = `<div>
            <h2>Docs</h2>
            <button class="active"><h3>Quick Start</h3></button>
            <button><h3>Stream</h3></button>
            <button><h3>Pattern</h3></button>
            <button><h3>Mini-Notation</h3></button>
            `

            + `
            <article id="docs__quick-start">
            <p>Streams are musical layers, represented by <code>s0</code>, <code>s1</code>, ... <code>s15</code>. Parameters are determined by an object passed to the <code>.set()</code> method.</p>
            <p>Parameter values can be raw:</p>
            ${marked(`\`\`\`typescript
s0.set({ inst: 'synth', note: 60, dur: 0.5 })
\`\`\``)}
            <p>patterns:</p>
            ${marked(`\`\`\`typescript
s1.set({ note: seq(60,62,64,65), dur: sine().add(.25) })
\`\`\``)}   
            <p>or mini-notation:</p>
            ${marked(`\`\`\`typescript
s2.set({ note: 'Ddor%16..' })
\`\`\``)}   
            <p>Trigger an event using <code>.e</code>:</p>
            ${marked(`\`\`\`typescript
s3.set({ ..., e: seq(1,0,1) })
\`\`\``)}
            </article>
            `
            
            + `
            <article id="docs__stream">
                <p>A Stream represents a musical layer. In Sartori, there are 16 instrument streams (s0 to s15) and 4 fx streams (fx0 to fx3).</p>
                <ul class="help__list">
                    ${Object.entries(streamMethods).map(([name, info]) => `
                        <li>
                            <h4>${name}</h4>
                            <p>${info.description}</p>
                            ${info.examples.length > 0 ? `
                                ${marked(info.examples.join('\n'))}
                            ` : ''}
                        </li>
                    `).join('')}
                </ul>
            </article>`
            
            + `
            <article id="docs__pattern">
                <ul class="help__list">
                    ${Object.entries(patternMethods).map(([name, info]) => `
                        <li>
                            <h4>${name}</h4>
                            <p>${info.description}</p>
                            ${info.examples.length > 0 ? `
                                ${marked(info.examples.join('\n'))}
                            ` : ''}
                        </li>
                    `).join('')}
                </ul>
            </article>`

            + `<article id="docs__mini-notation">
                ${marked(miniNotation)}
                </article>`
        + `</div>`;
    }
    hljs.highlightAll();
};

renderDocs(streamMethods, patternMethods);

// add event listeners to buttons
document.querySelectorAll('#help button').forEach((button) => {
    button.addEventListener('click', () => {
        const articleId = `docs__${button.textContent?.toLowerCase().replace(' ', '-')}`;
        const previousArticle = document.getElementById(currentArticle);
        const nextArticle = document.getElementById(articleId);
        if (previousArticle) previousArticle.style.display = 'none';
        if (nextArticle) nextArticle.style.display = 'block';
        currentArticle = articleId;
        // update button styles
        document.querySelectorAll('#help button').forEach((btn) => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    });
});