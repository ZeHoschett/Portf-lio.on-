/**
 * Entry point (loaded as type="module", so it runs after the HTML is parsed).
 * Each feature is initialised in isolation: if one fails, the rest of the site keeps working.
 */
import { applyConfigBindings } from './modules/config-bindings.js';

/**
 * Runs an initializer and contains any error it throws.
 * @param {string} name
 * @param {() => void} init
 */
function safeInit(name, init) {
  try {
    init();
  } catch (error) {
    console.error(`[portfolio] "${name}" failed to initialise.`, error);
  }
}

function setCurrentYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = year;
  });
}

safeInit('config-bindings', () => applyConfigBindings());
safeInit('current-year', setCurrentYear);
