// CSRF Protection Utilities

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  if (typeof window === 'undefined') {
    // Server-side: use crypto
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
  
  // Client-side: use Web Crypto API
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in sessionStorage
 */
export function storeCsrfToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch (error) {
    // Ignore storage errors (private browsing, etc.)
  }
}

/**
 * Get CSRF token from sessionStorage
 */
export function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem('csrf_token');
  } catch (error) {
    return null;
  }
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  const storedToken = getCsrfToken();
  return storedToken === token && token.length > 0;
}

/**
 * Server-side CSRF verification
 */
export function verifyCsrfTokenServer(
  token: string,
  sessionToken?: string
): boolean {
  if (!token || !sessionToken) return false;
  return token === sessionToken && token.length > 0;
}

