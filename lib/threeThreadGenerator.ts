import * as THREE from 'three';
import { MoodType, MOOD_STYLES } from './moodStyles';
import { createPRNG, layeredNoise } from './noise';
import { ThemeConfig } from './themeConfig';

export interface ThreadMeshBundle {
  mainTube: THREE.Mesh;
  yarnSpiral1: THREE.Mesh;
  yarnSpiral2?: THREE.Mesh;
  frayedWhiskers: THREE.LineSegments;
  looseEndMeshes: THREE.Mesh[];
  tailMesh?: THREE.Mesh;
}

/**
 * Builds physical 3D yarn tubes threading through every 3D word bead in space.
 */
export function buildPhysical3DThread(
  beadPositions: THREE.Vector3[],
  moods: MoodType[],
  theme: ThemeConfig,
  threadSeed: number = 42,
  someoneElseHoldsPen: boolean = false,
  time: number = 0
): ThreadMeshBundle {
  if (beadPositions.length === 0) {
    const dummy = new THREE.Mesh();
    return {
      mainTube: dummy,
      yarnSpiral1: dummy,
      frayedWhiskers: new THREE.LineSegments(),
      looseEndMeshes: [],
    };
  }

  const prng = createPRNG(threadSeed);
  const fullPathPoints: THREE.Vector3[] = [];
  const whiskerPoints: THREE.Vector3[] = [];

  // If only 1 word, create a gentle lead-in and lead-out
  if (beadPositions.length === 1) {
    const p = beadPositions[0];
    fullPathPoints.push(new THREE.Vector3(p.x - 80, p.y, p.z));
    fullPathPoints.push(p.clone());
    fullPathPoints.push(new THREE.Vector3(p.x + 80, p.y, p.z));
  } else {
    // Lead-in start knot
    const first = beadPositions[0];
    const second = beadPositions[1];
    const startDir = new THREE.Vector3().subVectors(first, second).normalize();
    fullPathPoints.push(new THREE.Vector3().addVectors(first, startDir.clone().multiplyScalar(90)));

    for (let i = 0; i < beadPositions.length - 1; i++) {
      const p1 = beadPositions[i];
      const p2 = beadPositions[i + 1];
      const mood = moods[i] || 'neutral';
      const moodConfig = MOOD_STYLES[mood] || MOOD_STYLES.neutral;
      const physics = moodConfig.thread;

      // Add entry into word i
      fullPathPoints.push(p1.clone());

      // Generate organic gap points between word i and word i + 1
      const dist = p1.distanceTo(p2);
      const steps = Math.max(8, Math.floor(dist / 20));

      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();

      const slack = physics.slackFactor * (dist * 0.28);

      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const interp = new THREE.Vector3().lerpVectors(p1, p2, t);

        // Catenary sag (gravity downwards)
        const sag = 4 * t * (1 - t) * slack;
        interp.y -= sag;

        // Multi-frequency noise displacement
        const nX = (layeredNoise(t * 5 + i * 2, threadSeed, 2) - 0.5) * physics.noiseAmp * 0.7;
        const nZ = (layeredNoise(threadSeed, t * 5 + i * 2, 2) - 0.5) * physics.noiseAmp * 0.7;
        interp.addScaledVector(right, nX);
        interp.z += nZ;

        // Inject mood loop / curl at center
        if (physics.loopRange[1] > 0 && s === Math.floor(steps / 2)) {
          const loopRadius = 14 * physics.strokeScale;
          const loopPoint = interp.clone().add(new THREE.Vector3(0, loopRadius, loopRadius * 0.8));
          fullPathPoints.push(loopPoint);
        }

        fullPathPoints.push(interp);
      }

      // Add frayed whiskers around bead exits
      for (let w = 0; w < 3; w++) {
        const fAngle = prng() * Math.PI * 2;
        const fLen = 8 + prng() * 10;
        whisperPointPair(p1, dir, fAngle, fLen, whiskerPoints);
      }
    }

    // Add final word point
    const lastWord = beadPositions[beadPositions.length - 1];
    fullPathPoints.push(lastWord.clone());

    // Loose swaying tail at the end
    const lastDir = new THREE.Vector3().subVectors(
      lastWord,
      beadPositions[Math.max(0, beadPositions.length - 2)]
    ).normalize();

    const tailEnd = lastWord.clone().add(lastDir.clone().multiplyScalar(100));
    // Sway animation on tail
    tailEnd.y -= 25 + Math.sin(time * 3) * (someoneElseHoldsPen ? 12 : 5);
    tailEnd.x += Math.cos(time * 2) * 6;
    fullPathPoints.push(tailEnd);
  }

  // Build CatmullRom Spline Curve in 3D
  const spline = new THREE.CatmullRomCurve3(fullPathPoints, false, 'catmullrom', 0.4);

  // 1. Main Yarn Tube
  const tubeGeom = new THREE.TubeGeometry(spline, fullPathPoints.length * 12, 2.2, 8, false);
  const threadColor = new THREE.Color(theme.inkPrimary);

  const mainMat = new THREE.MeshStandardMaterial({
    color: threadColor,
    roughness: 0.7,
    metalness: 0.05,
  });
  const mainTube = new THREE.Mesh(tubeGeom, mainMat);
  mainTube.castShadow = true;
  mainTube.receiveShadow = true;

  // 2. Secondary Twisted Strand (wrapped around main tube)
  const spiralGeom = new THREE.TubeGeometry(spline, fullPathPoints.length * 10, 1.0, 6, false);
  const spiralMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme.inkStrand2),
    roughness: 0.8,
    metalness: 0.0,
  });
  const yarnSpiral1 = new THREE.Mesh(spiralGeom, spiralMat);
  yarnSpiral1.scale.set(1.02, 1.02, 1.02);

  // 3. Frayed Fiber Whiskers
  const lineGeom = new THREE.BufferGeometry().setFromPoints(whiskerPoints);
  const lineMat = new THREE.LineBasicMaterial({
    color: threadColor,
    transparent: true,
    opacity: 0.6,
  });
  const frayedWhiskers = new THREE.LineSegments(lineGeom, lineMat);

  return {
    mainTube,
    yarnSpiral1,
    frayedWhiskers,
    looseEndMeshes: [],
  };
}

function whisperPointPair(
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  angle: number,
  len: number,
  pts: THREE.Vector3[]
) {
  pts.push(origin.clone());
  const offset = new THREE.Vector3(
    Math.cos(angle) * len,
    Math.sin(angle) * len,
    (Math.random() - 0.5) * len
  );
  pts.push(origin.clone().add(offset));
}
