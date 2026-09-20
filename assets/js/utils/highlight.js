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
  typescript: `as async await break case catch class const continue default delete do else enum
    export extends false finally for from function if implements import in instanceof interface
    let new null of private public readonly return static super switch this throw true try type
    typeof undefined var void while yield`,
  // Tag names: the excerpts are structural markup, where a tag name in text content is unlikely
  html: `!doctype html head meta title link script body header nav main section article aside
    footer div span ul ol li a p h1 h2 h3 h4 button form label input img picture video canvas
    svg use figure figcaption pre code dialog template`,
  // At-rules and the functions a token-based stylesheet leans on
  css: `@layer @media @supports @import @font-face @keyframes @property @container var calc clamp
    min max minmax repeat color-mix linear-gradient radial-gradient from to and not only`,
  sql: `SELECT FROM WHERE AND OR NOT IN IS NULL AS ON JOIN LEFT RIGHT INNER OUTER GROUP BY ORDER
    HAVING LIMIT WITH INSERT INTO VALUES UPDATE SET DELETE RETURNING CREATE TABLE INDEX IF EXISTS
    PRIMARY KEY REFERENCES DEFAULT DISTINCT CASE WHEN THEN ELSE END COUNT MAX MIN AVG SUM ROUND
    OVER PARTITION DESC ASC CAST INTERVAL COALESCE`,
};

const C_COMMENTS = String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`;

const COMMENTS = {
  java: C_COMMENTS,
  css: C_COMMENTS,
  html: String.raw`<!--[\s\S]*?-->`,
  javascript: C_COMMENTS,
  typescript: C_COMMENTS,
  python: String.raw`#[^\n]*`,
  sql: String.raw`--[^\n]*`,
  // Free-format "*>" comments and fixed-format comments ("*" in column 7)
  cobol: String.raw`\*>[^\n]*|^[ \d]{6}\*[^\n]*`,
};

const STRING = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'`;
// Python docstrings and multi-line f-strings (tried before the single-line forms)
const TRIPLE_STRING = String.raw`[fFrRbB]?(?:"""[\s\S]*?"""|'''[\s\S]*?''')`;
const NUMBER = String.raw`\b\d+(?:\.\d+)?\b`;

/** Grammars matched case-insensitively. */
const CASE_INSENSITIVE = new Set(['cobol', 'sql', 'html']);

/** Stack → highlighting grammar. */
const LANGUAGE_BY_STACK = { java: 'java', python: 'python', cobol: 'cobol', web: 'javascript' };

/** Every language a code sample may name explicitly (`codeSamples[].language`). */
export const LANGUAGES = Object.keys(KEYWORDS);

/** @type {Map<string, RegExp>} */
const patterns = new Map();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** @param {string} language */
function getPattern(language) {
  if (!patterns.has(language)) {
    const words = KEYWORDS[language].trim().split(/\s+/).map(escapeRegExp).join('|');
    const flags = CASE_INSENSITIVE.has(language) ? 'gim' : 'gm';
    const string = language === 'python' ? `${TRIPLE_STRING}|${STRING}` : STRING;
    patterns.set(
      language,
      new RegExp(
        `(?<comment>${COMMENTS[language]})|(?<string>${string})|(?<keyword>(?<![\\w-])(?:${words})(?![\\w-]))|(?<number>${NUMBER})`,
        flags,
      ),
    );
  }
  return /** @type {RegExp} */ (patterns.get(language));
}

/**
 * @param {string} code
 * @param {'java'|'python'|'cobol'|'web'} stack  grammar used when `language` is not given
 * @param {string} [language]  explicit grammar (see LANGUAGES), e.g. 'sql' inside a Python project
 * @returns {DocumentFragment}
 */
export function highlightCode(code, stack, language) {
  language = KEYWORDS[language] ? language : (LANGUAGE_BY_STACK[stack] ?? 'javascript');
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
