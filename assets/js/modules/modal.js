/**
 * Shared accessible modal built on the native <dialog> (focus containment, Esc, top layer).
 * Adds: close button, close on backdrop click, scroll lock, focus returned to the trigger.
 * Used for project details (and the certificate lightbox).
 */
import { el, icon } from '../utils/dom.js';

/** @type {HTMLDialogElement | null} */
let dialog = null;
/** @type {HTMLElement | null} */
let content = null;
/** @type {HTMLElement | null} */
let scrollArea = null;
/** @type {HTMLElement | null} */
let returnFocusTo = null;

function onClose() {
  document.documentElement.classList.remove('is-scroll-locked');
  content?.replaceChildren();
  dialog?.removeAttribute('aria-labelledby');
  dialog?.removeAttribute('data-variant');

  const target = returnFocusTo;
  returnFocusTo = null;
  if (target?.isConnected) target.focus({ preventScroll: true });
}

/** Creates the dialog once, on first use. */
function ensureDialog() {
  if (dialog) return dialog;

  const closeButton = el('button', { className: 'btn btn--icon modal__close', attrs: { type: 'button' } }, [
    icon('close'),
    el('span', { className: 'visually-hidden', text: 'Fechar' }),
  ]);

  content = el('div', { className: 'modal__content' });
  scrollArea = el('div', { className: 'modal__scroll' }, [content]);
  dialog = /** @type {HTMLDialogElement} */ (
    el('dialog', { className: 'modal' }, [el('div', { className: 'modal__panel' }, [closeButton, scrollArea])])
  );

  closeButton.addEventListener('click', () => dialog?.close());

  // Close on backdrop click — only when the press also started on the backdrop, so a text
  // selection dragged out of the panel does not close the dialog.
  let pressedOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => {
    pressedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener('click', (event) => {
    if (pressedOnBackdrop && event.target === dialog) dialog?.close();
    pressedOnBackdrop = false;
  });

  dialog.addEventListener('close', onClose);
  document.body.append(dialog);
  return dialog;
}

/**
 * Opens the modal with the given content.
 * @param {Node} node  content (build it with el(); never HTML strings)
 * @param {Object} options
 * @param {string} options.labelledBy  id of the heading inside `node`
 * @param {HTMLElement} [options.trigger]  receives focus back on close
 * @param {string} [options.variant]  styling hook (data-variant), e.g. 'lightbox'
 */
export function openModal(node, { labelledBy, trigger, variant }) {
  const modal = ensureDialog();

  content?.replaceChildren(node);
  modal.setAttribute('aria-labelledby', labelledBy);
  if (variant) modal.dataset.variant = variant;
  else modal.removeAttribute('data-variant');
  if (scrollArea) scrollArea.scrollTop = 0;

  if (!modal.open) {
    returnFocusTo = trigger ?? /** @type {HTMLElement | null} */ (document.activeElement);
    document.documentElement.classList.add('is-scroll-locked');
    modal.showModal();
  }
}
