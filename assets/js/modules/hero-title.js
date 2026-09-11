import { qs } from '../utils/dom.js';

/**
 * Adds an outlined, aria-hidden copy of the hero title on top of the portrait, so the letters
 * the photo covers remain readable as outlines (the editorial "image crosses the title" effect).
 * The copy reuses the same classes, so metrics and the letter-by-letter entrance stay in sync.
 */
export function initHeroTitle() {
  const title = qs('[data-hero-title]');
  const stage = title?.parentElement;
  if (!title || !stage) return;

  const ghost = document.createElement('div');
  ghost.className = `${title.className} hero__title--ghost`;
  ghost.setAttribute('aria-hidden', 'true');
  title.querySelectorAll(':scope > [aria-hidden="true"]').forEach((line) => {
    ghost.append(line.cloneNode(true));
  });
  stage.append(ghost);
}
