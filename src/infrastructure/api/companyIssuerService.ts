import { API_CONFIG } from "./config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  CompanyIssuerDto,
  CreateCompanyIssuerRequest,
  PagedResult,
  UpdateCompanyIssuerRequest,
} from "../../domain/types";

/**
 * Issuers registered by the tenant (the company that signs the e-CF).
 * The backend resolves the tenant from the JWT: no request carries companyId.
 */
export const companyIssuerService = {
  async getIssuers(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<CompanyIssuerDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_ISSUERS}?${params}`,
    );
  },

  async getIssuerById(id: string): Promise<CompanyIssuerDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_ISSUERS}/${id}`,
    );
  },

  async createIssuer(
    data: CreateCompanyIssuerRequest,
  ): Promise<CompanyIssuerDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_ISSUERS}`,
      { method: "POST", body: JSON.stringify(data) },
    );
  },

  async updateIssuer(
    id: string,
    data: UpdateCompanyIssuerRequest,
  ): Promise<CompanyIssuerDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_ISSUERS}/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
  },
};
