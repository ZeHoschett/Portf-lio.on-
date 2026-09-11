/**
 * Hero background: a metallic violet/blue/silver orb that slowly deforms (3D simplex noise on
 * its radius), lit from the top-left, with a halo, a rim light and a drifting glint.
 * Follows the pointer slightly (desktop). Reduced motion → one static frame.
 */
import { createAnimationLoop } from '../utils/animation-loop.js';
import { readCssVar, setupCanvas, withAlpha } from '../utils/canvas.js';
import { qs } from '../utils/dom.js';
import { isLowPowerDevice, watchFinePointer, watchReducedMotion } from '../utils/motion.js';
import { createNoise3D } from '../utils/noise.js';

const TAU = Math.PI * 2;
const NOISE_SEED = 7;
const POINTS = { high: 96, low: 48 };

// Shape
const NOISE_FREQUENCY = 0.9;
const DETAIL_FREQUENCY = 2.1;
const DETAIL_WEIGHT = 0.35;
const MORPH_SPEED = 0.00016; // noise units per ms
const DETAIL_SPEED = 0.00027;
const MORPH_AMPLITUDE = 0.07; // ratio of the radius

// Placement: centred on the portrait (ratios of its box), or on the canvas as a fallback
const ANCHOR = { x: 0.5, y: 0.4, radius: 0.8 };
const FALLBACK = { x: 0.68, y: 0.42, radius: 0.34 };

// Pointer
const POINTER_EASING = 0.05;
const POINTER_SHIFT = 0.1; // ratio of the radius
const LIGHT_COUNTER_SHIFT = 1.5;

// Lighting (ratios of the radius)
const LIGHT_OFFSET = { x: -0.38, y: -0.42 };
const RIM_OFFSET = { x: 0.55, y: 0.62 };
const GLINT_ORBIT = { x: 0.42, y: 0.38, speedX: 0.00021, speedY: 0.00017 };

const STATIC_TIME_MS = 2400; // frame shown when motion is reduced

export function initHeroOrb() {
  const canvas = /** @type {HTMLCanvasElement | null} */ (qs('[data-hero-orb]'));
  if (!canvas) return;

  const anchor = qs('.hero__photo');
  const noise3D = createNoise3D(NOISE_SEED);
  const points = new Float32Array((isLowPowerDevice() ? POINTS.low : POINTS.high) * 2);

  const tokens = {
    highlight: readCssVar('--color-text'),
    silver: readCssVar('--color-silver'),
    accent: readCssVar('--color-accent'),
    accent2: readCssVar('--color-accent-2'),
    deep: readCssVar('--color-bg-elev'),
  };
  // Pre-built color strings: no string allocation per frame
  const paint = {
    haloInner: withAlpha(tokens.accent, 0.32),
    haloMid: withAlpha(tokens.accent2, 0.1),
    haloOuter: withAlpha(tokens.accent2, 0),
    shadowInner: withAlpha(tokens.deep, 0.55),
    shadowOuter: withAlpha(tokens.deep, 0),
    rimInner: withAlpha(tokens.accent2, 0.4),
    rimOuter: withAlpha(tokens.accent2, 0),
    glintInner: withAlpha(tokens.silver, 0.35),
    glintOuter: withAlpha(tokens.silver, 0),
  };

  const orb = { x: 0, y: 0, radius: 0 };
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  /** @type {import('../utils/canvas.js').CanvasSurface | null} */
  let view = null;
  let reducedMotion = false;
  let time = STATIC_TIME_MS;

  function measure() {
    if (!view) return;
    const box = canvas.getBoundingClientRect();
    const rect = anchor?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      orb.x = rect.left - box.left + rect.width * ANCHOR.x;
      orb.y = rect.top - box.top + rect.height * ANCHOR.y;
      orb.radius = rect.width * ANCHOR.radius;
    } else {
      orb.x = view.width * FALLBACK.x;
      orb.y = view.height * FALLBACK.y;
      orb.radius = Math.min(view.width, view.height) * FALLBACK.radius;
    }
  }

  /** Builds the deformed outline as a smooth closed curve through edge midpoints. */
  function tracePath(ctx, cx, cy, radius, t) {
    const count = points.length / 2;
    const z = t * MORPH_SPEED;
    const detailZ = t * DETAIL_SPEED;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const base = noise3D(nx * NOISE_FREQUENCY, ny * NOISE_FREQUENCY, z);
      const detail = noise3D(nx * DETAIL_FREQUENCY, ny * DETAIL_FREQUENCY, detailZ);
      const r = radius * (1 + MORPH_AMPLITUDE * (base + detail * DETAIL_WEIGHT));
      points[i * 2] = cx + nx * r;
      points[i * 2 + 1] = cy + ny * r;
    }

    ctx.beginPath();
    const lastX = points[(count - 1) * 2];
    const lastY = points[(count - 1) * 2 + 1];
    ctx.moveTo((lastX + points[0]) / 2, (lastY + points[1]) / 2);
    for (let i = 0; i < count; i++) {
      const x = points[i * 2];
      const y = points[i * 2 + 1];
      const next = ((i + 1) % count) * 2;
      ctx.quadraticCurveTo(x, y, (x + points[next]) / 2, (y + points[next + 1]) / 2);
    }
    ctx.closePath();
  }

  function draw(t) {
    if (!view || !orb.radius) return;
    const { ctx, width, height } = view;
    const r = orb.radius;
    const shiftX = pointer.x * r * POINTER_SHIFT;
    const shiftY = pointer.y * r * POINTER_SHIFT;
    const cx = orb.x + shiftX;
    const cy = orb.y + shiftY;

    ctx.clearRect(0, 0, width, height);

    // Halo
    const halo = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 2.1);
    halo.addColorStop(0, paint.haloInner);
    halo.addColorStop(0.45, paint.haloMid);
    halo.addColorStop(1, paint.haloOuter);
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    // Body — the light source drifts against the pointer for a subtle 3D parallax
    tracePath(ctx, cx, cy, r, t);
    const lightX = cx + r * LIGHT_OFFSET.x - shiftX * LIGHT_COUNTER_SHIFT;
    const lightY = cy + r * LIGHT_OFFSET.y - shiftY * LIGHT_COUNTER_SHIFT;
    const body = ctx.createRadialGradient(lightX, lightY, r * 0.02, cx, cy, r * 1.08);
    body.addColorStop(0, tokens.highlight);
    body.addColorStop(0.22, tokens.silver);
    body.addColorStop(0.46, tokens.accent);
    body.addColorStop(0.78, tokens.accent2);
    body.addColorStop(1, tokens.deep);
    ctx.fillStyle = body;
    ctx.fill();

    ctx.save();
    ctx.clip();

    // Core shadow on the side opposite the light: gives the metal its volume
    const shadowX = cx - r * LIGHT_OFFSET.x;
    const shadowY = cy - r * LIGHT_OFFSET.y;
    const shadow = ctx.createRadialGradient(shadowX, shadowY, r * 0.1, shadowX, shadowY, r * 1.1);
    shadow.addColorStop(0, paint.shadowInner);
    shadow.addColorStop(1, paint.shadowOuter);
    ctx.fillStyle = shadow;
    ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);

    // Surface lights
    ctx.globalCompositeOperation = 'screen';

    const rimX = cx + r * RIM_OFFSET.x;
    const rimY = cy + r * RIM_OFFSET.y;
    const rim = ctx.createRadialGradient(rimX, rimY, 0, rimX, rimY, r * 0.85);
    rim.addColorStop(0, paint.rimInner);
    rim.addColorStop(1, paint.rimOuter);
    ctx.fillStyle = rim;
    ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);

    const glintX = cx + Math.cos(t * GLINT_ORBIT.speedX) * r * GLINT_ORBIT.x;
    const glintY = cy + Math.sin(t * GLINT_ORBIT.speedY) * r * GLINT_ORBIT.y;
    const glint = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, r * 0.55);
    glint.addColorStop(0, paint.glintInner);
    glint.addColorStop(1, paint.glintOuter);
    ctx.fillStyle = glint;
    ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);

    ctx.restore();
  }

  const redrawIfStatic = () => {
    if (reducedMotion) draw(STATIC_TIME_MS);
  };

  view = setupCanvas(canvas, {
    onResize: (surface) => {
      view = surface;
      measure();
      redrawIfStatic();
    },
  });
  measure();

  // The portrait moves when fonts load or its intro animation ends
  if (anchor) {
    anchor.addEventListener('animationend', () => {
      measure();
      redrawIfStatic();
    });
    new ResizeObserver(() => {
      measure();
      redrawIfStatic();
    }).observe(anchor.parentElement ?? anchor);
  }

  const loop = createAnimationLoop({
    target: canvas,
    onFrame: (elapsed) => {
      time = STATIC_TIME_MS + elapsed;
      pointer.x += (pointer.targetX - pointer.x) * POINTER_EASING;
      pointer.y += (pointer.targetY - pointer.y) * POINTER_EASING;
      draw(time);
    },
  });

  /** @param {PointerEvent} event */
  const onPointerMove = (event) => {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
  };

  watchFinePointer((fine) => {
    if (fine) window.addEventListener('pointermove', onPointerMove, { passive: true });
    else {
      window.removeEventListener('pointermove', onPointerMove);
      pointer.targetX = 0;
      pointer.targetY = 0;
    }
  });

  watchReducedMotion((reduced) => {
    reducedMotion = reduced;
    loop.setEnabled(!reduced);
    if (reduced) {
      Object.assign(pointer, { x: 0, y: 0, targetX: 0, targetY: 0 });
      draw(STATIC_TIME_MS);
    }
  });
}
