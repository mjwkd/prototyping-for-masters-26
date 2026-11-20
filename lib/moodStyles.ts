export type MoodType =
  | 'calm'
  | 'love'
  | 'joy'
  | 'anger'
  | 'sadness'
  | 'fear'
  | 'speed'
  | 'heavy'
  | 'whisper'
  | 'neutral';

export interface ThreadMoodPhysics {
  slackFactor: number;        // How heavily the thread sags under gravity
  loopRange: [number, number];// [min, max] loops/curls in the gap
  loopStyle: 'heart' | 'coil' | 'zigzag' | 'drip' | 'taut' | 'whisper' | 'loose' | 'jitter';
  zigzagIntensity: number;    // Density & sharpness of machine stitch sections (0 to 1)
  scribbleChance: number;     // Probability (0 to 1) of a tangled knot cluster
  strandCount: 1 | 2 | 3;     // 1 for whisper, 2-3 for organic yarn
  noiseFreq: number;          // Base spatial frequency for noise
  noiseAmp: number;           // Amplitude of organic wave deformation
  strokeScale: number;        // Multiplier on yarn thickness
}

export interface MoodStyleConfig {
  name: MoodType;
  label: string;
  fontFamily: string;
  minWeight: number;
  maxWeight: number;
  minSizeEm: number;
  maxSizeEm: number;
  letterSpacing: string;
  color: string;
  accentColor: string;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  animationClass: string;
  description: string;
  thread: ThreadMoodPhysics;
}

export const MOOD_STYLES: Record<MoodType, MoodStyleConfig> = {
  calm: {
    name: 'calm',
    label: 'Calm',
    fontFamily: '"Lora", "Georgia", serif',
    minWeight: 400,
    maxWeight: 500,
    minSizeEm: 1.1,
    maxSizeEm: 1.3,
    letterSpacing: '0.04em',
    color: '#476256',
    accentColor: '#8da698',
    fontStyle: 'normal',
    textTransform: 'none',
    animationClass: 'animate-breathe',
    description: 'Long, loose, slow curves with few loops and peaceful cadence.',
    thread: {
      slackFactor: 0.6,
      loopRange: [0, 1],
      loopStyle: 'loose',
      zigzagIntensity: 0.1,
      scribbleChance: 0.05,
      strandCount: 2,
      noiseFreq: 0.008,
      noiseAmp: 14,
      strokeScale: 1.0,
    },
  },
  love: {
    name: 'love',
    label: 'Love',
    fontFamily: '"Playfair Display", "Baskerville", serif',
    minWeight: 500,
    maxWeight: 700,
    minSizeEm: 1.15,
    maxSizeEm: 1.4,
    letterSpacing: '0.02em',
    color: '#b03b5b',
    accentColor: '#f2a7bb',
    fontStyle: 'italic',
    textTransform: 'none',
    animationClass: 'animate-soft-pulse',
    description: 'Soft rounded loops and occasional heart-like curls.',
    thread: {
      slackFactor: 0.8,
      loopRange: [1, 3],
      loopStyle: 'heart',
      zigzagIntensity: 0.2,
      scribbleChance: 0.15,
      strandCount: 3,
      noiseFreq: 0.012,
      noiseAmp: 20,
      strokeScale: 1.15,
    },
  },
  joy: {
    name: 'joy',
    label: 'Joy',
    fontFamily: '"Outfit", "Fredoka", sans-serif',
    minWeight: 600,
    maxWeight: 800,
    minSizeEm: 1.2,
    maxSizeEm: 1.45,
    letterSpacing: '0.01em',
    color: '#c27803',
    accentColor: '#fde047',
    fontStyle: 'normal',
    textTransform: 'none',
    animationClass: 'animate-joy-bounce',
    description: 'Springy coils, lively bouncy waves, and golden optimism.',
    thread: {
      slackFactor: 0.5,
      loopRange: [2, 4],
      loopStyle: 'coil',
      zigzagIntensity: 0.35,
      scribbleChance: 0.2,
      strandCount: 3,
      noiseFreq: 0.02,
      noiseAmp: 26,
      strokeScale: 1.2,
    },
  },
  anger: {
    name: 'anger',
    label: 'Anger',
    fontFamily: '"Rubik Mono One", "Impact", sans-serif',
    minWeight: 700,
    maxWeight: 900,
    minSizeEm: 1.25,
    maxSizeEm: 1.55,
    letterSpacing: '0.08em',
    color: '#991b1b',
    accentColor: '#ef4444',
    fontStyle: 'normal',
    textTransform: 'uppercase',
    animationClass: 'animate-anger-shake',
    description: 'Dense, sharp zigzag scribbles and tangled knot clusters.',
    thread: {
      slackFactor: 0.3,
      loopRange: [2, 4],
      loopStyle: 'zigzag',
      zigzagIntensity: 0.9,
      scribbleChance: 0.8,
      strandCount: 3,
      noiseFreq: 0.045,
      noiseAmp: 30,
      strokeScale: 1.35,
    },
  },
  sadness: {
    name: 'sadness',
    label: 'Sadness',
    fontFamily: '"Cormorant Garamond", "Garamond", serif',
    minWeight: 300,
    maxWeight: 400,
    minSizeEm: 1.0,
    maxSizeEm: 1.2,
    letterSpacing: '0.03em',
    color: '#4a5b78',
    accentColor: '#93a3bd',
    fontStyle: 'italic',
    textTransform: 'none',
    animationClass: 'animate-sad-droop',
    description: 'Heavy sagging drips that hang downward like tears.',
    thread: {
      slackFactor: 1.5,
      loopRange: [0, 1],
      loopStyle: 'drip',
      zigzagIntensity: 0.05,
      scribbleChance: 0.05,
      strandCount: 2,
      noiseFreq: 0.007,
      noiseAmp: 36,
      strokeScale: 0.95,
    },
  },
  fear: {
    name: 'fear',
    label: 'Fear',
    fontFamily: '"Syne", "Cinzel", sans-serif',
    minWeight: 400,
    maxWeight: 600,
    minSizeEm: 1.05,
    maxSizeEm: 1.25,
    letterSpacing: '0.12em',
    color: '#49405f',
    accentColor: '#8a7ea3',
    fontStyle: 'normal',
    textTransform: 'none',
    animationClass: 'animate-fear-jitter',
    description: 'Tense, guarded micro-jitters with tight nervous coils.',
    thread: {
      slackFactor: 0.4,
      loopRange: [1, 3],
      loopStyle: 'jitter',
      zigzagIntensity: 0.6,
      scribbleChance: 0.4,
      strandCount: 2,
      noiseFreq: 0.05,
      noiseAmp: 18,
      strokeScale: 0.9,
    },
  },
  speed: {
    name: 'speed',
    label: 'Speed',
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    minWeight: 500,
    maxWeight: 700,
    minSizeEm: 1.1,
    maxSizeEm: 1.35,
    letterSpacing: '-0.02em',
    color: '#0f766e',
    accentColor: '#2dd4bf',
    fontStyle: 'italic',
    textTransform: 'none',
    animationClass: 'animate-speed-glide',
    description: 'Stretched, taut lines with kinetic motion streaks.',
    thread: {
      slackFactor: 0.15,
      loopRange: [0, 1],
      loopStyle: 'taut',
      zigzagIntensity: 0.3,
      scribbleChance: 0.1,
      strandCount: 3,
      noiseFreq: 0.015,
      noiseAmp: 8,
      strokeScale: 1.1,
    },
  },
  heavy: {
    name: 'heavy',
    label: 'Heavy',
    fontFamily: '"Syne", "Arial Black", sans-serif',
    minWeight: 800,
    maxWeight: 900,
    minSizeEm: 1.3,
    maxSizeEm: 1.6,
    letterSpacing: '-0.03em',
    color: '#262422',
    accentColor: '#57534e',
    fontStyle: 'normal',
    textTransform: 'none',
    animationClass: 'animate-heavy-drop',
    description: 'Dense weighted mass that pulls downward into the paper.',
    thread: {
      slackFactor: 1.3,
      loopRange: [1, 2],
      loopStyle: 'drip',
      zigzagIntensity: 0.4,
      scribbleChance: 0.3,
      strandCount: 3,
      noiseFreq: 0.01,
      noiseAmp: 32,
      strokeScale: 1.4,
    },
  },
  whisper: {
    name: 'whisper',
    label: 'Whisper',
    fontFamily: '"Caveat", cursive',
    minWeight: 300,
    maxWeight: 400,
    minSizeEm: 0.95,
    maxSizeEm: 1.1,
    letterSpacing: '0.05em',
    color: '#78716c',
    accentColor: '#a8a29e',
    fontStyle: 'normal',
    textTransform: 'lowercase',
    animationClass: 'animate-whisper-fade',
    description: 'One very thin single strand, faint and almost invisible.',
    thread: {
      slackFactor: 0.7,
      loopRange: [0, 1],
      loopStyle: 'whisper',
      zigzagIntensity: 0.0,
      scribbleChance: 0.0,
      strandCount: 1,
      noiseFreq: 0.006,
      noiseAmp: 10,
      strokeScale: 0.6,
    },
  },
  neutral: {
    name: 'neutral',
    label: 'Neutral',
    fontFamily: '"EB Garamond", "Times New Roman", serif',
    minWeight: 400,
    maxWeight: 600,
    minSizeEm: 1.1,
    maxSizeEm: 1.3,
    letterSpacing: '0.01em',
    color: '#26221f',
    accentColor: '#78716c',
    fontStyle: 'normal',
    textTransform: 'none',
    animationClass: '',
    description: 'Gentle organic noise only, timeless and steady.',
    thread: {
      slackFactor: 0.5,
      loopRange: [0, 2],
      loopStyle: 'loose',
      zigzagIntensity: 0.15,
      scribbleChance: 0.1,
      strandCount: 2,
      noiseFreq: 0.01,
      noiseAmp: 16,
      strokeScale: 1.0,
    },
  },
};

export function getWordStyle(mood: MoodType | string, intensity: number = 0.5) {
  const validMood = (MOOD_STYLES[mood as MoodType] ? mood : 'neutral') as MoodType;
  const config = MOOD_STYLES[validMood];
  const clampedIntensity = Math.max(0, Math.min(1, intensity));

  const weight = Math.round(
    config.minWeight + clampedIntensity * (config.maxWeight - config.minWeight)
  );
  const sizeEm =
    config.minSizeEm + clampedIntensity * (config.maxSizeEm - config.minSizeEm);

  return {
    fontFamily: config.fontFamily,
    fontWeight: weight,
    fontSize: `${sizeEm.toFixed(2)}em`,
    letterSpacing: config.letterSpacing,
    color: config.color,
    fontStyle: config.fontStyle,
    textTransform: config.textTransform,
    animationClass: config.animationClass,
    threadPhysics: config.thread,
  };
}
