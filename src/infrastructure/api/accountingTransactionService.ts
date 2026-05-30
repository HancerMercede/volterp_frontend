import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { 
  PagedResult, 
  AccountingTransactionDto,
  AccountingTransactionRequest 
} from "../../domain/types";

export const accountingTransactionService = {
  async getTransactions(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<AccountingTransactionDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTING_TRANSACTIONS}?${params}`,
    );
  },

  async getTransaction(id: number): Promise<AccountingTransactionDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTING_TRANSACTIONS}/${id}`,
    );
  },

  async createTransaction(data: AccountingTransactionRequest): Promise<AccountingTransactionDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTING_TRANSACTIONS}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateTransaction(id: number, data: AccountingTransactionRequest): Promise<AccountingTransactionDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTING_TRANSACTIONS}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deleteTransaction(id: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTING_TRANSACTIONS}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
