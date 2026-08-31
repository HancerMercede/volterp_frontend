import { API_CONFIG } from "../api/config";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../api/types";
import { fetchWithAuthJson } from "./fetchWithAuth";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      },
    );
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
  },
};
