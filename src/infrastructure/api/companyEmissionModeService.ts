import { API_CONFIG } from "./config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  CompanyEmissionModeDto,
  UpdateCompanyContingencyRequest,
  UpdateCompanyEmissionModeRequest,
} from "../../domain/types";

/**
 * How the tenant issues: electronic (e-CF) or normal (paper), plus the
 * contingency the company declared to the DGII.
 */
export const companyEmissionModeService = {
  async getEmissionMode(): Promise<CompanyEmissionModeDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_EMISSION_MODE}`,
    );
  },

  async updateContingency(
    data: UpdateCompanyContingencyRequest,
  ): Promise<CompanyEmissionModeDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_EMISSION_MODE}/contingency`,
      { method: "PUT", body: JSON.stringify(data) },
    );
  },

  async updateEmissionMode(
    data: UpdateCompanyEmissionModeRequest,
  ): Promise<CompanyEmissionModeDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_EMISSION_MODE}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
  },
};
