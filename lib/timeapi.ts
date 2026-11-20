/**
 * TimeAPI.world Integration Service
 * Uses https://timeapi.world/ (gateway.timeapi.world) to fetch real-time timezone,
 * UTC offset, and current local datetime with robust fallback.
 */

export interface TimeApiResponse {
  timezone: string;
  datetime: string;
  utc_datetime: string;
  utc_offset: string;
  abbreviation: string;
  dst: boolean;
  unixtime: number;
  source: 'timeapi.world' | 'local_fallback';
}

/**
 * Fetch timezone details from timeapi.world via internal API or direct gateway
 */
export async function fetchTimeFromWorldTimeApi(timeZone: string): Promise<TimeApiResponse> {
  try {
    // Call our internal Next.js API route to handle CORS and caching
    const res = await fetch(`/api/time?timezone=${encodeURIComponent(timeZone)}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn(`[TimeAPI.world] Fetch failed for ${timeZone}, using local fallback:`, err);
  }

  // Graceful fallback using native Intl API
  return getLocalTimeFallback(timeZone);
}

/**
 * Calculates current time and UTC offset for any IANA timezone using Intl
 */
export function getLocalTimeFallback(timeZone: string): TimeApiResponse {
  const now = new Date();

  // Format ISO-like local datetime
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');
  const tzName = getPart('timeZoneName');

  // Compute UTC offset in hours
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const targetDate = new Date(now.toLocaleString('en-US', { timeZone }));
  const diffMinutes = Math.round((targetDate.getTime() - utcDate.getTime()) / 60000);
  const offsetHours = Math.floor(Math.abs(diffMinutes) / 60);
  const offsetRemMinutes = Math.abs(diffMinutes) % 60;
  const sign = diffMinutes >= 0 ? '+' : '-';
  const utc_offset = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetRemMinutes).padStart(2, '0')}`;

  const datetime = `${year}-${month}-${day}T${hour}:${minute}:${second}${utc_offset}`;

  return {
    timezone: timeZone,
    datetime,
    utc_datetime: now.toISOString(),
    utc_offset,
    abbreviation: tzName,
    dst: false,
    unixtime: Math.floor(now.getTime() / 1000),
    source: 'local_fallback',
  };
}

/**
 * Helper to parse hours, minutes, and day from datetime string
 */
export function parseDateTimeString(dtStr: string): { hour: number; minute: number; second: number } {
  try {
    const timePart = dtStr.split('T')[1]?.split(/[+-]/)[0] || '';
    const [h, m, s] = timePart.split(':').map(Number);
    return {
      hour: isNaN(h) ? 0 : h,
      minute: isNaN(m) ? 0 : m,
      second: isNaN(s) ? 0 : Math.floor(s),
    };
  } catch {
    return { hour: 0, minute: 0, second: 0 };
  }
}
