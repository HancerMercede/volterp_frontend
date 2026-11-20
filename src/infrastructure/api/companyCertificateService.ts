import { API_CONFIG } from "./config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  CompanyCertificateDto,
  CreateCompanyCertificateRequest,
  PagedResult,
} from "../../domain/types";

/**
 * Certificates the tenant signs with. The credential is opaque: the backend
 * encrypts it and never returns it again.
 */
export const companyCertificateService = {
  async getCertificates(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<CompanyCertificateDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_CERTIFICATES}?${params}`,
    );
  },

  async getCertificateById(id: string): Promise<CompanyCertificateDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_CERTIFICATES}/${id}`,
    );
  },

  async createCertificate(
    data: CreateCompanyCertificateRequest,
  ): Promise<CompanyCertificateDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_CERTIFICATES}`,
      { method: "POST", body: JSON.stringify(data) },
    );
  },
};
