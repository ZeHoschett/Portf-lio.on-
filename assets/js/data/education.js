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
  // TODO(jose): substituir este placeholder pela sua formação real (ou apagar para exibir o estado vazio)
  {
    id: 'education-placeholder',
    institution: 'Instituição de ensino',
    course: 'Nome do curso',
    degree: 'Graduação',
    period: 'Período a definir',
    status: 'in-progress',
    description: 'Detalhes da formação serão adicionados em breve.',
  },
];
