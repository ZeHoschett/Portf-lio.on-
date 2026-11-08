/** Relative path to the SVG icon sprite (relative to index.html). */
export const ICON_SPRITE = 'assets/icons/sprite.svg';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * querySelector shorthand.
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T | null}
 */
export const qs = (selector, root = document) => root.querySelector(selector);

/**
 * querySelectorAll shorthand that returns a real array.
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T[]}
 */
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/**
 * Creates an element safely. Text always goes through textContent (never innerHTML).
 * Strings passed as children become text nodes.
 *
 * @param {string} tag
 * @param {{
 *   className?: string,
 *   text?: string | number,
 *   attrs?: Record<string, string | number | boolean | null | undefined>,
 *   dataset?: Record<string, string>
 * }} [options]
 * @param {Array<Node | string | null | undefined | false>} [children]
 * @returns {HTMLElement}
 */
export function el(tag, { className, text, attrs, dataset } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value === false || value == null) continue;
      node.setAttribute(name, value === true ? '' : String(value));
    }
  }
  if (dataset) Object.assign(node.dataset, dataset);
  for (const child of children) {
    if (child == null || child === false) continue;
    node.append(child);
  }
  return node;
}

/**
 * Creates a decorative icon that references the sprite (`#icon-<name>`).
 * The control that contains it must provide its own accessible text.
 * @param {string} name  e.g. 'github', 'arrow', 'close'
 * @param {string} [className]
 * @returns {SVGSVGElement}
 */
export function icon(name, className = 'icon') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `${ICON_SPRITE}#icon-${name}`);
  svg.append(use);
  return svg;
}

/**
 * Returns the trimmed URL when it is http(s), mailto or a relative path; '' otherwise.
 * Blocks javascript:, data: and any other unexpected scheme coming from data files.
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeUrl(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed, document.baseURI);
    return SAFE_PROTOCOLS.has(url.protocol) ? trimmed : '';
  } catch {
    return '';
  }
}
