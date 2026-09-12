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
const LOOP_MS = 21000;
const FREQ = { x: 1, y: 2 };
const WOBBLE = { amplitude: 0.09, speed: 0.00004 }; // slow organic drift over the perfect curve

// Desktop: beside the heading. Mobile: higher and wider, clear of the text.
const PLACEMENT = {
  desktop: { x: 0.72, y: 0.44, w: 0.2, h: 0.3 },
  mobile: { x: 0.6, y: 0.24, w: 0.3, h: 0.18 },
};
const AMPLITUDE_LIMITS = { min: 60, max: 250 };

// Body
const SEGMENTS = { high: 56, low: 34 };
const SEGMENT_MS = 110; // time between segments: sets how long the snake is
const HEAD_RADIUS = { desktop: 10, mobile: 7 };
const TAIL_SHARE = 0.1; // tail thickness as a share of the head
const TAPER = 0.6;
const BODY_ALPHA = 0.85;
const HALO = { grow: 2.4, alpha: 0.09 };
const EYE = { forward: 0.3, side: 0.4, radius: 0.22 };

const STATIC_TIME_MS = 5200;

export function initPythonSnakes() {
  const canvas = /** @type {HTMLCanvasElement | null} */ (qs('[data-animation="python-snakes"]'));
  if (!canvas) return;

  const noise3D = createNoise3D(SEED);
  const count = isLowPowerDevice() ? SEGMENTS.low : SEGMENTS.high;

  const paint = [readCssVar('--stack-python-a'), readCssVar('--stack-python-b')].map((color) => ({
    body: withAlpha(color, BODY_ALPHA),
    halo: withAlpha(color, HALO.alpha),
  }));
  const eyeColor = readCssVar('--color-bg');

  const snakes = [0, 1].map((index) => ({
    index,
    rotated: index === 1, // the second snake is the 180° rotation of the first
    timeOffset: index * LOOP_MS * 0.5, // half a lap apart, so they meet at the crossing
    x: new Float32Array(count),
    y: new Float32Array(count),
    r: new Float32Array(count),
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
    const clamp = (value) =>
      Math.min(AMPLITUDE_LIMITS.max, Math.max(AMPLITUDE_LIMITS.min, value));

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
  }

  /**
   * Overlapping discs issued as ONE path: the union fills without seams, and the whole body
   * costs a single fill() instead of one per segment.
   */
  function traceBody(ctx, snake, grow) {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const radius = snake.r[i] * grow;
      ctx.moveTo(snake.x[i] + radius, snake.y[i]);
      ctx.arc(snake.x[i], snake.y[i], radius, 0, TAU);
    }
  }

  function drawSnake(ctx, snake) {
    traceBody(ctx, snake, HALO.grow);
    ctx.fillStyle = paint[snake.index].halo;
    ctx.fill();

    traceBody(ctx, snake, 1);
    ctx.fillStyle = paint[snake.index].body;
    ctx.fill();

    // Eyes: without them the shape reads as a stray trail rather than as a snake
    const dx = snake.x[0] - snake.x[1];
    const dy = snake.y[0] - snake.y[1];
    const length = Math.hypot(dx, dy) || 1;
    const forwardX = dx / length;
    const forwardY = dy / length;
    const head = snake.r[0];

    ctx.beginPath();
    for (const side of [-1, 1]) {
      const eyeX = snake.x[0] + forwardX * head * EYE.forward - forwardY * side * head * EYE.side;
      const eyeY = snake.y[0] + forwardY * head * EYE.forward + forwardX * side * head * EYE.side;
      ctx.moveTo(eyeX + head * EYE.radius, eyeY);
      ctx.arc(eyeX, eyeY, head * EYE.radius, 0, TAU);
    }
    ctx.fillStyle = eyeColor;
    ctx.fill();
  }

  function draw(time) {
    if (!view) return;
    const { ctx, width, height } = view;
    ctx.clearRect(0, 0, width, height);
    for (const snake of snakes) {
      updateSnake(snake, time);
      drawSnake(ctx, snake);
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
