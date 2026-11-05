import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  PagedResult,
  SaleDto,
  CreateSaleRequest,
  UpdateSaleRequest,
} from "../../domain/types";

export const saleService = {
  async getSales(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<SaleDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}?${params}`,
    );
  },

  async getSalesByStatus(
    status: "Pending" | "Completed",
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<SaleDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/status/${status}?${params}`,
    );
  },

  async getPendingSales(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<SaleDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/pending?${params}`,
    );
  },

  async getSale(id: string): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}`,
    );
  },

  async createSale(data: CreateSaleRequest): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateSale(id: string, data: UpdateSaleRequest): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async completeSale(id: string): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}/complete`,
      {
        method: "PUT",
      },
    );
  },

  async deleteSale(id: string): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};