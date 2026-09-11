/**
 * Renders `data/projects.js` into the four stack subsections of #projetos.
 * Each project appears only in the subsection of its `stack`; empty stacks show an empty state.
 * The mockup follows `type`: mobile → phone, backend/mainframe → terminal, web → browser.
 * Everything is built with el()/textContent and every URL goes through sanitizeUrl().
 */
import { projects as defaultProjects, STACKS } from '../data/projects.js';
import { el, icon, sanitizeUrl } from '../utils/dom.js';
import { highlightCode } from '../utils/highlight.js';
import { createCarousel } from './carousel.js';
import { openModal } from './modal.js';

const STACK_LABELS = { java: 'Java', python: 'Python', cobol: 'COBOL', web: 'Web' };
const TYPE_LABELS = { mobile: 'Mobile', backend: 'Back-end', mainframe: 'Mainframe', web: 'Web' };
const VALID_TYPES = new Set(Object.keys(TYPE_LABELS));
const FILE_EXTENSIONS = { java: '.java', python: '.py', web: '.js' };
const COBOL_PROGRAM_NAME_MAX = 8;

const EMPTY_MESSAGES = {
  java: 'Projetos Java em documentação — em breve por aqui.',
  python: 'Projetos Python em documentação — em breve por aqui.',
  cobol: '> NENHUM REGISTRO ENCONTRADO. AGUARDANDO CARGA...',
  web: 'Projetos Web em documentação — em breve por aqui.',
};

const PLACEHOLDER = { src: 'assets/img/placeholders/project.svg', width: 1600, height: 1000 };
const MODAL_TITLE_ID = 'modal-project-title';

/** @typedef {import('../data/projects.js').Project} Project */
/** @typedef {{ src: string, alt: string, width: number, height: number }} Image */
/** @typedef {'card' | 'modal'} Context */

// ============================== Helpers ==============================

/** @param {unknown} value */
const text = (value) => (typeof value === 'string' ? value.trim() : '');

/** @param {string} value */
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

/** @param {Project} project */
function isValidProject(project) {
  const valid = Boolean(project) && text(project.id) !== '' && text(project.title) !== '' && STACKS.includes(project.stack);
  if (!valid) console.warn('[portfolio] Projeto ignorado (id, title ou stack inválidos):', project);
  return valid;
}

/** @param {Project} project */
const resolveType = (project) =>
  VALID_TYPES.has(project.type) ? project.type : project.stack === 'cobol' ? 'mainframe' : 'web';

/**
 * @param {Project} project
 * @returns {Image[]}
 */
function normaliseImages(project) {
  if (!Array.isArray(project.images)) return [];
  return project.images
    .map((image) => ({
      src: sanitizeUrl(image?.src),
      alt: text(image?.alt),
      width: Number(image?.width) || PLACEHOLDER.width,
      height: Number(image?.height) || PLACEHOLDER.height,
    }))
    .filter((image) => image.src);
}

/**
 * @param {Image} image
 * @param {string} [className]
 */
const createImage = (image, className = 'mockup__image') =>
  el('img', {
    className,
    attrs: { src: image.src, alt: image.alt, width: image.width, height: image.height, loading: 'lazy', decoding: 'async' },
  });

/** Neutral artwork for projects without screenshots (decorative). */
const createPlaceholder = () =>
  createImage({ ...PLACEHOLDER, alt: '' }, 'mockup__image mockup__image--placeholder');

/**
 * @param {string} code
 * @param {Project['stack']} stack
 * @param {Context} context
 */
function createCodeBlock(code, stack, context) {
  return el(
    'pre',
    {
      className: 'code',
      // In cards the snippet is a visual preview (the modal repeats it); in the modal it scrolls
      attrs: context === 'modal' ? { tabindex: 0, 'aria-label': 'Trecho de código' } : { 'aria-hidden': 'true' },
    },
    [el('code', {}, [highlightCode(code, stack)])],
  );
}

/** @param {Project} project */
function defaultFileName(project) {
  if (project.stack === 'cobol') {
    const name = project.id.replace(/[^a-z0-9]/gi, '').slice(0, COBOL_PROGRAM_NAME_MAX).toUpperCase();
    return `${name}.CBL`;
  }
  return `${project.id}${FILE_EXTENSIONS[project.stack] ?? ''}`;
}

/** @param {Project} project */
function displayUrl(project) {
  const demo = sanitizeUrl(project.demo);
  if (demo) {
    try {
      const url = new URL(demo, document.baseURI);
      return `${url.host}${url.pathname === '/' ? '' : url.pathname}`;
    } catch {
      /* fall through to the neutral address */
    }
  }
  return `localhost/${project.id}`;
}

// ============================== Mockups ==============================

const createDots = () =>
  el('span', { className: 'mockup__dots' }, [0, 1, 2].map(() => el('span', { className: 'mockup__dot' })));

/**
 * Window-style mockup (terminal or browser).
 * @param {'terminal' | 'browser'} variant
 * @param {Node} barLabel
 * @param {Node} body
 */
const createWindow = (variant, barLabel, body) =>
  el('div', { className: `mockup mockup--${variant}` }, [
    el('div', { className: 'mockup__window' }, [
      el('div', { className: 'mockup__bar', attrs: { 'aria-hidden': 'true' } }, [createDots(), barLabel]),
      el('div', { className: 'mockup__body' }, [body]),
    ]),
  ]);

/**
 * @param {Project} project
 * @param {Image[]} images
 */
function createPhoneMockup(project, images) {
  const device = (screenContent) =>
    el('div', { className: 'mockup__device' }, [
      el('div', { className: 'mockup__screen' }, [
        el('span', { className: 'mockup__island', attrs: { 'aria-hidden': 'true' } }),
        screenContent,
      ]),
    ]);

  const content =
    images.length > 1
      ? createCarousel(images, { label: `Capturas de tela: ${project.title}`, frame: device })
      : device(images.length ? createImage(images[0]) : createPlaceholder());

  return el('div', { className: 'mockup mockup--phone' }, [content]);
}

/**
 * @param {Project} project
 * @param {Image[]} images
 * @param {Context} context
 */
function createTerminalMockup(project, images, context) {
  const snippet = text(project.codeSnippet) ? project.codeSnippet.replace(/^\n+|\s+$/g, '') : '';
  let body;
  if (context === 'modal' && images.length > 1) {
    body = createCarousel(images, { label: `Capturas de tela: ${project.title}` });
  } else if (snippet && (context === 'card' || !images.length)) {
    body = createCodeBlock(snippet, project.stack, context);
  } else {
    body = images.length ? createImage(images[0]) : createPlaceholder();
  }
  const title = el('span', { className: 'mockup__title', text: text(project.fileName) || defaultFileName(project) });
  return createWindow('terminal', title, body);
}

/**
 * @param {Project} project
 * @param {Image[]} images
 * @param {Context} context
 */
function createBrowserMockup(project, images, context) {
  let body;
  if (context === 'modal' && images.length > 1) {
    body = createCarousel(images, { label: `Capturas de tela: ${project.title}` });
  } else {
    body = images.length ? createImage(images[0]) : createPlaceholder();
  }
  return createWindow('browser', el('span', { className: 'mockup__url', text: displayUrl(project) }), body);
}

/**
 * @param {Project} project
 * @param {Context} context
 */
function createMockup(project, context) {
  const images = normaliseImages(project);
  switch (resolveType(project)) {
    case 'mobile':
      return createPhoneMockup(project, images);
    case 'backend':
    case 'mainframe':
      return createTerminalMockup(project, images, context);
    default:
      return createBrowserMockup(project, images, context);
  }
}

// ============================== Shared pieces ==============================

/** @param {string[]} tags */
const createTagList = (tags) =>
  el('ul', { className: 'tag-list', attrs: { role: 'list', 'aria-label': 'Tecnologias' } }, tags.map((tag) => el('li', { className: 'tag', text: tag })));

/** @param {Project} project */
const getTags = (project) => (Array.isArray(project.tags) ? project.tags.map(text).filter(Boolean) : []);

/**
 * Repository / demo links — only rendered when the URL exists and is safe.
 * @param {Project} project
 * @param {string} className
 */
function createLinks(project, className) {
  const links = [
    { href: sanitizeUrl(project.repo), label: 'Repositório', iconName: 'github' },
    { href: sanitizeUrl(project.demo), label: 'Demo', iconName: 'external' },
  ];
  return links
    .filter((link) => link.href)
    .map((link) =>
      el('a', { className, attrs: { href: link.href, target: '_blank', rel: 'noopener noreferrer' } }, [
        icon(link.iconName),
        el('span', { text: link.label }),
        el('span', { className: 'visually-hidden', text: ` de ${project.title} (abre em nova aba)` }),
      ]),
    );
}

// ============================== Modal ==============================

/**
 * @param {Project} project
 * @param {HTMLElement} trigger
 */
function openProjectModal(project, trigger) {
  const type = resolveType(project);
  const images = normaliseImages(project);
  const snippet = text(project.codeSnippet);
  const description = text(project.description) || text(project.summary);
  const challenges = Array.isArray(project.challenges)
    ? project.challenges.filter((item) => text(item?.challenge) && text(item?.solution))
    : [];
  const links = createLinks(project, 'btn btn--secondary');

  // "Web · Web" when stack and type share a label: keep each label once
  const eyebrow = [...new Set([STACK_LABELS[project.stack], TYPE_LABELS[type], project.year])]
    .filter(Boolean)
    .join(' · ');

  const section = (title, children) =>
    el('section', { className: 'project-detail__section' }, [
      el('h3', { className: 'project-detail__section-title', text: title }),
      ...children,
    ]);

  const detail = el('article', { className: 'project-detail', dataset: { stack: project.stack } }, [
    el('div', { className: 'project-detail__media' }, [createMockup(project, 'modal')]),
    el('div', { className: 'project-detail__body' }, [
      el('header', { className: 'project-detail__header' }, [
        el('p', { className: 'project-detail__eyebrow', text: eyebrow }),
        el('h2', { className: 'project-detail__title', text: project.title, attrs: { id: MODAL_TITLE_ID } }),
      ]),
      el('div', { className: 'project-detail__main' }, [
        description ? el('p', { className: 'project-detail__description', text: description }) : null,
        challenges.length
          ? section('Desafios e soluções', [
              el(
                'dl',
                { className: 'project-detail__challenges' },
                challenges.map((item) =>
                  el('div', { className: 'project-detail__challenge' }, [
                    el('dt', { text: item.challenge }),
                    el('dd', { text: item.solution }),
                  ]),
                ),
              ),
            ])
          : null,
        // The snippet is in the media when there are no screenshots; otherwise show it here
        snippet && images.length && (type === 'backend' || type === 'mainframe')
          ? section('Trecho de código', [el('div', { className: 'project-detail__code' }, [createCodeBlock(project.codeSnippet.replace(/^\n+|\s+$/g, ''), project.stack, 'modal')])])
          : null,
      ]),
      el('aside', { className: 'project-detail__aside' }, [
        section('Stack', [createTagList(getTags(project))]),
        links.length ? section('Links', [el('div', { className: 'project-detail__links' }, links)]) : null,
      ]),
    ]),
  ]);

  openModal(detail, { labelledBy: MODAL_TITLE_ID, trigger });
}

// ============================== Card ==============================

/** @param {Project} project */
function createCard(project) {
  const titleId = `project-${slug(project.id)}-title`;
  const tags = getTags(project);
  const links = createLinks(project, 'project-link');

  const trigger = el('button', {
    className: 'project-card__trigger',
    attrs: { type: 'button', 'aria-haspopup': 'dialog' },
    text: project.title,
  });
  trigger.addEventListener('click', () => openProjectModal(project, trigger));

  const card = el(
    'article',
    { className: 'project-card', attrs: { 'aria-labelledby': titleId, 'data-tilt': true }, dataset: { stack: project.stack } },
    [
      el('div', { className: 'project-card__glow', attrs: { 'aria-hidden': 'true' } }),
      el('div', { className: 'project-card__media' }, [createMockup(project, 'card')]),
      el('div', { className: 'project-card__body' }, [
        el('p', { className: 'project-card__meta' }, [
          el('span', { className: 'project-card__type', text: TYPE_LABELS[resolveType(project)] }),
          Number.isFinite(project.year) ? el('span', { text: String(project.year) }) : null,
        ]),
        el('h4', { className: 'project-card__title', attrs: { id: titleId } }, [trigger]),
        text(project.summary) ? el('p', { className: 'project-card__summary', text: project.summary }) : null,
        tags.length ? createTagList(tags) : null,
        links.length ? el('div', { className: 'project-card__links' }, links) : null,
      ]),
    ],
  );

  const featured = project.featured === true;
  return el(
    'li',
    { className: `project-grid__item${featured ? ' project-grid__item--featured' : ''}`, attrs: { 'data-reveal': true } },
    [card],
  );
}

/** @param {Project['stack']} stack */
function createEmptyState(stack) {
  if (stack === 'cobol') {
    return el('li', { className: 'project-empty project-empty--terminal' }, [
      el('span', { className: 'project-empty__text', text: EMPTY_MESSAGES.cobol }),
      el('span', { className: 'project-empty__cursor', attrs: { 'aria-hidden': 'true' } }),
    ]);
  }
  return el('li', { className: 'project-empty' }, [
    icon('code', 'icon project-empty__icon'),
    el('span', { className: 'project-empty__text', text: EMPTY_MESSAGES[stack] }),
  ]);
}

// ============================== Public ==============================

/**
 * Renders every stack subsection. Call again with another list to re-render.
 * @param {Project[]} [list]
 */
export function renderProjects(list = defaultProjects) {
  const valid = list.filter(isValidProject);

  STACKS.forEach((stack) => {
    const grid = document.querySelector(`[data-projects="${stack}"]`);
    if (!grid) return;
    const items = valid.filter((project) => project.stack === stack);
    grid.replaceChildren(...(items.length ? items.map(createCard) : [createEmptyState(stack)]));
  });
}
