/**
 * Decorative CSS art (masks, backgrounds) downloads as soon as its element is rendered, even far
 * below the fold. Elements marked `data-lazy-art` get `.is-loaded` only when they come within one
 * viewport of the screen; the stylesheet attaches the image under that class.
 */
const LOAD_MARGIN = '100% 0px';

export function initLazyArt() {
  const items = document.querySelectorAll('[data-lazy-art]');
  if (!items.length) return;

  const load = (node) => node.classList.add('is-loaded');

  if (!('IntersectionObserver' in window)) {
    items.forEach(load);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: LOAD_MARGIN },
  );
  items.forEach((node) => observer.observe(node));
}
