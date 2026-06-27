import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { 
  PagedResult, 
  SupplierDto, 
  SupplierRequest 
} from "../../domain/types";

export const supplierService = {
  async getSuppliers(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<SupplierDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}?${params}`,
    );
  },

  async getSupplier(id: number): Promise<SupplierDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`,
    );
  },

  async createSupplier(data: SupplierRequest): Promise<SupplierDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateSupplier(id: number, data: Partial<SupplierDto>): Promise<SupplierDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deleteSupplier(id: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
