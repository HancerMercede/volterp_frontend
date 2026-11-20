import { API_CONFIG } from "./config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  ElectronicInvoiceSequenceDto,
  PagedResult,
  RangeAnnulmentResult,
  SaveElectronicInvoiceSequenceRequest,
} from "../../domain/types";

/**
 * e-NCF ranges: the sequence the backend assigns to each signed document.
 */
export const electronicInvoiceSequenceService = {
  async getSequences(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<ElectronicInvoiceSequenceDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_SEQUENCES}?${params}`,
    );
  },

  async getSequenceById(id: string): Promise<ElectronicInvoiceSequenceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_SEQUENCES}/${id}`,
    );
  },

  async createSequence(
    data: SaveElectronicInvoiceSequenceRequest,
  ): Promise<ElectronicInvoiceSequenceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_SEQUENCES}`,
      { method: "POST", body: JSON.stringify(data) },
    );
  },

  async updateSequence(
    id: string,
    data: SaveElectronicInvoiceSequenceRequest,
  ): Promise<ElectronicInvoiceSequenceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_SEQUENCES}/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
  },

  async annulSequence(id: string): Promise<RangeAnnulmentResult> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_SEQUENCES}/${id}/annul`,
      { method: "POST" },
    );
  },
};
