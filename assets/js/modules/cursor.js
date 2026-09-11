/**
 * Soft light that follows the mouse with easing. Desktop only (fine pointer), off with
 * reduced motion. The rAF loop runs only while the glow is catching up with the pointer.
 */
import { el } from '../utils/dom.js';
import { watchFinePointer, watchReducedMotion } from '../utils/motion.js';

const EASING = 0.14;
const SETTLE_PX = 0.2;

export function initCursorGlow() {
  const glow = el('div', { className: 'cursor-glow', attrs: { 'aria-hidden': 'true' } });
  const position = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let finePointer = false;
  let reducedMotion = false;
  let active = false;
  let hasPosition = false;
  let frameId = 0;

  const render = () => {
    position.x += (position.targetX - position.x) * EASING;
    position.y += (position.targetY - position.y) * EASING;
    glow.style.transform = `translate3d(${position.x.toFixed(1)}px, ${position.y.toFixed(1)}px, 0)`;
    const settled =
      Math.abs(position.targetX - position.x) < SETTLE_PX &&
      Math.abs(position.targetY - position.y) < SETTLE_PX;
    frameId = settled ? 0 : requestAnimationFrame(render);
  };

  /** @param {PointerEvent} event */
  const onPointerMove = (event) => {
    position.targetX = event.clientX;
    position.targetY = event.clientY;
    if (!hasPosition) {
      // First move: appear under the cursor instead of flying in from the corner
      position.x = event.clientX;
      position.y = event.clientY;
      hasPosition = true;
    }
    glow.classList.add('is-visible');
    if (!frameId) frameId = requestAnimationFrame(render);
  };

  /** @param {PointerEvent} event */
  const onPointerOut = (event) => {
    if (!event.relatedTarget) glow.classList.remove('is-visible');
  };

  const sync = () => {
    const shouldBeActive = finePointer && !reducedMotion;
    if (shouldBeActive === active) return;
    active = shouldBeActive;

    if (active) {
      document.body.append(glow);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerout', onPointerOut);
      return;
    }

    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerout', onPointerOut);
    cancelAnimationFrame(frameId);
    frameId = 0;
    hasPosition = false;
    glow.classList.remove('is-visible');
    glow.remove();
  };

  watchFinePointer((fine) => {
    finePointer = fine;
    sync();
  });
  watchReducedMotion((reduced) => {
    reducedMotion = reduced;
    sync();
  });
}
