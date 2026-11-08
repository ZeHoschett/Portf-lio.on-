/**
 * "Copy e-mail" buttons (`[data-copy-email]`): Clipboard API with a legacy fallback, a short
 * icon change on the button and a toast. The e-mail itself always comes from config.js.
 */
import { config } from '../config.js';
import { ICON_SPRITE, qs, qsa } from '../utils/dom.js';
import { showToast } from './toast.js';

const FEEDBACK_MS = 2000;
const MESSAGES = {
  success: 'E-mail copiado!',
  error: 'Não foi possível copiar. Use o link do e-mail.',
};

/**
 * Fallback for browsers without the async Clipboard API (or when it is blocked).
 * @param {string} value
 * @returns {boolean}
 */
function copyWithSelection(value) {
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

/**
 * Copies text to the clipboard.
 * @param {string} value
 * @returns {Promise<boolean>} whether it worked
 */
export async function copyText(value) {
  if (!value) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Permission denied or a non-secure context: try the legacy path
  }
  return copyWithSelection(value);
}

/**
 * Swaps the button icon to a check mark for a moment.
 * @param {HTMLElement} button
 */
function flashConfirmation(button) {
  const use = qs('use', button);
  if (!use) return;
  use.setAttribute('href', `${ICON_SPRITE}#icon-check`);
  button.classList.add('is-copied');
  window.setTimeout(() => {
    use.setAttribute('href', `${ICON_SPRITE}#icon-copy`);
    button.classList.remove('is-copied');
  }, FEEDBACK_MS);
}

/** Wires every copy-e-mail button on the page. */
export function initClipboard() {
  const email = typeof config.email === 'string' ? config.email.trim() : '';
  const buttons = qsa('[data-copy-email]');
  if (!buttons.length) return;

  // Nothing to copy: the button would be a dead control
  if (!email) {
    buttons.forEach((button) => button.remove());
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const copied = await copyText(email);
      if (copied) flashConfirmation(button);
      showToast(copied ? MESSAGES.success : MESSAGES.error, { variant: copied ? 'success' : 'error' });
    });
  });
}
