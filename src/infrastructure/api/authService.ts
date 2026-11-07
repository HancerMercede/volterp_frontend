import { API_CONFIG } from "../api/config";
import type {
  ActivateAccountRequest,
  AuthLinkPurpose,
  AuthLinkStatus,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
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

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
  },

  async activateAccount(data: ActivateAccountRequest): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ACTIVATE_ACCOUNT}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
  },

  async getLinkStatus(
    token: string,
    purpose: AuthLinkPurpose,
  ): Promise<AuthLinkStatus> {
    const params = new URLSearchParams({ token, purpose });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LINK_STATUS}?${params}`,
    );
  },
};
