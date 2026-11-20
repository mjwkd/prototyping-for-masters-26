import { Point2D, Stroke } from './monolineFont';
import { MoodType, MOOD_STYLES, ThreadMoodPhysics } from './moodStyles';
import { createPRNG, layeredNoise } from './noise';

export interface YarnStrand {
  points: Point2D[];
  strokeWidth: number;
  opacity: number;
}

export interface StitchPunchDot {
  x: number;
  y: number;
  radius: number;
}

export interface FrayedFiber {
  points: Point2D[];
  strokeWidth: number;
  opacity: number;
}

export interface ExtrusionDot {
  x: number;
  y: number;
  radius: number;
  layer: number; // 0 (deep shadow), 1 (mid), 2 (foreground)
}

export interface ThreadGapGeometry {
  strands: YarnStrand[];
  stitches: Point2D[];
  punchDots: StitchPunchDot[];
  frayedEnds: FrayedFiber[];
  tangles: Stroke[];
  extrusionDots: ExtrusionDot[];
  startPoint: Point2D;
  endPoint: Point2D;
}

/**
 * Procedurally generates an organic multi-strand yarn path between two points.
 * Incorporates slack sags, machine stitches, loops/curls, tangled clusters, and frayed ends.
 */
export function generateOrganicThreadGap(
  pStart: Point2D,
  pEnd: Point2D,
  mood: MoodType,
  intensity: number,
  gapSeed: number,
  isEndingTail: boolean = false,
  tailAnimPhase: number = 0
): ThreadGapGeometry {
  const prng = createPRNG(gapSeed);
  const moodConfig = MOOD_STYLES[mood] || MOOD_STYLES.neutral;
  const physics = moodConfig.thread;

  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  // Unit vectors along and perpendicular to gap
  const ux = dx / Math.max(1, distance);
  const uy = dy / Math.max(1, distance);
  const perpX = -uy;
  const perpY = ux;

  // Number of sample points along the main path (at least 60-120 for silky curves)
  const numSteps = Math.max(60, Math.floor(distance / 5));
  const mainSpine: Point2D[] = [];

  // Determine physics parameters
  const slack = (physics.slackFactor * 0.7 + intensity * 0.4) * (distance * 0.35);
  const numLoops = Math.floor(
    physics.loopRange[0] + prng() * (physics.loopRange[1] - physics.loopRange[0] + 1)
  );

  // Subdivide gap into:
  // 1. Machine stitch zone (t: 0.05 -> 0.28)
  // 2. Slack curve & loops zone (t: 0.28 -> 0.75)
  // 3. Entry alignment zone (t: 0.75 -> 1.0)
  const stitchZoneStart = 0.08;
  const stitchZoneEnd = 0.32;
  const hasStitches = physics.zigzagIntensity > 0.05 && !isEndingTail;
  const stitches: Point2D[] = [];
  const punchDots: StitchPunchDot[] = [];

  // Generate main backbone spine
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;

    // Linear baseline interpolation
    let bx = pStart.x + ux * (distance * t);
    let by = pStart.y + uy * (distance * t);

    // Gravity sag (catenary parabola: 4 * t * (1 - t))
    const sagT = 4 * t * (1 - t);
    const sagOffset = slack * sagT;
    bx += 0; // vertical gravity
    by += sagOffset;

    // Layered 2-frequency simplex noise
    const noiseVal = layeredNoise(
      t * 6 + gapSeed * 0.1,
      gapSeed * 0.5,
      3,
      0.5,
      2.2
    );
    const noiseOffset = (noiseVal - 0.5) * physics.noiseAmp * 1.6;

    bx += perpX * noiseOffset;
    by += perpY * noiseOffset;

    // If ending tail: apply gentle harmonic swaying
    if (isEndingTail && t > 0.2) {
      const tailSway = Math.sin(tailAnimPhase + t * 4) * (20 * t);
      bx += perpX * tailSway;
      by += perpY * tailSway;
    }

    mainSpine.push({ x: bx, y: by });
  }

  // Inject Machine Stitch zigzags
  if (hasStitches) {
    const stitchSteps = 14;
    const stitchAmp = 9 * physics.zigzagIntensity;
    for (let s = 0; s <= stitchSteps; s++) {
      const st = stitchZoneStart + (s / stitchSteps) * (stitchZoneEnd - stitchZoneStart);
      const spineIdx = Math.floor(st * numSteps);
      const basePt = mainSpine[Math.min(spineIdx, mainSpine.length - 1)];

      const sign = (s % 2 === 0 ? 1 : -1);
      const sx = basePt.x + perpX * (sign * stitchAmp);
      const sy = basePt.y + perpY * (sign * stitchAmp);

      stitches.push({ x: sx, y: sy });

      if (s % 2 === 0) {
        punchDots.push({
          x: sx,
          y: sy,
          radius: 1.4,
        });
      }
    }
  }

  // Inject Mood Loops / Curls / Knots
  const tangles: Stroke[] = [];
  if (numLoops > 0 && !isEndingTail) {
    for (let l = 0; l < numLoops; l++) {
      const loopCenterT = 0.35 + (l / (numLoops + 1)) * 0.4 + (prng() - 0.5) * 0.08;
      const spineIdx = Math.floor(loopCenterT * numSteps);
      const center = mainSpine[Math.min(spineIdx, mainSpine.length - 1)];
      const loopRadius = 10 + prng() * 14 * physics.strokeScale;

      const loopStroke: Point2D[] = [];
      const loopSegments = 24;

      if (physics.loopStyle === 'heart') {
        // Lyrical heart-like curl (for love mood)
        for (let k = 0; k <= loopSegments; k++) {
          const theta = (k / loopSegments) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(theta), 3);
          const hy = -(13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta));
          loopStroke.push({
            x: center.x + (hx * 0.6) * (loopRadius / 15),
            y: center.y + (hy * 0.6) * (loopRadius / 15),
          });
        }
      } else if (physics.loopStyle === 'drip') {
        // Deep teardrop sag (sadness / heavy)
        for (let k = 0; k <= loopSegments; k++) {
          const theta = (k / loopSegments) * Math.PI * 2;
          const r = loopRadius * (1 + 0.6 * Math.sin(theta));
          loopStroke.push({
            x: center.x + Math.cos(theta) * r * 0.6,
            y: center.y + Math.sin(theta) * r * 1.5,
          });
        }
      } else {
        // Standard loop / spring coil (joy, calm, neutral)
        for (let k = 0; k <= loopSegments; k++) {
          const theta = (k / loopSegments) * Math.PI * 2.3;
          loopStroke.push({
            x: center.x + Math.cos(theta) * loopRadius,
            y: center.y + Math.sin(theta) * loopRadius,
          });
        }
      }

      tangles.push(loopStroke);
    }
  }

  // Scribbled knot cluster (for anger or high tension)
  if (prng() < physics.scribbleChance && !isEndingTail) {
    const tangleCenterT = 0.5 + (prng() - 0.5) * 0.2;
    const center = mainSpine[Math.floor(tangleCenterT * numSteps)];
    const clusterPoints: Point2D[] = [];
    const tangleSteps = 18;
    const clusterRadius = 14 * physics.strokeScale;

    for (let c = 0; c < tangleSteps; c++) {
      const theta = prng() * Math.PI * 2;
      const r = prng() * clusterRadius;
      clusterPoints.push({
        x: center.x + Math.cos(theta) * r,
        y: center.y + Math.sin(theta) * r,
      });
    }
    tangles.push(clusterPoints);
  }

  // Generate 2-3 Offset Strands for Authentic Twisted Yarn
  const strands: YarnStrand[] = [];
  const strandCount = physics.strandCount;

  // Primary Strand
  strands.push({
    points: mainSpine,
    strokeWidth: 1.8 * physics.strokeScale,
    opacity: 0.95,
  });

  // Secondary Strand (micro-offset + divergence)
  if (strandCount >= 2) {
    const strand2Points: Point2D[] = mainSpine.map((pt, idx) => {
      const t = idx / numSteps;
      const divergence = Math.sin(t * Math.PI * 5 + gapSeed) * 1.8;
      const localNoise = layeredNoise(pt.x * 0.04, pt.y * 0.04 + gapSeed, 2) * 1.2;
      return {
        x: pt.x + perpX * (divergence + localNoise + 0.8),
        y: pt.y + perpY * (divergence + localNoise + 0.8),
      };
    });

    strands.push({
      points: strand2Points,
      strokeWidth: 1.1 * physics.strokeScale,
      opacity: 0.8,
    });
  }

  // Tertiary Strand (lighter, occasionally drifting slack thread)
  if (strandCount >= 3) {
    const strand3Points: Point2D[] = mainSpine.map((pt, idx) => {
      const t = idx / numSteps;
      const divergence = Math.cos(t * Math.PI * 4 + gapSeed * 1.5) * 2.2;
      return {
        x: pt.x + perpX * (divergence - 1.2),
        y: pt.y + perpY * (divergence - 1.2),
      };
    });

    strands.push({
      points: strand3Points,
      strokeWidth: 0.7 * physics.strokeScale,
      opacity: 0.65,
    });
  }

  // Frayed Fiber Whiskers at Entry / Exit points and Knots
  const frayedEnds: FrayedFiber[] = [];
  const addFrayCluster = (origin: Point2D, dirX: number, dirY: number, count: number) => {
    for (let f = 0; f < count; f++) {
      const fAngle = Math.atan2(dirY, dirX) + (prng() - 0.5) * 1.4;
      const fLen = 6 + prng() * 12;
      frayedEnds.push({
        points: [
          origin,
          {
            x: origin.x + Math.cos(fAngle) * fLen,
            y: origin.y + Math.sin(fAngle) * fLen,
          },
        ],
        strokeWidth: 0.6 + prng() * 0.4,
        opacity: 0.5 + prng() * 0.3,
      });
    }
  };

  addFrayCluster(pStart, ux, uy, 3);
  if (!isEndingTail) {
    addFrayCluster(pEnd, -ux, -uy, 3);
  }

  // Reference 3: Dotted Extrusion Accent points (stacked repeating dot matrices)
  const extrusionDots: ExtrusionDot[] = [];
  const dotCount = 12;
  for (let d = 0; d < dotCount; d++) {
    const dt = 0.72 + (d / dotCount) * 0.25;
    const spineIdx = Math.floor(dt * numSteps);
    const base = mainSpine[Math.min(spineIdx, mainSpine.length - 1)];

    // Layer 0: Shadow dot
    extrusionDots.push({
      x: base.x + 2,
      y: base.y + 3,
      radius: 3.2,
      layer: 0,
    });
    // Layer 1: Mid dot
    extrusionDots.push({
      x: base.x + 1,
      y: base.y + 1.5,
      radius: 2.4,
      layer: 1,
    });
    // Layer 2: Core dot
    extrusionDots.push({
      x: base.x,
      y: base.y,
      radius: 1.8,
      layer: 2,
    });
  }

  return {
    strands,
    stitches,
    punchDots,
    frayedEnds,
    tangles,
    extrusionDots,
    startPoint: pStart,
    endPoint: pEnd,
  };
}
