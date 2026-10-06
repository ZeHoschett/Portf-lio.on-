/**
 * Projects area (#projetos): one area, four stack panels, tabs that filter in place.
 * - The tabs and all four panels are in the HTML (inactive ones `hidden`), so every project stays
 *   in the page and indexable; modules/tabs.js gives them the WAI-ARIA behaviour.
 * - Each tab shows how many projects its panel holds ("Java · 2"), counted from the cards that
 *   render-projects.js built from data/projects.js (invalid entries are already skipped there).
 * - The area's data-stack follows the selected tab, which switches the background light.
 * - A link to #projetos-<stack> opens that tab.
 * Must run after renderProjects().
 */
import { qs } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';
import { enhanceTabs } from './tabs.js';

const PANEL_HASH = /^#projetos-(java|python|cobol|web)$/;

export function initProjectsTabs() {
  const area = qs('[data-projects-area]');
  const list = qs('[data-projects-tabs]', area ?? document);
  if (!area || !list) return;

  /** @param {HTMLElement} tab @param {HTMLElement} panel */
  const onSelect = (tab, panel) => {
    area.dataset.stack = panel.dataset.stack ?? '';
    // On a narrow screen the tab list scrolls: keep the selected tab in view
    if (list.scrollWidth > list.clientWidth) {
      const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
      list.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  };

  const wired = enhanceTabs(list, { onSelect });
  if (!wired) return;
  const { tabs, panels, select } = wired;

  tabs.forEach((tab, index) => {
    const count = qs('[data-project-count]', tab);
    if (count) count.textContent = ` · ${panels[index].querySelectorAll('.project-card').length}`;
  });

  // After a switch, a shorter panel may leave the visitor below the area: bring its top back
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      if (area.getBoundingClientRect().top >= 0) return;
      list.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }),
  );

  const openFromHash = () => {
    const match = PANEL_HASH.exec(location.hash);
    if (!match) return;
    const index = panels.findIndex((panel) => panel.id === `projetos-${match[1]}`);
    if (index === -1) return;
    select(index);
    list.scrollIntoView({ block: 'start' });
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
}
