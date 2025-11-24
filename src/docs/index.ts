import { marked } from 'marked';
import Pattern from './Pattern.json'
import './style.css';

// extract all Pattern methods
const patternMethods = (Pattern.children.find((item) => item.name === 'methods')?.type?.declaration?.children || [])
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

console.log(patternMethods);

// get element with id 'help
const helpElement = document.getElementById('help');

// fill with pattern methods
if (helpElement) {
    helpElement.innerHTML = `
        <h2>Pattern</h2>
        <ul class="help__list">
            ${Object.entries(patternMethods).map(([name, info]) => `
                <li>
                    <h3>${name}</h3>
                    <p>${info.description}</p>
                    ${info.examples.length > 0 ? `
                        ${marked(info.examples.join('\n'))}
                    ` : ''}
                </li>
            `).join('')}
        </ul>
    `;
}

                            