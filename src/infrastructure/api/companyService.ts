import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { PagedResult } from "../../domain/types";

export interface CompanyDto {
  id: number;
  name: string;
  taxId: string;
  logoUrl: string | null;
  isActive: boolean;
  address: string;
  legalName: string;
  phone: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyRequest {
  name: string;
  taxId: string;
  logoUrl: string | null;
  address: string;
  legalName: string;
  phone: string;
  email: string;
}

export const companyService = {
  async getCompanies(
    pageNumber: number,
    pageSize: number,
  ): Promise<PagedResult<CompanyDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    console.log(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}?${params}`,
    );
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}?${params}`,
    );
  },

  async getCompany(id: number): Promise<CompanyDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`,
    );
  },

  async createCompany(data: CompanyRequest): Promise<CompanyDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateCompany(id: number, data: CompanyRequest): Promise<CompanyDto> {
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
