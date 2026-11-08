/**
 * The backend answers with four error bodies at once: a plain text message
 * (`BadRequest(error.Message)`, content-type text/plain), `ErrorResponse`
 * { error, details? } (api/accounts, 401/403), an anonymous { message }
 * (api/sales, api/purchases) and RFC 7807 ProblemDetails (5xx, 429).
 * A 5xx body can carry raw database text, so only 4xx bodies are shown as-is.
 */
export const DEFAULT_ERROR_MESSAGE = "An error occurred";

export interface ApiRequestError extends Error {
  status: number;
}

export function createApiRequestError(
  message: string,
  status: number,
): ApiRequestError {
  return Object.assign(new Error(message), { status });
}

export function isForbidden(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 403
  );
}

/** `BadRequest(error.Message)` answers text/plain; JSON bodies need parsing. */
export function parseErrorBody(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

export function extractErrorMessage(
  body: unknown,
  status: number,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (status >= 500) return fallback;
  // `BadRequest(error.Message)` answers text/plain and that text is the message.
  if (typeof body === "string") return body.trim() || fallback;
  if (!body || typeof body !== "object") return fallback;

  const candidate = body as { error?: unknown; message?: unknown };
  for (const key of ["error", "message"] as const) {
    const value = candidate[key];
    if (typeof value === "string" && value.trim() !== "") return value;
  }

  return fallback;
}
