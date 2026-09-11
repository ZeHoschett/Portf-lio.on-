/**
 * Small seeded 3D simplex noise (after Stefan Gustavson's public-domain reference).
 * Output range is roughly [-1, 1]. Use the third dimension as time for smooth morphing.
 */

const F3 = 1 / 3;
const G3 = 1 / 6;
const SCALE = 32;
const CORNER_FALLOFF = 0.6;

// 12 gradient directions (edges of a cube), flattened as x, y, z
const GRAD3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1,
  1, 0, 1, -1, 0, -1, -1,
]);

/**
 * Deterministic PRNG (mulberry32): animations look the same on every visit and their
 * reduced-motion frames are stable.
 * @param {number} seed
 * @returns {() => number} values in [0, 1)
 */
export function createRandom(seed) {
  return mulberry32(seed);
}

/**
 * @param {number} seed
 * @returns {() => number}
 */
function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} [seed]
 * @returns {(x: number, y: number, z: number) => number}
 */
export function createNoise3D(seed = 1) {
  const random = mulberry32(seed);
  const source = new Uint8Array(256);
  for (let i = 0; i < 256; i++) source[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }

  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = source[i & 255];
    permMod12[i] = perm[i] % 12;
  }

  /** Contribution of one simplex corner. */
  const corner = (gradientIndex, x, y, z) => {
    let t = CORNER_FALLOFF - x * x - y * y - z * z;
    if (t < 0) return 0;
    const g = gradientIndex * 3;
    t *= t;
    return t * t * (GRAD3[g] * x + GRAD3[g + 1] * y + GRAD3[g + 2] * z);
  };

  return function noise3D(x, y, z) {
    const skew = (x + y + z) * F3;
    const i = Math.floor(x + skew);
    const j = Math.floor(y + skew);
    const k = Math.floor(z + skew);
    const unskew = (i + j + k) * G3;
    const x0 = x - (i - unskew);
    const y0 = y - (j - unskew);
    const z0 = z - (k - unskew);

    // Which of the six tetrahedra of the skewed cube contains the point
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0];
      else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1];
      else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1];
    } else if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1];
    else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1];
    else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0];

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const n0 = corner(permMod12[ii + perm[jj + perm[kk]]], x0, y0, z0);
    const n1 = corner(
      permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]],
      x0 - i1 + G3,
      y0 - j1 + G3,
      z0 - k1 + G3,
    );
    const n2 = corner(
      permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]],
      x0 - i2 + 2 * G3,
      y0 - j2 + 2 * G3,
      z0 - k2 + 2 * G3,
    );
    const n3 = corner(
      permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]],
      x0 - 1 + 3 * G3,
      y0 - 1 + 3 * G3,
      z0 - 1 + 3 * G3,
    );

    return SCALE * (n0 + n1 + n2 + n3);
  };
}
