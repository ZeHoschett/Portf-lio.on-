/**
 * Shared scroll channel: a single passive listener and a single read of the scroll metrics per
 * animation frame for every subscriber (header state, progress bar, scrollspy, parallax…).
 * Subscribers only write; layout is read here, once, so there is no layout thrashing.
 */

/**
 * @typedef {Object} ScrollMetrics
 * @property {number} y               current window.scrollY
 * @property {number} viewportHeight  window.innerHeight
 * @property {number} maxScroll       document height minus viewport height (>= 0)
 */

/** @type {Set<(metrics: ScrollMetrics) => void>} */
const subscribers = new Set();

/** @type {ScrollMetrics} */
const metrics = { y: 0, viewportHeight: 0, maxScroll: 0 };

let initialised = false;
let frameRequested = false;
let layoutDirty = true;

function measure() {
  if (layoutDirty) {
    metrics.viewportHeight = window.innerHeight;
    metrics.maxScroll = Math.max(0, document.documentElement.scrollHeight - metrics.viewportHeight);
    layoutDirty = false;
  }
  metrics.y = window.scrollY;
}

function flush() {
  frameRequested = false;
  measure();
  subscribers.forEach((callback) => callback(metrics));
}

function requestFlush() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(flush);
}

function invalidateLayout() {
  layoutDirty = true;
  requestFlush();
}

function init() {
  initialised = true;
  window.addEventListener('scroll', requestFlush, { passive: true });
  window.addEventListener('resize', invalidateLayout, { passive: true });
  // Page height changes (images, fonts, rendered data) also change maxScroll
  new ResizeObserver(invalidateLayout).observe(document.body);
  measure();
}

/**
 * Subscribes to scroll updates (rAF-throttled). The callback also runs immediately.
 * @param {(metrics: ScrollMetrics) => void} callback  must not read layout; only write
 * @returns {() => void} unsubscribe
 */
export function onScrollFrame(callback) {
  if (!initialised) init();
  subscribers.add(callback);
  callback(metrics);
  return () => subscribers.delete(callback);
}
