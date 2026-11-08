/**
 * Horizontal rail (`[data-rail]`): native horizontal scroll with snap, plus a counter
 * ("01 de 14") and two arrows that move exactly one card. Touch drag and keyboard arrows on the
 * focused viewport are the browser's own. At either end the arrow is aria-disabled (not
 * `disabled`), so keyboard focus is never dropped when it switches off.
 *
 * The rail scrolls its own box, not the page, so it listens to its own (passive, rAF-throttled)
 * scroll events; utils/scroll.js is the channel for page scroll only.
 * Must run after the rail's items are rendered.
 */
import { qs, qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

const EDGE_TOLERANCE_PX = 2;

/** @param {number} value */
const pad = (value) => String(value).padStart(2, '0');

/** @param {HTMLElement} rail */
function setupRail(rail) {
  const viewport = qs('[data-rail-viewport]', rail);
  const head = qs('[data-rail-head]', rail);
  const count = qs('[data-rail-count]', rail);
  const prev = qs('[data-rail-prev]', rail);
  const next = qs('[data-rail-next]', rail);
  if (!viewport || !prev || !next) return;

  const items = qsa('[data-rail-item]', viewport);
  // Empty state (or a single card): nothing to navigate
  if (items.length < 2) {
    head?.setAttribute('hidden', '');
    return;
  }

  /** Width of one card plus the gap: the distance between two consecutive cards. */
  const step = () => items[1].offsetLeft - items[0].offsetLeft;

  /**
   * @param {HTMLElement} button
   * @param {boolean} disabled
   */
  const setDisabled = (button, disabled) => {
    button.setAttribute('aria-disabled', String(disabled));
    button.classList.toggle('is-disabled', disabled);
  };

  let frameId = 0;
  const sync = () => {
    frameId = 0;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const left = viewport.scrollLeft;
    const atStart = left <= EDGE_TOLERANCE_PX;
    const atEnd = left >= max - EDGE_TOLERANCE_PX;
    // The first card in view; at the far end the last one, so the count can reach the total
    const index = atEnd ? items.length : Math.min(items.length, Math.round(left / step()) + 1);

    if (count) count.textContent = `${pad(index)} de ${pad(items.length)}`;
    setDisabled(prev, atStart);
    setDisabled(next, atEnd);
    rail.classList.toggle('is-at-end', atEnd);
  };

  /** @param {number} direction  -1 or 1 */
  const move = (direction) => {
    viewport.scrollBy({
      left: step() * direction,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  prev.addEventListener('click', () => {
    if (prev.getAttribute('aria-disabled') !== 'true') move(-1);
  });
  next.addEventListener('click', () => {
    if (next.getAttribute('aria-disabled') !== 'true') move(1);
  });

  viewport.addEventListener(
    'scroll',
    () => {
      if (!frameId) frameId = requestAnimationFrame(sync);
    },
    { passive: true },
  );
  new ResizeObserver(sync).observe(viewport);
  sync();
}

export function initRails() {
  qsa('[data-rail]').forEach(setupRail);
}
