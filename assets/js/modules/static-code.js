/**
 * Syntax highlighting for code written straight into the HTML (`<pre data-highlight="cobol">`),
 * e.g. the .CBL program of the COBOL panel. The text stays exactly the same: it is only split
 * into token <span>s (textContent, never innerHTML), and a line-number gutter is added unless the
 * code numbers its own lines. Without JS the plain program is still there.
 */
import { el, qsa } from '../utils/dom.js';
import { highlightCode, lineNumbers } from '../utils/highlight.js';

export function initStaticCode() {
  qsa('pre[data-highlight]').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;
    const source = code.textContent ?? '';
    const language = pre.dataset.highlight ?? '';

    code.replaceChildren(highlightCode(source, /** @type {any} */ (language), language));

    const numbers = lineNumbers(source);
    if (!numbers) return;
    pre.classList.add('code--numbered');
    pre.prepend(el('span', { className: 'code__gutter', text: numbers, attrs: { 'aria-hidden': 'true' } }));
  });
}
