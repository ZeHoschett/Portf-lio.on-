/**
 * Renders `data/projects.js` into the four stack subsections of #projetos.
 * Each project appears only in the subsection of its `stack`; empty stacks show an empty state.
 * The mockup follows `type`: mobile → phone, backend/mainframe → terminal, web → browser,
 * fullstack → browser with a phone in front of it (the modal shows the browser carousel).
 * The portfolio only presents the projects: no source code and no repository links. A terminal
 * without screenshots shows the project's key numbers instead.
 * The modal is a case study: each section renders only when its data exists, so a small
 * project and a fully documented one share the same layout.
 * Everything is built with el()/textContent and every URL goes through sanitizeUrl().
 */
import { projects as defaultProjects, STACKS } from '../data/projects.js';
import { el, icon, sanitizeUrl } from '../utils/dom.js';
import { createCarousel } from './carousel.js';
import { openModal } from './modal.js';

const STACK_LABELS = { java: 'Java', python: 'Python', cobol: 'COBOL', web: 'Web' };
const TYPE_LABELS = {
  mobile: 'Mobile',
  backend: 'Back-end',
  mainframe: 'Mainframe',
  web: 'Web',
  fullstack: 'Full-stack',
};
const VALID_TYPES = new Set(Object.keys(TYPE_LABELS));

const EMPTY_MESSAGES = {
  java: 'Projetos Java em documentação. Em breve por aqui.',
  python: 'Projetos Python em documentação. Em breve por aqui.',
  cobol: '> NENHUM REGISTRO ENCONTRADO. AGUARDANDO CARGA...',
  web: 'Projetos Web em documentação. Em breve por aqui.',
};

const PLACEHOLDER = { src: 'assets/img/placeholders/project.svg', width: 1600, height: 1000 };
/** Intrinsic size assumed for a video without width/height (a portrait phone recording). */
const VIDEO_FALLBACK = { width: 390, height: 844 };
const MODAL_TITLE_ID = 'modal-project-title';

/** @typedef {import('../data/projects.js').Project} Project */
/** @typedef {import('../data/projects.js').ProjectRecommendation} ProjectRecommendation */
/** @typedef {{ src: string, alt: string, width: number, height: number }} Image */
/** @typedef {{ src: string, poster: string, title: string, width: number, height: number }} Video */
/** @typedef {'card' | 'modal'} Context */

// ============================== Helpers ==============================

/** @param {unknown} value */
const text = (value) => (typeof value === 'string' ? value.trim() : '');

/** @param {string} value */
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

/** @param {unknown} value */
const toArray = (value) => (Array.isArray(value) ? value : []);

/**
 * A string or an array of strings → the trimmed, non-empty strings.
 * @param {unknown} value
 * @returns {string[]}
 */
const toTextList = (value) => (Array.isArray(value) ? value : [value]).map(text).filter(Boolean);

/** @param {Project} project */
function isValidProject(project) {
  const valid =
    Boolean(project) &&
    text(project.id) !== '' &&
    text(project.title) !== '' &&
    STACKS.includes(project.stack);
  if (!valid) console.warn('[portfolio] Projeto ignorado (id, title ou stack inválidos):', project);
  return valid;
}

/** @param {Project} project */
const resolveType = (project) =>
  VALID_TYPES.has(project.type) ? project.type : project.stack === 'cobol' ? 'mainframe' : 'web';

/**
 * @param {unknown} list
 * @returns {Image[]}
 */
function normaliseImages(list) {
  return toArray(list)
    .map((image) => ({
      src: sanitizeUrl(image?.src),
      alt: text(image?.alt),
      width: Number(image?.width) || PLACEHOLDER.width,
      height: Number(image?.height) || PLACEHOLDER.height,
    }))
    .filter((image) => image.src);
}

/**
 * @param {Project} project
 * @returns {Video[]}
 */
function normaliseVideos(project) {
  return toArray(project.videos)
    .map((video) => ({
      src: sanitizeUrl(video?.src),
      poster: sanitizeUrl(video?.poster),
      title: text(video?.title),
      width: Number(video?.width) || VIDEO_FALLBACK.width,
      height: Number(video?.height) || VIDEO_FALLBACK.height,
    }))
    .filter((video) => video.src && video.title);
}

/**
 * @param {Project} project
 * @returns {{ value: string, label: string }[]}
 */
const getStats = (project) =>
  toArray(project.stats)
    .map((item) => ({ value: text(item?.value), label: text(item?.label) }))
    .filter((item) => item.value && item.label);

/**
 * @param {Image} image
 * @param {string} [className]
 */
const createImage = (image, className = 'mockup__image') =>
  el('img', {
    className,
    attrs: {
      src: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
      loading: 'lazy',
      decoding: 'async',
    },
  });

/** Neutral artwork for projects without screenshots (decorative). */
const createPlaceholder = () =>
  createImage({ ...PLACEHOLDER, alt: '' }, 'mockup__image mockup__image--placeholder');

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
  el(
    'span',
    { className: 'mockup__dots' },
    [0, 1, 2].map(() => el('span', { className: 'mockup__dot' })),
  );

/**
 * Window-style mockup (terminal or browser) in the plain monochrome chrome.
 * @param {'terminal' | 'browser'} variant
 * @param {Node} barLabel
 * @param {Node} body
 */
const createWindow = (variant, barLabel, body) =>
  el('div', { className: `mockup mockup--${variant}` }, [
    el('div', { className: 'mockup__window' }, [
      el('div', { className: 'mockup__bar', attrs: { 'aria-hidden': 'true' } }, [
        createDots(),
        barLabel,
      ]),
      el('div', { className: 'mockup__body' }, [body]),
    ]),
  ]);

/**
 * Phone frame around any screen content (image, carousel viewport or video).
 * @param {Node} content
 */
const createDevice = (content) =>
  el('div', { className: 'mockup__device' }, [
    el('div', { className: 'mockup__screen' }, [
      el('span', { className: 'mockup__island', attrs: { 'aria-hidden': 'true' } }),
      content,
    ]),
  ]);

/**
 * @param {Image[]} images
 * @param {string} label  accessible name of the carousel
 * @param {string} [className]
 */
function createPhoneMockup(images, label, className = '') {
  const content =
    images.length > 1
      ? createCarousel(images, { label, frame: createDevice })
      : createDevice(images.length ? createImage(images[0]) : createPlaceholder());

  return el('div', { className: `mockup mockup--phone ${className}`.trim() }, [content]);
}

/**
 * Terminal screen for a project without screenshots: its key numbers (or, without numbers, its
 * features) as lines of output, white on black. Decorative: the case study lists the same facts.
 * @param {Project} project
 */
function createReadout(project) {
  const stats = getStats(project);
  const lines = stats.length
    ? stats.map((item) => [item.value, item.label])
    : toTextList(project.highlights ?? []).map((item) => ['>', item]);
  if (!lines.length) return createPlaceholder();

  return el(
    'div',
    { className: 'mockup__readout', attrs: { 'aria-hidden': 'true' } },
    lines.flatMap(([mark, label]) => [
      el('span', { className: 'mockup__readout-mark', text: mark }),
      el('span', { className: 'mockup__readout-text', text: label }),
    ]),
  );
}

/**
 * Terminal window titled with the project's name: screenshots when there are any, otherwise the
 * readout of its numbers.
 * @param {Project} project
 * @param {Image[]} images
 * @param {Context} context
 */
function createTerminalMockup(project, images, context) {
  let body;
  if (context === 'modal' && images.length > 1) {
    body = createCarousel(images, { label: `Capturas de tela: ${project.title}` });
  } else {
    body = images.length ? createImage(images[0]) : createReadout(project);
  }
  return createWindow('terminal', el('span', { className: 'mockup__title', text: project.title }), body);
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
  return createWindow(
    'browser',
    el('span', { className: 'mockup__url', text: displayUrl(project) }),
    body,
  );
}

/**
 * Full-stack card cover: the desktop screen in a browser with the phone version in front of it.
 * @param {Project} project
 * @param {Image[]} images
 * @param {Image[]} mobileImages
 */
const createShowcaseMockup = (project, images, mobileImages) =>
  el('div', { className: 'mockup mockup--showcase' }, [
    createBrowserMockup(project, images, 'card'),
    createDevice(createImage(mobileImages[0])),
  ]);

/**
 * @param {Project} project
 * @param {Context} context
 */
function createMockup(project, context) {
  const images = normaliseImages(project.images);
  switch (resolveType(project)) {
    case 'mobile':
      return createPhoneMockup(images, `Capturas de tela: ${project.title}`);
    case 'backend':
    case 'mainframe':
      return createTerminalMockup(project, images, context);
    case 'fullstack': {
      const mobileImages = normaliseImages(project.mobileImages);
      return context === 'card' && images.length && mobileImages.length
        ? createShowcaseMockup(project, images, mobileImages)
        : createBrowserMockup(project, images, context);
    }
    default:
      return createBrowserMockup(project, images, context);
  }
}

// ============================== Shared pieces ==============================

/** @param {string[]} tags */
const createTagList = (tags) =>
  el(
    'ul',
    { className: 'tag-list', attrs: { role: 'list', 'aria-label': 'Tecnologias' } },
    tags.map((tag) => el('li', { className: 'tag', text: tag })),
  );

/** @param {Project} project */
const getTags = (project) => toTextList(project.tags ?? []);

/**
 * The live demo link, only rendered when the URL exists and is safe. There are no repository or
 * document links: the portfolio presents the projects, it never hands out their source.
 * With `iconOnly` (card footer) the label is kept for screen readers only.
 * @param {Project} project
 * @param {string} className
 * @param {{ iconOnly?: boolean }} [options]
 */
function createLinks(project, className, { iconOnly = false } = {}) {
  const href = sanitizeUrl(project.demo);
  if (!href) return [];
  return [
    el('a', { className, attrs: { href, target: '_blank', rel: 'noopener noreferrer' } }, [
      icon('external'),
      el('span', { className: iconOnly ? 'visually-hidden' : '', text: 'Demo' }),
      el('span', { className: 'visually-hidden', text: ` de ${project.title} (abre em nova aba)` }),
    ]),
  ];
}

// ============================== Modal ==============================

/**
 * A demo video inside a phone frame. No autoplay: it only loads when the visitor presses play.
 * @param {Video} video
 */
const createVideo = (video) =>
  el('figure', { className: 'project-detail__video' }, [
    el('div', { className: 'mockup mockup--phone' }, [
      createDevice(
        el('video', {
          className: 'mockup__video',
          attrs: {
            src: video.src,
            poster: video.poster || null,
            width: video.width,
            height: video.height,
            controls: true,
            muted: true,
            playsinline: true,
            preload: video.poster ? 'none' : 'metadata',
            'aria-label': `Vídeo: ${video.title}`,
          },
        }),
      ),
    ]),
    el('figcaption', { className: 'project-detail__video-caption', text: video.title }),
  ]);

/**
 * @param {Project} project
 * @param {HTMLElement} trigger
 */
function openProjectModal(project, trigger) {
  const type = resolveType(project);
  // A terminal without screenshots would only repeat the numbers listed below it
  const showMedia =
    !(type === 'backend' || type === 'mainframe') || normaliseImages(project.images).length > 0;
  // A mobile project already shows its phone screens in the media area
  const mobileImages = type === 'mobile' ? [] : normaliseImages(project.mobileImages);
  const videos = normaliseVideos(project);
  const tags = getTags(project);
  const paragraphs = toTextList(project.description);
  if (!paragraphs.length && text(project.summary)) paragraphs.push(text(project.summary));
  const highlights = toTextList(project.highlights ?? []);
  const stats = getStats(project);
  const architecture = toArray(project.architecture).filter(
    (item) => text(item?.title) && text(item?.description),
  );
  const challenges = toArray(project.challenges).filter(
    (item) => text(item?.challenge) && text(item?.solution),
  );
  const links = createLinks(project, 'btn btn--secondary');

  // "Web · Web" when stack and type share a label: keep each label once
  const eyebrow = [...new Set([STACK_LABELS[project.stack], TYPE_LABELS[type], project.year])]
    .filter(Boolean)
    .join(' · ');

  /**
   * @param {string} title
   * @param {Node[]} children
   * @param {string} [modifier]
   */
  const section = (title, children, modifier) =>
    el(
      'section',
      {
        className: `project-detail__section${modifier ? ` project-detail__section--${modifier}` : ''}`,
      },
      [el('h3', { className: 'project-detail__section-title', text: title }), ...children],
    );

  /*
   * Glass case study: a top bar (stack, type and year in mono; the close button from modal.js
   * sits at its right), the media, then two columns: the main reading on the left and the
   * supporting column (Tecnologias, Acessos, Versão mobile) on the right, which drops below on
   * phones. Videos close the panel at full width.
   */
  const detail = el('article', { className: 'project-detail', dataset: { stack: project.stack } }, [
    el('div', { className: 'project-detail__bar' }, [
      el('p', { className: 'project-detail__eyebrow', text: eyebrow }),
    ]),
    showMedia ? el('div', { className: 'project-detail__media' }, [createMockup(project, 'modal')]) : null,
    el('div', { className: 'project-detail__body' }, [
      el('div', { className: 'project-detail__main' }, [
        el('header', { className: 'project-detail__header' }, [
          el('h2', {
            className: 'project-detail__title',
            text: project.title,
            attrs: { id: MODAL_TITLE_ID },
          }),
          text(project.subtitle)
            ? el('p', { className: 'project-detail__subtitle', text: project.subtitle })
            : null,
        ]),
        stats.length
          ? el(
              'dl',
              { className: 'project-detail__stats' },
              stats.map((item) =>
                el('div', { className: 'project-detail__stat' }, [
                  el('dt', { text: item.label }),
                  el('dd', { text: item.value }),
                ]),
              ),
            )
          : null,
        paragraphs.length
          ? el(
              'div',
              { className: 'project-detail__prose' },
              paragraphs.map((paragraph) =>
                el('p', { className: 'project-detail__description', text: paragraph }),
              ),
            )
          : null,
        highlights.length
          ? section('Funcionalidades', [
              el(
                'ul',
                { className: 'project-detail__highlights', attrs: { role: 'list' } },
                highlights.map((item) => el('li', { text: item })),
              ),
            ])
          : null,
        architecture.length
          ? section('Arquitetura', [
              el(
                'dl',
                { className: 'project-detail__architecture' },
                architecture.map((item) =>
                  el('div', { className: 'project-detail__layer' }, [
                    el('dt', { text: item.title }),
                    el('dd', { text: item.description }),
                  ]),
                ),
              ),
            ])
          : null,
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
      ]),
      el('aside', { className: 'project-detail__aside' }, [
        tags.length ? section('Tecnologias', [createTagList(tags)]) : null,
        links.length
          ? section('Acessos', [el('div', { className: 'project-detail__links' }, links)])
          : null,
        mobileImages.length
          ? section('Versão mobile', [
              createPhoneMockup(
                mobileImages,
                `Versão mobile: ${project.title}`,
                'project-detail__phone',
              ),
            ])
          : null,
      ]),
      videos.length
        ? section(
            'Demonstração em vídeo',
            [
              el(
                'ul',
                { className: 'project-detail__videos', attrs: { role: 'list' } },
                videos.map((video) => el('li', {}, [createVideo(video)])),
              ),
            ],
            'wide',
          )
        : null,
    ]),
  ]);

  openModal(detail, { labelledBy: MODAL_TITLE_ID, trigger });
}

// ============================== Card ==============================

/**
 * Reading order: title, subtitle, summary, tags, mockup, then the footer with the two levels of
 * access: "Estudo de caso" (the one main control; its ::after covers the whole card) and the
 * circular demo icon, which sits above that area. Solid surface: cards repeat many
 * times per screen, so they never get a backdrop-filter.
 * @param {Project} project
 */
function createCard(project) {
  const titleId = `project-${slug(project.id)}-title`;
  const tags = getTags(project);
  const links = createLinks(project, 'project-card__access', { iconOnly: true });

  const trigger = el(
    'button',
    {
      className: 'project-card__trigger',
      attrs: { type: 'button', 'aria-haspopup': 'dialog' },
    },
    [
      el('span', { text: 'Estudo de caso' }),
      el('span', { className: 'visually-hidden', text: ` de ${project.title}` }),
      icon('arrow', 'icon project-card__arrow'),
    ],
  );
  trigger.addEventListener('click', () => openProjectModal(project, trigger));

  const card = el(
    'article',
    {
      className: 'project-card surface-solid',
      attrs: { 'aria-labelledby': titleId },
      dataset: { stack: project.stack },
    },
    [
      el('div', { className: 'project-card__body' }, [
        el('h4', { className: 'project-card__title', attrs: { id: titleId }, text: project.title }),
        text(project.subtitle)
          ? el('p', { className: 'project-card__subtitle', text: project.subtitle })
          : null,
        text(project.summary)
          ? el('p', { className: 'project-card__summary', text: project.summary })
          : null,
        tags.length ? createTagList(tags) : null,
      ]),
      el('div', { className: 'project-card__media' }, [createMockup(project, 'card')]),
      el('div', { className: 'project-card__footer' }, [
        trigger,
        links.length ? el('div', { className: 'project-card__links' }, links) : null,
      ]),
    ],
  );

  const featured = project.featured === true;
  return el(
    'li',
    {
      className: `project-grid__item${featured ? ' project-grid__item--featured' : ''}`,
      attrs: { 'data-reveal': true },
    },
    [card],
  );
}

/**
 * Recommendation card: a project that lives in another tab but matters for this one (`alsoIn`).
 * Full width, after the tab's own projects, never counted as one of them. It shows why it is
 * recommended here, the tags for this stack, the project's numbers on a terminal screen,
 * "Estudo de caso" (same modal) and a link to the project's own tab.
 * @param {Project} project
 * @param {ProjectRecommendation} recommendation
 */
function createRecommendation(project, recommendation) {
  const titleId = `project-${slug(project.id)}-${recommendation.stack}-title`;
  const tags = toTextList(recommendation.tags ?? project.tags ?? []);
  const homeLabel = STACK_LABELS[project.stack];

  const trigger = el(
    'button',
    { className: 'project-card__trigger', attrs: { type: 'button', 'aria-haspopup': 'dialog' } },
    [
      el('span', { text: 'Estudo de caso' }),
      el('span', { className: 'visually-hidden', text: ` de ${project.title}` }),
      icon('arrow', 'icon project-card__arrow'),
    ],
  );
  trigger.addEventListener('click', () => openProjectModal(project, trigger));

  const homeLink = el('a', { className: 'project-card__home', attrs: { href: `#projetos-${project.stack}` } }, [
    el('span', { text: `Ver na aba ${homeLabel}` }),
  ]);

  const card = el(
    'article',
    {
      className: 'project-card project-card--recommendation surface-solid',
      attrs: { 'aria-labelledby': titleId },
      dataset: { stack: project.stack },
    },
    [
      el('div', { className: 'project-card__body' }, [
        el('p', { className: 'project-card__eyebrow', text: `Recomendado · projeto ${homeLabel}` }),
        el('h4', { className: 'project-card__title', attrs: { id: titleId }, text: project.title }),
        text(project.subtitle)
          ? el('p', { className: 'project-card__subtitle', text: project.subtitle })
          : null,
        text(recommendation.note)
          ? el('p', { className: 'project-card__summary', text: recommendation.note })
          : null,
        tags.length ? createTagList(tags) : null,
      ]),
      el('div', { className: 'project-card__media' }, [
        createWindow('terminal', el('span', { className: 'mockup__title', text: project.title }), createReadout(project)),
      ]),
      el('div', { className: 'project-card__footer' }, [
        trigger,
        el('div', { className: 'project-card__links' }, [homeLink]),
      ]),
    ],
  );

  return el(
    'li',
    { className: 'project-grid__item project-grid__item--wide', attrs: { 'data-reveal': true } },
    [card],
  );
}

/** @param {Project['stack']} stack */
function createEmptyState(stack) {
  if (stack === 'cobol') {
    // Static block cursor: the marquee is the only continuous animation of the site
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
    // Projects from other tabs recommended here (alsoIn), after this tab's own projects
    const recommended = valid.flatMap((project) =>
      toArray(project.alsoIn)
        .filter((rec) => rec?.stack === stack && project.stack !== stack)
        .map((rec) => createRecommendation(project, rec)),
    );
    grid.replaceChildren(
      ...(items.length ? items.map(createCard) : [createEmptyState(stack)]),
      ...recommended,
    );
  });
}
