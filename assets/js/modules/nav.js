/**
 * Site header: glass state on scroll, desktop active-link indicator (scrollspy) and the
 * accessible mobile menu (aria-expanded, focus trap, Esc, scroll lock, inert background).
 * Smooth scrolling itself is CSS (`scroll-behavior`), disabled with reduced motion.
 */
import { el, qs, qsa } from '../utils/dom.js';
import { watchMedia } from '../utils/motion.js';
import { onScrollFrame } from '../utils/scroll.js';
import { createScrollspy } from './scrollspy.js';

const SCROLLED_THRESHOLD_PX = 40;
const DESKTOP_QUERY = '(min-width: 1280px)';
const LABELS = { open: 'Abrir menu', close: 'Fechar menu' };

/**
 * Sliding underline that follows the active desktop link.
 * @param {HTMLElement} menu
 * @param {HTMLAnchorElement[]} links
 */
function initIndicator(menu, links) {
  const indicator = el('span', { className: 'site-nav__indicator', attrs: { 'aria-hidden': 'true' } });
  menu.append(indicator);

  /** @type {HTMLAnchorElement | null} */
  let activeLink = null;

  const place = () => {
    const baseWidth = indicator.offsetWidth;
    if (!activeLink || !baseWidth) {
      indicator.classList.remove('is-visible');
      return;
    }
    const style = getComputedStyle(activeLink);
    const paddingLeft = parseFloat(style.paddingLeft);
    const textWidth = activeLink.offsetWidth - paddingLeft - parseFloat(style.paddingRight);

    indicator.style.setProperty('--indicator-x', `${activeLink.offsetLeft + paddingLeft}px`);
    indicator.style.setProperty('--indicator-scale', String(textWidth / baseWidth));

    if (!indicator.classList.contains('is-visible')) {
      indicator.classList.add('is-visible');
      // Enable the slide only after the first placement (no sweep in from the left on load)
      requestAnimationFrame(() => indicator.classList.add('is-animated'));
    }
  };

  createScrollspy({
    links,
    onChange: (link) => {
      activeLink = link;
      place();
    },
  });

  new ResizeObserver(place).observe(menu);
  document.fonts?.ready.then(place);
}

/**
 * @param {Object} parts
 * @param {HTMLElement} parts.header
 * @param {HTMLElement} parts.menu
 * @param {HTMLButtonElement} parts.toggle
 * @param {HTMLElement | null} parts.label
 * @param {HTMLAnchorElement[]} parts.links
 */
function initMobileMenu({ header, menu, toggle, label, links }) {
  const root = document.documentElement;
  let isOpen = false;
  /** @type {HTMLElement[]} */
  let inertElements = [];

  // Cascade index for the entrance animation; the CTA block enters after the links
  links.forEach((link, index) => link.parentElement?.style.setProperty('--i', String(index)));
  qs('[data-nav-actions]', menu)?.style.setProperty('--i', String(links.length));

  /** Everything focusable inside the overlay (links + CTAs), in DOM order, plus the toggle. */
  const getFocusables = () => [...qsa('a[href], button', menu), toggle];

  /** Everything except the menu and its toggle becomes inert while the menu is open. */
  const getBackground = () => {
    const outsideHeader = [...document.body.children].filter((node) => node !== header);
    const insideHeader = [...toggle.parentElement.children].filter(
      (node) => node !== toggle && !node.contains(menu),
    );
    return /** @type {HTMLElement[]} */ ([...outsideHeader, ...insideHeader]);
  };

  /** @param {KeyboardEvent} event */
  const onKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, { restoreFocus: true });
      return;
    }
    if (event.key !== 'Tab') return;

    const focusables = getFocusables();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /**
   * @param {boolean} open
   * @param {{ restoreFocus?: boolean }} [options]
   */
  function setOpen(open, { restoreFocus = false } = {}) {
    if (open === isOpen) return;
    isOpen = open;

    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? LABELS.close : LABELS.open;
    header.classList.toggle('is-menu-open', open);
    root.classList.toggle('is-scroll-locked', open);

    if (open) {
      inertElements = getBackground();
      inertElements.forEach((node) => {
        node.inert = true;
      });
      document.addEventListener('keydown', onKeydown);
      return;
    }

    inertElements.forEach((node) => {
      node.inert = false;
    });
    inertElements = [];
    document.removeEventListener('keydown', onKeydown);
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(!isOpen));
  // Closing synchronously lifts the scroll lock before the browser follows the anchor.
  // Every anchor in the overlay closes it, CTAs included.
  qsa('a[href]', menu).forEach((link) => link.addEventListener('click', () => setOpen(false)));
  watchMedia(DESKTOP_QUERY, (isDesktop) => {
    if (isDesktop) setOpen(false);
  });
}

/** Initialises the header, its navigation and the mobile menu. */
export function initNav() {
  const header = qs('[data-header]');
  if (!header) return;

  onScrollFrame(({ y }) => header.classList.toggle('is-scrolled', y > SCROLLED_THRESHOLD_PX));

  const menu = qs('[data-nav-menu]', header);
  const toggle = qs('[data-nav-toggle]', header);
  const label = qs('[data-nav-toggle-label]', header);
  const links = qsa('.site-nav__link', header);

  if (menu && links.length) initIndicator(menu, links);
  if (menu && toggle) initMobileMenu({ header, menu, toggle, label, links });
}
