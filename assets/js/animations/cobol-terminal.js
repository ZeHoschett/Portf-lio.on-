/**
 * COBOL subsection: once the terminal enters the viewport, the program is typed character by
 * character (indentation appears instantly, lines pause briefly), then a block cursor blinks.
 *
 * Accessibility: the real <pre> keeps the complete program in the DOM the whole time — it is
 * only made transparent while typing, so the layout never shifts. The typing is an aria-hidden
 * overlay with identical metrics. Reduced motion: full text and a static cursor right away.
 */
import { createAnimationLoop } from '../utils/animation-loop.js';
import { el, qs } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

const START_DELAY_MS = 350;
const CHAR_DELAY_MS = 22;
const LINE_PAUSE_MS = 160;
const VISIBLE_THRESHOLD = 0.35;

/**
 * Time (ms from the start) at which each character appears.
 * @param {string} text
 * @returns {Float32Array}
 */
function buildSchedule(text) {
  const times = new Float32Array(text.length);
  let clock = START_DELAY_MS;
  let atLineStart = true;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\n') {
      clock += LINE_PAUSE_MS;
      atLineStart = true;
    } else if (atLineStart && char === ' ') {
      // COBOL column indentation: no point typing spaces one by one
    } else {
      clock += CHAR_DELAY_MS;
      atLineStart = false;
    }
    times[i] = clock;
  }
  return times;
}

const createCursor = () => el('span', { className: 'cobol-terminal__cursor', attrs: { 'aria-hidden': 'true' } });

export function initCobolTerminal() {
  const figure = qs('[data-cobol-terminal]');
  const source = figure ? qs('.cobol-terminal__code', figure) : null;
  if (!figure || !source) return;

  const screen = qs('.cobol-terminal__screen', figure) ?? figure;
  const code = qs('code', source) ?? source;
  const text = source.textContent ?? '';

  const finish = () => {
    if (figure.classList.contains('is-done')) return;
    figure.classList.remove('is-typing');
    figure.classList.add('is-done');
    code.append(createCursor());
  };

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    finish();
    return;
  }

  const schedule = buildSchedule(text);
  const typed = document.createTextNode('');
  const overlay = el(
    'pre',
    { className: 'cobol-terminal__code cobol-terminal__typed', attrs: { 'aria-hidden': 'true' } },
    [typed, createCursor()],
  );

  const startTyping = () => {
    figure.classList.add('is-typing');
    screen.append(overlay);
    let shown = 0;

    // Pauses on its own while scrolled away or with the tab hidden
    const loop = createAnimationLoop({
      target: figure,
      onFrame: (elapsed) => {
        let count = shown;
        while (count < text.length && schedule[count] <= elapsed) count++;
        if (count !== shown) {
          shown = count;
          typed.data = text.slice(0, shown);
        }
        if (shown < text.length) return;
        loop.destroy();
        overlay.remove();
        finish();
      },
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect(); // types only once
      startTyping();
    },
    { threshold: VISIBLE_THRESHOLD },
  );
  observer.observe(figure);
}
