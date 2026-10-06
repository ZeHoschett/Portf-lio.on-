/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation).
 * - Only the selected tab is in the Tab order; Arrow keys, Home and End move between tabs.
 * - Panels are built up front and toggled with `hidden`, so nothing is re-rendered on switch.
 * Generic: the caller decides what a tab is called and what its panel contains.
 *
 * Two entry points share the same behaviour:
 * - createTabs(): builds the tabs and panels from data (the case-study modal).
 * - enhanceTabs(): wires tabs that already exist in the HTML (the projects area), so every panel
 *   is in the page source and stays indexable.
 */
import { el } from '../utils/dom.js';

/**
 * Selection + keyboard behaviour for a tab list whose tabs and panels already exist.
 * @param {HTMLElement} list  the [role="tablist"] element
 * @param {HTMLElement[]} tabs
 * @param {HTMLElement[]} panels  same order as `tabs`
 * @param {(index: number) => void} [onSelect]
 * @returns {(index: number, moveFocus?: boolean) => void} select
 */
function wireTabs(list, tabs, panels, onSelect) {
  const select = (target, moveFocus = false) => {
    tabs.forEach((tab, index) => {
      const selected = index === target;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
    if (moveFocus) tabs[target].focus();
    onSelect?.(target);
  };

  tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)));

  list.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(/** @type {HTMLElement} */ (event.target));
    if (current === -1) return;
    const last = tabs.length - 1;
    const targets = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    select(targets[event.key], true);
  });

  return select;
}

/**
 * @template T
 * @param {T[]} items
 * @param {Object} options
 * @param {string} options.label  accessible name of the tab list
 * @param {string} options.idPrefix  unique prefix for the tab/panel ids
 * @param {(item: T, index: number) => string} options.getLabel
 * @param {(item: T, index: number) => Node} options.renderPanel
 * @returns {HTMLElement}
 */
export function createTabs(items, { label, idPrefix, getLabel, renderPanel }) {
  /** @type {HTMLElement[]} */
  const tabs = [];
  /** @type {HTMLElement[]} */
  const panels = [];

  items.forEach((item, index) => {
    const tabId = `${idPrefix}-tab-${index}`;
    const panelId = `${idPrefix}-panel-${index}`;
    const selected = index === 0;

    tabs.push(
      el('button', {
        className: 'tabs__tab',
        text: getLabel(item, index),
        attrs: {
          type: 'button',
          role: 'tab',
          id: tabId,
          'aria-controls': panelId,
          'aria-selected': String(selected),
          tabindex: selected ? 0 : -1,
        },
      }),
    );
    panels.push(
      el(
        'div',
        {
          className: 'tabs__panel',
          attrs: { role: 'tabpanel', id: panelId, 'aria-labelledby': tabId, hidden: !selected },
        },
        [renderPanel(item, index)],
      ),
    );
  });

  const list = el(
    'div',
    { className: 'tabs__list', attrs: { role: 'tablist', 'aria-label': label } },
    tabs,
  );
  wireTabs(list, tabs, panels);

  return el('div', { className: 'tabs' }, [list, ...panels]);
}

/**
 * Wires tabs already in the HTML: `[role="tab"]` children of `list`, each pointing to its panel
 * through `aria-controls`. The markup sets the initial state (aria-selected, tabindex, hidden).
 * @param {HTMLElement} list
 * @param {{ onSelect?: (tab: HTMLElement, panel: HTMLElement) => void }} [options]
 * @returns {{ tabs: HTMLElement[], panels: HTMLElement[], select: (index: number, moveFocus?: boolean) => void } | null}
 */
export function enhanceTabs(list, { onSelect } = {}) {
  const tabs = /** @type {HTMLElement[]} */ ([...list.querySelectorAll('[role="tab"]')]);
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls') ?? ''));
  if (!tabs.length || panels.some((panel) => !panel)) return null;

  const validPanels = /** @type {HTMLElement[]} */ (panels);
  const select = wireTabs(list, tabs, validPanels, (index) => onSelect?.(tabs[index], validPanels[index]));
  return { tabs, panels: validPanels, select };
}
