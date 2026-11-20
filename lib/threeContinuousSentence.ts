import * as THREE from 'three';
import { ThreadWord } from '../types/thread';
import { buildContinuousWordPoints } from './monolineCursive';
import { MoodType, MOOD_STYLES } from './moodStyles';
import { layeredNoise, createPRNG } from './noise';
import { ThemeConfig } from './themeConfig';

export interface ContinuousSentence3D {
  mainTubeMesh: THREE.Mesh;
  secondaryStrandMesh: THREE.Mesh;
  frayedWhiskers: THREE.LineSegments;
  moodAccentsGroup: THREE.Group;
  hitBoxes: THREE.Mesh[]; // Invisible hitboxes for raycasting clicks on words
  wordCenters: THREE.Vector3[];
}

/**
 * Generates a single, seamless, continuous 3D physical yarn tube
 * that threads through the letterforms themselves into the gaps and into the next words.
 * NO blocks, NO background cards. Pure sculpted 3D typography & thread.
 */
export function buildContinuous3DSentence(
  words: ThreadWord[],
  theme: ThemeConfig,
  threadSeed: number = 77,
  someoneElseHoldsPen: boolean = false,
  time: number = 0
): ContinuousSentence3D {
  const prng = createPRNG(threadSeed);
  const master3DPath: THREE.Vector3[] = [];
  const whiskerPoints: THREE.Vector3[] = [];
  const hitBoxes: THREE.Mesh[] = [];
  const wordCenters: THREE.Vector3[] = [];
  const moodAccentsGroup = new THREE.Group();

  if (words.length === 0) {
    const dummy = new THREE.Mesh();
    return {
      mainTubeMesh: dummy,
      secondaryStrandMesh: dummy,
      frayedWhiskers: new THREE.LineSegments(),
      moodAccentsGroup,
      hitBoxes: [],
      wordCenters: [],
    };
  }

  // 1. Calculate Wandering 3D Spatial Path for the sentence
  const count = words.length;
  const wordSpacing = 190;
  const totalLength = Math.max(600, count * wordSpacing);
  const startX = -totalLength / 2 + 100;

  // Lead-in beginning thread
  master3DPath.push(new THREE.Vector3(startX - 120, 0, -40));
  master3DPath.push(new THREE.Vector3(startX - 60, -15, -20));

  for (let i = 0; i < count; i++) {
    const word = words[i];
    const t = i / Math.max(1, count - 1);
    const mood = word.mood || 'neutral';
    const intensity = word.intensity || 0.5;
    const moodConfig = MOOD_STYLES[mood] || MOOD_STYLES.neutral;
    const physics = moodConfig.thread;

    // Word base world position along wandering 3D curve
    const wx = startX + i * wordSpacing;
    const wy = Math.sin(t * Math.PI * 2.8) * 75 + Math.cos(i * 1.4) * 30;
    const wz = Math.sin(t * Math.PI * 3.2) * 90 + (i % 2 === 0 ? 25 : -25);
    const wordPos = new THREE.Vector3(wx, wy, wz);
    wordCenters.push(wordPos);

    // Compute local tangent direction
    const nextT = (i + 1) / Math.max(1, count);
    const nextX = startX + (i + 1) * wordSpacing;
    const nextY = Math.sin(nextT * Math.PI * 2.8) * 75 + Math.cos((i + 1) * 1.4) * 30;
    const nextZ = Math.sin(nextT * Math.PI * 3.2) * 90;
    const tangent = new THREE.Vector3(nextX - wx, nextY - wy, nextZ - wz).normalize();

    // Scale of letters based on mood and intensity
    const letterScale = 0.95 + intensity * 0.45;

    // Build Continuous Cursive letter points for this word
    const { points: rawGlyphPoints, width: glyphWidth } = buildContinuousWordPoints(
      word.text,
      letterScale
    );

    // Rotation quaternion to align word with tangent
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);

    // Append word letterform points into master path
    const wordStartIdx = master3DPath.length;
    rawGlyphPoints.forEach((pt) => {
      // Local offset relative to word center
      const localV = new THREE.Vector3(pt.x - glyphWidth * 0.5, pt.y, pt.z);
      localV.applyQuaternion(quat);
      localV.add(wordPos);
      master3DPath.push(localV);
    });
    const wordEndIdx = master3DPath.length - 1;

    // Invisible Hitbox for Raycasting Interaction (clicking on the word in 3D)
    const hitBoxGeom = new THREE.BoxGeometry(glyphWidth + 20, 50, 40);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitBoxGeom, hitBoxMat);
    hitBox.position.copy(wordPos);
    hitBox.quaternion.copy(quat);
    hitBox.userData = { wordIndex: i, word };
    hitBoxes.push(hitBox);

    // Mood Accent Charm (e.g. 3D extruded Heart for love, Teardrop for sadness, Gem for joy)
    if (mood === 'love' || mood === 'joy' || mood === 'anger' || mood === 'sadness') {
      const charm = createMoodAccentMesh(mood, intensity, theme);
      if (charm) {
        charm.position.copy(wordPos);
        charm.position.y += 32;
        charm.position.z += 10;
        charm.quaternion.copy(quat);
        moodAccentsGroup.add(charm);
      }
    }

    // Frayed Fiber Whiskers at letter terminal entry & exit
    if (master3DPath.length > 2) {
      const exitPt = master3DPath[wordEndIdx];
      for (let w = 0; w < 3; w++) {
        const theta = prng() * Math.PI * 2;
        const len = 7 + prng() * 11;
        whiskerPoints.push(exitPt.clone());
        whiskerPoints.push(
          exitPt.clone().add(new THREE.Vector3(Math.cos(theta) * len, Math.sin(theta) * len, (prng() - 0.5) * len))
        );
      }
    }

    // Connect Gap between word i and word i + 1 seamlessly
    if (i < count - 1) {
      const nextWordPos = new THREE.Vector3(nextX, nextY, nextZ);
      const gapExitPt = master3DPath[wordEndIdx];
      const gapEnterPt = new THREE.Vector3(nextX - 35, nextY, nextZ);

      const gapDist = gapExitPt.distanceTo(gapEnterPt);
      const gapSteps = Math.max(10, Math.floor(gapDist / 15));

      const slack = physics.slackFactor * (gapDist * 0.32);

      for (let s = 1; s < gapSteps; s++) {
        const gt = s / gapSteps;
        const gapPt = new THREE.Vector3().lerpVectors(gapExitPt, gapEnterPt, gt);

        // Organic gravity sag
        const sag = 4 * gt * (1 - gt) * slack;
        gapPt.y -= sag;

        // Noise displacement
        const nY = (layeredNoise(gt * 4 + i, threadSeed, 2) - 0.5) * physics.noiseAmp * 0.6;
        const nZ = (layeredNoise(threadSeed, gt * 4 + i, 2) - 0.5) * physics.noiseAmp * 0.6;
        gapPt.y += nY;
        gapPt.z += nZ;

        // Mood-driven loops / coils
        if (physics.loopRange[1] > 0 && s === Math.floor(gapSteps / 2)) {
          const loopRadius = 14 * physics.strokeScale;
          const loopPt = gapPt.clone().add(new THREE.Vector3(0, loopRadius * 1.2, loopRadius * 0.8));
          master3DPath.push(loopPt);
        }

        master3DPath.push(gapPt);
      }
    }
  }

  // Trailing Tail at the end of the sentence
  const lastPt = master3DPath[master3DPath.length - 1];
  const tailSway = Math.sin(time * 3) * (someoneElseHoldsPen ? 16 : 6);
  master3DPath.push(new THREE.Vector3(lastPt.x + 40, lastPt.y - 15 + tailSway, lastPt.z + 10));
  master3DPath.push(new THREE.Vector3(lastPt.x + 85, lastPt.y - 35 + tailSway * 1.4, lastPt.z + 20));

  // Build the Unified Continuous 3D Spline
  const continuousSpline = new THREE.CatmullRomCurve3(
    master3DPath,
    false,
    'catmullrom',
    0.3
  );

  // 1. Primary 3D Extruded Yarn Tube
  const tubeGeometry = new THREE.TubeGeometry(
    continuousSpline,
    master3DPath.length * 10,
    2.4, // radius
    10,  // radial segments for smooth round 3D yarn
    false
  );

  const mainMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme.inkPrimary),
    roughness: 0.55,
    metalness: 0.08,
  });

  const mainTubeMesh = new THREE.Mesh(tubeGeometry, mainMaterial);
  mainTubeMesh.castShadow = true;
  mainTubeMesh.receiveShadow = true;

  // 2. Secondary Twisted Yarn Strand
  const secondaryGeom = new THREE.TubeGeometry(
    continuousSpline,
    master3DPath.length * 8,
    1.1,
    6,
    false
  );

  const secondaryMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme.inkStrand2),
    roughness: 0.7,
    metalness: 0.0,
  });

  const secondaryStrandMesh = new THREE.Mesh(secondaryGeom, secondaryMaterial);
  secondaryStrandMesh.scale.set(1.02, 1.02, 1.02);

  // 3. Frayed Fiber Line Segments
  const lineGeom = new THREE.BufferGeometry().setFromPoints(whiskerPoints);
  const lineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(theme.inkPrimary),
    transparent: true,
    opacity: 0.5,
  });
  const frayedWhiskers = new THREE.LineSegments(lineGeom, lineMat);

  return {
    mainTubeMesh,
    secondaryStrandMesh,
    frayedWhiskers,
    moodAccentsGroup,
    hitBoxes,
    wordCenters,
  };
}

/**
 * Creates sculpted 3D mood accents (Hearts for love, Droplets for sadness, Gems for joy)
 * without any rectangular background cards.
 */
function createMoodAccentMesh(
  mood: MoodType,
  intensity: number,
  theme: ThemeConfig
): THREE.Mesh | null {
  const shape = new THREE.Shape();
  const moodColor = new THREE.Color(MOOD_STYLES[mood]?.color || theme.accent);

  if (mood === 'love') {
    // 3D Extruded Heart Charm
    const s = 0.5 + intensity * 0.2;
    shape.moveTo(0, 5 * s);
    shape.bezierCurveTo(5 * s, 15 * s, 18 * s, 12 * s, 18 * s, 2 * s);
    shape.bezierCurveTo(18 * s, -8 * s, 10 * s, -14 * s, 0, -22 * s);
    shape.bezierCurveTo(-10 * s, -14 * s, -18 * s, -8 * s, -18 * s, 2 * s);
    shape.bezierCurveTo(-18 * s, 12 * s, -5 * s, 15 * s, 0, 5 * s);
  } else if (mood === 'sadness') {
    // 3D Teardrop Droplet Charm
    const s = 0.5;
    shape.moveTo(0, 15 * s);
    shape.bezierCurveTo(12 * s, 5 * s, 12 * s, -12 * s, 0, -12 * s);
    shape.bezierCurveTo(-12 * s, -12 * s, -12 * s, 5 * s, 0, 15 * s);
  } else if (mood === 'joy') {
    // 3D Four-point Star / Gem
    const r1 = 12;
    const r2 = 5;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = i % 2 === 0 ? r1 : r2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    }
    shape.closePath();
  } else {
    return null;
  }

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 4,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 1.5,
    bevelThickness: 1.5,
  });
  geom.center();

  const mat = new THREE.MeshStandardMaterial({
    color: moodColor,
    roughness: 0.3,
    metalness: 0.2,
  });

  return new THREE.Mesh(geom, mat);
}
