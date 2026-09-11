/**
 * Infinite marquee: each `.marquee__track` gets enough copies of its items to cover the row,
 * then the whole set is duplicated so a CSS `translate` from 0 to -50% loops seamlessly.
 * Speed is constant in px/s whatever the width. Paused off screen (and on hover, via CSS).
 * The marquee is decorative (aria-hidden); the same technologies are listed accessibly elsewhere.
 */
import { qsa } from '../utils/dom.js';

const SPEED_PX_PER_SECOND = 60;
const RESIZE_DEBOUNCE_MS = 150;

/** @param {HTMLElement} marquee */
function setupMarquee(marquee) {
  const tracks = qsa('.marquee__track', marquee);
  const originals = tracks.map((track) => [...track.children]);
  let lastRowWidth = 0;

  const build = () => {
    const rowWidth = marquee.clientWidth;
    if (!rowWidth || rowWidth === lastRowWidth) return;
    lastRowWidth = rowWidth;

    tracks.forEach((track, index) => {
      const items = originals[index];
      track.replaceChildren(...items);
      const setWidth = track.scrollWidth;
      if (!setWidth) return;

      // One half must be at least as wide as the row, otherwise a gap shows before the loop
      const copies = Math.max(1, Math.ceil(rowWidth / setWidth));
      const half = [];
      for (let copy = 0; copy < copies; copy++) {
        items.forEach((item) => half.push(copy === 0 ? item : item.cloneNode(true)));
      }
      track.replaceChildren(...half, ...half.map((item) => item.cloneNode(true)));
      track.style.setProperty(
        '--marquee-duration',
        `${((setWidth * copies) / SPEED_PX_PER_SECOND).toFixed(2)}s`,
      );
    });
  };

  build();
  document.fonts?.ready.then(() => {
    lastRowWidth = 0; // the font changes the text width: force a rebuild
    build();
  });

  let timer = 0;
  new ResizeObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(build, RESIZE_DEBOUNCE_MS);
  }).observe(marquee);

  new IntersectionObserver((entries) => {
    marquee.classList.toggle('is-paused', !entries[entries.length - 1].isIntersecting);
  }).observe(marquee);
}

export function initMarquee() {
  qsa('[data-marquee]').forEach(setupMarquee);
}
