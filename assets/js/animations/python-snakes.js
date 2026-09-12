/**
 * Python subsection background — the two snakes of the language's mark.
 *
 * Both serpents glide along the same self-crossing loop, the second one rotated 180° about its
 * centre: the rotational symmetry of the Python logo. Colours are the official Python blue and
 * yellow. The crossing of the loop is what makes them read as interlocked rather than as two
 * lines circling in parallel.
 *
 * The body is sampled from the path at fixed time offsets behind the head, so the whole shape is
 * a pure function of time: no history buffer, no drift when frames are dropped, and the
 * reduced-motion frame is simply one fixed t.
 *
 * Volume is faked with three disc chains (base, belly shadow, spine highlight) plus dorsal
 * blotches, each issued as a single path — the union of overlapping discs fills without seams, so
 * a whole layer costs one fill() instead of one per segment.
 */
import { createAnimationLoop } from '../utils/animation-loop.js';
import { readCssVar, setupCanvas, withAlpha } from '../utils/canvas.js';
import { qs } from '../utils/dom.js';
import { isLowPowerDevice, watchReducedMotion } from '../utils/motion.js';
import { createNoise3D } from '../utils/noise.js';

const SEED = 23;
const MAX_DPR = 1.5;
const MOBILE_BREAKPOINT = 768;
const TAU = Math.PI * 2;

// Path: a 1:2 Lissajous figure — one horizontal swing per two vertical ones, which draws a
// figure eight that crosses itself in the middle.
const LOOP_MS = 34000;
const FREQ = { x: 1, y: 2 };
const WOBBLE = { amplitude: 0.09, speed: 0.00004 }; // slow organic drift over the perfect curve

// Desktop: beside the heading. Mobile: higher and wider, clear of the text.
const PLACEMENT = {
  desktop: { x: 0.72, y: 0.44, w: 0.2, h: 0.3 },
  mobile: { x: 0.6, y: 0.24, w: 0.3, h: 0.18 },
};
const AMPLITUDE_LIMITS = { min: 60, max: 260 };

// Body
const SEGMENTS = { high: 58, low: 36 };
const SEGMENT_MS = 170; // time between segments: sets how long the snake is
const HEAD_RADIUS = { desktop: 16, mobile: 11 };
const TAIL_SHARE = 0.08; // tail thickness as a share of the neck
const TAPER = 0.6;
const BODY_ALPHA = 0.9;
const HALO = { grow: 1.8, alpha: 0.08 };

// Shading: radii and offsets are shares of the local body radius, offsets along the normal
const BELLY = { radius: 0.62, offset: 0.34, alpha: 0.26 };
const SPINE = { radius: 0.44, offset: -0.3, alpha: 0.14 };
const BLOTCH = { step: 4, first: 3, radius: 0.66, wobble: 0.12, alpha: 0.3 };

// Head and face, in head-local units (x forward, y across)
const HEAD = { forward: 0.5, length: 1.7, width: 1.15 };
const EYE = { x: 0.35, y: 0.5, radius: 0.3, pupilX: 0.3, pupilY: 0.72, alpha: 0.95 };
const BROW = { back: -0.9, outer: 0.95, front: 1.15, inner: 0.1, width: 0.55, alpha: 0.75 };
const TONGUE = { length: 0.5, fork: 0.55, width: 0.16, speed: 0.0016, threshold: 0.72 };

const STATIC_TIME_MS = 5200;

export function initPythonSnakes() {
  const canvas = /** @type {HTMLCanvasElement | null} */ (qs('[data-animation="python-snakes"]'));
  if (!canvas) return;

  const noise3D = createNoise3D(SEED);
  const count = isLowPowerDevice() ? SEGMENTS.low : SEGMENTS.high;

  const bg = readCssVar('--color-bg');
  const text = readCssVar('--color-text');
  const paint = [readCssVar('--stack-python-a'), readCssVar('--stack-python-b')].map((color) => ({
    body: withAlpha(color, BODY_ALPHA),
    halo: withAlpha(color, HALO.alpha),
  }));
  const shade = {
    belly: withAlpha(bg, BELLY.alpha),
    spine: withAlpha(text, SPINE.alpha),
    blotch: withAlpha(bg, BLOTCH.alpha),
    brow: withAlpha(bg, BROW.alpha),
    eye: withAlpha(text, EYE.alpha),
    pupil: bg,
    tongue: readCssVar('--snake-tongue'),
  };

  const snakes = [0, 1].map((index) => ({
    index,
    rotated: index === 1, // the second snake is the 180° rotation of the first
    timeOffset: index * LOOP_MS * 0.5, // half a lap apart, so they meet at the crossing
    x: new Float32Array(count),
    y: new Float32Array(count),
    r: new Float32Array(count),
    nx: new Float32Array(count), // unit normal, for the shading offsets
    ny: new Float32Array(count),
  }));

  /** @type {import('../utils/canvas.js').CanvasSurface | null} */
  let view = null;
  let reducedMotion = false;
  const loop = { x: 0, y: 0, ax: 0, ay: 0, head: 0 };
  const point = { x: 0, y: 0 }; // scratch, so the frame allocates nothing

  function layout() {
    if (!view) return;
    const mobile = view.width < MOBILE_BREAKPOINT;
    const placement = mobile ? PLACEMENT.mobile : PLACEMENT.desktop;
    const clamp = (value) => Math.min(AMPLITUDE_LIMITS.max, Math.max(AMPLITUDE_LIMITS.min, value));

    loop.x = view.width * placement.x;
    loop.y = view.height * placement.y;
    loop.ax = clamp(view.width * placement.w);
    loop.ay = clamp(view.height * placement.h);
    loop.head = mobile ? HEAD_RADIUS.mobile : HEAD_RADIUS.desktop;
  }

  /** Writes the position on the shared loop at `time` into the scratch point. */
  function pathAt(time) {
    const phase = (time / LOOP_MS) * TAU;
    const drift = noise3D(phase * 0.1, time * WOBBLE.speed, 0) * WOBBLE.amplitude;
    point.x = loop.x + loop.ax * Math.sin(phase * FREQ.x + drift);
    point.y = loop.y + loop.ay * Math.sin(phase * FREQ.y);
  }

  function updateSnake(snake, time) {
    for (let i = 0; i < count; i++) {
      pathAt(time + snake.timeOffset - i * SEGMENT_MS);
      snake.x[i] = snake.rotated ? 2 * loop.x - point.x : point.x;
      snake.y[i] = snake.rotated ? 2 * loop.y - point.y : point.y;
      const share = i / (count - 1);
      snake.r[i] = loop.head * (TAIL_SHARE + (1 - TAIL_SHARE) * (1 - share) ** TAPER);
    }

    // Normal at each segment, taken from the tangent between its neighbours
    for (let i = 0; i < count; i++) {
      const before = Math.max(0, i - 1);
      const after = Math.min(count - 1, i + 1);
      const dx = snake.x[before] - snake.x[after];
      const dy = snake.y[before] - snake.y[after];
      const length = Math.hypot(dx, dy) || 1;
      snake.nx[i] = -dy / length;
      snake.ny[i] = dx / length;
    }
  }

  /**
   * A chain of overlapping discs as ONE path. `radiusScale` thins it and `offsetShare` slides it
   * sideways along the normal — that is what turns a flat tube into a shaded one.
   */
  function traceChain(ctx, snake, radiusScale, offsetShare) {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const radius = snake.r[i] * radiusScale;
      const x = snake.x[i] + snake.nx[i] * snake.r[i] * offsetShare;
      const y = snake.y[i] + snake.ny[i] * snake.r[i] * offsetShare;
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, TAU);
    }
  }

  /** Dorsal blotches, alternating side to side like the markings of a real python. */
  function traceBlotches(ctx, snake) {
    ctx.beginPath();
    for (let i = BLOTCH.first; i < count; i += BLOTCH.step) {
      const radius = snake.r[i] * BLOTCH.radius;
      const side = (i / BLOTCH.step) % 2 < 1 ? 1 : -1;
      const x = snake.x[i] + snake.nx[i] * snake.r[i] * BLOTCH.wobble * side;
      const y = snake.y[i] + snake.ny[i] * snake.r[i] * BLOTCH.wobble * side;
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, TAU);
    }
  }

  /** Wedge-shaped head with brow ridges, slit pupils and a flicking forked tongue. */
  function drawHead(ctx, snake, time) {
    const r = snake.r[0];
    const angle = Math.atan2(snake.y[0] - snake.y[1], snake.x[0] - snake.x[1]);

    ctx.save();
    ctx.translate(snake.x[0], snake.y[0]);
    ctx.rotate(angle);

    const length = HEAD.length * r;
    const width = HEAD.width * r;
    const centre = HEAD.forward * r;

    ctx.beginPath();
    ctx.ellipse(centre, 0, length, width, 0, 0, TAU);
    ctx.fillStyle = paint[snake.index].body;
    ctx.fill();

    const eyeX = centre + EYE.x * length;
    const eyeY = EYE.y * width;
    const eyeR = EYE.radius * width;

    ctx.beginPath();
    for (const side of [-1, 1]) {
      ctx.moveTo(eyeX + eyeR, side * eyeY);
      ctx.ellipse(eyeX, side * eyeY, eyeR, eyeR * 0.85, 0, 0, TAU);
    }
    ctx.fillStyle = shade.eye;
    ctx.fill();

    ctx.beginPath();
    for (const side of [-1, 1]) {
      ctx.moveTo(eyeX + eyeR * EYE.pupilX, side * eyeY);
      ctx.ellipse(eyeX, side * eyeY, eyeR * EYE.pupilX, eyeR * EYE.pupilY, 0, 0, TAU);
    }
    ctx.fillStyle = shade.pupil;
    ctx.fill();

    // The angry part: a heavy ridge running from behind and outside the eye down to the snout
    ctx.beginPath();
    for (const side of [-1, 1]) {
      ctx.moveTo(eyeX + BROW.back * eyeR, side * (eyeY + BROW.outer * eyeR));
      ctx.lineTo(eyeX + BROW.front * eyeR, side * (eyeY - BROW.inner * eyeR));
    }
    ctx.strokeStyle = shade.brow;
    ctx.lineWidth = BROW.width * eyeR;
    ctx.lineCap = 'round';
    ctx.stroke();

    const flick = Math.sin(time * TONGUE.speed + snake.index * Math.PI);
    if (flick > TONGUE.threshold) {
      const snout = centre + length;
      const reach = TONGUE.length * length * ((flick - TONGUE.threshold) / (1 - TONGUE.threshold));
      ctx.beginPath();
      ctx.moveTo(snout, 0);
      ctx.lineTo(snout + reach, 0);
      for (const side of [-1, 1]) {
        ctx.moveTo(snout + reach, 0);
        ctx.lineTo(snout + reach * 1.5, side * reach * TONGUE.fork);
      }
      ctx.strokeStyle = shade.tongue;
      ctx.lineWidth = TONGUE.width * r;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSnake(ctx, snake, time) {
    traceChain(ctx, snake, HALO.grow, 0);
    ctx.fillStyle = paint[snake.index].halo;
    ctx.fill();

    traceChain(ctx, snake, 1, 0);
    ctx.fillStyle = paint[snake.index].body;
    ctx.fill();

    traceChain(ctx, snake, BELLY.radius, BELLY.offset);
    ctx.fillStyle = shade.belly;
    ctx.fill();

    traceChain(ctx, snake, SPINE.radius, SPINE.offset);
    ctx.fillStyle = shade.spine;
    ctx.fill();

    traceBlotches(ctx, snake);
    ctx.fillStyle = shade.blotch;
    ctx.fill();

    drawHead(ctx, snake, time);
  }

  function draw(time) {
    if (!view) return;
    const { ctx, width, height } = view;
    ctx.clearRect(0, 0, width, height);
    for (const snake of snakes) {
      updateSnake(snake, time);
      drawSnake(ctx, snake, time);
    }
  }

  // ---------- Wiring ----------
  view = setupCanvas(canvas, {
    maxDpr: MAX_DPR,
    onResize: (surface) => {
      const sizeChanged = surface.width !== view?.width || surface.height !== view?.height;
      view = surface;
      if (sizeChanged || !loop.head) layout();
      if (reducedMotion) draw(STATIC_TIME_MS);
    },
  });
  if (!loop.head) layout();

  const animation = createAnimationLoop({
    target: canvas,
    onFrame: (elapsed) => draw(STATIC_TIME_MS + elapsed),
  });

  watchReducedMotion((reduced) => {
    reducedMotion = reduced;
    animation.setEnabled(!reduced);
    if (reduced) draw(STATIC_TIME_MS);
  });
}
