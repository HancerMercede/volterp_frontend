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

export interface ApiError {
  error: string;
  details?: string;
}