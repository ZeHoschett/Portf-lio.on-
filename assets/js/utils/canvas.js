const DEFAULT_MAX_DPR = 2;
const RESIZE_DEBOUNCE_MS = 120;

/**
 * @typedef {Object} CanvasSurface
 * @property {CanvasRenderingContext2D} ctx
 * @property {number} width   size in CSS pixels (draw in these units)
 * @property {number} height
 * @property {number} dpr     device pixel ratio in use (capped)
 * @property {() => void} destroy
 */

/**
 * Sizes a canvas to its CSS box × devicePixelRatio (capped) and keeps it in sync through a
 * debounced ResizeObserver. `onResize` runs after every (re)size — redraw there if paused.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ maxDpr?: number, onResize?: (surface: CanvasSurface) => void }} [options]
 * @returns {CanvasSurface}
 */
export function setupCanvas(canvas, { maxDpr = DEFAULT_MAX_DPR, onResize } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available.');

  let timer = 0;
  const observer = new ResizeObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(apply, RESIZE_DEBOUNCE_MS);
  });

  /** @type {CanvasSurface} */
  const surface = {
    ctx,
    width: 0,
    height: 0,
    dpr: 1,
    destroy() {
      observer.disconnect();
      window.clearTimeout(timer);
    },
  };

  function apply() {
    // clientWidth/Height ignore CSS transforms (parallax), unlike getBoundingClientRect
    const width = Math.max(1, Math.round(canvas.clientWidth));
    const height = Math.max(1, Math.round(canvas.clientHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    // Assigning canvas.width clears the bitmap, so only do it when something changed
    if (width !== surface.width || height !== surface.height || dpr !== surface.dpr) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      Object.assign(surface, { width, height, dpr });
    }
    onResize?.(surface);
  }

  apply();
  observer.observe(canvas);
  return surface;
}

/**
 * Reads a CSS custom property from :root (e.g. a color token), already resolved.
 * @param {string} name  e.g. '--color-accent'
 * @returns {string}
 */
export const readCssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Converts a hex color (#rgb or #rrggbb) to an rgba() string.
 * @param {string} hex
 * @param {number} alpha  0–1
 * @returns {string}
 */
export function withAlpha(hex, alpha) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((char) => char + char).join('') : value;
  const int = Number.parseInt(full, 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
}
