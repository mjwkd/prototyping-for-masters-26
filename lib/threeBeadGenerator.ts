import * as THREE from 'three';
import { MoodType, MOOD_STYLES } from './moodStyles';
import { ThemeConfig } from './themeConfig';

/**
 * Creates high-resolution canvas texture for the word text
 * with crisp anti-aliased typography and mood badge.
 */
export function createWordTextTexture(
  text: string,
  mood: MoodType,
  authorName: string,
  theme: ThemeConfig,
  intensity: number = 0.5
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const moodConfig = MOOD_STYLES[mood] || MOOD_STYLES.neutral;

  // Determine font styling
  let fontName = 'serif';
  if (mood === 'joy' || mood === 'speed') fontName = '"Outfit", sans-serif';
  else if (mood === 'anger' || mood === 'heavy') fontName = '"Rubik Mono One", sans-serif';
  else if (mood === 'whisper') fontName = '"Caveat", cursive';
  else if (mood === 'love') fontName = '"Playfair Display", serif';
  else fontName = '"Lora", serif';

  const fontSize = Math.round(110 + intensity * 40);
  ctx.font = `${moodConfig.minWeight > 500 ? 'bold' : 'normal'} ${fontSize}px ${fontName}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Soft drop shadow on text
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Word text
  ctx.fillStyle = theme.id === 'B' ? '#ffffff' : '#1c1917';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 15);

  // Author & mood subtitle pill below
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = '500 32px "Space Grotesk", sans-serif';
  ctx.fillStyle = theme.id === 'B' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.55)';
  ctx.fillText(`by ${authorName} • ${mood}`, canvas.width / 2, canvas.height / 2 + 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates 3D extruded shapes inspired by webgl_geometry_shapes:
 * Rounded rectangles, hearts (love), teardrops (sadness), multifaceted prisms (joy/anger),
 * and beveled pill beads pierced through by a central tunnel for the thread.
 */
export function createBeadGeometry(
  mood: MoodType,
  wordLength: number,
  intensity: number = 0.5
): THREE.BufferGeometry {
  const baseWidth = Math.max(70, Math.min(180, wordLength * 14 + 50));
  const baseHeight = 44 + intensity * 12;
  const depth = 22 + intensity * 8;

  const shape = new THREE.Shape();
  const hw = baseWidth / 2;
  const hh = baseHeight / 2;
  const radius = Math.min(hh * 0.85, 20);

  if (mood === 'love') {
    // 3D Heart-contoured bead (inspired by webgl_geometry_shapes heart)
    const scale = 1.6 + intensity * 0.4;
    shape.moveTo(0, 15 * scale);
    shape.bezierCurveTo(15 * scale, 35 * scale, 40 * scale, 25 * scale, 40 * scale, 5 * scale);
    shape.bezierCurveTo(40 * scale, -15 * scale, 25 * scale, -30 * scale, 0, -45 * scale);
    shape.bezierCurveTo(-25 * scale, -30 * scale, -40 * scale, -15 * scale, -40 * scale, 5 * scale);
    shape.bezierCurveTo(-40 * scale, 25 * scale, -15 * scale, 35 * scale, 0, 15 * scale);
  } else if (mood === 'sadness') {
    // Teardrop droplet shape
    shape.moveTo(0, hh * 1.2);
    shape.bezierCurveTo(hw, hh * 0.4, hw, -hh, 0, -hh);
    shape.bezierCurveTo(-hw, -hh, -hw, hh * 0.4, 0, hh * 1.2);
  } else if (mood === 'anger') {
    // Sharp chamfered angular polygon
    const ch = 12;
    shape.moveTo(-hw + ch, -hh);
    shape.lineTo(hw - ch, -hh);
    shape.lineTo(hw, -hh + ch);
    shape.lineTo(hw, hh - ch);
    shape.lineTo(hw - ch, hh);
    shape.lineTo(-hw + ch, hh);
    shape.lineTo(-hw, hh - ch);
    shape.lineTo(-hw, -hh + ch);
    shape.closePath();
  } else if (mood === 'joy') {
    // Curvilinear cloud / squircle shape
    shape.moveTo(-hw + radius, -hh);
    shape.lineTo(hw - radius, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
    shape.quadraticCurveTo(hw + 6, 0, hw, radius);
    shape.quadraticCurveTo(hw, hh, hw - radius, hh);
    shape.lineTo(-hw + radius, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, radius);
    shape.quadraticCurveTo(-hw - 6, 0, -hw, -hh + radius);
    shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  } else {
    // Classic smooth beveled rounded rectangle pill (webgl_geometry_shapes standard)
    shape.moveTo(-hw + radius, -hh);
    shape.lineTo(hw - radius, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
    shape.lineTo(hw, hh - radius);
    shape.quadraticCurveTo(hw, hh, hw - radius, hh);
    shape.lineTo(-hw + radius, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
    shape.lineTo(-hw, -hh + radius);
    shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  }

  // Bead Hole: Circular cutout path so the thread visibly tunnels through!
  const holePath = new THREE.Path();
  const holeRadius = 4.5;
  holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  // Extrude with smooth bevels
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 3.5,
    bevelSize: 3,
    bevelOffset: 0,
    bevelSegments: 4,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

/**
 * Creates 3D tactile material for each mood:
 * Rich subsurface scattering appearance, specular highlights, matte or metallic lacquer.
 */
export function createBeadMaterial(
  mood: MoodType,
  theme: ThemeConfig,
  textTexture: THREE.CanvasTexture,
  intensity: number = 0.5
): THREE.Material[] {
  const moodConfig = MOOD_STYLES[mood] || MOOD_STYLES.neutral;
  const moodColor = new THREE.Color(moodConfig.color);

  // Surface material with front text map
  const frontMat = new THREE.MeshStandardMaterial({
    color: theme.id === 'B' ? moodColor.clone().multiplyScalar(0.7) : moodColor,
    map: textTexture,
    roughness: mood === 'love' || mood === 'speed' ? 0.2 : 0.45,
    metalness: mood === 'heavy' ? 0.7 : mood === 'speed' ? 0.6 : 0.08,
  });

  // Bevel & body material (rich ceramic / lacquer tone)
  const bodyMat = new THREE.MeshStandardMaterial({
    color: moodColor,
    roughness: mood === 'calm' ? 0.6 : 0.3,
    metalness: mood === 'heavy' ? 0.8 : 0.1,
  });

  // Array of materials: [front/back faces, bevel/sides]
  return [frontMat, bodyMat];
}
