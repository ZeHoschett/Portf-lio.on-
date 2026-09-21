/**
 * Personal data and links — the ONLY place to edit them.
 * Empty strings are safe: the related links/buttons are simply not rendered.
 *
 * @typedef {Object} SiteConfig
 * @property {string} name
 * @property {string} role
 * @property {string} tagline
 * @property {string|string[]} bio  one string or one per paragraph
 * @property {string} photo      relative path to the photo (e.g. 'assets/img/jose.webp')
 * @property {string} email
 * @property {string} linkedin
 * @property {string} github
 * @property {{number: string, message: string}} whatsapp
 */

/** @type {SiteConfig} */
export const config = {
  name: 'José Hoschett',
  role: 'Desenvolvedor COBOL · Java',
  tagline: 'Desenvolvedor COBOL para ambientes Mainframe e aplicações Java Backend.', // TODO(jose): revisar
  // Um item por parágrafo. Vazio = o texto padrão do index.html é exibido.
  bio: [
    'Sou estudante de Análise e Desenvolvimento de Sistemas e apaixonado por tecnologia, aprendizado contínuo e resolução de problemas. Tenho grande interesse em desenvolvimento de software, com foco em Java e COBOL, explorando tanto tecnologias modernas quanto sistemas corporativos que movimentam setores como o financeiro e bancário.',
    'Além da programação, sou fascinado por história, filosofia, desenvolvimento pessoal e pela forma como a matemática influencia nossa maneira de pensar e resolver desafios. Acredito que a tecnologia é uma ferramenta poderosa para transformar ideias em soluções reais.',
    'Possuo um perfil criador e analítico, movido pela curiosidade e pela busca constante por conhecimento. Gosto de compreender como as coisas funcionam, identificar oportunidades de melhoria e desenvolver soluções que gerem valor para pessoas e negócios.',
  ],
  photo: 'assets/img/jose-hoschett.webp', // retrato 4:5, 832×1040
  email: 'dev.jose841@gmail.com',
  linkedin: 'https://www.linkedin.com/in/josehoschett/',
  github: 'https://github.com/ZeHoschett',
  whatsapp: {
    number: '5511952170800', // (11) 95217-0800 — nunca exibido como texto na página
    message: 'Olá José! Vi seu portfólio e gostaria de conversar.',
  },
};
