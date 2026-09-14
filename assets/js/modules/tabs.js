/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation).
 * - Only the selected tab is in the Tab order; Arrow keys, Home and End move between tabs.
 * - Panels are built up front and toggled with `hidden`, so nothing is re-rendered on switch.
 * Generic: the caller decides what a tab is called and what its panel contains.
 */
import { el } from '../utils/dom.js';

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

  /**
   * @param {number} target
   * @param {boolean} moveFocus
   */
  const select = (target, moveFocus) => {
    tabs.forEach((tab, index) => {
      const selected = index === target;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
    if (moveFocus) tabs[target].focus();
  };

  tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index, false)));

  const list = el(
    'div',
    { className: 'tabs__list', attrs: { role: 'tablist', 'aria-label': label } },
    tabs,
  );
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

  return el('div', { className: 'tabs' }, [list, ...panels]);
}
