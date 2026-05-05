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
  companyId: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  companyId: number;
  role?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}