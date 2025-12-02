import { marked } from 'marked';
import 'highlight.js/styles/github-dark.min.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import quickStart from './quick-start';
import streams from './streams';
import patterns from './patterns';
import miniNotation from './mini-notation';
import './style.css';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);

const help = document.getElementById('help')
help && (help.innerHTML = `
<div>
    <h2>Docs</h2>
    <button class="active"><h3>Quick Start</h3></button>
    <button><h3>Stream</h3></button>
    <button><h3>Pattern</h3></button>
    <button><h3>Mini-Notation</h3></button>

    <article id="docs__quick-start">
        ${quickStart}
    </article>
    
    <article id="docs__stream">
        ${streams}
    </article>
    
    <article id="docs__pattern">
        ${patterns}
    </article>
    
    <article id="docs__mini-notation">
        ${marked(miniNotation)}
    </article>
</div>`)
hljs.highlightAll();

// current active article
let article = 'docs__quick-start';
// add event listeners to buttons
document.querySelectorAll('#help button').forEach((button) => {
    button.addEventListener('click', () => {
        const articleId = `docs__${button.textContent?.toLowerCase().replace(' ', '-')}`;
        const previousArticle = document.getElementById(article);
        const nextArticle = document.getElementById(articleId);
        if (previousArticle) previousArticle.style.display = 'none';
        if (nextArticle) nextArticle.style.display = 'block';
        article = articleId;
        // update button styles
        document.querySelectorAll('#help button').forEach((btn) => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    });
});