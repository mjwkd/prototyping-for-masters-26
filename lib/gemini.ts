import { MoodClassificationResult } from '../types/thread';
import { MoodType, MOOD_STYLES } from './moodStyles';
import { classifyWordHeuristically } from './heuristics';

const VALID_MOODS = new Set(Object.keys(MOOD_STYLES));

/**
 * Classifies a word using Google Gemini API (Phase 2), falling back to heuristic (Phase 1).
 * Returns { mood, intensity (0.0-1.0), allowed (boolean), source: 'gemini' | 'heuristic' }
 */
export async function classifyWordWithGemini(
  word: string,
  contextWords: string[] = []
): Promise<MoodClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return classifyWordHeuristically(word);
  }

  const prompt = `You are a sensitive linguistic classifier for a collaborative poetic art piece called "Thread the Word".
Analyze this single newly added word: "${word}".
Recent sentence context: "${contextWords.slice(-5).join(' ')}".

Choose exactly one mood from this list:
- "calm" (peaceful, gentle, still, serene)
- "love" (tender, affectionate, romantic, yearning)
- "joy" (celebratory, playful, glowing, bright)
- "anger" (furious, harsh, fiery, aggressive)
- "sadness" (grieving, melancholic, desolate, lonely)
- "fear" (tense, frightened, haunting, guarded)
- "speed" (rushing, rapid, kinetic, dynamic)
- "heavy" (dense, solid, burdened, grounded)
- "whisper" (faint, secretive, hushed, delicate)
- "neutral" (structural, grammatical, everyday uninflected)

Also assess intensity: float from 0.0 (very mild) to 1.0 (extreme/maximum).
Also assess allowed: boolean. Set allowed=false if the word is an explicit racial slur, hate speech, severe harassment, or gratuitous obscenity. Otherwise allowed=true.

Respond ONLY with valid JSON in this exact structure:
{"mood": "...", "intensity": 0.5, "allowed": true}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Call Gemini 2.5 Flash (or 1.5 Flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}, falling back to heuristic.`);
      return classifyWordHeuristically(word);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return classifyWordHeuristically(word);
    }

    const parsed = JSON.parse(candidateText.trim());

    const moodCandidate = String(parsed.mood || '').toLowerCase().trim() as MoodType;
    const mood: MoodType = VALID_MOODS.has(moodCandidate) ? moodCandidate : 'neutral';

    const intensityNum = Number(parsed.intensity);
    const intensity = isNaN(intensityNum) ? 0.5 : Math.max(0, Math.min(1, intensityNum));
    const allowed = parsed.allowed !== false;

    return {
      mood,
      intensity: Number(intensity.toFixed(2)),
      allowed,
      source: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini classification failed or timed out, falling back to heuristic:', err);
    return classifyWordHeuristically(word);
  }
}
