import { Point2D } from './monolineFont';
import { createPRNG, layeredNoise } from './noise';

export interface ProjectedWordNode {
  wordIndex: number;
  worldPos: { x: number; y: number; z: number };
  screenPos: Point2D;
  scale: number;
  angle: number; // inclination angle along thread
  depthAlpha: number; // 0.35 to 1.0 based on Z
}

/**
 * Calculates a wandering 3D spatial layout for all words in the sentence.
 * Words weave across the canvas, looping and crossing over themselves.
 */
export function calculateWanderingSentenceLayout(
  wordCount: number,
  viewWidth: number,
  viewHeight: number,
  cameraOrbitTime: number = 0,
  threadSeed: number = 101
): ProjectedWordNode[] {
  if (wordCount === 0) return [];

  const prng = createPRNG(threadSeed);
  const nodes: ProjectedWordNode[] = [];

  const cx = viewWidth / 2;
  const cy = viewHeight / 2;
  const fov = 650;

  // Camera orbit angle (slow continuous breathing rotation)
  const orbitAngleY = Math.sin(cameraOrbitTime * 0.15) * 0.06;
  const orbitAngleX = Math.cos(cameraOrbitTime * 0.12) * 0.04;

  // Path step size
  const baseSpacing = Math.max(140, Math.min(260, (viewWidth * 1.5) / Math.max(1, wordCount)));

  for (let i = 0; i < wordCount; i++) {
    const t = i / Math.max(1, wordCount - 1);

    // Wandering S-curves across canvas crossing over itself
    const wanderFreqX = 1.8;
    const wanderFreqY = 2.4;

    // Base horizontal progression that folds and loops back
    const loopX = Math.sin(t * Math.PI * wanderFreqX + threadSeed) * (viewWidth * 0.38);
    const loopY = Math.cos(t * Math.PI * wanderFreqY + threadSeed * 1.3) * (viewHeight * 0.32);

    // Progressive shift from left to right with local loops
    const progressX = (t - 0.5) * (viewWidth * 0.7);

    // Procedural noise distortion to avoid mechanical perfection
    const noiseX = (layeredNoise(t * 4 + threadSeed, 1.2, 2) - 0.5) * 80;
    const noiseY = (layeredNoise(2.4, t * 4 + threadSeed, 2) - 0.5) * 90;

    const rawX = cx + progressX + loopX * 0.6 + noiseX;
    const rawY = cy + loopY + noiseY;

    // 3D Depth oscillation: Z ranges from -150 (far) to +150 (close)
    const rawZ = Math.sin(t * Math.PI * 3.2 + threadSeed) * 120 +
                 Math.cos(t * Math.PI * 1.5) * 40;

    // Apply 3D Camera Orbit rotation around (cx, cy, 0)
    const dx = rawX - cx;
    const dy = rawY - cy;
    const dz = rawZ;

    // Rotate around Y axis
    const rx = dx * Math.cos(orbitAngleY) + dz * Math.sin(orbitAngleY);
    const rz = -dx * Math.sin(orbitAngleY) + dz * Math.cos(orbitAngleY);

    // Rotate around X axis
    const ry = dy * Math.cos(orbitAngleX) - rz * Math.sin(orbitAngleX);
    const finalZ = dy * Math.sin(orbitAngleX) + rz * Math.cos(orbitAngleX);

    // Perspective Projection
    const depthScale = fov / (fov + finalZ);
    const screenX = cx + rx * depthScale;
    const screenY = cy + ry * depthScale;

    // Alpha / Depth attenuation: closer = 1.0, farther = 0.45
    const depthAlpha = Math.max(0.35, Math.min(1.0, 0.7 + (finalZ / 300) * 0.35));

    nodes.push({
      wordIndex: i,
      worldPos: { x: cx + rx, y: cy + ry, z: finalZ },
      screenPos: { x: screenX, y: screenY },
      scale: depthScale,
      angle: 0, // calculated in second pass below
      depthAlpha,
    });
  }

  // Second pass: compute local tangent angle for each word
  for (let i = 0; i < nodes.length; i++) {
    const prev = nodes[Math.max(0, i - 1)];
    const next = nodes[Math.min(nodes.length - 1, i + 1)];
    const dx = next.screenPos.x - prev.screenPos.x;
    const dy = next.screenPos.y - prev.screenPos.y;
    // Mild tilt clamp (-25 deg to +25 deg) so words stay readable
    const rawAngle = Math.atan2(dy, dx);
    const clampedAngle = Math.max(-0.4, Math.min(0.4, rawAngle));
    nodes[i].angle = clampedAngle;
  }

  return nodes;
}
