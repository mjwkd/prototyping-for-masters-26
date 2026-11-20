import * as THREE from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export type WordStyleKey =
  | 'sunshine'
  | 'is'
  | 'rain'
  | 'love'
  | 'the'
  | 'heavy'
  | 'whisper'
  | 'fire'
  | 'default';

export interface WordStyleConfig {
  fontKey: 'helvetiker_regular' | 'helvetiker_bold' | 'droid_serif_bold';
  size: number;
  depth: number;
  bevelEnabled: boolean;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  curveSegments: number;
  materialType: 'standard' | 'physical' | 'outline';
  color: number;
  emissive?: number;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  transmission?: number;
  ior?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transparent?: boolean;
  opacity?: number;
  effect: 'rays' | 'drops' | 'pulse' | 'flicker' | 'outline' | 'none';
}

export const WORD_STYLES: Record<string, WordStyleConfig> = {
  sunshine: {
    fontKey: 'helvetiker_bold',
    size: 10,
    depth: 3.5,
    bevelEnabled: true,
    bevelThickness: 0.55,
    bevelSize: 0.35,
    bevelSegments: 4,
    curveSegments: 12,
    materialType: 'standard',
    color: 0xffb700, // warm golden yellow
    emissive: 0xff8f00, // warm sun glow
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.12,
    effect: 'rays',
  },
  is: {
    fontKey: 'helvetiker_regular',
    size: 10,
    depth: 2.2,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 3,
    curveSegments: 10,
    materialType: 'standard',
    color: 0x111111, // plain crisp black
    roughness: 0.45,
    metalness: 0.08,
    effect: 'none',
  },
  rain: {
    fontKey: 'helvetiker_regular',
    size: 10,
    depth: 3.2,
    bevelEnabled: true,
    bevelThickness: 0.4,
    bevelSize: 0.25,
    bevelSegments: 4,
    curveSegments: 12,
    materialType: 'physical',
    color: 0xdff3ff, // clear water/glass tint
    transmission: 0.94,
    ior: 1.48,
    roughness: 0.05,
    transparent: true,
    opacity: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    effect: 'drops',
  },
  love: {
    fontKey: 'helvetiker_bold',
    size: 10,
    depth: 4.2,
    bevelEnabled: true,
    bevelThickness: 0.85,
    bevelSize: 0.55,
    bevelSegments: 6, // voluptuous candy bevel
    curveSegments: 14,
    materialType: 'physical',
    color: 0xff2875, // glossy vibrant pink
    roughness: 0.08,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    effect: 'pulse',
  },
  the: {
    fontKey: 'helvetiker_regular',
    size: 10,
    depth: 2.2,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 3,
    curveSegments: 10,
    materialType: 'standard',
    color: 0x111111, // plain crisp black
    roughness: 0.45,
    metalness: 0.08,
    effect: 'none',
  },
  heavy: {
    fontKey: 'droid_serif_bold',
    size: 10.5,
    depth: 18.0, // very thick solid dark gray letters
    bevelEnabled: true,
    bevelThickness: 0.9,
    bevelSize: 0.5,
    bevelSegments: 4,
    curveSegments: 12,
    materialType: 'standard',
    color: 0x222227, // dense dark charcoal slate
    roughness: 0.85,
    metalness: 0.25,
    effect: 'none',
  },
  whisper: {
    fontKey: 'helvetiker_regular',
    size: 10,
    depth: 1.4,
    bevelEnabled: false,
    bevelThickness: 0,
    bevelSize: 0,
    bevelSegments: 1,
    curveSegments: 10,
    materialType: 'outline',
    color: 0xa8b0bd, // light gray thin outline
    transparent: true,
    opacity: 0.9,
    effect: 'outline',
  },
  fire: {
    fontKey: 'helvetiker_bold',
    size: 10,
    depth: 3.6,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.3,
    bevelSegments: 4,
    curveSegments: 12,
    materialType: 'standard',
    color: 0xff3b00, // blazing orange-red
    emissive: 0xff1e00,
    emissiveIntensity: 0.75,
    roughness: 0.28,
    metalness: 0.1,
    effect: 'flicker',
  },
  default: {
    fontKey: 'helvetiker_regular',
    size: 10,
    depth: 2.5,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.2,
    bevelSegments: 3,
    curveSegments: 10,
    materialType: 'standard',
    color: 0x111111,
    roughness: 0.45,
    metalness: 0.08,
    effect: 'none',
  },
};

// Font cache
const fontCache: Record<string, Font> = {};

export async function loadFonts(): Promise<Record<string, Font>> {
  if (
    fontCache['helvetiker_regular'] &&
    fontCache['helvetiker_bold'] &&
    fontCache['droid_serif_bold']
  ) {
    return fontCache;
  }

  const loader = new FontLoader();
  const fontFiles = [
    { key: 'helvetiker_regular', url: '/fonts/helvetiker_regular.typeface.json' },
    { key: 'helvetiker_bold', url: '/fonts/helvetiker_bold.typeface.json' },
    { key: 'droid_serif_bold', url: '/fonts/droid_serif_bold.typeface.json' },
  ];

  await Promise.all(
    fontFiles.map(async ({ key, url }) => {
      if (fontCache[key]) return;
      try {
        const res = await fetch(url);
        const data = await res.json();
        fontCache[key] = loader.parse(data);
      } catch (err) {
        console.error(`Failed to load font ${key}:`, err);
      }
    })
  );

  return fontCache;
}

export interface Word3DInstance {
  rootGroup: THREE.Group;
  innerPivot: THREE.Group;
  width: number;
  height: number;
  depth: number;
  update: (time: number, delta: number, rotateMode: 'oscillate' | 'turntable' | 'still') => void;
  dispose: () => void;
}

/**
 * Creates a solid 3D extruded word mesh and attached effects (rays, rain, pulse, flicker).
 */
export function createWord3D(
  text: string,
  styleKey: string,
  fonts: Record<string, Font>,
  wordIndex: number = 0
): Word3DInstance {
  const normalizedKey = styleKey.toLowerCase();
  const cfg = WORD_STYLES[normalizedKey] || WORD_STYLES.default;
  const font = fonts[cfg.fontKey] || fonts['helvetiker_regular'];

  const rootGroup = new THREE.Group();
  const innerPivot = new THREE.Group();
  rootGroup.add(innerPivot);

  // Generate 3D Text Geometry
  const geometry = new TextGeometry(text, {
    font,
    size: cfg.size,
    depth: cfg.depth,
    curveSegments: cfg.curveSegments,
    bevelEnabled: cfg.bevelEnabled,
    bevelThickness: cfg.bevelThickness,
    bevelSize: cfg.bevelSize,
    bevelSegments: cfg.bevelSegments,
  });

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox || new THREE.Box3();
  const width = bbox.max.x - bbox.min.x;
  const height = bbox.max.y - bbox.min.y;
  const depth = bbox.max.z - bbox.min.z;

  // Center the geometry inside innerPivot
  const offsetX = -bbox.min.x - width / 2;
  const offsetY = -bbox.min.y - height / 2;
  const offsetZ = -bbox.min.z - depth / 2;

  let mainMesh: THREE.Object3D;
  const disposables: { dispose: () => void }[] = [geometry];

  // 1. Material & Mesh Creation
  if (cfg.materialType === 'outline') {
    // Whisper: thin outline only, light gray
    const edges = new THREE.EdgesGeometry(geometry, 22);
    disposables.push(edges);

    const lineMat = new THREE.LineBasicMaterial({
      color: cfg.color,
      linewidth: 1.5,
      transparent: true,
      opacity: cfg.opacity ?? 0.85,
    });
    disposables.push(lineMat);

    const lineSegments = new THREE.LineSegments(edges, lineMat);
    lineSegments.position.set(offsetX, offsetY, offsetZ);
    innerPivot.add(lineSegments);
    mainMesh = lineSegments;
  } else {
    // Solid 3D extruded letters
    let material: THREE.Material;

    if (cfg.materialType === 'physical') {
      material = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        roughness: cfg.roughness ?? 0.1,
        metalness: cfg.metalness ?? 0.05,
        transmission: cfg.transmission ?? 0.0,
        ior: cfg.ior ?? 1.5,
        clearcoat: cfg.clearcoat ?? 0.0,
        clearcoatRoughness: cfg.clearcoatRoughness ?? 0.0,
        transparent: cfg.transparent ?? false,
        opacity: cfg.opacity ?? 1.0,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: cfg.roughness ?? 0.45,
        metalness: cfg.metalness ?? 0.1,
        emissive: cfg.emissive ?? 0x000000,
        emissiveIntensity: cfg.emissiveIntensity ?? 0,
      });
    }

    disposables.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(offsetX, offsetY, offsetZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    innerPivot.add(mesh);
    mainMesh = mesh;
  }

  // 2. Attached Special Effects
  // A. Sunshine: Thin radiant rays around the letters
  let raysGroup: THREE.Group | null = null;
  const rayCylinders: THREE.Mesh[] = [];
  let sunLight: THREE.PointLight | null = null;

  if (cfg.effect === 'rays') {
    raysGroup = new THREE.Group();
    innerPivot.add(raysGroup);

    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xffd24d,
      transparent: true,
      opacity: 0.75,
    });
    disposables.push(rayMat);

    const rayCount = 20;
    const radiusX = width * 0.65;
    const radiusY = height * 1.05;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayLen = 4.5 + (i % 3) * 2.5;
      const rayGeom = new THREE.CylinderGeometry(0.12, 0.18, rayLen, 6);
      disposables.push(rayGeom);

      const rayMesh = new THREE.Mesh(rayGeom, rayMat);
      const px = Math.cos(angle) * radiusX;
      const py = Math.sin(angle) * radiusY;
      rayMesh.position.set(px, py, 0);
      rayMesh.rotation.z = angle - Math.PI / 2;
      raysGroup.add(rayMesh);
      rayCylinders.push(rayMesh);
    }

    sunLight = new THREE.PointLight(0xffb700, 1.8, 80);
    sunLight.position.set(0, 0, 12);
    innerPivot.add(sunLight);
  }

  // B. Rain: Small falling drops
  interface RainDrop {
    mesh: THREE.Mesh;
    speed: number;
    initialX: number;
    initialZ: number;
  }
  const rainDrops: RainDrop[] = [];

  if (cfg.effect === 'drops') {
    const dropGeom = new THREE.SphereGeometry(0.4, 8, 8);
    dropGeom.scale(0.8, 1.8, 0.8); // teardrop elongation
    disposables.push(dropGeom);

    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0xa8dcff,
      transmission: 0.9,
      transparent: true,
      opacity: 0.85,
      roughness: 0.05,
      ior: 1.4,
    });
    disposables.push(dropMat);

    const dropCount = 28;
    for (let i = 0; i < dropCount; i++) {
      const dropMesh = new THREE.Mesh(dropGeom, dropMat);
      const rx = (Math.random() - 0.5) * (width + 12);
      const ry = (Math.random() - 0.5) * (height + 20);
      const rz = (Math.random() - 0.5) * 16;
      dropMesh.position.set(rx, ry, rz);
      innerPivot.add(dropMesh);

      rainDrops.push({
        mesh: dropMesh,
        speed: 16 + Math.random() * 14,
        initialX: rx,
        initialZ: rz,
      });
    }
  }

  // C. Fire: Flickering orange-red glow and floating embers
  let fireLight: THREE.PointLight | null = null;
  interface EmberParticle {
    mesh: THREE.Mesh;
    speedY: number;
    driftPhase: number;
  }
  const embers: EmberParticle[] = [];

  if (cfg.effect === 'flicker') {
    fireLight = new THREE.PointLight(0xff4400, 2.2, 70);
    fireLight.position.set(0, -2, 10);
    innerPivot.add(fireLight);

    const emberGeom = new THREE.SphereGeometry(0.25, 6, 6);
    disposables.push(emberGeom);

    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.85,
    });
    disposables.push(emberMat);

    const emberCount = 16;
    for (let i = 0; i < emberCount; i++) {
      const emberMesh = new THREE.Mesh(emberGeom, emberMat);
      emberMesh.position.set(
        (Math.random() - 0.5) * (width + 4),
        -height / 2 + Math.random() * height * 1.4,
        (Math.random() - 0.5) * 8
      );
      innerPivot.add(emberMesh);

      embers.push({
        mesh: emberMesh,
        speedY: 6 + Math.random() * 8,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  // 3. Animation Update Routine
  const update = (
    time: number,
    delta: number,
    rotateMode: 'oscillate' | 'turntable' | 'still'
  ) => {
    // Rotation logic
    if (rotateMode === 'turntable') {
      innerPivot.rotation.y += delta * 0.45;
    } else if (rotateMode === 'oscillate') {
      // Gentle harmonic oscillation facing the camera so words stay readable left to right
      innerPivot.rotation.y = Math.sin(time * 0.8 + wordIndex * 0.45) * 0.28;
      innerPivot.rotation.x = Math.cos(time * 0.6 + wordIndex * 0.3) * 0.04;
    } else {
      innerPivot.rotation.y = 0;
      innerPivot.rotation.x = 0;
    }

    // Effect: Sunshine rays
    if (raysGroup) {
      raysGroup.rotation.z += delta * 0.35;
      const pulseRays = 1.0 + 0.08 * Math.sin(time * 2.5);
      raysGroup.scale.set(pulseRays, pulseRays, 1);
    }

    // Effect: Rain falling drops
    if (rainDrops.length > 0) {
      const topY = height / 2 + 12;
      const bottomY = -height / 2 - 12;

      for (const drop of rainDrops) {
        drop.mesh.position.y -= drop.speed * delta;
        if (drop.mesh.position.y < bottomY) {
          drop.mesh.position.y = topY;
          drop.mesh.position.x = drop.initialX + (Math.random() - 0.5) * 3;
          drop.mesh.position.z = drop.initialZ + (Math.random() - 0.5) * 3;
        }
      }
    }

    // Effect: Love gentle pulsing
    if (cfg.effect === 'pulse') {
      // Gentle heartbeat scale rhythm
      const heartbeat =
        1.0 +
        0.07 * Math.pow(Math.sin(time * 3.2), 4) +
        0.02 * Math.sin(time * 6.4);
      mainMesh.scale.set(heartbeat, heartbeat, heartbeat);
    }

    // Effect: Fire flickering
    if (cfg.effect === 'flicker') {
      const flickerVal =
        0.55 +
        0.35 * Math.sin(time * 14.5) * Math.cos(time * 9.2) +
        (Math.random() - 0.5) * 0.15;
      const clampedFlicker = THREE.MathUtils.clamp(flickerVal, 0.35, 1.15);

      if (mainMesh instanceof THREE.Mesh) {
        const mat = mainMesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = clampedFlicker * 0.9;
      }
      if (fireLight) {
        fireLight.intensity = clampedFlicker * 2.4;
      }

      // Float embers
      const topY = height / 2 + 10;
      const bottomY = -height / 2 - 2;
      for (const ember of embers) {
        ember.mesh.position.y += ember.speedY * delta;
        ember.mesh.position.x += Math.sin(time * 4 + ember.driftPhase) * 0.05;
        if (ember.mesh.position.y > topY) {
          ember.mesh.position.y = bottomY;
          ember.mesh.position.x = (Math.random() - 0.5) * (width + 4);
        }
      }
    }
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    rootGroup,
    innerPivot,
    width,
    height,
    depth,
    update,
    dispose,
  };
}

/**
 * Resolves any input word to its most fitting visual style based on
 * direct keyword matching, semantic associations, or fallback mood.
 */
export function resolveWordStyleKey(wordText: string, mood?: string): string {
  const clean = (wordText || '').toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!clean) return 'default';
  if (WORD_STYLES[clean]) return clean;

  // Semantic keyword mapping
  if (/^(sun|sunshine|light|golden|bright|glow|warm|sunny|gold|shine|day|morning|ray|beam|glory)$/.test(clean)) {
    return 'sunshine';
  }
  if (/^(rain|water|river|sea|ocean|tear|stream|drop|drops|wave|lake|ice|clear|blue|flood|mist|dew|pond)$/.test(clean)) {
    return 'rain';
  }
  if (/^(love|heart|sweet|dear|kiss|tender|warmth|passion|beloved|darling|hug|care|softly)$/.test(clean)) {
    return 'love';
  }
  if (/^(heavy|dark|stone|deep|rock|mountain|dense|night|solid|canopy|ground|giant|shadow|iron|earth)$/.test(clean)) {
    return 'heavy';
  }
  if (/^(whisper|whispered|whispers|quiet|soft|silence|silent|breeze|wind|ghost|faint|gentle|starlit|beneath|secret)$/.test(clean)) {
    return 'whisper';
  }
  if (/^(fire|flame|burn|blaze|spark|sparks|wild|furious|hot|red|ember|smoke|ash|heat|fierce)$/.test(clean)) {
    return 'fire';
  }
  if (/^(the|is|a|an|and|of|to|in|on|with|our|by|for|it|at|from|as|but|so|or)$/.test(clean)) {
    return 'is';
  }

  // Mood fallback
  if (mood === 'joy') return 'sunshine';
  if (mood === 'calm') return 'rain';
  if (mood === 'love') return 'love';
  if (mood === 'heavy') return 'heavy';
  if (mood === 'whisper') return 'whisper';
  if (mood === 'anger' || mood === 'speed') return 'fire';

  return 'default';
}

/**
 * Builds a thin organic thread connecting the exit point of one word
 * to the entry point of the next word.
 * Radius: 0.22 units (~1.5px on screen), with natural catenary sag and subtle noise.
 */
export function buildGapThread(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  seed: number = 0
): { mesh: THREE.Mesh; whiskers: THREE.LineSegments } {
  const dx = p2.x - p1.x;
  const dist = p1.distanceTo(p2);
  const sag = Math.min(3.5, Math.max(1.2, dist * 0.12));

  // Organic catenary-like curve between words
  const pts: THREE.Vector3[] = [
    p1.clone(),
    new THREE.Vector3(p1.x + dx * 0.25, p1.y - sag * 0.6 + Math.sin(seed * 1.7) * 0.4, p1.z + Math.cos(seed * 1.3) * 0.3),
    new THREE.Vector3(p1.x + dx * 0.5, p1.y - sag + Math.sin(seed * 3.1) * 0.5, p1.z + Math.sin(seed * 2.1) * 0.4),
    new THREE.Vector3(p1.x + dx * 0.75, p1.y - sag * 0.5 + Math.cos(seed * 2.7) * 0.3, p1.z + Math.cos(seed * 3.3) * 0.3),
    p2.clone(),
  ];

  const curve = new THREE.CatmullRomCurve3(pts);
  const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.22, 6, false);
  const threadMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.85,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(tubeGeom, threadMat);
  mesh.castShadow = true;

  // Short frayed whiskers at entry and exit
  const whiskerPts: THREE.Vector3[] = [];
  // Exit whisker
  whiskerPts.push(p1.clone(), new THREE.Vector3(p1.x + 1.2, p1.y - 0.9, p1.z + 0.6));
  whiskerPts.push(p1.clone(), new THREE.Vector3(p1.x + 0.8, p1.y + 0.7, p1.z - 0.5));
  // Entry whisker
  whiskerPts.push(p2.clone(), new THREE.Vector3(p2.x - 1.2, p2.y - 0.8, p2.z + 0.5));
  whiskerPts.push(p2.clone(), new THREE.Vector3(p2.x - 0.7, p2.y + 0.9, p2.z - 0.4));

  const whiskerGeom = new THREE.BufferGeometry().setFromPoints(whiskerPts);
  const whiskerMat = new THREE.LineBasicMaterial({
    color: 0x333333,
    linewidth: 1,
    transparent: true,
    opacity: 0.6,
  });
  const whiskers = new THREE.LineSegments(whiskerGeom, whiskerMat);

  return { mesh, whiskers };
}

/**
 * Builds a loose swaying tail at the end of the sentence.
 */
export function buildTailPoints(
  lastExit: THREE.Vector3,
  time: number,
  isTrembling: boolean = false
): THREE.Vector3[] {
  const tailLength = 26;
  const segments = 12;
  const pts: THREE.Vector3[] = [];

  const freq = isTrembling ? 28 : 2.2;
  const amp = isTrembling ? 0.9 : 2.0;

  for (let i = 0; i <= segments; i++) {
    const frac = i / segments;
    const x = lastExit.x + frac * tailLength;
    const sag = Math.pow(frac, 1.4) * 8.0;
    const wave = Math.sin(time * freq - frac * 3.5) * amp * frac;
    const waveZ = Math.cos(time * freq * 0.8 - frac * 3.0) * amp * 0.5 * frac;
    pts.push(new THREE.Vector3(x, lastExit.y - sag + wave, lastExit.z + waveZ));
  }

  return pts;
}

