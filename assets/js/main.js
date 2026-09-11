/**
 * Entry point (loaded as type="module", so it runs after the HTML is parsed).
 * Each feature is initialised in isolation: if one fails, the rest of the site keeps working.
 */
import { initHeroOrb } from './animations/hero-orb.js';
import { applyConfigBindings } from './modules/config-bindings.js';
import { initCursorGlow } from './modules/cursor.js';
import { initHeroTitle } from './modules/hero-title.js';
import { initMagnetic } from './modules/magnetic.js';
import { initMarquee } from './modules/marquee.js';
import { initNav } from './modules/nav.js';
import { initParallax } from './modules/parallax.js';
import { initReveal } from './modules/reveal.js';
import { initScrollProgress } from './modules/scroll-progress.js';
import { whenIdle } from './utils/animation-loop.js';

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
safeInit('reveal', initReveal);
safeInit('marquee', initMarquee);
safeInit('hero-title', initHeroTitle);
safeInit('parallax', initParallax);
safeInit('magnetic', initMagnetic);
safeInit('cursor-glow', initCursorGlow);

// Canvas animations start when the main thread is idle: they never block the first render
whenIdle(() => safeInit('hero-orb', initHeroOrb));
