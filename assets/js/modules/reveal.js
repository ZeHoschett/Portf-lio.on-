/**
 * Scroll reveal: `[data-reveal]` elements fade in, rise and sharpen when they enter the viewport.
 *
 * - Only elements OFF screen at startup are hidden, so nothing already visible flashes
 *   (deep links included: the landing position of #fragment is predicted).
 * - Elements entering together (e.g. a grid row) are staggered in DOM order.
 * - Classes are removed once the entrance ends, so components keep their own transitions.
 * - Does nothing with prefers-reduced-motion (content simply stays visible).
 */
import { qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

const STAGGER_MS = 80;
const ROOT_MARGIN = '0px 0px -8% 0px';

/** @param {HTMLElement} node */
function cleanUp(node) {
  node.classList.remove('reveal', 'is-revealed');
  node.style.removeProperty('--reveal-delay');
}

/**
 * The part of the page (in current viewport coordinates) that will be on screen once loading
 * settles. With a deep link (#contato) the browser may scroll to the fragment only after this
 * module runs, so predict where it will land instead of trusting scrollY = 0.
 * @returns {{ top: number, bottom: number }}
 */
function getInitialWindow() {
  const viewportHeight = window.innerHeight;
  let target = null;
  try {
    target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  } catch {
    target = null; // malformed hash: fall back to the current viewport
  }

  if (!target || window.scrollY !== 0) return { top: 0, bottom: viewportHeight };

  const root = document.documentElement;
  const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  const maxScroll = Math.max(0, root.scrollHeight - viewportHeight);
  const top = Math.min(Math.max(0, target.getBoundingClientRect().top - padding), maxScroll);
  return { top, bottom: top + viewportHeight };
}

export function initReveal() {
  if (prefersReducedMotion()) return;

  const nodes = qsa('[data-reveal]');
  if (!nodes.length) return;

  // Read every position first, then write (no layout thrashing)
  const initialWindow = getInitialWindow();
  const offScreen = nodes.filter((node) => {
    const rect = node.getBoundingClientRect();
    return rect.top >= initialWindow.bottom || rect.bottom <= initialWindow.top;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
      entering.forEach((node, index) => {
        observer.unobserve(node);
        node.style.setProperty('--reveal-delay', `${index * STAGGER_MS}ms`);
        node.addEventListener('transitionend', function onEnd(event) {
          // transitionend bubbles from children and fires once per property
          if (event.target !== node || event.propertyName !== 'opacity') return;
          node.removeEventListener('transitionend', onEnd);
          cleanUp(node);
        });
        node.classList.add('is-revealed');
      });
    },
    { rootMargin: ROOT_MARGIN },
  );

  offScreen.forEach((node) => {
    node.classList.add('reveal');
    observer.observe(node);
  });
}
