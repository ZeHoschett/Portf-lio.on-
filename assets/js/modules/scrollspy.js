import { onScrollFrame } from '../utils/scroll.js';

const BOTTOM_TOLERANCE_PX = 2;
const BAND_HEIGHT_PERCENT = 1;

/**
 * Highlights the link whose target section crosses an activation line in the viewport.
 * The active link receives `.is-active` and `aria-current="true"`.
 * Reusable: the header navigation and the project stack tabs both use it.
 *
 * @param {Object} options
 * @param {HTMLAnchorElement[]} options.links     in-page anchors (`href="#id"`)
 * @param {number} [options.activationLine]       line position as a viewport-height ratio (0–1)
 * @param {(link: HTMLAnchorElement | null) => void} [options.onChange]
 * @returns {() => void} destroy
 */
export function createScrollspy({ links, activationLine = 0.4, onChange }) {
  const items = links
    .map((link) => ({
      link,
      section: link.hash ? document.getElementById(decodeURIComponent(link.hash.slice(1))) : null,
    }))
    .filter((item) => item.section);

  if (!items.length) return () => {};

  /** @type {Set<Element>} */
  const intersecting = new Set();
  /** @type {(typeof items)[number] | null} */
  let active = null;
  let atBottom = false;

  const setActive = (item) => {
    if (item === active) return;
    if (active) {
      active.link.classList.remove('is-active');
      active.link.removeAttribute('aria-current');
    }
    active = item;
    if (item) {
      item.link.classList.add('is-active');
      item.link.setAttribute('aria-current', 'true');
    }
    onChange?.(item ? item.link : null);
  };

  const update = () => {
    // A short last section may never reach the line: at the very bottom, it wins.
    if (atBottom) {
      setActive(items[items.length - 1]);
      return;
    }
    // At a boundary two sections may touch the line: the later one (already entering) wins.
    const current = items.findLast((item) => intersecting.has(item.section));
    if (current) setActive(current);
  };

  const topPercent = Math.round(activationLine * 100);
  const bottomPercent = 100 - topPercent - BAND_HEIGHT_PERCENT;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) intersecting.add(entry.target);
        else intersecting.delete(entry.target);
      });
      update();
    },
    { rootMargin: `-${topPercent}% 0px -${bottomPercent}% 0px` },
  );

  items.forEach((item) => observer.observe(item.section));

  const unsubscribe = onScrollFrame(({ y, maxScroll }) => {
    const bottom = maxScroll > 0 && y >= maxScroll - BOTTOM_TOLERANCE_PX;
    if (bottom === atBottom) return;
    atBottom = bottom;
    update();
  });

  return () => {
    observer.disconnect();
    unsubscribe();
  };
}
