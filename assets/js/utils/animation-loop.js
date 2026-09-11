const MAX_FRAME_MS = 50; // clamp long frames (tab switches, jank) so motion never jumps
const VIEWPORT_MARGIN = '80px';
const IDLE_TIMEOUT_MS = 1500;

/**
 * @typedef {Object} AnimationLoop
 * @property {(enabled: boolean) => void} setEnabled  e.g. false with prefers-reduced-motion
 * @property {() => boolean} isRunning
 * @property {() => void} destroy
 */

/**
 * requestAnimationFrame loop that only runs while `target` is on screen (IntersectionObserver)
 * and the tab is visible. `elapsed` only advances while running, so motion resumes smoothly.
 *
 * @param {Object} options
 * @param {Element} options.target
 * @param {(elapsed: number, delta: number) => void} options.onFrame  times in ms
 * @returns {AnimationLoop}
 */
export function createAnimationLoop({ target, onFrame }) {
  let inView = false;
  let pageVisible = !document.hidden;
  let enabled = true;
  let frameId = 0;
  let lastTime = 0;
  let elapsed = 0;

  const tick = (now) => {
    const delta = lastTime ? Math.min(now - lastTime, MAX_FRAME_MS) : 0;
    lastTime = now;
    elapsed += delta;
    onFrame(elapsed, delta);
    frameId = requestAnimationFrame(tick);
  };

  const sync = () => {
    const shouldRun = enabled && inView && pageVisible;
    if (shouldRun && !frameId) {
      lastTime = 0;
      frameId = requestAnimationFrame(tick);
    } else if (!shouldRun && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    },
    { rootMargin: VIEWPORT_MARGIN },
  );
  observer.observe(target);

  const onVisibilityChange = () => {
    pageVisible = !document.hidden;
    sync();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    setEnabled(value) {
      enabled = value;
      sync();
    },
    isRunning: () => frameId !== 0,
    destroy() {
      enabled = false;
      sync();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}

/**
 * Runs a callback when the main thread is idle (fallback: next macrotask), so decorative work
 * never competes with the first render.
 * @param {() => void} callback
 */
export function whenIdle(callback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => callback(), { timeout: IDLE_TIMEOUT_MS });
  } else {
    window.setTimeout(callback, 1);
  }
}
