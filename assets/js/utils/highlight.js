/**
 * Tiny, safe syntax highlighter for the terminal mockups. Produces text nodes and <span>s
 * (textContent only — never innerHTML), coloured by CSS classes `code__token--{type}`.
 * Deliberately simple: comments, strings, keywords and numbers.
 */
import { el } from './dom.js';

const KEYWORDS = {
  java: `abstract boolean break byte case catch char class continue default do double else enum
    extends final finally float for if implements import instanceof int interface long new null
    package private protected public record return short static super switch this throw throws
    try var void while true false`,
  python: `and as assert async await break class continue def del elif else except False finally
    for from global if import in is lambda None nonlocal not or pass raise return True try while
    with yield self`,
  cobol: `IDENTIFICATION ENVIRONMENT DATA PROCEDURE DIVISION SECTION PROGRAM-ID AUTHOR
    WORKING-STORAGE LINKAGE FILE-CONTROL SELECT ASSIGN FD PIC PICTURE VALUE MOVE TO DISPLAY
    ACCEPT PERFORM UNTIL VARYING FROM BY IF ELSE END-IF EVALUATE WHEN END-EVALUATE COMPUTE ADD
    SUBTRACT MULTIPLY DIVIDE GIVING OPEN CLOSE READ WRITE REWRITE AT END STOP RUN EXEC SQL
    END-EXEC CICS CALL USING COPY`,
  javascript: `async await break case catch class const continue default delete do else export
    extends false finally for from function if import in instanceof let new null of return
    static super switch this throw true try typeof undefined var void while yield`,
};

const COMMENTS = {
  java: String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`,
  javascript: String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`,
  python: String.raw`#[^\n]*`,
  // Free-format "*>" comments and fixed-format comments ("*" in column 7)
  cobol: String.raw`\*>[^\n]*|^[ \d]{6}\*[^\n]*`,
};

const STRING = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'`;
const NUMBER = String.raw`\b\d+(?:\.\d+)?\b`;

/** Stack → highlighting grammar. */
const LANGUAGE_BY_STACK = { java: 'java', python: 'python', cobol: 'cobol', web: 'javascript' };

/** @type {Map<string, RegExp>} */
const patterns = new Map();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** @param {string} language */
function getPattern(language) {
  if (!patterns.has(language)) {
    const words = KEYWORDS[language].trim().split(/\s+/).map(escapeRegExp).join('|');
    const flags = language === 'cobol' ? 'gim' : 'gm';
    patterns.set(
      language,
      new RegExp(
        `(?<comment>${COMMENTS[language]})|(?<string>${STRING})|(?<keyword>(?<![\\w-])(?:${words})(?![\\w-]))|(?<number>${NUMBER})`,
        flags,
      ),
    );
  }
  return /** @type {RegExp} */ (patterns.get(language));
}

/**
 * @param {string} code
 * @param {'java'|'python'|'cobol'|'web'} stack
 * @returns {DocumentFragment}
 */
export function highlightCode(code, stack) {
  const language = LANGUAGE_BY_STACK[stack] ?? 'javascript';
  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const match of code.matchAll(getPattern(language))) {
    const groups = match.groups ?? {};
    const type = Object.keys(groups).find((key) => groups[key] !== undefined) ?? 'text';
    if (match.index > cursor) fragment.append(code.slice(cursor, match.index));
    fragment.append(el('span', { className: `code__token code__token--${type}`, text: match[0] }));
    cursor = match.index + match[0].length;
  }

  fragment.append(code.slice(cursor));
  return fragment;
}
