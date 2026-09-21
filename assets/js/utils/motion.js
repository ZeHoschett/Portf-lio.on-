const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const LOW_POWER_CORES = 4;
const LOW_POWER_MEMORY_GB = 4;

/** @returns {boolean} true when the user asked the OS to reduce motion. */
export const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * Subscribes to a media query. The callback runs immediately and on every change.
 * @param {string} query
 * @param {(matches: boolean) => void} callback
 * @returns {() => void} unsubscribe
 */
export function watchMedia(query, callback) {
  const mql = window.matchMedia(query);
  const handler = (event) => callback(event.matches);
  mql.addEventListener('change', handler);
  callback(mql.matches);
  return () => mql.removeEventListener('change', handler);
}

/**
 * @param {(reduced: boolean) => void} callback
 * @returns {() => void} unsubscribe
 */
export const watchReducedMotion = (callback) => watchMedia(REDUCED_MOTION_QUERY, callback);

/**
 * @param {(fine: boolean) => void} callback
 * @returns {() => void} unsubscribe
 */
export const watchFinePointer = (callback) => watchMedia(FINE_POINTER_QUERY, callback);

/**
 * Heuristic used to lower particle/node counts on modest hardware.
 * @returns {boolean}
 */
export function isLowPowerDevice() {
  const cores = navigator.hardwareConcurrency ?? LOW_POWER_CORES * 2;
  const memory = /** @type {any} */ (navigator).deviceMemory ?? LOW_POWER_MEMORY_GB * 2;
  return cores <= LOW_POWER_CORES || memory <= LOW_POWER_MEMORY_GB;
}
