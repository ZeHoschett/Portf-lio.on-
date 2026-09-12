/**
 * Web subsection background — "front-end, interactivity, the browser itself":
 * a grid of dots that lean towards the cursor, grow and glow around it (magnetic effect).
 * Without a mouse (touch) or while the pointer is elsewhere, a slow wave sweeps the grid.
 * Reduced motion → one static frame.
 *
 * Performance: the resting dots are a CSS background pattern on the canvas element (composited,
 * free every frame, visible even without JS). The canvas only draws the *active* dots — those lit
 * by the wave or the cursor — aligned with that pattern through CSS custom properties.
 */
import { createAnimationLoop } from '../utils/animation-loop.js';
import { readCssVar, setupCanvas, withAlpha } from '../utils/canvas.js';
import { qs } from '../utils/dom.js';
import { isLowPowerDevice, watchFinePointer, watchReducedMotion } from '../utils/motion.js';
import { onScrollFrame } from '../utils/scroll.js';

const MAX_DPR = 1.5;
const MOBILE_BREAKPOINT = 768;
const TAU = Math.PI * 2;

// Grid (must match the CSS pattern, which reads the values set below)
const SPACING = { desktop: 28, mobile: 24 };
const LOW_POWER_SCALE = 1.3;
const DOT_SIZE = 1.6;

// Intensity is quantised into levels → one fill() per level; level 0 = resting (CSS)
const LEVELS = 8;
const ROUND_FROM_LEVEL = 2; // faint active dots are squares (cheaper), brighter ones circles
const LEVEL_ALPHA = { min: 0.3, max: 1 };
const CORE_LEVEL_SHARE = 0.75; // brightest levels shift from violet to blue

// Pointer (magnetic)
const POINTER_RADIUS = 150;
const POINTER_PULL_PX = 14;
const POINTER_MAX_PULL_SHARE = 0.5; // never pull a dot past the cursor
const POINTER_GROW_PX = 3.2;
const POINTER_EASING = 0.18;
const POINTER_FADE_PER_MS = 0.004; // how fast the pointer takes over from the wave
const HALO = { scale: 1.3, alpha: 0.12 };

// Automatic wave
const WAVE = { length: 420, speedPxPerMs: 0.12, sharpness: 6, strength: 0.5, angle: -0.6 };

const STATIC_TIME_MS = 2000;

export function initWebDotgrid() {
  const canvas = /** @type {HTMLCanvasElement | null} */ (qs('[data-animation="web-dotgrid"]'));
  if (!canvas) return;
  const section = canvas.closest('section') ?? canvas.parentElement;

  const lowPower = isLowPowerDevice();
  const violet = readCssVar('--stack-web');
  const blue = readCssVar('--color-accent-2');

  // Paint per active level (index 0 unused: resting dots come from CSS)
  const paint = Array.from({ length: LEVELS }, (_, level) => {
    const share = level / (LEVELS - 1);
    return withAlpha(share > CORE_LEVEL_SHARE ? blue : violet, LEVEL_ALPHA.min + (LEVEL_ALPHA.max - LEVEL_ALPHA.min) * share);
  });
  const halo = { inner: withAlpha(violet, HALO.alpha), outer: withAlpha(violet, 0) };
  const waveDirection = { x: Math.cos(WAVE.angle), y: Math.sin(WAVE.angle) };

  /** @type {import('../utils/canvas.js').CanvasSurface | null} */
  let view = null;
  /** @type {{ count: number, baseX: Float32Array, baseY: Float32Array, x: Float32Array, y: Float32Array, size: Float32Array, level: Uint8Array } | null} */
  let grid = null;
  let reducedMotion = false;
  let finePointer = false;
  /** @type {DOMRect | null} */
  let canvasRect = null;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, inside: false, influence: 0 };

  function build() {
    if (!view) return;
    const mobile = view.width < MOBILE_BREAKPOINT;
    const spacing = (mobile ? SPACING.mobile : SPACING.desktop) * (lowPower ? LOW_POWER_SCALE : 1);
    const cols = Math.floor(view.width / spacing) + 1;
    const rows = Math.floor(view.height / spacing) + 1;
    const offsetX = (view.width - (cols - 1) * spacing) / 2;
    const offsetY = (view.height - (rows - 1) * spacing) / 2;
    const count = cols * rows;

    // Align the CSS resting-dot pattern with the canvas grid
    canvas.style.setProperty('--dotgrid-spacing', `${spacing}px`);
    canvas.style.setProperty('--dotgrid-offset-x', `${offsetX}px`);
    canvas.style.setProperty('--dotgrid-offset-y', `${offsetY}px`);

    grid = {
      count,
      baseX: new Float32Array(count),
      baseY: new Float32Array(count),
      x: new Float32Array(count),
      y: new Float32Array(count),
      size: new Float32Array(count),
      level: new Uint8Array(count),
    };
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        grid.baseX[index] = offsetX + col * spacing;
        grid.baseY[index] = offsetY + row * spacing;
      }
    }
  }

  function draw(time, delta) {
    if (!view || !grid) return;
    const { ctx, width, height } = view;
    const g = grid;

    if (delta) {
      pointer.x += (pointer.targetX - pointer.x) * POINTER_EASING;
      pointer.y += (pointer.targetY - pointer.y) * POINTER_EASING;
      const target = pointer.inside && finePointer && !reducedMotion ? 1 : 0;
      const step = POINTER_FADE_PER_MS * delta;
      pointer.influence =
        target > pointer.influence ? Math.min(target, pointer.influence + step) : Math.max(target, pointer.influence - step);
    }

    const waveWeight = 1 - pointer.influence;
    const waveOffset = time * WAVE.speedPxPerMs;
    const radiusSquared = POINTER_RADIUS * POINTER_RADIUS;

    for (let i = 0; i < g.count; i++) {
      let x = g.baseX[i];
      let y = g.baseY[i];
      let intensity = 0;

      if (waveWeight > 0) {
        const phase = ((x * waveDirection.x + y * waveDirection.y - waveOffset) / WAVE.length) * TAU;
        intensity = ((Math.sin(phase) + 1) / 2) ** WAVE.sharpness * WAVE.strength * waveWeight;
      }

      if (pointer.influence > 0) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < radiusSquared) {
          const distance = Math.sqrt(distanceSquared) || 1;
          const force = (1 - distance / POINTER_RADIUS) ** 2 * pointer.influence;
          const pull = Math.min(force * POINTER_PULL_PX, distance * POINTER_MAX_PULL_SHARE);
          x += (dx / distance) * pull;
          y += (dy / distance) * pull;
          intensity = Math.max(intensity, force);
        }
      }

      g.x[i] = x;
      g.y[i] = y;
      g.size[i] = DOT_SIZE + intensity * POINTER_GROW_PX;
      g.level[i] = Math.round(intensity * (LEVELS - 1));
    }

    ctx.clearRect(0, 0, width, height);

    if (pointer.influence > 0) {
      const radius = POINTER_RADIUS * HALO.scale;
      const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
      gradient.addColorStop(0, halo.inner);
      gradient.addColorStop(1, halo.outer);
      ctx.globalAlpha = pointer.influence;
      ctx.fillStyle = gradient;
      ctx.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);
      ctx.globalAlpha = 1;
    }

    // Only active dots (level ≥ 1); the resting grid is the CSS pattern underneath
    for (let level = 1; level < LEVELS; level++) {
      ctx.beginPath();
      let hasDots = false;
      for (let i = 0; i < g.count; i++) {
        if (g.level[i] !== level) continue;
        const size = g.size[i];
        if (level < ROUND_FROM_LEVEL) {
          ctx.rect(g.x[i] - size / 2, g.y[i] - size / 2, size, size);
        } else {
          ctx.moveTo(g.x[i] + size / 2, g.y[i]);
          ctx.arc(g.x[i], g.y[i], size / 2, 0, TAU);
        }
        hasDots = true;
      }
      if (!hasDots) continue;
      ctx.fillStyle = paint[level];
      ctx.fill();
    }
  }

  // ---------- Wiring ----------
  view = setupCanvas(canvas, {
    maxDpr: MAX_DPR,
    onResize: (surface) => {
      const sizeChanged = !grid || surface.width !== view?.width || surface.height !== view?.height;
      view = surface;
      canvasRect = null;
      if (sizeChanged) build();
      if (reducedMotion) draw(STATIC_TIME_MS, 0);
    },
  });
  if (!grid) build();

  const loop = createAnimationLoop({
    target: canvas,
    onFrame: (elapsed, delta) => draw(STATIC_TIME_MS + elapsed, delta),
  });

  onScrollFrame(() => {
    canvasRect = null;
  });

  section?.addEventListener(
    'pointermove',
    (event) => {
      if (!finePointer) return;
      canvasRect ??= canvas.getBoundingClientRect();
      pointer.targetX = event.clientX - canvasRect.left;
      pointer.targetY = event.clientY - canvasRect.top;
      if (!pointer.inside) {
        // Start the easing from the entry point instead of sweeping in from (0, 0)
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }
      pointer.inside = true;
    },
    { passive: true },
  );
  section?.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });

  watchFinePointer((fine) => {
    finePointer = fine;
  });
  watchReducedMotion((reduced) => {
    reducedMotion = reduced;
    loop.setEnabled(!reduced);
    if (reduced) {
      pointer.influence = 0;
      draw(STATIC_TIME_MS, 0);
    }
  });
}
