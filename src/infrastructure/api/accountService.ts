import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson, fetchWithAuth } from "./fetchWithAuth";
import type {
  PagedResult,
  AccountDto,
  AccountRequest,
} from "../../domain/types";

export const accountService = {
  async getAccounts(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<AccountDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTS}?${params}`,
    );
  },

  async getAccountById(id: string): Promise<AccountDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTS}/${id}`,
    );
  },

  async createAccount(account: AccountRequest): Promise<AccountDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTS}`,
      {
        method: "POST",
        body: JSON.stringify(account),
      },
    );
  },

  async updateAccount(id: string, account: AccountRequest): Promise<AccountDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTS}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(account),
      },
    );
  },

  async deleteAccount(id: string): Promise<void> {
    await fetchWithAuth(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNTS}/${id}`,
      { method: "DELETE" },
    );
  },
};
