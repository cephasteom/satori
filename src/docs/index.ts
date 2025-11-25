// TODO: grab comments from the class - e.g. a Stream is x.

import { marked } from 'marked';
import 'highlight.js/styles/github-dark.min.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

import Pattern from './Pattern.json'
import Stream from './Stream.json'
import './style.css';

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

const renderDocs = (streamMethods: Record<string, any>, patternMethods: Record<string, any>) => {
    // fill with pattern methods
    if (helpElement) {
        helpElement.innerHTML = `
            <h2>Docs</h2>
            <h3>Stream</h3>
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
            <h3>Pattern</h3>
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
        `;
    }
    hljs.highlightAll();
};

renderDocs(streamMethods, patternMethods);
