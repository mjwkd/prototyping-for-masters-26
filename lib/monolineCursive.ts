import { Point2D } from './monolineFont';

/**
 * Continuous Cursive Monoline Geometry
 * In this system, letters are drawn as continuous flowing strokes where:
 * - Each letter starts at a connecting entry lead (y ~ 0)
 * - Forms its expressive letter anatomy
 * - Finishes at a connecting exit lead (y ~ 0) that bridges directly into the next letter or the thread.
 * 
 * Result: The thread and the words are ONE seamless physical filament in 3D.
 * NO boxes, NO background blocks.
 */

export interface CursiveLetterDef {
  width: number;
  // Normalized points in [0..width, y: -0.8 (ascender) to +0.6 (descender), baseline at 0]
  points: Array<{ x: number; y: number }>;
}

// Highly expressive, continuous single-line cursive glyph paths
export const CURSIVE_GLYPHS: Record<string, CursiveLetterDef> = {
  a: {
    width: 26,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -4 }, { x: 14, y: -18 }, { x: 8, y: -22 },
      { x: 2, y: -14 }, { x: 2, y: -6 }, { x: 8, y: 0 }, { x: 18, y: 0 },
      { x: 20, y: -20 }, { x: 20, y: 0 }, { x: 26, y: 0 }
    ]
  },
  b: {
    width: 24,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -15 }, { x: 12, y: -45 }, { x: 10, y: -48 },
      { x: 6, y: -40 }, { x: 6, y: -4 }, { x: 10, y: 0 }, { x: 18, y: -4 },
      { x: 20, y: -12 }, { x: 16, y: -18 }, { x: 8, y: -16 }, { x: 18, y: -16 },
      { x: 24, y: -8 }
    ]
  },
  c: {
    width: 20,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -6 }, { x: 16, y: -18 }, { x: 12, y: -22 },
      { x: 4, y: -16 }, { x: 2, y: -6 }, { x: 8, y: 0 }, { x: 16, y: 0 },
      { x: 20, y: 0 }
    ]
  },
  d: {
    width: 26,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -6 }, { x: 14, y: -18 }, { x: 8, y: -22 },
      { x: 2, y: -14 }, { x: 2, y: -6 }, { x: 8, y: 0 }, { x: 18, y: 0 },
      { x: 20, y: -46 }, { x: 20, y: 0 }, { x: 26, y: 0 }
    ]
  },
  e: {
    width: 20,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -10 }, { x: 16, y: -16 }, { x: 14, y: -22 },
      { x: 6, y: -20 }, { x: 2, y: -10 }, { x: 6, y: 0 }, { x: 16, y: 0 },
      { x: 20, y: 0 }
    ]
  },
  f: {
    width: 22,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -18 }, { x: 14, y: -46 }, { x: 10, y: -48 },
      { x: 6, y: -38 }, { x: 6, y: 22 }, { x: 10, y: 26 }, { x: 14, y: 16 },
      { x: 6, y: 0 }, { x: 16, y: 0 }, { x: 22, y: 0 }
    ]
  },
  g: {
    width: 26,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -6 }, { x: 14, y: -18 }, { x: 8, y: -22 },
      { x: 2, y: -14 }, { x: 2, y: -6 }, { x: 8, y: 0 }, { x: 18, y: 0 },
      { x: 18, y: 22 }, { x: 12, y: 28 }, { x: 6, y: 24 }, { x: 14, y: 10 },
      { x: 26, y: 0 }
    ]
  },
  h: {
    width: 26,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -16 }, { x: 12, y: -45 }, { x: 10, y: -48 },
      { x: 6, y: -38 }, { x: 6, y: 0 }, { x: 8, y: -12 }, { x: 14, y: -20 },
      { x: 20, y: -16 }, { x: 20, y: 0 }, { x: 26, y: 0 }
    ]
  },
  i: {
    width: 16,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -8 }, { x: 8, y: -20 }, { x: 8, y: 0 },
      { x: 16, y: 0 }
    ]
  },
  j: {
    width: 18,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -8 }, { x: 8, y: -20 }, { x: 8, y: 22 },
      { x: 2, y: 28 }, { x: 0, y: 22 }, { x: 8, y: 10 }, { x: 18, y: 0 }
    ]
  },
  k: {
    width: 24,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -16 }, { x: 12, y: -45 }, { x: 10, y: -48 },
      { x: 6, y: -38 }, { x: 6, y: 0 }, { x: 8, y: -12 }, { x: 18, y: -22 },
      { x: 12, y: -12 }, { x: 18, y: 0 }, { x: 24, y: 0 }
    ]
  },
  l: {
    width: 18,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -16 }, { x: 10, y: -45 }, { x: 8, y: -48 },
      { x: 4, y: -38 }, { x: 4, y: -2 }, { x: 10, y: 0 }, { x: 18, y: 0 }
    ]
  },
  m: {
    width: 36,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 8, y: 0 }, { x: 10, y: -18 },
      { x: 18, y: -18 }, { x: 20, y: 0 }, { x: 22, y: -18 }, { x: 30, y: -18 },
      { x: 32, y: 0 }, { x: 36, y: 0 }
    ]
  },
  n: {
    width: 26,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 8, y: 0 }, { x: 10, y: -18 },
      { x: 18, y: -18 }, { x: 20, y: 0 }, { x: 26, y: 0 }
    ]
  },
  o: {
    width: 22,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -8 }, { x: 14, y: -18 }, { x: 8, y: -22 },
      { x: 2, y: -14 }, { x: 2, y: -6 }, { x: 8, y: 0 }, { x: 16, y: 0 },
      { x: 18, y: -12 }, { x: 12, y: -18 }, { x: 22, y: 0 }
    ]
  },
  p: {
    width: 24,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -8 }, { x: 8, y: -20 }, { x: 8, y: 24 },
      { x: 8, y: -10 }, { x: 14, y: -18 }, { x: 20, y: -12 }, { x: 18, y: 0 },
      { x: 8, y: 0 }, { x: 24, y: 0 }
    ]
  },
  q: {
    width: 26,
    points: [
      { x: 0, y: 0 }, { x: 8, y: -6 }, { x: 14, y: -18 }, { x: 8, y: -22 },
      { x: 2, y: -14 }, { x: 2, y: -6 }, { x: 8, y: 0 }, { x: 18, y: 0 },
      { x: 18, y: 24 }, { x: 24, y: 16 }, { x: 18, y: 10 }, { x: 26, y: 0 }
    ]
  },
  r: {
    width: 20,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -16 }, { x: 4, y: -20 }, { x: 12, y: -20 },
      { x: 16, y: -16 }, { x: 14, y: 0 }, { x: 20, y: 0 }
    ]
  },
  s: {
    width: 20,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -12 }, { x: 12, y: -20 }, { x: 8, y: -14 },
      { x: 4, y: -6 }, { x: 8, y: 0 }, { x: 16, y: 0 }, { x: 20, y: 0 }
    ]
  },
  t: {
    width: 20,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -12 }, { x: 8, y: -38 }, { x: 8, y: 0 },
      { x: 16, y: 0 }
    ]
  },
  u: {
    width: 24,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 6, y: -2 }, { x: 12, y: 0 },
      { x: 18, y: -2 }, { x: 18, y: -18 }, { x: 18, y: 0 }, { x: 24, y: 0 }
    ]
  },
  v: {
    width: 22,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 10, y: 0 }, { x: 16, y: -16 },
      { x: 14, y: -20 }, { x: 22, y: 0 }
    ]
  },
  w: {
    width: 32,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 8, y: 0 }, { x: 14, y: -16 },
      { x: 16, y: 0 }, { x: 22, y: -16 }, { x: 26, y: -18 }, { x: 32, y: 0 }
    ]
  },
  x: {
    width: 22,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 16, y: 0 }, { x: 16, y: -18 },
      { x: 6, y: 0 }, { x: 22, y: 0 }
    ]
  },
  y: {
    width: 24,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 6, y: -2 }, { x: 12, y: 0 },
      { x: 18, y: -2 }, { x: 18, y: 22 }, { x: 12, y: 28 }, { x: 6, y: 24 },
      { x: 14, y: 10 }, { x: 24, y: 0 }
    ]
  },
  z: {
    width: 22,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -18 }, { x: 16, y: -18 }, { x: 6, y: 0 },
      { x: 16, y: 0 }, { x: 12, y: 18 }, { x: 6, y: 22 }, { x: 14, y: 10 },
      { x: 22, y: 0 }
    ]
  },
  '.': {
    width: 14,
    points: [
      { x: 0, y: 0 }, { x: 4, y: -4 }, { x: 8, y: 0 }, { x: 4, y: 4 },
      { x: 4, y: -4 }, { x: 14, y: 0 }
    ]
  },
  ',': {
    width: 14,
    points: [
      { x: 0, y: 0 }, { x: 4, y: -4 }, { x: 6, y: 6 }, { x: 2, y: 12 },
      { x: 14, y: 0 }
    ]
  },
  '!': {
    width: 16,
    points: [
      { x: 0, y: 0 }, { x: 6, y: -40 }, { x: 6, y: -10 }, { x: 6, y: 0 },
      { x: 16, y: 0 }
    ]
  },
  '?': {
    width: 20,
    points: [
      { x: 0, y: 0 }, { x: 4, y: -20 }, { x: 10, y: -38 }, { x: 16, y: -28 },
      { x: 8, y: -16 }, { x: 8, y: -4 }, { x: 8, y: 0 }, { x: 20, y: 0 }
    ]
  }
};

/**
 * Builds continuous 3D coordinate points for a word in local space.
 * Every letter connects to the next without leaving the surface.
 */
export function buildContinuousWordPoints(
  text: string,
  scale: number = 1.0
): { points: Array<{ x: number; y: number; z: number }>; width: number } {
  const chars = text.toLowerCase().split('');
  const points: Array<{ x: number; y: number; z: number }> = [];

  let cursorX = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const glyph = CURSIVE_GLYPHS[ch] || CURSIVE_GLYPHS['a'];

    for (let p = 0; p < glyph.points.length; p++) {
      const pt = glyph.points[p];
      points.push({
        x: (cursorX + pt.x) * scale,
        y: pt.y * scale,
        // Micro Z depth variation to allow graceful self-crossing in 3D
        z: Math.sin((cursorX + pt.x) * 0.1) * (2.5 * scale)
      });
    }

    cursorX += glyph.width;
  }

  return {
    points,
    width: cursorX * scale
  };
}
