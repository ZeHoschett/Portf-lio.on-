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
 * @property {string} [description]                   optional; omit it and nothing is rendered
 */

/** @type {Education[]} */
export const education = [
  {
    id: 'analise-desenvolvimento-sistemas',
    institution: 'Faculdade Estácio de Sá — São Paulo',
    course: 'Análise e Desenvolvimento de Sistemas',
    degree: 'Tecnólogo',
    period: '2025 — 2027',
    status: 'in-progress',
  },
];
