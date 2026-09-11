/**
 * Binds values from config.js to the static HTML through data attributes.
 * The HTML keeps sensible fallback content, so the page is readable even without JS.
 *
 *   data-bind="tagline"            textContent ← config value (only when not empty)
 *   data-bind-src="photo"          src ← config value; data-bind-alt sets the alt at the same time
 *   data-link="whatsapp"           href ← built link; when unavailable:
 *     data-link-fallback="#id"       → points to an in-page anchor instead (drops `download`)
 *     data-link-empty="disable"      → stays visible, aria-disabled, no href
 *     (default)                      → element is removed
 *   data-requires="github"         element is removed when the link is unavailable, unhidden otherwise
 *   data-requires-missing="resume" element is removed when the link IS available
 */
import { config } from '../config.js';
import { sanitizeUrl } from '../utils/dom.js';

const WHATSAPP_NUMBER = /^\d{10,15}$/;

/** @param {unknown} value */
const asText = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Reads a dotted path (e.g. 'whatsapp.number') from the config.
 * @param {string} path
 * @returns {unknown}
 */
const readConfig = (path) =>
  path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), config);

/** @type {Record<string, () => string>} */
const LINK_BUILDERS = {
  email: () => {
    const email = asText(config.email);
    return email ? `mailto:${email}` : '';
  },
  linkedin: () => sanitizeUrl(config.linkedin),
  github: () => sanitizeUrl(config.github),
  resume: () => sanitizeUrl(config.resumeUrl),
  whatsapp: () => {
    const number = asText(config.whatsapp?.number);
    if (!WHATSAPP_NUMBER.test(number)) return '';
    const message = asText(config.whatsapp?.message);
    return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  },
};

/**
 * Builds a contact/resource link from config. Returns '' when it cannot be built.
 * @param {'email'|'linkedin'|'github'|'resume'|'whatsapp'} name
 * @returns {string}
 */
export function getLink(name) {
  const build = LINK_BUILDERS[name];
  return build ? build() : '';
}

/** @param {HTMLElement} node */
function bindLink(node) {
  const href = getLink(/** @type {any} */ (node.dataset.link));

  if (href) {
    node.setAttribute('href', href);
    node.removeAttribute('aria-disabled');
    node.hidden = false;
    return;
  }

  if (node.dataset.linkFallback) {
    node.setAttribute('href', node.dataset.linkFallback);
    node.removeAttribute('download');
    node.removeAttribute('target');
    node.removeAttribute('rel');
    node.hidden = false;
    return;
  }

  if (node.dataset.linkEmpty === 'disable') {
    node.removeAttribute('href');
    node.setAttribute('aria-disabled', 'true');
    node.classList.add('is-disabled');
    node.hidden = false;
    return;
  }

  node.remove();
}

/**
 * Applies every config binding inside `root`.
 * @param {ParentNode} [root]
 */
export function applyConfigBindings(root = document) {
  root.querySelectorAll('[data-requires]').forEach((node) => {
    if (getLink(/** @type {any} */ (node.dataset.requires))) node.hidden = false;
    else node.remove();
  });

  root.querySelectorAll('[data-requires-missing]').forEach((node) => {
    if (getLink(/** @type {any} */ (node.dataset.requiresMissing))) node.remove();
  });

  root.querySelectorAll('[data-bind]').forEach((node) => {
    const value = asText(readConfig(node.dataset.bind));
    if (value) node.textContent = value;
  });

  root.querySelectorAll('[data-bind-src]').forEach((node) => {
    const src = sanitizeUrl(readConfig(node.dataset.bindSrc));
    if (!src) return;
    node.setAttribute('src', src);
    if (node.dataset.bindAlt) node.setAttribute('alt', node.dataset.bindAlt);
  });

  root.querySelectorAll('[data-link]').forEach(bindLink);
}
