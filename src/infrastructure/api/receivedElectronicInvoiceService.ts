import { API_CONFIG } from "./config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  CommercialApprovalDecisionRequest,
  ReceivedElectronicInvoiceDto,
} from "../../domain/types";

/**
 * Third party e-CF received by the tenant. The browser only records the
 * commercial approval: the reception endpoints themselves require a client
 * TLS certificate (mTLS) and are out of reach for the web app.
 */
export const receivedElectronicInvoiceService = {
  async decideCommercialApproval(
    id: string,
    data: CommercialApprovalDecisionRequest,
  ): Promise<ReceivedElectronicInvoiceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ELECTRONIC_INVOICE_RECEPTION}/${id}/commercial-approval`,
      { method: "POST", body: JSON.stringify(data) },
    );
  },
};
