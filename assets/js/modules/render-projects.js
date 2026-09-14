/**
 * Renders `data/projects.js` into the four stack subsections of #projetos.
 * Each project appears only in the subsection of its `stack`; empty stacks show an empty state.
 * The mockup follows `type`: mobile → phone, backend/mainframe → terminal, web → browser,
 * fullstack → browser with a phone in front of it (the modal shows the browser carousel).
 * The modal is a case study: each section renders only when its data exists, so a small
 * project and a fully documented one share the same layout.
 * Everything is built with el()/textContent and every URL goes through sanitizeUrl().
 */
import { projects as defaultProjects, STACKS } from '../data/projects.js';
import { el, icon, sanitizeUrl } from '../utils/dom.js';
import { highlightCode } from '../utils/highlight.js';
import { createCarousel } from './carousel.js';
import { openModal } from './modal.js';
import { createTabs } from './tabs.js';

const STACK_LABELS = { java: 'Java', python: 'Python', cobol: 'COBOL', web: 'Web' };
const TYPE_LABELS = {
  mobile: 'Mobile',
  backend: 'Back-end',
  mainframe: 'Mainframe',
  web: 'Web',
  fullstack: 'Full-stack',
};
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
/** Intrinsic size assumed for a video without width/height (a portrait phone recording). */
const VIDEO_FALLBACK = { width: 390, height: 844 };
const MODAL_TITLE_ID = 'modal-project-title';

/** @typedef {import('../data/projects.js').Project} Project */
/** @typedef {{ src: string, alt: string, width: number, height: number }} Image */
/** @typedef {{ src: string, poster: string, title: string, width: number, height: number }} Video */
/** @typedef {{ fileName: string, language: string, caption: string, code: string }} CodeSample */
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

/**
 * Drops leading blank lines and trailing whitespace, keeping the indentation of the first line.
 * @param {string} code
 */
const trimCode = (code) => code.replace(/^\n+|\s+$/g, '');

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
 * @returns {CodeSample[]}
 */
function normaliseCodeSamples(project) {
  return toArray(project.codeSamples)
    .map((sample) => ({
      fileName: text(sample?.fileName),
      language: text(sample?.language),
      caption: text(sample?.caption),
      code: typeof sample?.code === 'string' ? trimCode(sample.code) : '',
    }))
    .filter((sample) => sample.fileName && sample.code);
}

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

/**
 * @param {string} code
 * @param {Project['stack']} stack
 * @param {Context} context
 * @param {{ language?: string, label?: string }} [options]
 */
function createCodeBlock(code, stack, context, { language, label = 'Trecho de código' } = {}) {
  return el(
    'pre',
    {
      className: 'code',
      // In cards the snippet is a visual preview (the modal repeats it); in the modal it scrolls
      attrs: context === 'modal' ? { tabindex: 0, 'aria-label': label } : { 'aria-hidden': 'true' },
    },
    [el('code', {}, [highlightCode(code, stack, language)])],
  );
}

/** @param {Project} project */
function defaultFileName(project) {
  if (project.stack === 'cobol') {
    const name = project.id
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, COBOL_PROGRAM_NAME_MAX)
      .toUpperCase();
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
  el(
    'span',
    { className: 'mockup__dots' },
    [0, 1, 2].map(() => el('span', { className: 'mockup__dot' })),
  );

/**
 * Window-style mockup (terminal or browser).
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
 * @param {Project} project
 * @param {Image[]} images
 * @param {Context} context
 */
function createTerminalMockup(project, images, context) {
  const snippet = text(project.codeSnippet) ? trimCode(project.codeSnippet) : '';
  let body;
  if (context === 'modal' && images.length > 1) {
    body = createCarousel(images, { label: `Capturas de tela: ${project.title}` });
  } else if (snippet && (context === 'card' || !images.length)) {
    body = createCodeBlock(snippet, project.stack, context);
  } else {
    body = images.length ? createImage(images[0]) : createPlaceholder();
  }
  const title = el('span', {
    className: 'mockup__title',
    text: text(project.fileName) || defaultFileName(project),
  });
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
      el(
        'a',
        { className, attrs: { href: link.href, target: '_blank', rel: 'noopener noreferrer' } },
        [
          icon(link.iconName),
          el('span', { text: link.label }),
          el('span', {
            className: 'visually-hidden',
            text: ` de ${project.title} (abre em nova aba)`,
          }),
        ],
      ),
    );
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
 * Code excerpts: one terminal window per file, behind tabs when there is more than one.
 * @param {Project} project
 * @param {CodeSample[]} samples
 */
function createCodeSamples(project, samples) {
  /** @param {CodeSample} sample */
  const renderSample = (sample) =>
    el('div', { className: 'project-code' }, [
      sample.caption ? el('p', { className: 'project-code__caption', text: sample.caption }) : null,
      createWindow(
        'terminal',
        el('span', { className: 'mockup__title', text: sample.fileName }),
        createCodeBlock(sample.code, project.stack, 'modal', {
          language: sample.language,
          label: `Código: ${sample.fileName}`,
        }),
      ),
    ]);

  if (samples.length === 1) return renderSample(samples[0]);

  return createTabs(samples, {
    label: `Arquivos de ${project.title}`,
    idPrefix: `modal-${slug(project.id)}-code`,
    getLabel: (sample) => sample.fileName.split('/').pop() ?? sample.fileName,
    renderPanel: renderSample,
  });
}

/**
 * @param {Project} project
 * @param {HTMLElement} trigger
 */
function openProjectModal(project, trigger) {
  const type = resolveType(project);
  const images = normaliseImages(project.images);
  // A mobile project already shows its phone screens in the media area
  const mobileImages = type === 'mobile' ? [] : normaliseImages(project.mobileImages);
  const snippet = text(project.codeSnippet) ? trimCode(project.codeSnippet) : '';
  const codeSamples = normaliseCodeSamples(project);
  const videos = normaliseVideos(project);
  const tags = getTags(project);
  const paragraphs = toTextList(project.description);
  if (!paragraphs.length && text(project.summary)) paragraphs.push(text(project.summary));
  const highlights = toTextList(project.highlights ?? []);
  const stats = toArray(project.stats).filter((item) => text(item?.value) && text(item?.label));
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

  // Legacy single snippet: in the media when there are no screenshots, otherwise here
  const showSnippet =
    !codeSamples.length && snippet && images.length && (type === 'backend' || type === 'mainframe');

  const detail = el('article', { className: 'project-detail', dataset: { stack: project.stack } }, [
    el('div', { className: 'project-detail__media' }, [createMockup(project, 'modal')]),
    el('div', { className: 'project-detail__body' }, [
      el('header', { className: 'project-detail__header' }, [
        el('p', { className: 'project-detail__eyebrow', text: eyebrow }),
        el('h2', {
          className: 'project-detail__title',
          text: project.title,
          attrs: { id: MODAL_TITLE_ID },
        }),
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
      el('div', { className: 'project-detail__main' }, [
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
        showSnippet
          ? section('Trecho de código', [
              el('div', { className: 'project-detail__code' }, [
                createCodeBlock(snippet, project.stack, 'modal'),
              ]),
            ])
          : null,
      ]),
      el('aside', { className: 'project-detail__aside' }, [
        tags.length ? section('Stack', [createTagList(tags)]) : null,
        links.length
          ? section('Links', [el('div', { className: 'project-detail__links' }, links)])
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
      codeSamples.length
        ? section('Código em destaque', [createCodeSamples(project, codeSamples)], 'wide')
        : null,
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
    {
      className: 'project-card',
      attrs: { 'aria-labelledby': titleId, 'data-tilt': true },
      dataset: { stack: project.stack },
    },
    [
      el('div', { className: 'project-card__glow', attrs: { 'aria-hidden': 'true' } }),
      el('div', { className: 'project-card__media' }, [createMockup(project, 'card')]),
      el('div', { className: 'project-card__body' }, [
        el('p', { className: 'project-card__meta' }, [
          el('span', { className: 'project-card__type', text: TYPE_LABELS[resolveType(project)] }),
          Number.isFinite(project.year) ? el('span', { text: String(project.year) }) : null,
        ]),
        el('h4', { className: 'project-card__title', attrs: { id: titleId } }, [trigger]),
        text(project.summary)
          ? el('p', { className: 'project-card__summary', text: project.summary })
          : null,
        tags.length ? createTagList(tags) : null,
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
