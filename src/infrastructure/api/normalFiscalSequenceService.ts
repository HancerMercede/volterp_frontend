import { API_CONFIG } from "./config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  NormalFiscalSequenceDto,
  PagedResult,
  SaveNormalFiscalSequenceRequest,
} from "../../domain/types";

/**
 * Sequences of the normal (paper) fiscal documents, used when the tenant
 * issues with the normal mode.
 */
export const normalFiscalSequenceService = {
  async getNormalSequences(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<NormalFiscalSequenceDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NORMAL_FISCAL_SEQUENCES}?${params}`,
    );
  },

  async getNormalSequenceById(id: string): Promise<NormalFiscalSequenceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NORMAL_FISCAL_SEQUENCES}/${id}`,
    );
  },

  async createNormalSequence(
    data: SaveNormalFiscalSequenceRequest,
  ): Promise<NormalFiscalSequenceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NORMAL_FISCAL_SEQUENCES}`,
      { method: "POST", body: JSON.stringify(data) },
    );
  },

  async updateNormalSequence(
    id: string,
    data: SaveNormalFiscalSequenceRequest,
  ): Promise<NormalFiscalSequenceDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NORMAL_FISCAL_SEQUENCES}/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
  },
};
