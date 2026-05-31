import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { 
  PagedResult, 
  PurchaseDto, 
  CreatePurchaseRequest 
} from "../../domain/types";

export const purchaseService = {
  async getPurchases(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<PurchaseDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}?${params}`,
    );
  },

  async getPurchase(id: number): Promise<PurchaseDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}/${id}`,
    );
  },

  async createPurchase(data: CreatePurchaseRequest): Promise<PurchaseDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updatePurchase(id: number, data: Partial<PurchaseDto>): Promise<PurchaseDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deletePurchase(id: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
