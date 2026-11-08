/**
 * Magnetic buttons: `[data-magnetic]` elements lean towards the pointer.
 * Writes --magnet-x/--magnet-y, consumed by the CSS `translate` property (independent of
 * `transform`, so it composes with :active scale and parallax). Desktop only, off with reduced motion.
 */
import { qsa } from '../utils/dom.js';
import { watchFinePointer, watchReducedMotion } from '../utils/motion.js';

const STRENGTH = 0.3; // share of the distance from the centre
const MAX_OFFSET_PX = 12;

const clamp = (value) => Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, value));

export function initMagnetic() {
  const nodes = qsa('[data-magnetic]');
  if (!nodes.length) return;

  let finePointer = false;
  let reducedMotion = false;
  let active = false;
  /** @type {WeakMap<Element, DOMRect>} */
  const rects = new WeakMap();

  /** @param {PointerEvent} event */
  const onEnter = (event) => {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    rects.set(node, node.getBoundingClientRect()); // read once per hover, not per move
  };

  /** @param {PointerEvent} event */
  const onMove = (event) => {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const rect = rects.get(node);
    if (!rect) return;
    const x = clamp((event.clientX - (rect.left + rect.width / 2)) * STRENGTH);
    const y = clamp((event.clientY - (rect.top + rect.height / 2)) * STRENGTH);
    node.style.setProperty('--magnet-x', `${x.toFixed(1)}px`);
    node.style.setProperty('--magnet-y', `${y.toFixed(1)}px`);
  };

  /** @param {PointerEvent} event */
  const onLeave = (event) => {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    node.style.removeProperty('--magnet-x');
    node.style.removeProperty('--magnet-y');
  };

  const sync = () => {
    const shouldBeActive = finePointer && !reducedMotion;
    if (shouldBeActive === active) return;
    active = shouldBeActive;
    const method = active ? 'addEventListener' : 'removeEventListener';
    nodes.forEach((node) => {
      node[method]('pointerenter', onEnter);
      node[method]('pointermove', onMove);
      node[method]('pointerleave', onLeave);
      if (!active) {
        node.style.removeProperty('--magnet-x');
        node.style.removeProperty('--magnet-y');
      }
    });
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
