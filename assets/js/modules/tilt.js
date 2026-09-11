/**
 * 3D tilt + cursor-following glow for `[data-tilt]` cards (event delegation, so it also works
 * for cards rendered later). Writes `transform` and `--mx/--my` (glow position).
 * Desktop only (fine pointer), off with reduced motion.
 */
import { watchFinePointer, watchReducedMotion } from '../utils/motion.js';
import { onScrollFrame } from '../utils/scroll.js';

const MAX_TILT_DEG = 6;
const PERSPECTIVE_PX = 900;

export function initTilt() {
  /** @type {HTMLElement | null} */
  let card = null;
  /** @type {DOMRect | null} */
  let rect = null;
  let pointerX = 0;
  let pointerY = 0;
  let frameId = 0;
  let finePointer = false;
  let reducedMotion = false;
  let active = false;

  /** @param {HTMLElement} node */
  const release = (node) => {
    node.classList.remove('is-tilting');
    node.style.removeProperty('transform');
    node.style.removeProperty('--mx');
    node.style.removeProperty('--my');
  };

  const render = () => {
    frameId = 0;
    if (!card) return;
    rect ??= card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (pointerX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (pointerY - rect.top) / rect.height));
    const rotateY = (x - 0.5) * 2 * MAX_TILT_DEG;
    const rotateX = (0.5 - y) * 2 * MAX_TILT_DEG;
    card.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  };

  /** @param {PointerEvent} event */
  const onPointerMove = (event) => {
    const target =
      event.target instanceof Element ? /** @type {HTMLElement | null} */ (event.target.closest('[data-tilt]')) : null;

    if (target !== card) {
      if (card) release(card);
      card = target;
      rect = null;
      card?.classList.add('is-tilting');
    }
    if (!card) return;

    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frameId) frameId = requestAnimationFrame(render);
  };

  const onPointerLeaveWindow = () => {
    if (card) release(card);
    card = null;
  };

  const sync = () => {
    const shouldBeActive = finePointer && !reducedMotion;
    if (shouldBeActive === active) return;
    active = shouldBeActive;

    if (active) {
      document.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeaveWindow);
      return;
    }
    document.removeEventListener('pointermove', onPointerMove);
    document.documentElement.removeEventListener('pointerleave', onPointerLeaveWindow);
    cancelAnimationFrame(frameId);
    frameId = 0;
    onPointerLeaveWindow();
  };

  // Scrolling moves the card under a still pointer: measure again on the next move
  onScrollFrame(() => {
    rect = null;
  });

  watchFinePointer((fine) => {
    finePointer = fine;
    sync();
  });
  watchReducedMotion((reduced) => {
    reducedMotion = reduced;
    sync();
  });
}
