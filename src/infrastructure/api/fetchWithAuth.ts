import { useAuthStore } from '../../stores/authStore';
import { extractErrorMessage } from '../../utils/apiError';

/**
 * Centralized fetch wrapper that:
 * 1. Injects Authorization: Bearer <token> header
 * 2. Intercepts 401 → triggers logout + dispatches session-expired event
 *
 * Services should import this instead of duplicating fetchWithAuth locally.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().token;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    // Dispatch a custom event so useTokenExpiry and any listener can react
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    throw new Error('SESSION_EXPIRED');
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(body, response.status));
  }

  if (response.status === 204) return response;

  return response;
}

/**
 * Convenience wrapper that also parses JSON from the response.
 */
export async function fetchWithAuthJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);
  if (response.status === 204) return null as T;
  return response.json();
}
