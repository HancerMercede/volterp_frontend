export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  companyId: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ActivateAccountRequest {
  token: string;
  password: string;
}

/** Which invitation link a token belongs to. */
export type AuthLinkPurpose = "activation" | "password-reset";

/**
 * Answer of `GET /api/auth/link-status`.
 *
 * `email` lets the activation screen confirm which account is being activated;
 * `expiresAt` lets the UI explain why a link stopped working.
 */
export interface AuthLinkStatus {
  valid: boolean;
  email: string | null;
  expiresAt: string | null;
}

/**
 * The backend's `ErrorResponse`: the shape used by `api/accounts` and by every
 * 401/403. It is only one of three error bodies the API uses — the others are
 * an anonymous `{ message }` and RFC 7807 `ProblemDetails`. See
 * `src/utils/apiError.ts` for how all three are read.
 */
export interface ApiError {
  error: string;
  details?: string;
}