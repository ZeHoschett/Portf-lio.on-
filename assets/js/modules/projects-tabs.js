/**
 * Sticky stack tabs (Java · Python · COBOL · Web): in-page anchors with their own scrollspy.
 * On narrow screens the active tab is scrolled into view horizontally.
 */
import { qs, qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';
import { createScrollspy } from './scrollspy.js';

const ACTIVATION_LINE = 0.35;

export function initProjectsTabs() {
  const nav = qs('[data-projects-tabs]');
  if (!nav) return;

  const list = qs('.projects-tabs__list', nav);
  const links = qsa('.projects-tabs__link', nav);

  createScrollspy({
    links,
    activationLine: ACTIVATION_LINE,
    onChange: (link) => {
      if (!link || !list || list.scrollWidth <= list.clientWidth) return;
      const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
      list.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
  });
}
