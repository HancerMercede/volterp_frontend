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

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  companyId?: string;
  role?: string;
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