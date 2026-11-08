import { qs } from '../utils/dom.js';
import { onScrollFrame } from '../utils/scroll.js';

/** Thin reading-progress bar at the top of the page (transform-only updates). */
export function initScrollProgress() {
  const bar = qs('[data-scroll-progress] .scroll-progress__bar');
  if (!bar) return;

  let lastValue = '';

  onScrollFrame(({ y, maxScroll }) => {
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
    const value = `scaleX(${progress.toFixed(4)})`;
    if (value === lastValue) return;
    lastValue = value;
    bar.style.transform = value;
  });
}
