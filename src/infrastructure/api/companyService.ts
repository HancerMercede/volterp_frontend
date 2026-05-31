import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { PagedResult, CompanyDto, CreateCompanyRequest } from "../../domain/types";

export const companyService = {
  async getCompanies(
    pageNumber: number,
    pageSize: number,
  ): Promise<PagedResult<CompanyDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}?${params}`,
    );
  },

  async getCompany(id: number): Promise<CompanyDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`,
    );
  },

  async createCompany(data: CreateCompanyRequest): Promise<CompanyDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateCompany(id: number, data: Partial<CompanyDto>): Promise<CompanyDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deleteCompany(id: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
