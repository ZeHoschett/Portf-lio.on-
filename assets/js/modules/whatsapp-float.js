/**
 * Floating WhatsApp button: hidden over the hero (the hero already has its own WhatsApp CTA),
 * revealed once the visitor scrolls past it. The button is removed altogether by
 * config-bindings.js when there is no number, so this module may find nothing to do.
 *
 * The hero height is measured outside the scroll callback (scroll.js reads layout once per frame
 * for everybody; subscribers only write).
 */
import { qs } from '../utils/dom.js';
import { onScrollFrame } from '../utils/scroll.js';

const SHOW_AFTER_HERO_SHARE = 0.6;

export function initWhatsappFloat() {
  const float = qs('[data-whatsapp-float]');
  if (!float) return;

  const hero = qs('#inicio');
  let threshold = 0;

  const measure = () => {
    threshold = (hero?.offsetHeight ?? window.innerHeight) * SHOW_AFTER_HERO_SHARE;
  };

  measure();
  new ResizeObserver(measure).observe(hero ?? document.body);

  onScrollFrame(({ y }) => float.classList.toggle('is-visible', y > threshold));
}
