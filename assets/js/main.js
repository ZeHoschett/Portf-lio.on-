/**
 * Entry point (loaded as type="module", so it runs after the HTML is parsed).
 * Each feature is initialised in isolation: if one fails, the rest of the site keeps working.
 */
import { initClipboard } from './modules/clipboard.js';
import { applyConfigBindings } from './modules/config-bindings.js';
import { initMagnetic } from './modules/magnetic.js';
import { initMarquee } from './modules/marquee.js';
import { initNav } from './modules/nav.js';
import { initParallax } from './modules/parallax.js';
import { initProjectsTabs } from './modules/projects-tabs.js';
import { initRails } from './modules/rail.js';
import { renderCertificates } from './modules/render-certificates.js';
import { renderEducation } from './modules/render-education.js';
import { renderProjects } from './modules/render-projects.js';
import { initReveal } from './modules/reveal.js';
import { initScrollProgress } from './modules/scroll-progress.js';
import { initSpecular } from './modules/specular.js';
import { initStaticCode } from './modules/static-code.js';
import { initWhatsappFloat } from './modules/whatsapp-float.js';

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
safeInit('nav', initNav);
safeInit('scroll-progress', initScrollProgress);
// Data-driven content first, so reveal sees the rendered cards
safeInit('projects', () => renderProjects());
safeInit('education', () => renderEducation());
safeInit('certificates', () => renderCertificates());
safeInit('projects-tabs', initProjectsTabs);
safeInit('rails', initRails);
safeInit('static-code', initStaticCode);
safeInit('specular', initSpecular);
safeInit('reveal', initReveal);
safeInit('marquee', initMarquee);
safeInit('parallax', initParallax);
safeInit('magnetic', initMagnetic);
safeInit('clipboard', initClipboard);
safeInit('whatsapp-float', initWhatsappFloat);
