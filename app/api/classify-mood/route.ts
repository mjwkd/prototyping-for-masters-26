import { NextRequest, NextResponse } from 'next/server';
import { validateWordInput } from '../../../lib/heuristics';
import { classifyWordWithGemini } from '../../../lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { word, contextWords } = body;

    const validation = validateWordInput(word || '');
    if (!validation.valid) {
      return NextResponse.json(
        {
          allowed: false,
          error: validation.error,
          mood: 'anger',
          intensity: 0.9,
          source: 'validation',
        },
        { status: 400 }
      );
    }

    const result = await classifyWordWithGemini(
      validation.word,
      Array.isArray(contextWords) ? contextWords : []
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/classify-mood:', error);
    return NextResponse.json(
      { error: 'Internal server error', allowed: false },
      { status: 500 }
    );
  }
}
