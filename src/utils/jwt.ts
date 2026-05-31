/**
 * Decodes a JWT payload without a library.
 * JWT structure: header.payload.signature (all base64url encoded)
 * We only need the payload to read the `exp` claim.
 */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns the expiry timestamp (ms) of a JWT token, or null if invalid.
 * The `exp` claim in JWT is in seconds — we convert to ms.
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}

/**
 * Returns true if the token is expired or will expire within the buffer (ms).
 */
export function isTokenExpired(token: string, bufferMs = 0): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true;
  return Date.now() >= expiry - bufferMs;
}

/**
 * Returns milliseconds until the token expires.
 * Returns 0 if already expired.
 */
export function msUntilExpiry(token: string): number {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return 0;
  return Math.max(0, expiry - Date.now());
}
