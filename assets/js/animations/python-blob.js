/**
 * Python subsection background — "data, fluidity, flexibility":
 * an organic blob morphing continuously (radius perturbed by fractal 3D noise over time),
 * filled with a slowly rotating Python blue → site violet → Python yellow gradient, with a soft
 * glow, plus small particles drifting upwards and gently attracted to it.
 * Reduced motion → one static frame.
 */
import { createAnimationLoop } from '../utils/animation-loop.js';
import { readCssVar, setupCanvas, withAlpha } from '../utils/canvas.js';
import { qs } from '../utils/dom.js';
import { isLowPowerDevice, watchReducedMotion } from '../utils/motion.js';
import { createNoise3D, createRandom } from '../utils/noise.js';

const SEED = 23;
const MAX_DPR = 1.5;
const MOBILE_BREAKPOINT = 768;
const TAU = Math.PI * 2;

// Blob shape
const POINTS = { high: 90, low: 54 };
// Desktop: beside the heading. Mobile: tucked into the top-right corner, away from the text.
const PLACEMENT = {
  desktop: { x: 0.72, y: 0.36, radius: 0.27 },
  mobile: { x: 0.88, y: 0.14, radius: 0.34 },
};
const RADIUS_LIMITS = { min: 90, max: 250 };
const MORPH = { amplitude: 0.16, frequency: 0.8, speed: 0.00022, octaves: 3, lacunarity: 2, gain: 0.5 };
const OCTAVE_TIME_OFFSET = 13.7;

// Fill and lighting
const GRADIENT_ROTATION_SPEED = 0.00008; // radians per ms
const HIGHLIGHT = { x: -0.35, y: -0.4, radius: 0.9, alpha: 0.35 };
const SHADE = { x: 0.4, y: 0.45, radius: 1, alpha: 0.45 };

// Glow: the blob is redrawn on a tiny canvas, blurred and scaled up (cheap soft halo)
const GLOW = { downscale: 10, blurPx: 3, grow: 1.35, alpha: 0.55 };

// Particles
const PARTICLE_COUNT = { desktop: 70, mobile: 36, lowPower: 24 };
const PARTICLE_SPEED = { min: 0.012, max: 0.035 }; // px per ms, upwards
const PARTICLE_RADIUS = { min: 0.8, max: 2.2 };
const PARTICLE_ALPHA = { min: 0.25, max: 0.8 };
const SWAY_PX_PER_MS = 0.02;
const SWAY_SCALE = 0.0003;
const ATTRACTION_PX_PER_MS = 0.004;
const RESPAWN_MARGIN = 40;
const TOP_FADE = 0.12; // share of the height where particles fade out

const STATIC_TIME_MS = 7000;

const lerp = (min, max, t) => min + (max - min) * t;

export function initPythonBlob() {
  const canvas = /** @type {HTMLCanvasElement | null} */ (qs('[data-animation="python-blob"]'));
  if (!canvas) return;

  const lowPower = isLowPowerDevice();
  const noise3D = createNoise3D(SEED);
  const random = createRandom(SEED);
  const points = new Float32Array((lowPower ? POINTS.low : POINTS.high) * 2);

  const glowCanvas = document.createElement('canvas');
  const glowCtx = glowCanvas.getContext('2d');

  const colors = {
    blue: readCssVar('--stack-python-a'),
    violet: readCssVar('--color-accent'),
    yellow: readCssVar('--stack-python-b'),
  };
  const bg = readCssVar('--color-bg');
  const paint = {
    highlightInner: withAlpha(readCssVar('--color-text'), HIGHLIGHT.alpha),
    highlightOuter: withAlpha(readCssVar('--color-text'), 0),
    shadeInner: withAlpha(bg, SHADE.alpha),
    shadeOuter: withAlpha(bg, 0),
    particles: [readCssVar('--stack-python-text'), colors.yellow, readCssVar('--color-silver')],
  };

  /** @type {import('../utils/canvas.js').CanvasSurface | null} */
  let view = null;
  let reducedMotion = false;
  const blob = { x: 0, y: 0, radius: 0 };
  /** @type {{ x: number, y: number, speed: number, radius: number, alpha: number, color: number, seed: number }[]} */
  let particles = [];

  // ---------- Setup ----------
  function createParticle(anywhere) {
    const width = view?.width ?? 0;
    const height = view?.height ?? 0;
    return {
      x: random() * width,
      y: anywhere ? random() * height : height + random() * RESPAWN_MARGIN,
      speed: lerp(PARTICLE_SPEED.min, PARTICLE_SPEED.max, random()),
      radius: lerp(PARTICLE_RADIUS.min, PARTICLE_RADIUS.max, random()),
      alpha: lerp(PARTICLE_ALPHA.min, PARTICLE_ALPHA.max, random()),
      color: Math.floor(random() * paint.particles.length),
      seed: random() * 100,
    };
  }

  function layout() {
    if (!view) return;
    const mobile = view.width < MOBILE_BREAKPOINT;
    const placement = mobile ? PLACEMENT.mobile : PLACEMENT.desktop;
    blob.x = view.width * placement.x;
    blob.y = view.height * placement.y;
    const base = mobile ? view.width : Math.min(view.width, view.height);
    blob.radius = Math.min(RADIUS_LIMITS.max, Math.max(RADIUS_LIMITS.min, base * placement.radius));

    glowCanvas.width = Math.ceil(view.width / GLOW.downscale);
    glowCanvas.height = Math.ceil(view.height / GLOW.downscale);

    const count = lowPower ? PARTICLE_COUNT.lowPower : mobile ? PARTICLE_COUNT.mobile : PARTICLE_COUNT.desktop;
    particles = Array.from({ length: count }, () => createParticle(true));
  }

  // ---------- Shape ----------
  /** Fractal noise: a few octaves of simplex for a more organic outline. */
  function fbm(x, y, z) {
    let amplitude = 1;
    let frequency = 1;
    let sum = 0;
    let norm = 0;
    for (let octave = 0; octave < MORPH.octaves; octave++) {
      sum += amplitude * noise3D(x * frequency, y * frequency, z + octave * OCTAVE_TIME_OFFSET);
      norm += amplitude;
      amplitude *= MORPH.gain;
      frequency *= MORPH.lacunarity;
    }
    return sum / norm;
  }

  function computeOutline(time) {
    const count = points.length / 2;
    const z = time * MORPH.speed;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const r = blob.radius * (1 + MORPH.amplitude * fbm(nx * MORPH.frequency, ny * MORPH.frequency, z));
      points[i * 2] = blob.x + nx * r;
      points[i * 2 + 1] = blob.y + ny * r;
    }
  }

  /**
   * Smooth closed curve through the outline midpoints.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} grow   scale of the outline around the blob centre
   * @param {number} scale  coordinate scale (1 = main canvas, 1/downscale = glow canvas)
   */
  function tracePath(ctx, grow, scale) {
    const count = points.length / 2;
    const px = (i) => (blob.x + (points[i * 2] - blob.x) * grow) * scale;
    const py = (i) => (blob.y + (points[i * 2 + 1] - blob.y) * grow) * scale;
    ctx.beginPath();
    ctx.moveTo((px(count - 1) + px(0)) / 2, (py(count - 1) + py(0)) / 2);
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      ctx.quadraticCurveTo(px(i), py(i), (px(i) + px(next)) / 2, (py(i) + py(next)) / 2);
    }
    ctx.closePath();
  }

  function createFill(ctx, time, scale) {
    const angle = time * GRADIENT_ROTATION_SPEED;
    const dx = Math.cos(angle) * blob.radius * scale;
    const dy = Math.sin(angle) * blob.radius * scale;
    const cx = blob.x * scale;
    const cy = blob.y * scale;
    const gradient = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    gradient.addColorStop(0, colors.blue);
    gradient.addColorStop(0.5, colors.violet);
    gradient.addColorStop(1, colors.yellow);
    return gradient;
  }

  // ---------- Frame ----------
  function draw(time, delta) {
    if (!view || !glowCtx) return;
    const { ctx, width, height } = view;
    const r = blob.radius;
    ctx.clearRect(0, 0, width, height);
    computeOutline(time);

    // Soft glow
    const glowScale = 1 / GLOW.downscale;
    glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
    glowCtx.filter = `blur(${GLOW.blurPx}px)`;
    tracePath(glowCtx, GLOW.grow, glowScale);
    glowCtx.fillStyle = createFill(glowCtx, time, glowScale);
    glowCtx.fill();
    ctx.globalAlpha = GLOW.alpha;
    ctx.drawImage(glowCanvas, 0, 0, width, height);
    ctx.globalAlpha = 1;

    // Body
    tracePath(ctx, 1, 1);
    ctx.fillStyle = createFill(ctx, time, 1);
    ctx.fill();

    // Volume: light from the top-left, shade on the opposite side (clipped to the blob)
    ctx.save();
    ctx.clip();
    const shadeX = blob.x + r * SHADE.x;
    const shadeY = blob.y + r * SHADE.y;
    const shade = ctx.createRadialGradient(shadeX, shadeY, 0, shadeX, shadeY, r * SHADE.radius);
    shade.addColorStop(0, paint.shadeInner);
    shade.addColorStop(1, paint.shadeOuter);
    ctx.fillStyle = shade;
    ctx.fillRect(blob.x - r * 2, blob.y - r * 2, r * 4, r * 4);

    ctx.globalCompositeOperation = 'screen';
    const lightX = blob.x + r * HIGHLIGHT.x;
    const lightY = blob.y + r * HIGHLIGHT.y;
    const light = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, r * HIGHLIGHT.radius);
    light.addColorStop(0, paint.highlightInner);
    light.addColorStop(1, paint.highlightOuter);
    ctx.fillStyle = light;
    ctx.fillRect(blob.x - r * 2, blob.y - r * 2, r * 4, r * 4);
    ctx.restore();

    // Particles
    ctx.globalCompositeOperation = 'lighter';
    for (const particle of particles) {
      if (delta) {
        particle.y -= particle.speed * delta;
        particle.x += noise3D(particle.seed, time * SWAY_SCALE, 0) * SWAY_PX_PER_MS * delta;
      }
      const dx = blob.x - particle.x;
      const dy = blob.y - particle.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (delta && distance > r) {
        particle.x += (dx / distance) * ATTRACTION_PX_PER_MS * delta;
        particle.y += (dy / distance) * ATTRACTION_PX_PER_MS * delta;
      }
      if (particle.y < -RESPAWN_MARGIN || particle.x < -RESPAWN_MARGIN || particle.x > width + RESPAWN_MARGIN) {
        Object.assign(particle, createParticle(false));
        continue;
      }
      const insideFade = distance < r ? distance / r : 1; // particles dissolve into the blob
      const topFade = Math.min(1, Math.max(0, particle.y / (height * TOP_FADE)));
      ctx.globalAlpha = particle.alpha * insideFade * topFade;
      ctx.fillStyle = paint.particles[particle.color];
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- Wiring ----------
  view = setupCanvas(canvas, {
    maxDpr: MAX_DPR,
    onResize: (surface) => {
      const sizeChanged = surface.width !== view?.width || surface.height !== view?.height || !particles.length;
      view = surface;
      if (sizeChanged) layout();
      if (reducedMotion) draw(STATIC_TIME_MS, 0);
    },
  });
  if (!particles.length) layout();

  const loop = createAnimationLoop({
    target: canvas,
    onFrame: (elapsed, delta) => draw(STATIC_TIME_MS + elapsed, delta),
  });

  watchReducedMotion((reduced) => {
    reducedMotion = reduced;
    loop.setEnabled(!reduced);
    if (reduced) draw(STATIC_TIME_MS, 0);
  });
}
