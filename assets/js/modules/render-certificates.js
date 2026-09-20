/**
 * Renders `data/certificates.js` into the grid of #certificados (`[data-certificates]`).
 * A certificate with an image gets a title button that opens it enlarged in the modal
 * (lightbox); without an image the title is plain text (there would be nothing to enlarge).
 * `description` (one short sentence) is shown on the card and repeated in the lightbox.
 * Invalid entries are skipped with a console warning; an empty list shows the empty state.
 */
import { certificates as defaultCertificates } from '../data/certificates.js';
import { el, icon, qs, sanitizeUrl } from '../utils/dom.js';
import { openModal } from './modal.js';

const EMPTY_MESSAGE = 'Certificados em digitalização — em breve por aqui.';
const LIGHTBOX_TITLE_ID = 'modal-certificate-title';
const MONTH_YEAR = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DEFAULT_IMAGE_SIZE = { width: 1400, height: 1000 };

const dateFormat = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' });

/** @typedef {import('../data/certificates.js').Certificate} Certificate */
/** @typedef {{ src: string, alt: string, width: number, height: number }} Image */

/** @param {unknown} value */
const text = (value) => (typeof value === 'string' ? value.trim() : '');

/** @param {Certificate} certificate */
function isValidCertificate(certificate) {
  const valid =
    Boolean(certificate) && text(certificate.id) !== '' && text(certificate.name) !== '';
  if (!valid) console.warn('[portfolio] Certificado ignorado (id ou name inválidos):', certificate);
  return valid;
}

/**
 * 'YYYY-MM' → 'mar. 2025'. Returns '' for anything else.
 * @param {unknown} value
 */
function formatDate(value) {
  const match = MONTH_YEAR.exec(text(value));
  if (!match) return '';
  return dateFormat.format(new Date(Number(match[1]), Number(match[2]) - 1, 1));
}

/**
 * @param {Certificate} certificate
 * @returns {Image | null}
 */
function normaliseImage(certificate) {
  const src = sanitizeUrl(certificate.image?.src);
  if (!src) return null;
  return {
    src,
    alt: text(certificate.image?.alt) || `Certificado: ${certificate.name}`,
    width: Number(certificate.image?.width) || DEFAULT_IMAGE_SIZE.width,
    height: Number(certificate.image?.height) || DEFAULT_IMAGE_SIZE.height,
  };
}

/**
 * @param {Certificate} certificate
 * @param {string} className
 */
function createCredentialLink(certificate, className) {
  const href = sanitizeUrl(certificate.credentialUrl);
  if (!href) return null;
  return el('a', { className, attrs: { href, target: '_blank', rel: 'noopener noreferrer' } }, [
    icon('external'),
    el('span', { text: 'Ver credencial' }),
    el('span', { className: 'visually-hidden', text: ` de ${certificate.name} (abre em nova aba)` }),
  ]);
}

/**
 * @param {Certificate} certificate
 * @param {Image} image
 * @param {HTMLElement} trigger
 */
function openCertificate(certificate, image, trigger) {
  const meta = [text(certificate.issuer), formatDate(certificate.date)].filter(Boolean).join(' · ');
  const description = text(certificate.description);
  const link = createCredentialLink(certificate, 'btn btn--secondary');

  const figure = el('figure', { className: 'lightbox' }, [
    el('img', {
      className: 'lightbox__image',
      attrs: {
        src: image.src,
        alt: image.alt,
        width: image.width,
        height: image.height,
        decoding: 'async',
      },
    }),
    el('figcaption', { className: 'lightbox__caption' }, [
      el('h2', {
        className: 'lightbox__title',
        text: certificate.name,
        attrs: { id: LIGHTBOX_TITLE_ID },
      }),
      meta ? el('p', { className: 'lightbox__meta', text: meta }) : null,
      description ? el('p', { className: 'lightbox__text', text: description }) : null,
      link,
    ]),
  ]);

  openModal(figure, { labelledBy: LIGHTBOX_TITLE_ID, trigger, variant: 'lightbox' });
}

/** @param {Certificate} certificate */
function createCard(certificate) {
  const image = normaliseImage(certificate);
  const date = formatDate(certificate.date);
  const issuer = text(certificate.issuer);
  const description = text(certificate.description);

  /** @type {Node} */
  let title;
  if (image) {
    const trigger = el('button', {
      className: 'cert-card__trigger',
      attrs: { type: 'button', 'aria-haspopup': 'dialog' },
      text: certificate.name,
    });
    trigger.addEventListener('click', () => openCertificate(certificate, image, trigger));
    title = el('h3', { className: 'cert-card__name' }, [trigger]);
  } else {
    title = el('h3', { className: 'cert-card__name', text: certificate.name });
  }

  const card = el('article', { className: 'cert-card' }, [
    el('div', { className: 'cert-card__media' }, [
      image
        ? el('img', {
            className: 'cert-card__image',
            attrs: {
              src: image.src,
              alt: '', // decorative here: the title already names the certificate
              width: image.width,
              height: image.height,
              loading: 'lazy',
              decoding: 'async',
            },
          })
        : icon('award', 'icon cert-card__placeholder'),
    ]),
    el('div', { className: 'cert-card__body' }, [
      title,
      issuer ? el('p', { className: 'cert-card__issuer', text: issuer }) : null,
      date ? el('p', { className: 'cert-card__date', text: date }) : null,
      description ? el('p', { className: 'cert-card__text', text: description }) : null,
      createCredentialLink(certificate, 'cert-card__link'),
    ]),
  ]);

  return el('li', { className: 'cert-grid__item', attrs: { 'data-reveal': true } }, [card]);
}

const createEmptyState = () =>
  el('li', { className: 'empty-state' }, [
    icon('award', 'icon empty-state__icon'),
    el('span', { text: EMPTY_MESSAGE }),
  ]);

/**
 * Renders the certificate grid. Call again with another list to re-render.
 * @param {Certificate[]} [list]
 */
export function renderCertificates(list = defaultCertificates) {
  const grid = qs('[data-certificates]');
  if (!grid) return;

  const items = list.filter(isValidCertificate);
  grid.replaceChildren(...(items.length ? items.map(createCard) : [createEmptyState()]));
}
