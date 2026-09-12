/**
 * Projects shown in #projetos. Each project appears ONLY in the subsection of its `stack`.
 * How to add one: see README.md → "Como adicionar um novo projeto".
 *
 * @typedef {Object} ProjectImage
 * @property {string} src     relative path, e.g. 'assets/img/projects/<id>/01.webp'
 * @property {string} alt     describe what the screenshot shows
 * @property {number} width   intrinsic width in px (prevents layout shift)
 * @property {number} height  intrinsic height in px
 *
 * @typedef {Object} Project
 * @property {string} id                                  unique slug
 * @property {string} title
 * @property {'java'|'python'|'cobol'|'web'} stack        subsection where it appears
 * @property {'mobile'|'backend'|'mainframe'|'web'} type  mockup: phone | terminal | terminal | browser
 * @property {string} summary                             short description (card, 2–3 lines)
 * @property {string} [description]                       long description (modal)
 * @property {string[]} tags                              e.g. ['Java 17', 'Spring Boot', 'PostgreSQL']
 * @property {ProjectImage[]} [images]
 * @property {string} [codeSnippet]                       optional code for terminal mockups
 * @property {string} [fileName]                          terminal title (default: id + extension)
 * @property {{challenge: string, solution: string}[]} [challenges]  shown in the modal
 * @property {string} [repo]                              repository URL (hidden when empty)
 * @property {string} [demo]                              live demo URL (hidden when empty)
 * @property {number} [year]
 * @property {boolean} [featured]                         spans 2 columns on larger screens
 */

/** @type {ReadonlyArray<Project['stack']>} */
export const STACKS = ['java', 'python', 'cobol', 'web'];

/** @type {Project[]} */
export const projects = [
  {
    id: 'portfolio',
    title: 'Portfólio Pessoal',
    stack: 'web',
    type: 'web',
    summary:
      'Este site: página única responsiva e interativa, feita com HTML, CSS e JavaScript puros, sem frameworks.',
    description:
      'Animações em Canvas com identidade por stack (rede hexagonal para Java, serpentes entrelaçadas para Python, terminal CRT para COBOL e grade interativa para Web), foco em acessibilidade (WCAG 2.1 AA), performance e código modular com ES Modules.',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Acessibilidade'],
    images: [], // TODO(jose): print do site publicado
    repo: '', // TODO(jose): link do repositório
    demo: '', // TODO(jose): link publicado
    year: 2026,
    featured: true,
  },
];
