import { generateAnonymousId, generateRandomFriendlyName } from './nameGenerator';

export const USER_ID_COOKIE = 'ttw_user_id';
export const USER_NAME_COOKIE = 'ttw_user_name';

/**
 * Get cookie value by name in browser context.
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Set cookie value with standard 365-day persistence in browser context.
 */
export function setClientCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Returns or initializes user session (anonymous ID + display name).
 */
export function getOrCreateClientSession(): { id: string; name: string; isNew: boolean } {
  let id = getClientCookie(USER_ID_COOKIE);
  let name = getClientCookie(USER_NAME_COOKIE);
  let isNew = false;

  if (!id) {
    id = generateAnonymousId();
    setClientCookie(USER_ID_COOKIE, id);
    isNew = true;
  }

  if (!name) {
    name = generateRandomFriendlyName();
    setClientCookie(USER_NAME_COOKIE, name);
    isNew = true;
  }

  return { id, name, isNew };
}

export function updateClientUserName(newName: string): void {
  const sanitized = newName.trim().slice(0, 30) || generateRandomFriendlyName();
  setClientCookie(USER_NAME_COOKIE, sanitized);
}
