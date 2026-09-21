/**
 * Certificates shown in #certificados. An empty list renders the empty state.
 *
 * @typedef {Object} CertificateImage
 * @property {string} src     e.g. 'assets/img/certificates/<id>.webp'
 * @property {string} alt
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} Certificate
 * @property {string} id                  unique slug
 * @property {string} name
 * @property {string} issuer
 * @property {string} [date]              'YYYY-MM', e.g. '2025-03' → shown as "mar. 2025"
 * @property {string} [description]       one short sentence, shown on the card and in the lightbox
 * @property {CertificateImage} [image]   opens enlarged in the lightbox
 * @property {string} [credentialUrl]     verification link (hidden when empty)
 */

/** @type {Certificate[]} */
export const certificates = [
  {
    id: 'cobol-primeiros-passos',
    name: 'Cobol: primeiros passos',
    issuer: 'Alura',
    date: '2026-09',
    description:
      '10 horas sobre a estrutura da linguagem, comandos e variáveis, operadores aritméticos e relacionais, lógica com parágrafos, repetições e variáveis de índice.',
    image: {
      src: 'assets/img/certificates/cobol-primeiros-passos.webp',
      alt: 'Certificado de conclusão do curso Cobol: primeiros passos, da Alura',
      width: 1307,
      height: 881,
    },
    credentialUrl: 'https://cursos.alura.com.br/certificate/2cae4d28-4376-4912-9fb7-a3373d7fac0c',
  },
  {
    id: 'java-primeira-aplicacao',
    name: 'Java: criando a sua primeira aplicação',
    issuer: 'Alura',
    date: '2026-02',
    description:
      '8 horas de introdução ao Java, construindo a primeira aplicação do código à execução.',
    image: {
      src: 'assets/img/certificates/java-primeira-aplicacao.webp',
      alt: 'Certificado de conclusão do curso Java: criando a sua primeira aplicação, da Alura',
      width: 1307,
      height: 881,
    },
    credentialUrl:
      'https://cursos.alura.com.br/user/josehoschett841/course/java-criando-primeira-aplicacao/certificate',
  },
  {
    id: 'java-orientacao-objetos',
    name: 'Praticando Java: orientação a objetos',
    issuer: 'Alura',
    date: '2026-02',
    description: '4 horas de exercícios de orientação a objetos com classes, atributos e métodos.',
    image: {
      src: 'assets/img/certificates/java-orientacao-objetos.webp',
      alt: 'Certificado de conclusão do curso Praticando Java: orientação a objetos com classes, atributos e métodos, da Alura',
      width: 1307,
      height: 881,
    },
    credentialUrl:
      'https://cursos.alura.com.br/user/josehoschett841/course/praticando-java-orientacao-objetos-classes-atributos-metodos/certificate',
  },
  {
    id: 'java-heranca-polimorfismo',
    name: 'Praticando Java: herança, polimorfismo e interfaces',
    issuer: 'Alura',
    date: '2026-02',
    description: '6 horas de exercícios de herança, polimorfismo e interfaces em Java.',
    image: {
      src: 'assets/img/certificates/java-heranca-polimorfismo.webp',
      alt: 'Certificado de conclusão do curso Praticando Java: herança, polimorfismo e interfaces, da Alura',
      width: 1307,
      height: 881,
    },
    credentialUrl:
      'https://cursos.alura.com.br/user/josehoschett841/course/praticando-java-heranca-polimorfismo-interfaces/certificate',
  },
  {
    id: 'java-encapsulamento',
    name: 'Praticando Java: encapsulamento',
    issuer: 'Alura',
    date: '2026-02',
    description: '4 horas de exercícios de encapsulamento e controle de acesso aos atributos.',
    image: {
      src: 'assets/img/certificates/java-encapsulamento.webp',
      alt: 'Certificado de conclusão do curso Praticando Java: encapsulamento, da Alura',
      width: 1307,
      height: 881,
    },
    credentialUrl:
      'https://cursos.alura.com.br/user/josehoschett841/course/praticando-java-encapsulamento/certificate',
  },
  {
    id: 'java-colecoes-streams',
    name: 'Praticando Java: coleções e streams',
    issuer: 'Alura',
    date: '2026-02',
    description: '4 horas de exercícios com as coleções do Java e a API de streams.',
    image: {
      src: 'assets/img/certificates/java-colecoes-streams.webp',
      alt: 'Certificado de conclusão do curso Praticando Java: coleções e streams, da Alura',
      width: 1307,
      height: 881,
    },
    credentialUrl:
      'https://cursos.alura.com.br/user/josehoschett841/course/praticando-java-colecoes-streams/certificate',
  },
  {
    id: 'java-strings-regex',
    name: 'Praticando Java: Strings e Regex',
    issuer: 'Alura',
    date: '2026-01',
    description:
      '4 horas de exercícios de manipulação de texto em Java com Strings e expressões regulares.',
    image: {
      src: 'assets/img/certificates/java-strings-regex.webp',
      alt: 'Certificado de conclusão do curso Praticando Java: Strings e Regex, da Alura',
      width: 1307,
      height: 881,
    },
    credentialUrl:
      'https://cursos.alura.com.br/user/josehoschett841/course/praticando-java-strings-regex/certificate',
  },
  {
    id: 'administrando-banco-de-dados',
    name: 'Administrando banco de dados',
    issuer: 'Fundação Bradesco, Escola Virtual',
    date: '2025-12',
    description: 'Curso autoinstrucional de 15 horas sobre a administração de bancos de dados.',
    image: {
      src: 'assets/img/certificates/administrando-banco-de-dados.webp',
      alt: 'Certificado de conclusão do curso Administrando banco de dados, da Escola Virtual da Fundação Bradesco',
      width: 1370,
      height: 918,
    },
  },
  {
    id: 'git-github',
    name: 'Introdução ao Git e GitHub',
    issuer: 'FGV Online',
    date: '2026-05',
    description:
      '15 horas sobre versionamento de código com Git e trabalho com repositórios no GitHub.',
    image: {
      src: 'assets/img/certificates/git-github.webp',
      alt: 'Declaração de participação no curso Introdução ao Git e GitHub, da FGV Online',
      width: 1269,
      height: 873,
    },
  },
  {
    id: 'powerbi-visualizando-dados',
    name: 'Visualizando dados no Power BI',
    issuer: 'Fundação Bradesco, Escola Virtual',
    date: '2025-12',
    description: 'Curso autoinstrucional de 10 horas sobre visualização de dados no Power BI.',
    image: {
      src: 'assets/img/certificates/powerbi-visualizando.webp',
      alt: 'Certificado de conclusão do curso Visualizando dados no Power BI, da Escola Virtual da Fundação Bradesco',
      width: 1392,
      height: 933,
    },
  },
  {
    id: 'claude-code-101',
    name: 'Claude Code 101',
    issuer: 'Anthropic',
    date: '2026-05',
    description: 'Curso oficial da Anthropic com os fundamentos do Claude Code no terminal.',
    image: {
      src: 'assets/img/certificates/claude-code-101.webp',
      alt: 'Certificado de conclusão do curso Claude Code 101, da Anthropic',
      width: 1316,
      height: 998,
    },
  },
  {
    id: 'claude-code-in-action',
    name: 'Claude Code in Action',
    issuer: 'Anthropic',
    date: '2026-05',
    description: 'Curso oficial da Anthropic sobre o Claude Code aplicado ao fluxo de trabalho.',
    image: {
      src: 'assets/img/certificates/claude-code-in-action.webp',
      alt: 'Certificado de conclusão do curso Claude Code in Action, da Anthropic',
      width: 1316,
      height: 998,
    },
    credentialUrl: 'https://verify.skilljar.com/c/2gitxfps6wpw',
  },
  {
    id: 'claude-subagents',
    name: 'Introduction to subagents',
    issuer: 'Anthropic',
    description:
      'Curso oficial da Anthropic sobre subagentes: delegar partes da tarefa a agentes especializados.',
    image: {
      src: 'assets/img/certificates/claude-subagents.webp',
      alt: 'Certificado de conclusão do curso Introduction to subagents, da Anthropic',
      width: 1316,
      height: 998,
    },
  },
  {
    id: 'claude-mcp',
    name: 'Introduction to Model Context Protocol',
    issuer: 'Anthropic',
    date: '2026-05',
    description:
      'Curso oficial da Anthropic sobre o MCP, o protocolo que conecta agentes a ferramentas e fontes de dados.',
    image: {
      src: 'assets/img/certificates/claude-mcp.webp',
      alt: 'Certificado de conclusão do curso Introduction to Model Context Protocol, da Anthropic',
      width: 1316,
      height: 998,
    },
    credentialUrl: 'https://verify.skilljar.com/c/78piw8odr8wa',
  },
];
