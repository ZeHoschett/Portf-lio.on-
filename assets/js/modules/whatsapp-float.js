/**
 * Floating WhatsApp button: hidden over the hero (the first screen stays clean), revealed once
 * the visitor scrolls past it, and hidden again when the contact section comes into view: that
 * section has its own WhatsApp row, and the glass panel there plus the header and a toast are
 * already three blurred surfaces. The button is removed altogether by config-bindings.js when
 * there is no number, so this module may find nothing to do.
 *
 * Positions are measured outside the scroll callback (scroll.js reads layout once per frame
 * for everybody; subscribers only write).
 */
import { qs } from '../utils/dom.js';
import { onScrollFrame } from '../utils/scroll.js';

const SHOW_AFTER_HERO_SHARE = 0.6;
/** Hide once this share of the viewport is taken by the contact section. */
const HIDE_INTO_CONTACT_SHARE = 0.2;

export function initWhatsappFloat() {
  const float = qs('[data-whatsapp-float]');
  if (!float) return;

  const hero = qs('#inicio');
  const contact = qs('#contato');
  let showFrom = 0;
  let hideFrom = Infinity;

  const measure = () => {
    showFrom = (hero?.offsetHeight ?? window.innerHeight) * SHOW_AFTER_HERO_SHARE;
    hideFrom = contact
      ? contact.getBoundingClientRect().top + window.scrollY - window.innerHeight * (1 - HIDE_INTO_CONTACT_SHARE)
      : Infinity;
  };

  measure();
  new ResizeObserver(measure).observe(document.body);
  // A viewport height change (rotation, mobile toolbar) moves the hide point without resizing body
  window.addEventListener('resize', measure, { passive: true });

  onScrollFrame(({ y }) => float.classList.toggle('is-visible', y > showFrom && y < hideFrom));
}
