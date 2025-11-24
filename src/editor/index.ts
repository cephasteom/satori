/**
 * Code editor setup.
 * If you want to make use of this, add a <div id="editor"></div> to your HTML.
 * Then, listen out for the 'executeCode' event to get the code the user has written.
 */
import "prism-code-editor/prism/languages/markup"
import 'prism-code-editor/prism/languages/typescript';

import { editorFromPlaceholder } from 'prism-code-editor';
import { matchBrackets } from 'prism-code-editor/match-brackets';
import { indentGuides } from 'prism-code-editor/guides';
import {
  searchWidget,
  highlightSelectionMatches,
  showInvisibles,
} from 'prism-code-editor/search';
import { defaultCommands, editHistory } from 'prism-code-editor/commands';
import { cursorPosition } from 'prism-code-editor/cursor';
import { highlightBracketPairs } from 'prism-code-editor/highlight-brackets';
import 'prism-code-editor/languages/clike';

import 'prism-code-editor/layout.css';
import 'prism-code-editor/scrollbar.css';
import 'prism-code-editor/guides.css';
import 'prism-code-editor/invisibles.css';
import 'prism-code-editor/themes/night-owl.css';
import 'prism-code-editor/search.css';

/**
 * Initialize the code editor in an element with ID 'editor'
 */
export const editor = editorFromPlaceholder(
    '#editor',
    {
        language: 'typescript',
        lineNumbers: false,
    },
    indentGuides(),
    matchBrackets(),
    highlightSelectionMatches(),
    searchWidget(),
    defaultCommands(),
    editHistory(),
    highlightBracketPairs(),
    cursorPosition(),
    showInvisibles()
);

/**
 * If a user presses Shift+Enter, fire a custom 'executeCode' event
 */
editor.textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("executeCode", { detail: { code: editor.value } }));
        return false;
    }
});