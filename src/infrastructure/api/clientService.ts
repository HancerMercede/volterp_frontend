import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson, fetchWithAuth } from "./fetchWithAuth";
import type { PagedResult, ClientDto, ClientRequest } from "../../domain/types";

export const clientService = {
  async getClients(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<ClientDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}?${params}`,
    );
  },

  async getClientById(id: number): Promise<ClientDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`,
    );
  },

  async createClient(client: ClientRequest): Promise<ClientDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}`,
      {
        method: "POST",
        body: JSON.stringify(client),
      },
    );
  },

  async updateClient(id: number, client: ClientRequest): Promise<ClientDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(client),
      },
    );
  },

  async deleteClient(id: number): Promise<void> {
    await fetchWithAuth(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`,
      { method: "DELETE" },
    );
  },
};
