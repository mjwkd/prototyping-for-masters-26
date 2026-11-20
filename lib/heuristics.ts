import { MoodType } from './moodStyles';
import { MoodClassificationResult } from '../types/thread';

const MOOD_DICTIONARY: Record<MoodType, string[]> = {
  love: [
    'love', 'adore', 'heart', 'cherish', 'kiss', 'hug', 'passion', 'tender', 'beloved',
    'darling', 'sweetheart', 'romance', 'forever', 'softly', 'warmth', 'embrace', 'honey',
    'desire', 'devotion', 'affection', 'fond', 'yearn', 'longing', 'beloved', 'dear'
  ],
  joy: [
    'joy', 'happy', 'laugh', 'smile', 'dance', 'sun', 'bright', 'delight', 'ecstasy',
    'glee', 'cheer', 'celebrate', 'radiant', 'spark', 'glow', 'bliss', 'play', 'miracle',
    'light', 'shine', 'soar', 'golden', 'triumph', 'alive', 'magic', 'splendid', 'eureka'
  ],
  anger: [
    'anger', 'rage', 'furious', 'hate', 'burn', 'break', 'shatter', 'smash', 'scream',
    'fire', 'roar', 'curse', 'mad', 'cruel', 'blood', 'wrath', 'strike', 'venom', 'fury',
    'destroy', 'enemy', 'storm', 'crush', 'fist', 'blast', 'bitter', 'scorn', 'spite'
  ],
  sadness: [
    'sad', 'sorrow', 'tears', 'weep', 'cry', 'lonely', 'lost', 'empty', 'grief',
    'cold', 'broken', 'fade', 'ache', 'bleak', 'shadow', 'dark', 'alone', 'goodbye',
    'ruin', 'silence', 'mourn', 'despair', 'rain', 'hollow', 'forgotten', 'drown'
  ],
  fear: [
    'fear', 'scared', 'dread', 'terror', 'horror', 'tremble', 'shake', 'shiver', 'hide',
    'flee', 'run', 'phantom', 'ghost', 'abyss', 'panic', 'haunt', 'threat', 'trap',
    'darkness', 'monster', 'shadows', 'creep', 'paralyzed', 'chilling', 'nightmare'
  ],
  calm: [
    'calm', 'peace', 'quiet', 'still', 'serene', 'gentle', 'slow', 'breathe', 'rest',
    'ocean', 'drift', 'smooth', 'mellow', 'sleep', 'hush', 'tranquil', 'ease', 'zen',
    'river', 'meadow', 'breeze', 'cloud', 'soft', 'flow', 'silent', 'cradle', 'pause'
  ],
  speed: [
    'fast', 'speed', 'rush', 'dash', 'quick', 'sprint', 'zoom', 'flash', 'bolt',
    'dart', 'race', 'whirl', 'swift', 'chase', 'rocket', 'hyper', 'rapid', 'fly',
    'streak', 'hurry', 'velocity', 'stride', 'surge', 'spark'
  ],
  heavy: [
    'heavy', 'stone', 'iron', 'weight', 'deep', 'dense', 'crush', 'anchor', 'gravity',
    'mountain', 'rock', 'solid', 'thud', 'burden', 'massive', 'titan', 'steel', 'ground',
    'sink', 'anvil', 'immense', 'unyielding', 'press', 'boulder'
  ],
  whisper: [
    'whisper', 'secret', 'soft', 'breath', 'hush', 'faint', 'murmur', 'subtle', 'tiny',
    'shadow', 'veil', 'feather', 'tiptoe', 'gossamer', 'mist', 'trace', 'breeze', 'sigh',
    'hidden', 'listen', 'unseen', 'muffled', 'delicate'
  ],
  neutral: [
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'it', 'that',
    'this', 'then', 'there', 'here', 'when', 'what', 'who', 'how', 'if', 'so', 'just',
    'then', 'well', 'said', 'went', 'came', 'walked', 'looked', 'turned', 'opened'
  ],
};

const DISALLOWED_PATTERNS = [
  /\b(nazi|hitler|faggot|nigger|nigga|kike|chink|cunt|retard|killall)\b/i,
];

/**
 * Validates a submitted word according to the game's core rules:
 * - One word per turn
 * - Trim whitespace
 * - Reject empty input
 * - Max 30 characters
 * - No spaces inside the word
 */
export function validateWordInput(raw: string): { valid: boolean; word: string; error?: string } {
  if (typeof raw !== 'string') {
    return { valid: false, word: '', error: 'Input must be a string.' };
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    return { valid: false, word: '', error: 'A word is required.' };
  }

  if (/\s/.test(trimmed)) {
    return { valid: false, word: trimmed, error: 'Only ONE word allowed (no spaces).' };
  }

  if (trimmed.length > 30) {
    return { valid: false, word: trimmed, error: 'Word cannot exceed 30 characters.' };
  }

  // Check profanity / safety
  for (const pattern of DISALLOWED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, word: trimmed, error: 'Word contains prohibited language.' };
    }
  }

  return { valid: true, word: trimmed };
}

/**
 * Phase 1 Heuristic Classifier:
 * Analyzes word characters, morphology, punctuation, and dictionary associations.
 */
export function classifyWordHeuristically(word: string): MoodClassificationResult {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Check safety first
  for (const pattern of DISALLOWED_PATTERNS) {
    if (pattern.test(word)) {
      return {
        mood: 'anger',
        intensity: 0.9,
        allowed: false,
        reason: 'Violates content policy',
        source: 'heuristic',
      };
    }
  }

  // Exact or prefix matches against dictionary
  let matchedMood: MoodType = 'neutral';
  let matchScore = 0;

  for (const [mood, words] of Object.entries(MOOD_DICTIONARY) as [MoodType, string[]][]) {
    for (const dictWord of words) {
      if (clean === dictWord) {
        matchedMood = mood;
        matchScore = 1.0;
        break;
      }
      if (clean.length > 3 && (clean.startsWith(dictWord) || dictWord.startsWith(clean))) {
        matchedMood = mood;
        matchScore = 0.7;
      }
    }
    if (matchScore === 1.0) break;
  }

  // Punctuation & casing intensity indicators
  const isAllUpper = word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word);
  const hasExclamation = word.includes('!');
  const hasEllipsis = word.includes('...') || word.includes('…');
  const hasQuestion = word.includes('?');

  let intensity = 0.5;

  if (matchScore > 0) {
    intensity = 0.4 + matchScore * 0.3;
  }

  if (isAllUpper) {
    intensity = Math.min(1.0, intensity + 0.35);
    if (matchedMood === 'neutral') matchedMood = 'anger';
  }

  if (hasExclamation) {
    intensity = Math.min(1.0, intensity + 0.25);
    if (matchedMood === 'neutral') matchedMood = 'joy';
  }

  if (hasEllipsis) {
    intensity = Math.max(0.1, intensity - 0.25);
    if (matchedMood === 'neutral') matchedMood = 'whisper';
  }

  if (hasQuestion && matchedMood === 'neutral') {
    matchedMood = 'calm';
  }

  // If still neutral, check heuristics based on phonetics/morphology
  if (matchedMood === 'neutral') {
    if (/^(run|dash|fly|leap|zoom|fast|quick|zip|blast)/i.test(clean)) {
      matchedMood = 'speed';
      intensity = 0.7;
    } else if (/^(stone|heavy|dark|iron|cold|grave|deep|crush)/i.test(clean)) {
      matchedMood = 'heavy';
      intensity = 0.75;
    } else if (/^(soft|shh|quiet|whisper|sigh|faint)/i.test(clean)) {
      matchedMood = 'whisper';
      intensity = 0.35;
    } else {
      // Mild varied intensity for neutral words
      intensity = 0.3 + (clean.length % 5) * 0.08;
    }
  }

  return {
    mood: matchedMood,
    intensity: Math.max(0.1, Math.min(1.0, Number(intensity.toFixed(2)))),
    allowed: true,
    source: 'heuristic',
  };
}
