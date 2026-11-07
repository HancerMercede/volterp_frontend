import { API_CONFIG } from '../api/config';
import { fetchWithAuthJson } from './fetchWithAuth';
import type { PagedResult, UserDto, InviteUserRequest } from '../../domain/types';

export const userService = {
  async getUsers(
    pageNumber = 1,
    pageSize = 10
  ): Promise<PagedResult<UserDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}?${params}`
    );
  },

  async getUser(id: string): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`
    );
  },

  async inviteUser(data: InviteUserRequest): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/invite`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async resendInvitation(userId: string): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}/invite`,
      {
        method: 'POST',
      }
    );
  },

  async sendPasswordReset(userId: string): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}/reset-password`,
      {
        method: 'POST',
      }
    );
  },

  async updateUserRole(userId: string, role: string): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}/role`,
      {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }
    );
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
      }
    );
  },

  async deleteUser(userId: string): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
