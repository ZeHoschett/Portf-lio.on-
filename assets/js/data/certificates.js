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
 * @property {CertificateImage} [image]   opens enlarged in the lightbox
 * @property {string} [credentialUrl]     verification link (hidden when empty)
 */

/** @type {Certificate[]} */
export const certificates = [
  // TODO(jose): adicionar certificados. Exemplo de formato:
  // {
  //   id: 'nome-do-certificado',
  //   name: 'Nome do certificado',
  //   issuer: 'Emissor',
  //   date: '2025-03',
  //   image: { src: 'assets/img/certificates/nome-do-certificado.webp', alt: 'Certificado de ...', width: 1400, height: 1000 },
  //   credentialUrl: '',
  // },
];
