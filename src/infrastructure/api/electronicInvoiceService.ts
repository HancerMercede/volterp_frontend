import { API_CONFIG } from "../api/config";
import { fetchWithAuth, fetchWithAuthJson } from "./fetchWithAuth";
import type { ElectronicInvoiceDto } from "../../domain/types";

export const electronicInvoiceService = {
  /** The document of a sale, with the verdict the DGII gave it. */
  async getById(id: string): Promise<ElectronicInvoiceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}`,
    );
  },

  /** Asks the API to send the document to the DGII again. */
  async retry(id: string): Promise<ElectronicInvoiceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}/retry`,
      {
        method: "POST",
      },
    );
  },

  /** The URL of the QR of the document. */
  qrUrl(id: string): string {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}/qr.svg`;
  },

  /**
   * The QR is an image behind the authorization of the caller: it comes as
   * a blob and the screen turns it into an object url.
   */
  async getQrBlob(id: string): Promise<Blob> {
    const response = await fetchWithAuth(this.qrUrl(id));
    return response.blob();
  },
};
