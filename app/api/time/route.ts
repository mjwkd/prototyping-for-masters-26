import { NextRequest, NextResponse } from 'next/server';
import { getLocalTimeFallback } from '../../../lib/timeapi';

/**
 * Next.js API Route for TimeAPI.world (https://timeapi.world/)
 * Endpoint: /api/time?timezone=Asia/Seoul
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timezone = searchParams.get('timezone') || 'America/New_York';

  try {
    // Attempt fetch from TimeAPI.world gateway
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const gatewayUrl = `https://gateway.timeapi.world/timezone/${timezone}`;
    const response = await fetch(gatewayUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 10 },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        ...data,
        source: 'timeapi.world',
      });
    }
  } catch (error) {
    // Network timeout, rate-limit, or gateway error: fallback gracefully
    console.warn(`[TimeAPI.world Gateway Error for ${timezone}]:`, error);
  }

  // Fallback to high-precision local IANA calculation
  const fallbackData = getLocalTimeFallback(timezone);
  return NextResponse.json(fallbackData);
}
