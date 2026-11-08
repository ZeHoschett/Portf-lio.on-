/**
 * Renders `data/education.js` into the timeline of #formacao (`[data-education]`), in list order.
 * Invalid entries are skipped with a console warning; an empty list shows the empty state.
 * Everything is built with el()/textContent.
 */
import { education as defaultEducation } from '../data/education.js';
import { el, icon, qs } from '../utils/dom.js';

const STATUS_LABELS = { completed: 'Concluído', 'in-progress': 'Em andamento' };
const EMPTY_MESSAGE = 'Formação acadêmica em atualização. Em breve por aqui.';

/** @typedef {import('../data/education.js').Education} Education */

/** @param {unknown} value */
const text = (value) => (typeof value === 'string' ? value.trim() : '');

/** @param {Education} item */
function isValidEducation(item) {
  const valid = Boolean(item) && text(item.id) !== '' && text(item.institution) !== '' && text(item.course) !== '';
  if (!valid) console.warn('[portfolio] Formação ignorada (id, institution ou course inválidos):', item);
  return valid;
}

/** @param {Education} item */
function createItem(item) {
  const period = text(item.period);
  const status = STATUS_LABELS[item.status] ? item.status : '';
  const meta = [
    period ? el('span', { className: 'timeline__period', text: period }) : null,
    status
      ? el('span', { className: 'timeline__status', text: STATUS_LABELS[status], dataset: { status } })
      : null,
  ].filter(Boolean);

  return el('li', { className: 'timeline__item', attrs: { 'data-reveal': true } }, [
    el('article', { className: 'timeline__card' }, [
      meta.length ? el('p', { className: 'timeline__meta' }, meta) : null,
      el('h3', { className: 'timeline__course', text: item.course }),
      el('p', { className: 'timeline__institution', text: item.institution }),
      text(item.degree) ? el('p', { className: 'timeline__degree', text: item.degree }) : null,
      text(item.description)
        ? el('p', { className: 'timeline__description', text: item.description })
        : null,
    ]),
  ]);
}

const createEmptyState = () =>
  el('li', { className: 'empty-state' }, [
    icon('graduation', 'icon empty-state__icon'),
    el('span', { text: EMPTY_MESSAGE }),
  ]);

/**
 * Renders the education timeline. Call again with another list to re-render.
 * @param {Education[]} [list]
 */
export function renderEducation(list = defaultEducation) {
  const timeline = qs('[data-education]');
  if (!timeline) return;

  const items = list.filter(isValidEducation);
  timeline.replaceChildren(...(items.length ? items.map(createItem) : [createEmptyState()]));
}
