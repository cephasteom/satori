import { marked } from 'marked';
import 'highlight.js/styles/github-dark.min.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import quickStart from './quick-start';
import { streamDoc} from './streams';
import { patternDoc } from './patterns';
import miniNotation from './mini-notation';
import { instrumentsDoc } from './instruments';
import effects from './effects';
import midi from './midi';
import { search } from './utils';
import './style.css';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);

const docs = document.querySelector('#docs > div')
let article = 'docs__quick-start';

const render = (searchResults: Record<string, Record<string, any>> = {}) => {
    docs && (docs.innerHTML = `
        <div>
            ${Object.keys(searchResults).length > 0
                ? `<h2>Search Results</h2>
                    ${Object.entries(searchResults).map(([section, items]) => `
                        <h3>${section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                        <ul class="docs__list">
                            ${Object.entries(items).map(([name, info]) => `
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
                : `
                    <h2>Docs</h2>
                    <button class="active"><h3>Quick Start</h3></button>
                    <button><h3>Stream</h3></button>
                    <button><h3>Pattern</h3></button>
                    <button><h3>Mini</h3></button>
                    <button><h3>Instruments</h3></button>
                    <button><h3>Effects</h3></button>
                    <button><h3>MIDI</h3></button>

                    ${Object.entries({
                        ['quick-start']: quickStart,
                        ['stream']: streamDoc,
                        ['pattern']: patternDoc,
                        ['mini']: marked(miniNotation),
                        ['instruments']: instrumentsDoc,
                        ['effects']: effects,
                        ['midi']: marked(midi),
                    }).map(([id, content]) => `
                        <article id="docs__${id}">
                            ${content}
                        </article>
                    `).join('')}
                `}
        </div>`
    )

    hljs.highlightAll();
};

const addButtonEvents = () => {
    // add event listeners to buttons
    document.querySelectorAll('#docs button').forEach((button) => {
        button.addEventListener('click', () => {
            const articleId = `docs__${button.textContent?.toLowerCase().replace(' ', '-')}`;
            const previousArticle = document.getElementById(article);
            const nextArticle = document.getElementById(articleId);
            if (previousArticle) previousArticle.style.display = 'none';
            if (nextArticle) nextArticle.style.display = 'block';
            article = articleId;
            // update button styles
            document.querySelectorAll('#docs button').forEach((btn) => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        });
    });
};

render();
addButtonEvents();

// search functionality
const searchInput = document.getElementById('search') as HTMLInputElement;
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    render(search(query));
    addButtonEvents();
});