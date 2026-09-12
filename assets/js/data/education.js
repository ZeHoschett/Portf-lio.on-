/**
 * Education timeline shown in #formacao (rendered in list order — put the most recent first).
 *
 * @typedef {Object} Education
 * @property {string} id                              unique slug
 * @property {string} institution
 * @property {string} course
 * @property {string} degree                          e.g. 'Graduação', 'Tecnólogo', 'Pós-graduação'
 * @property {string} period                          e.g. '2022 — 2025'
 * @property {'completed'|'in-progress'} status
 * @property {string} [description]
 */

/** @type {Education[]} */
export const education = [
  {
    id: 'analise-desenvolvimento-sistemas',
    // TODO(jose): nome da instituição (o item não renderiza sem este campo)
    institution: 'Instituição de ensino',
    course: 'Análise e Desenvolvimento de Sistemas',
    degree: '', // TODO(jose): ex.: 'Tecnólogo' ou 'Bacharelado'. Vazio = não é exibido
    period: 'Período a definir', // TODO(jose): ex.: '2023 — 2025'
    status: 'in-progress', // TODO(jose): 'completed' se já concluiu
    description: 'Detalhes da formação serão adicionados em breve.',
  },
];
