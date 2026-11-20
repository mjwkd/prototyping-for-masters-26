import { layeredNoise } from './noise';

export interface Point2D {
  x: number;
  y: number;
}

export type Stroke = Point2D[];

export interface WordGlyphPath {
  strokes: Stroke[];
  width: number;
  entryPoint: Point2D;
  exitPoint: Point2D;
}

// Normalized glyph stroke definitions (unit coordinate box: width ~ 0.5-0.9, height ~ 1.0, baseline at 0.8)
const GLYPH_STROKES: Record<string, Stroke[]> = {
  // Lowercase
  a: [
    [{ x: 0.65, y: 0.4 }, { x: 0.5, y: 0.35 }, { x: 0.3, y: 0.45 }, { x: 0.25, y: 0.65 }, { x: 0.35, y: 0.8 }, { x: 0.55, y: 0.8 }, { x: 0.65, y: 0.65 }, { x: 0.65, y: 0.35 }, { x: 0.65, y: 0.8 }, { x: 0.78, y: 0.78 }]
  ],
  b: [
    [{ x: 0.25, y: 0.05 }, { x: 0.25, y: 0.8 }, { x: 0.4, y: 0.8 }, { x: 0.65, y: 0.7 }, { x: 0.65, y: 0.45 }, { x: 0.45, y: 0.35 }, { x: 0.25, y: 0.45 }, { x: 0.75, y: 0.5 }]
  ],
  c: [
    [{ x: 0.65, y: 0.42 }, { x: 0.5, y: 0.35 }, { x: 0.3, y: 0.45 }, { x: 0.25, y: 0.65 }, { x: 0.35, y: 0.8 }, { x: 0.65, y: 0.75 }]
  ],
  d: [
    [{ x: 0.65, y: 0.05 }, { x: 0.65, y: 0.8 }, { x: 0.75, y: 0.78 }],
    [{ x: 0.65, y: 0.5 }, { x: 0.5, y: 0.35 }, { x: 0.3, y: 0.45 }, { x: 0.25, y: 0.65 }, { x: 0.35, y: 0.8 }, { x: 0.65, y: 0.75 }]
  ],
  e: [
    [{ x: 0.25, y: 0.6 }, { x: 0.65, y: 0.55 }, { x: 0.6, y: 0.38 }, { x: 0.42, y: 0.35 }, { x: 0.26, y: 0.48 }, { x: 0.26, y: 0.68 }, { x: 0.4, y: 0.8 }, { x: 0.72, y: 0.76 }]
  ],
  f: [
    [{ x: 0.6, y: 0.1 }, { x: 0.45, y: 0.05 }, { x: 0.35, y: 0.15 }, { x: 0.35, y: 0.8 }],
    [{ x: 0.2, y: 0.4 }, { x: 0.6, y: 0.4 }]
  ],
  g: [
    [{ x: 0.65, y: 0.4 }, { x: 0.5, y: 0.35 }, { x: 0.3, y: 0.45 }, { x: 0.25, y: 0.65 }, { x: 0.35, y: 0.8 }, { x: 0.65, y: 0.75 }, { x: 0.65, y: 0.35 }, { x: 0.65, y: 1.05 }, { x: 0.5, y: 1.15 }, { x: 0.3, y: 1.05 }]
  ],
  h: [
    [{ x: 0.25, y: 0.05 }, { x: 0.25, y: 0.8 }],
    [{ x: 0.25, y: 0.5 }, { x: 0.45, y: 0.35 }, { x: 0.65, y: 0.45 }, { x: 0.65, y: 0.8 }, { x: 0.78, y: 0.78 }]
  ],
  i: [
    [{ x: 0.45, y: 0.35 }, { x: 0.45, y: 0.8 }, { x: 0.58, y: 0.78 }],
    [{ x: 0.45, y: 0.15 }, { x: 0.45, y: 0.2 }] // dot
  ],
  j: [
    [{ x: 0.55, y: 0.35 }, { x: 0.55, y: 1.05 }, { x: 0.4, y: 1.15 }, { x: 0.25, y: 1.05 }],
    [{ x: 0.55, y: 0.15 }, { x: 0.55, y: 0.2 }]
  ],
  k: [
    [{ x: 0.25, y: 0.05 }, { x: 0.25, y: 0.8 }],
    [{ x: 0.65, y: 0.35 }, { x: 0.3, y: 0.55 }, { x: 0.68, y: 0.8 }, { x: 0.78, y: 0.78 }]
  ],
  l: [
    [{ x: 0.35, y: 0.05 }, { x: 0.35, y: 0.78 }, { x: 0.55, y: 0.78 }]
  ],
  m: [
    [{ x: 0.15, y: 0.35 }, { x: 0.15, y: 0.8 }],
    [{ x: 0.15, y: 0.48 }, { x: 0.35, y: 0.35 }, { x: 0.48, y: 0.48 }, { x: 0.48, y: 0.8 }],
    [{ x: 0.48, y: 0.48 }, { x: 0.68, y: 0.35 }, { x: 0.8, y: 0.48 }, { x: 0.8, y: 0.8 }, { x: 0.9, y: 0.78 }]
  ],
  n: [
    [{ x: 0.2, y: 0.35 }, { x: 0.2, y: 0.8 }],
    [{ x: 0.2, y: 0.48 }, { x: 0.45, y: 0.35 }, { x: 0.68, y: 0.48 }, { x: 0.68, y: 0.8 }, { x: 0.8, y: 0.78 }]
  ],
  o: [
    [{ x: 0.5, y: 0.35 }, { x: 0.28, y: 0.45 }, { x: 0.24, y: 0.65 }, { x: 0.35, y: 0.8 }, { x: 0.55, y: 0.8 }, { x: 0.72, y: 0.65 }, { x: 0.68, y: 0.45 }, { x: 0.5, y: 0.35 }, { x: 0.78, y: 0.42 }]
  ],
  p: [
    [{ x: 0.25, y: 0.35 }, { x: 0.25, y: 1.15 }],
    [{ x: 0.25, y: 0.45 }, { x: 0.45, y: 0.35 }, { x: 0.68, y: 0.45 }, { x: 0.68, y: 0.68 }, { x: 0.45, y: 0.78 }, { x: 0.25, y: 0.72 }]
  ],
  q: [
    [{ x: 0.65, y: 0.35 }, { x: 0.65, y: 1.15 }, { x: 0.78, y: 1.05 }],
    [{ x: 0.65, y: 0.5 }, { x: 0.45, y: 0.35 }, { x: 0.25, y: 0.45 }, { x: 0.25, y: 0.68 }, { x: 0.45, y: 0.78 }, { x: 0.65, y: 0.7 }]
  ],
  r: [
    [{ x: 0.25, y: 0.35 }, { x: 0.25, y: 0.8 }],
    [{ x: 0.25, y: 0.5 }, { x: 0.42, y: 0.36 }, { x: 0.65, y: 0.4 }, { x: 0.75, y: 0.48 }]
  ],
  s: [
    [{ x: 0.68, y: 0.42 }, { x: 0.55, y: 0.35 }, { x: 0.35, y: 0.4 }, { x: 0.3, y: 0.52 }, { x: 0.58, y: 0.62 }, { x: 0.65, y: 0.7 }, { x: 0.55, y: 0.8 }, { x: 0.32, y: 0.78 }, { x: 0.25, y: 0.7 }, { x: 0.8, y: 0.78 }]
  ],
  t: [
    [{ x: 0.4, y: 0.15 }, { x: 0.4, y: 0.75 }, { x: 0.55, y: 0.78 }],
    [{ x: 0.25, y: 0.35 }, { x: 0.6, y: 0.35 }]
  ],
  u: [
    [{ x: 0.25, y: 0.35 }, { x: 0.25, y: 0.7 }, { x: 0.4, y: 0.8 }, { x: 0.65, y: 0.7 }, { x: 0.65, y: 0.35 }],
    [{ x: 0.65, y: 0.55 }, { x: 0.65, y: 0.8 }, { x: 0.78, y: 0.78 }]
  ],
  v: [
    [{ x: 0.2, y: 0.35 }, { x: 0.45, y: 0.8 }, { x: 0.7, y: 0.35 }, { x: 0.82, y: 0.38 }]
  ],
  w: [
    [{ x: 0.15, y: 0.35 }, { x: 0.32, y: 0.8 }, { x: 0.48, y: 0.45 }, { x: 0.65, y: 0.8 }, { x: 0.82, y: 0.35 }, { x: 0.92, y: 0.38 }]
  ],
  x: [
    [{ x: 0.25, y: 0.35 }, { x: 0.65, y: 0.8 }],
    [{ x: 0.65, y: 0.35 }, { x: 0.25, y: 0.8 }, { x: 0.75, y: 0.78 }]
  ],
  y: [
    [{ x: 0.25, y: 0.35 }, { x: 0.45, y: 0.7 }, { x: 0.68, y: 0.35 }],
    [{ x: 0.68, y: 0.35 }, { x: 0.68, y: 1.05 }, { x: 0.5, y: 1.15 }, { x: 0.32, y: 1.08 }]
  ],
  z: [
    [{ x: 0.25, y: 0.35 }, { x: 0.65, y: 0.35 }, { x: 0.28, y: 0.78 }, { x: 0.72, y: 0.78 }]
  ],
  // Punctuation
  '.': [
    [{ x: 0.35, y: 0.75 }, { x: 0.35, y: 0.8 }]
  ],
  ',': [
    [{ x: 0.35, y: 0.75 }, { x: 0.35, y: 0.85 }, { x: 0.25, y: 0.95 }]
  ],
  '!': [
    [{ x: 0.45, y: 0.15 }, { x: 0.45, y: 0.65 }],
    [{ x: 0.45, y: 0.78 }, { x: 0.45, y: 0.8 }]
  ],
  '?': [
    [{ x: 0.3, y: 0.25 }, { x: 0.45, y: 0.15 }, { x: 0.62, y: 0.25 }, { x: 0.58, y: 0.45 }, { x: 0.45, y: 0.55 }, { x: 0.45, y: 0.65 }],
    [{ x: 0.45, y: 0.78 }, { x: 0.45, y: 0.8 }]
  ],
  '-': [
    [{ x: 0.25, y: 0.55 }, { x: 0.65, y: 0.55 }]
  ],
  '\'': [
    [{ x: 0.4, y: 0.15 }, { x: 0.35, y: 0.3 }]
  ]
};

// Fallback for uppercase: map to lowercase or geometric monoline
function getGlyphStrokeData(char: string): Stroke[] {
  const lower = char.toLowerCase();
  if (GLYPH_STROKES[lower]) {
    return GLYPH_STROKES[lower];
  }
  // Generic box stroke for unknown characters
  return [
    [{ x: 0.2, y: 0.35 }, { x: 0.7, y: 0.35 }, { x: 0.7, y: 0.8 }, { x: 0.2, y: 0.8 }, { x: 0.2, y: 0.35 }]
  ];
}

/**
 * Builds a continuous word stroke geometry.
 * Rotates, scales, and adds organic fiber wobble.
 */
export function generateWordMonoline(
  text: string,
  fontSize: number,
  wobbleAmount: number = 1.2,
  seed: number = 42
): WordGlyphPath {
  const glyphs = text.split('');
  const letterSpacing = fontSize * 0.68;
  const wordWidth = Math.max(fontSize * 1.2, glyphs.length * letterSpacing);
  const strokes: Stroke[] = [];

  let cursorX = 0;
  let firstPoint: Point2D | null = null;
  let lastPoint: Point2D | null = null;

  glyphs.forEach((char, charIdx) => {
    const rawStrokes = getGlyphStrokeData(char);

    rawStrokes.forEach((stroke, strokeIdx) => {
      const perturbedStroke: Stroke = [];

      stroke.forEach((pt, ptIdx) => {
        // Base coordinate in word space
        const gx = cursorX + pt.x * fontSize;
        const gy = pt.y * fontSize;

        // Organic hand-drawn wobble via noise
        const nX = layeredNoise(gx * 0.05 + seed, gy * 0.05, 2) * wobbleAmount;
        const nY = layeredNoise(gx * 0.05, gy * 0.05 + seed, 2) * wobbleAmount;

        const finalPt = {
          x: gx + nX,
          y: gy + nY
        };

        perturbedStroke.push(finalPt);

        if (!firstPoint) {
          firstPoint = finalPt;
        }
        lastPoint = finalPt;
      });

      strokes.push(perturbedStroke);
    });

    cursorX += letterSpacing;
  });

  return {
    strokes,
    width: cursorX,
    entryPoint: firstPoint || { x: 0, y: fontSize * 0.6 },
    exitPoint: lastPoint || { x: cursorX, y: fontSize * 0.78 }
  };
}
