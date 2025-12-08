/**
 * Code editor setup.
 * If you want to make use of this, add a <div id="editor"></div> to your HTML.
 * Then, listen out for the 'evaluateCode' event to get the code the user has written.
 */
import "prism-code-editor/prism/languages/markup"
import 'prism-code-editor/prism/languages/typescript';

import { editorFromPlaceholder } from 'prism-code-editor';
import { matchBrackets } from 'prism-code-editor/match-brackets';
import { defaultCommands, editHistory } from 'prism-code-editor/commands';
import 'prism-code-editor/languages/clike';

import 'prism-code-editor/layout.css';
import 'prism-code-editor/scrollbar.css';
import 'prism-code-editor/guides.css';
import 'prism-code-editor/invisibles.css';
import 'prism-code-editor/themes/night-owl.css';
import 'prism-code-editor/search.css';

import { preset } from "./preset";

import './style.css'

export const init = (element: string = '#editor') => {
    /**
     * Initialize the code editor in an element with ID 'editor'
     */
    const editor = editorFromPlaceholder(
        element,
        {
            language: 'typescript',
            lineNumbers: false,
            value: localStorage.getItem("satori.code") || preset,
        },
        matchBrackets(),
        defaultCommands(),
        editHistory(),
    );

    /**
     * If a user presses Shift+Enter, fire a custom 'evaluateCode' event
     */
    editor.textarea.addEventListener('keydown', (e) => {
        localStorage.setItem("satori.code", editor.value);

        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("evaluateCode", { detail: { code: editor.value } }));
            return false;
        }
    });
}