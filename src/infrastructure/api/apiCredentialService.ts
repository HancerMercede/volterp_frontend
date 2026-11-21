import { API_CONFIG } from "./config";
import { fetchWithAuth, fetchWithAuthJson } from "./fetchWithAuth";
import type {
  ApiCredentialDto,
  IssuedApiCredentialDto,
  PagedResult,
} from "../../domain/types";

/**
 * Machine credentials (`ApiKey <keyId>.<secret>`) for the integrations that
 * sign e-CF outside the browser. The secret travels exactly once.
 */
export const apiCredentialService = {
  async getCredentials(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<ApiCredentialDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API_CREDENTIALS}?${params}`,
    );
  },

  async createCredential(
    name: string,
    expiresAt: string | null,
  ): Promise<IssuedApiCredentialDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API_CREDENTIALS}`,
      { method: "POST", body: JSON.stringify({ name, expiresAt }) },
    );
  },

  async deleteCredential(id: string): Promise<void> {
    await fetchWithAuth(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API_CREDENTIALS}/${id}`,
      { method: "DELETE" },
    );
  },
};
