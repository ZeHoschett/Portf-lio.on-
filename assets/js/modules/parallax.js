/**
 * Transform-only parallax.
 *
 *   data-parallax="0.3"        translateY = scrollY × speed while its <section> is on screen
 *                              (positive = slower than the page, negative = faster)
 *   data-parallax-mouse="14"   follows the pointer by up to ±14px (fine pointers only)
 *
 * Never put both attributes on the same element (both write `transform`); nest instead.
 * CSS entrance animations on these elements must use `translate`/`scale`, not `transform`.
 * Disabled with prefers-reduced-motion.
 */
import { qsa } from '../utils/dom.js';
import { watchFinePointer, watchReducedMotion } from '../utils/motion.js';
import { onScrollFrame } from '../utils/scroll.js';

const MOUSE_EASING = 0.08;
const MOUSE_SETTLE = 0.001;

export function initParallax() {
  const scrollLayers = qsa('[data-parallax]').map((node) => ({
    node,
    speed: Number(node.dataset.parallax) || 0,
    limit: Infinity,
    value: '',
  }));
  const mouseLayers = qsa('[data-parallax-mouse]').map((node) => ({
    node,
    amount: Number(node.dataset.parallaxMouse) || 0,
  }));

  if (!scrollLayers.length && !mouseLayers.length) return;

  let reducedMotion = false;
  let finePointer = false;

  // ---------- Scroll ----------
  /** Scroll position after which the layer's section has left the viewport. */
  const measureLimits = () => {
    scrollLayers.forEach((layer) => {
      const section = layer.node.closest('section');
      layer.limit = section ? section.getBoundingClientRect().bottom + window.scrollY : Infinity;
    });
  };

  const resetScroll = () => {
    scrollLayers.forEach((layer) => {
      layer.node.style.transform = '';
      layer.value = '';
    });
  };

  const applyScroll = ({ y }) => {
    if (reducedMotion) return;
    for (const layer of scrollLayers) {
      if (y > layer.limit) continue; // section is off screen: keep the last transform
      const value = `translate3d(0, ${(y * layer.speed).toFixed(2)}px, 0)`;
      if (value === layer.value) continue;
      layer.value = value;
      layer.node.style.transform = value;
    }
  };

  measureLimits();
  new ResizeObserver(measureLimits).observe(document.body);

  // ---------- Pointer ----------
  const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
  let frameId = 0;

  const renderMouse = () => {
    pointer.currentX += (pointer.x - pointer.currentX) * MOUSE_EASING;
    pointer.currentY += (pointer.y - pointer.currentY) * MOUSE_EASING;
    mouseLayers.forEach(({ node, amount }) => {
      node.style.transform = `translate3d(${(pointer.currentX * amount).toFixed(2)}px, ${(pointer.currentY * amount).toFixed(2)}px, 0)`;
    });
    const settled =
      Math.abs(pointer.x - pointer.currentX) < MOUSE_SETTLE &&
      Math.abs(pointer.y - pointer.currentY) < MOUSE_SETTLE;
    frameId = settled ? 0 : requestAnimationFrame(renderMouse);
  };

  /** @param {PointerEvent} event */
  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    if (!frameId) frameId = requestAnimationFrame(renderMouse);
  };

  const syncPointer = () => {
    const active = finePointer && !reducedMotion && mouseLayers.length > 0;
    if (active) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      return;
    }
    window.removeEventListener('pointermove', onPointerMove);
    cancelAnimationFrame(frameId);
    frameId = 0;
    Object.assign(pointer, { x: 0, y: 0, currentX: 0, currentY: 0 });
    mouseLayers.forEach(({ node }) => {
      node.style.transform = '';
    });
  };

  watchReducedMotion((reduced) => {
    reducedMotion = reduced;
    if (reduced) resetScroll();
    syncPointer();
  });
  watchFinePointer((fine) => {
    finePointer = fine;
    syncPointer();
  });

  onScrollFrame(applyScroll);
}
