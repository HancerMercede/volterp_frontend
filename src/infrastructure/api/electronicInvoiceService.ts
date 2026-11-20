import { API_CONFIG } from "./config";
import { fetchWithAuthBlob, fetchWithAuthJson } from "./fetchWithAuth";
import type {
  ElectronicInvoiceDto,
  ElectronicInvoiceStateSurfaceDto,
} from "../../domain/types";

/**
 * Electronic invoices (e-CF) issued by the tenant.
 *
 * The backend exposes the state surface instead of a paged list, plus the
 * retry action and the two read-only artifacts of a comprobante.
 */
export const electronicInvoiceService = {
  async getStateSurface(
    limit: number = 50,
  ): Promise<ElectronicInvoiceStateSurfaceDto> {
    const params = new URLSearchParams({ limit: String(limit) });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/state?${params}`,
    );
  },

  async retryInvoice(id: string): Promise<ElectronicInvoiceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}/retry`,
      { method: "POST" },
    );
  },

  async getQrSvg(id: string): Promise<Blob> {
    return fetchWithAuthBlob(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}/qr.svg`,
    );
  },

  async getQrPng(id: string): Promise<Blob> {
    return fetchWithAuthBlob(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}/qr.png`,
    );
  },

  async getPrintableInvoice(id: string): Promise<Blob> {
    return fetchWithAuthBlob(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_PRINT}/${id}`,
    );
  },
};
