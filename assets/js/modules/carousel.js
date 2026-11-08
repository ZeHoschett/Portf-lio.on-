/**
 * Accessible image carousel.
 * - Native scroll-snap viewport: touch swipe for free, focusable, arrow keys navigate.
 * - Previous/next buttons wrap around (never disabled, so keyboard focus is never lost).
 * - A polite live status ("2 / 3") is updated once scrolling settles (no chatter mid-scroll).
 */
import { el, icon } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

const SETTLE_MS = 120;

/**
 * @typedef {{ src: string, alt: string, width: number, height: number }} CarouselImage
 */

/**
 * @param {CarouselImage[]} images
 * @param {Object} options
 * @param {string} options.label  accessible name of the carousel region
 * @param {(viewport: HTMLElement) => Node} [options.frame]  wraps the viewport (e.g. a phone)
 * @param {string} [options.imageClass]
 * @returns {HTMLElement}
 */
export function createCarousel(
  images,
  { label, frame = (viewport) => viewport, imageClass = 'mockup__image' },
) {
  const total = images.length;

  const viewport = el(
    'ul',
    {
      className: 'carousel__viewport',
      attrs: { role: 'list', tabindex: 0, 'aria-label': 'Imagens (use as setas para navegar)' },
    },
    images.map((image) =>
      el('li', { className: 'carousel__slide' }, [
        el('img', {
          className: imageClass,
          attrs: {
            src: image.src,
            alt: image.alt,
            width: image.width,
            height: image.height,
            loading: 'lazy',
            decoding: 'async',
          },
        }),
      ]),
    ),
  );

  const status = el('p', {
    className: 'carousel__status',
    attrs: { 'aria-live': 'polite', 'aria-atomic': 'true' },
    text: `1 / ${total}`,
  });

  const createButton = (direction, text, iconName) =>
    el('button', { className: `carousel__button carousel__button--${direction}`, attrs: { type: 'button' } }, [
      icon(iconName),
      el('span', { className: 'visually-hidden', text }),
    ]);

  const previous = createButton('prev', 'Imagem anterior', 'chevron-left');
  const next = createButton('next', 'Próxima imagem', 'chevron-right');

  const root = el(
    'div',
    { className: 'carousel', attrs: { role: 'region', 'aria-roledescription': 'carrossel', 'aria-label': label } },
    [frame(viewport), el('div', { className: 'carousel__controls' }, [previous, status, next])],
  );

  let index = 0;

  /** @param {number} target */
  const goTo = (target) => {
    index = (target + total) % total;
    viewport.scrollTo({
      left: index * viewport.clientWidth,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const syncStatus = () => {
    const width = viewport.clientWidth;
    if (!width) return;
    index = Math.round(viewport.scrollLeft / width);
    status.textContent = `${index + 1} / ${total}`;
  };

  let settleTimer = 0;
  viewport.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(syncStatus, SETTLE_MS);
    },
    { passive: true },
  );

  previous.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  viewport.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
  });

  return root;
}
