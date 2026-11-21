import { API_CONFIG } from "./config";
import { fetchWithAuthBlob, fetchWithAuthJson } from "./fetchWithAuth";
import type {
  ElectronicInvoiceDto,
  ElectronicInvoiceStateSurfaceDto,
} from "../../domain/types";

/**
 * The electronic documents (e-CF) the tenant issued.
 *
 * The backend exposes the state surface instead of a paged list, plus the
 * retry action and the read-only artifacts of a document (the QR and the
 * printable one).
 */
export const electronicInvoiceService = {
  /** The document of a sale, with the verdict the DGII gave it. */
  async getById(id: string): Promise<ElectronicInvoiceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}`,
    );
  },

  /** The state of the documents the tenant issued. */
  async getStateSurface(
    limit: number = 50,
  ): Promise<ElectronicInvoiceStateSurfaceDto> {
    const params = new URLSearchParams({ limit: String(limit) });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/state?${params}`,
    );
  },

  /** Asks the API to send the document to the DGII again. */
  async retry(id: string): Promise<ElectronicInvoiceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}/retry`,
      { method: "POST" },
    );
  },

  /** The same action, with the name the electronic invoicing screens use. */
  async retryInvoice(id: string): Promise<ElectronicInvoiceDto> {
    return electronicInvoiceService.retry(id);
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
    return electronicInvoiceService.getQrSvg(id);
  },

  async getQrSvg(id: string): Promise<Blob> {
    return fetchWithAuthBlob(electronicInvoiceService.qrUrl(id));
  },

  async getQrPng(id: string): Promise<Blob> {
    return fetchWithAuthBlob(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICES}/${id}/qr.png`,
    );
  },

  async getPrintableInvoice(id: string): Promise<Blob {
    return fetchWithAuthBlob(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_PRINT}/${id}`,
    );
  },
};
