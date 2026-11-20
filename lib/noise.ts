/**
 * Fast deterministic PRNG (Mulberry32) and layered 1D/2D Perlin-style noise
 * for procedural organic yarn rendering.
 */

export function createPRNG(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
}

// Simple permutation table for smooth gradient noise
const PERM: number[] = new Array(512);
const GRAD2: [number, number][] = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1]
];

(function initPerm() {
  const p = new Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = 1337;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) {
    PERM[i] = p[i & 255];
  }
})();

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

export function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[X] + Y] % GRAD2.length;
  const ab = PERM[PERM[X] + Y + 1] % GRAD2.length;
  const ba = PERM[PERM[X + 1] + Y] % GRAD2.length;
  const bb = PERM[PERM[X + 1] + Y + 1] % GRAD2.length;

  const g1 = GRAD2[aa][0] * xf + GRAD2[aa][1] * yf;
  const g2 = GRAD2[ba][0] * (xf - 1) + GRAD2[ba][1] * yf;
  const g3 = GRAD2[ab][0] * xf + GRAD2[ab][1] * (yf - 1);
  const g4 = GRAD2[bb][0] * (xf - 1) + GRAD2[bb][1] * (yf - 1);

  return lerp(lerp(g1, g2, u), lerp(g3, g4, u), v);
}

/**
 * 3-octave layered organic noise for natural yarn jitter & sag.
 */
export function layeredNoise(
  x: number,
  y: number,
  octaves: number = 3,
  persistence: number = 0.5,
  lacunarity: number = 2.0
): number {
  let total = 0;
  let frequency = 1.0;
  let amplitude = 1.0;
  let maxVal = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, y * frequency) * amplitude;
    maxVal += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxVal;
}
