import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  PagedResult,
  SaleDto,
  CreateSaleRequest,
  UpdateSaleRequest,
  FiscalReadinessDto,
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

  // Whether the taxpayer can bill right now: the path the sale takes, the
  // certificate that signs it and the room the ranges have left. The seller
  // asks it before charging, so it lives with the sales.
  async getReadiness(): Promise<FiscalReadinessDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES_READINESS}`,
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

  // The commercial invoice is the sale that leaves without a fiscal
  // document: it is only for the taxpayer that invoices in the normal mode.
  async completeSale(id: string, asCommercialInvoice = false): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}/complete`,
      {
        method: "PUT",
        body: JSON.stringify({ asCommercialInvoice }),
      },
    );
  },

  // The cashier closes the sale: it stays on record as cancelled and the
  // stock it reserved comes back.
  async cancelSale(id: string): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}/cancel`,
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