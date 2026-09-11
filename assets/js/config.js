/**
 * Personal data and links — the ONLY place to edit them.
 * Empty strings are safe: the related links/buttons are simply not rendered.
 *
 * @typedef {Object} SiteConfig
 * @property {string} name
 * @property {string} role
 * @property {string} tagline
 * @property {string} bio
 * @property {string} photo      relative path to the photo (e.g. 'assets/img/jose.webp')
 * @property {string} email
 * @property {string} linkedin
 * @property {string} github
 * @property {{number: string, message: string}} whatsapp
 * @property {string} resumeUrl  relative path to the PDF
 * @property {string} siteUrl    final public URL (OG/canonical)
 */

/** @type {SiteConfig} */
export const config = {
  name: 'José Hoschett',
  role: 'Desenvolvedor COBOL · Java',
  tagline: 'Do mainframe à nuvem — sistemas robustos com COBOL, Java e Python.', // TODO(jose): revisar
  bio: '', // TODO(jose): bio (2–4 frases). Enquanto vazia, o texto padrão do index.html é exibido.
  photo: '', // TODO(jose): caminho da foto, ex.: 'assets/img/jose.webp' (retrato 4:5, ex.: 800×1000)
  email: 'dev.jose841@gmail.com',
  linkedin: 'https://www.linkedin.com/in/josehoschett/',
  github: '', // TODO(jose): URL do GitHub
  whatsapp: {
    number: '', // TODO(jose): só dígitos com DDI+DDD, ex.: '5511999999999'
    message: 'Olá José! Vi seu portfólio e gostaria de conversar.',
  },
  // TODO(jose): coloque o PDF em assets/docs/ e preencha: 'assets/docs/curriculo-jose-hoschett.pdf'
  // Enquanto vazio, a seção Currículo mostra "Currículo disponível em breve".
  resumeUrl: '',
  siteUrl: '', // TODO(jose): URL final após publicar (usado em OG/canonical)
};
