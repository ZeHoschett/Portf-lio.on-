/**
 * Toast messages shown in the page's live region (`[data-toast-region]`, role="status").
 * One toast at a time: a new message replaces the previous one, so the announcement is never
 * a pile of stale text. Purely additive — the site works if the region is missing.
 */
import { el, icon, qs } from '../utils/dom.js';

const VISIBLE_MS = 3200;
const EXIT_MS = 320; // slightly above --dur-base, so the node leaves after its transition
const ICONS = { success: 'check', error: 'close' };

let hideTimer = 0;
let removeTimer = 0;

/**
 * Shows a message. Replaces any toast currently on screen.
 * @param {string} message
 * @param {{ variant?: 'success' | 'error' }} [options]
 */
export function showToast(message, { variant = 'success' } = {}) {
  const region = qs('[data-toast-region]');
  if (!region) return;

  window.clearTimeout(hideTimer);
  window.clearTimeout(removeTimer);

  const toast = el('div', { className: `toast toast--${variant}` }, [
    icon(ICONS[variant] ?? ICONS.success),
    el('span', { text: message }),
  ]);
  region.replaceChildren(toast);

  // Enter on the next frame: the element must be painted hidden first
  requestAnimationFrame(() => toast.classList.add('is-visible'));

  hideTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    removeTimer = window.setTimeout(() => toast.remove(), EXIT_MS);
  }, VISIBLE_MS);
}
