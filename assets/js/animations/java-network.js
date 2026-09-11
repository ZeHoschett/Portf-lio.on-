/**
 * Java subsection background — "distributed architecture":
 * a honeycomb network whose nodes breathe (noise drift), edges whose opacity follows their
 * stretch, amber light pulses travelling edge to edge like packets, and nodes near the cursor
 * lighting up and leaning towards it. Reduced motion → one static frame.
 */
import { createAnimationLoop } from '../utils/animation-loop.js';
import { readCssVar, setupCanvas, withAlpha } from '../utils/canvas.js';
import { qs } from '../utils/dom.js';
import { isLowPowerDevice, watchFinePointer, watchReducedMotion } from '../utils/motion.js';
import { createNoise3D, createRandom } from '../utils/noise.js';
import { onScrollFrame } from '../utils/scroll.js';

const SEED = 11;
const MAX_DPR = 1.5; // soft background: 1.5 is plenty and halves the bitmap of a 2× screen
const MOBILE_BREAKPOINT = 768;
const TAU = Math.PI * 2;

// Lattice
const HEX_SIZE = { desktop: 46, mobile: 36 };
const LOW_POWER_SCALE = 1.35; // bigger cells → fewer nodes

// Breathing
const DRIFT_PX = 6;
const DRIFT_SCALE = 0.004;
const DRIFT_SPEED = 0.00012; // noise units per ms
const DRIFT_OFFSET = 31.7; // decorrelates the x and y noise fields

// Edges (opacity quantised into levels → one stroke() per level)
const EDGE_LEVELS = 6;
const EDGE_ALPHA = { min: 0.03, max: 0.24 };
const EDGE_REST_WEIGHT = 0.35;

// Nodes and pointer
const NODE_SIZE = 2;
const NODE_ALPHA = 0.3;
const GLOW_NODE_RADIUS = { base: 1.5, extra: 3 };
const POINTER_RADIUS = 170;
const POINTER_PULL = 0.14;
const POINTER_HALO_SCALE = 1.25; // halo radius relative to POINTER_RADIUS
const EDGE_HIGHLIGHT_MIN_GLOW = 0.2; // edges this close to the pointer turn amber

// Pulses
const PULSE_COUNT = { desktop: 16, mobile: 8, lowPower: 6 };
const PULSE_SPEED = 0.16; // px per ms
const PULSE_HOPS = { min: 5, max: 14 };
const PULSE_RADIUS = { core: 2.2, glow: 9 };
const SPAWN_ATTEMPTS = 12;

const STATIC_TIME_MS = 5000;

/**
 * Honeycomb as zig-zag rows: node (row j, col k) links to (j, k+1), and to (j+1, k) when
 * (j + k) is odd. Integer topology, so no floating-point de-duplication is needed.
 * Every edge has the same rest length: `size`.
 */
function buildHoneycomb(width, height, size) {
  const halfWidth = (Math.sqrt(3) * size) / 2;
  const rowHeight = 1.5 * size;
  const cols = Math.ceil(width / halfWidth) + 3;
  const rows = Math.ceil(height / rowHeight) + 3;
  const count = cols * rows;

  const baseX = new Float32Array(count);
  const baseY = new Float32Array(count);
  /** @type {number[]} */
  const edges = [];
  /** @type {number[][]} */
  const adjacency = Array.from({ length: count }, () => []);

  const link = (a, b) => {
    edges.push(a, b);
    adjacency[a].push(b);
    adjacency[b].push(a);
  };

  for (let j = 0; j < rows; j++) {
    for (let k = 0; k < cols; k++) {
      const index = j * cols + k;
      const isLow = (j + k) & 1;
      baseX[index] = (k - 1) * halfWidth;
      baseY[index] = (j - 1) * rowHeight + (isLow ? size / 2 : 0);
      if (k + 1 < cols) link(index, index + 1);
      if (isLow && j + 1 < rows) link(index, index + cols);
    }
  }

  return {
    count,
    size,
    baseX,
    baseY,
    x: new Float32Array(count),
    y: new Float32Array(count),
    glow: new Float32Array(count),
    edges: Uint32Array.from(edges),
    levels: new Uint8Array(edges.length / 2),
    adjacency,
  };
}

export function initJavaNetwork() {
  const canvas = /** @type {HTMLCanvasElement | null} */ (qs('[data-animation="java-network"]'));
  if (!canvas) return;
  const section = canvas.closest('section') ?? canvas.parentElement;

  const lowPower = isLowPowerDevice();
  const noise3D = createNoise3D(SEED);
  const random = createRandom(SEED);

  const amber = readCssVar('--stack-java');
  const silver = readCssVar('--color-silver');
  const paint = {
    edges: Array.from({ length: EDGE_LEVELS }, (_, level) =>
      withAlpha(silver, EDGE_ALPHA.min + ((EDGE_ALPHA.max - EDGE_ALPHA.min) * level) / (EDGE_LEVELS - 1)),
    ),
    node: withAlpha(silver, NODE_ALPHA),
    glowNode: amber,
    haloInner: withAlpha(amber, 0.14),
    haloOuter: withAlpha(amber, 0),
    edgeHighlight: withAlpha(amber, 0.55),
    pulseTrail: withAlpha(amber, 0.45),
    pulseGlow: withAlpha(amber, 0.18),
    pulseCore: amber,
  };

  /** @type {import('../utils/canvas.js').CanvasSurface | null} */
  let view = null;
  /** @type {ReturnType<typeof buildHoneycomb> | null} */
  let graph = null;
  /** @type {{ from: number, to: number, progress: number, hops: number }[]} */
  let pulses = [];
  let reducedMotion = false;
  let finePointer = false;
  /** @type {DOMRect | null} */
  let canvasRect = null;
  const pointer = { x: 0, y: 0, inside: false };

  // ---------- Pulses ----------
  const randomHops = () => PULSE_HOPS.min + Math.floor(random() * (PULSE_HOPS.max - PULSE_HOPS.min));

  /** Starts a pulse on a random edge inside the visible area. */
  function spawnPulse() {
    const g = /** @type {NonNullable<typeof graph>} */ (graph);
    let from = 0;
    for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
      from = Math.floor(random() * g.count);
      const inside = g.baseX[from] > 0 && g.baseX[from] < (view?.width ?? 0) && g.baseY[from] > 0 && g.baseY[from] < (view?.height ?? 0);
      if (inside && g.adjacency[from].length) break;
    }
    const options = g.adjacency[from];
    return { from, to: options[Math.floor(random() * options.length)] ?? from, progress: random(), hops: randomHops() };
  }

  function advancePulse(pulse, distance) {
    const g = /** @type {NonNullable<typeof graph>} */ (graph);
    pulse.progress += distance / g.size;
    while (pulse.progress >= 1) {
      pulse.progress -= 1;
      pulse.hops -= 1;
      const options = g.adjacency[pulse.to].filter((node) => node !== pulse.from);
      if (pulse.hops <= 0 || !options.length) {
        Object.assign(pulse, spawnPulse(), { progress: 0 });
        return;
      }
      pulse.from = pulse.to;
      pulse.to = options[Math.floor(random() * options.length)];
    }
  }

  function rebuild() {
    if (!view) return;
    const mobile = view.width < MOBILE_BREAKPOINT;
    const size = (mobile ? HEX_SIZE.mobile : HEX_SIZE.desktop) * (lowPower ? LOW_POWER_SCALE : 1);
    graph = buildHoneycomb(view.width, view.height, size);
    const count = lowPower ? PULSE_COUNT.lowPower : mobile ? PULSE_COUNT.mobile : PULSE_COUNT.desktop;
    pulses = Array.from({ length: count }, spawnPulse);
  }

  // ---------- Frame ----------
  function draw(time, delta) {
    if (!view || !graph) return;
    const { ctx, width, height } = view;
    const g = graph;
    const z = time * DRIFT_SPEED;
    const pointerActive = pointer.inside && finePointer && !reducedMotion;
    const radiusSquared = POINTER_RADIUS * POINTER_RADIUS;

    ctx.clearRect(0, 0, width, height);

    // Warm light under the cursor
    if (pointerActive) {
      const haloRadius = POINTER_RADIUS * POINTER_HALO_SCALE;
      const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, haloRadius);
      halo.addColorStop(0, paint.haloInner);
      halo.addColorStop(1, paint.haloOuter);
      ctx.fillStyle = halo;
      ctx.fillRect(pointer.x - haloRadius, pointer.y - haloRadius, haloRadius * 2, haloRadius * 2);
    }

    // Node positions: base + breathing + pull towards the pointer
    for (let i = 0; i < g.count; i++) {
      const bx = g.baseX[i];
      const by = g.baseY[i];
      let x = bx + noise3D(bx * DRIFT_SCALE, by * DRIFT_SCALE, z) * DRIFT_PX;
      let y = by + noise3D(bx * DRIFT_SCALE + DRIFT_OFFSET, by * DRIFT_SCALE - DRIFT_OFFSET, z) * DRIFT_PX;
      let glow = 0;
      if (pointerActive) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < radiusSquared) {
          glow = 1 - Math.sqrt(distanceSquared) / POINTER_RADIUS;
          x += dx * glow * POINTER_PULL;
          y += dy * glow * POINTER_PULL;
        }
      }
      g.x[i] = x;
      g.y[i] = y;
      g.glow[i] = glow;
    }

    // Edge opacity: compressed edges brighter, stretched ones fainter, lit near the pointer
    const edgeCount = g.levels.length;
    for (let e = 0; e < edgeCount; e++) {
      const a = g.edges[e * 2];
      const b = g.edges[e * 2 + 1];
      const dx = g.x[b] - g.x[a];
      const dy = g.y[b] - g.y[a];
      const stretch = g.size / Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const value = Math.min(1, stretch ** 3 * EDGE_REST_WEIGHT + Math.max(g.glow[a], g.glow[b]));
      g.levels[e] = Math.round(value * (EDGE_LEVELS - 1));
    }

    ctx.lineWidth = 1;
    for (let level = 0; level < EDGE_LEVELS; level++) {
      ctx.beginPath();
      for (let e = 0; e < edgeCount; e++) {
        if (g.levels[e] !== level) continue;
        const a = g.edges[e * 2];
        const b = g.edges[e * 2 + 1];
        ctx.moveTo(g.x[a], g.y[a]);
        ctx.lineTo(g.x[b], g.y[b]);
      }
      ctx.strokeStyle = paint.edges[level];
      ctx.stroke();
    }

    // Edges next to the cursor light up in amber
    if (pointerActive) {
      ctx.beginPath();
      for (let e = 0; e < edgeCount; e++) {
        const a = g.edges[e * 2];
        const b = g.edges[e * 2 + 1];
        if (Math.max(g.glow[a], g.glow[b]) < EDGE_HIGHLIGHT_MIN_GLOW) continue;
        ctx.moveTo(g.x[a], g.y[a]);
        ctx.lineTo(g.x[b], g.y[b]);
      }
      ctx.strokeStyle = paint.edgeHighlight;
      ctx.stroke();
    }

    // Nodes (one fill for all), then the few lit nodes near the pointer
    ctx.beginPath();
    for (let i = 0; i < g.count; i++) {
      ctx.rect(g.x[i] - NODE_SIZE / 2, g.y[i] - NODE_SIZE / 2, NODE_SIZE, NODE_SIZE);
    }
    ctx.fillStyle = paint.node;
    ctx.fill();

    if (pointerActive) {
      ctx.fillStyle = paint.glowNode;
      for (let i = 0; i < g.count; i++) {
        if (!g.glow[i]) continue;
        ctx.globalAlpha = g.glow[i];
        ctx.beginPath();
        ctx.arc(g.x[i], g.y[i], GLOW_NODE_RADIUS.base + g.glow[i] * GLOW_NODE_RADIUS.extra, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Pulses: lit trail from the last node, soft glow and bright core
    if (delta) pulses.forEach((pulse) => advancePulse(pulse, PULSE_SPEED * delta));
    ctx.globalCompositeOperation = 'lighter';

    ctx.beginPath();
    for (const pulse of pulses) {
      const ax = g.x[pulse.from];
      const ay = g.y[pulse.from];
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (g.x[pulse.to] - ax) * pulse.progress, ay + (g.y[pulse.to] - ay) * pulse.progress);
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = paint.pulseTrail;
    ctx.stroke();

    for (const [radius, color] of [
      [PULSE_RADIUS.glow, paint.pulseGlow],
      [PULSE_RADIUS.core, paint.pulseCore],
    ]) {
      ctx.beginPath();
      for (const pulse of pulses) {
        const ax = g.x[pulse.from];
        const ay = g.y[pulse.from];
        const px = ax + (g.x[pulse.to] - ax) * pulse.progress;
        const py = ay + (g.y[pulse.to] - ay) * pulse.progress;
        ctx.moveTo(px + radius, py);
        ctx.arc(px, py, radius, 0, TAU);
      }
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- Wiring ----------
  view = setupCanvas(canvas, {
    maxDpr: MAX_DPR,
    onResize: (surface) => {
      const sizeChanged = !graph || surface.width !== view?.width || surface.height !== view?.height;
      view = surface;
      canvasRect = null;
      if (sizeChanged) rebuild();
      if (reducedMotion) draw(STATIC_TIME_MS, 0);
    },
  });
  if (!graph) rebuild();

  const loop = createAnimationLoop({
    target: canvas,
    onFrame: (elapsed, delta) => draw(STATIC_TIME_MS + elapsed, delta),
  });

  onScrollFrame(() => {
    canvasRect = null; // the canvas moved: measure again on the next pointer move
  });

  section?.addEventListener(
    'pointermove',
    (event) => {
      if (!finePointer) return;
      canvasRect ??= canvas.getBoundingClientRect();
      pointer.x = event.clientX - canvasRect.left;
      pointer.y = event.clientY - canvasRect.top;
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
    if (reduced) draw(STATIC_TIME_MS, 0);
  });
}
