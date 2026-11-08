/**
 * Specular highlight: a soft light that follows the pointer over glass and solid surfaces.
 * Writes `--mx/--my` (percentages) on the hovered surface; the CSS `::after` draws the light.
 * Event delegation, so it also works for cards rendered later. No transform: the surface only
 * lifts through CSS. Fine pointer only, off with reduced motion.
 */
import { watchFinePointer, watchReducedMotion } from '../utils/motion.js';
import { onScrollFrame } from '../utils/scroll.js';

const SELECTOR = '.surface-glass, .surface-solid, [data-specular]';

export function initSpecular() {
  /** @type {HTMLElement | null} */
  let surface = null;
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
    node.style.removeProperty('--mx');
    node.style.removeProperty('--my');
  };

  const render = () => {
    frameId = 0;
    if (!surface) return;
    rect ??= surface.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (pointerX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (pointerY - rect.top) / rect.height));
    surface.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    surface.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  };

  /** @param {PointerEvent} event */
  const onPointerMove = (event) => {
    const target =
      event.target instanceof Element ? /** @type {HTMLElement | null} */ (event.target.closest(SELECTOR)) : null;

    if (target !== surface) {
      if (surface) release(surface);
      surface = target;
      rect = null;
    }
    if (!surface) return;

    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frameId) frameId = requestAnimationFrame(render);
  };

  const onPointerLeaveWindow = () => {
    if (surface) release(surface);
    surface = null;
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

  // Scrolling moves the surface under a still pointer: measure again on the next move
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
