import { API_CONFIG } from '../api/config';
import { fetchWithAuthJson } from './fetchWithAuth';
import type { PagedResult, UserDto, CreateUserRequest } from '../../domain/types';

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

  async getUser(id: number): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`
    );
  },

  async createUser(data: CreateUserRequest): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async updateUserRole(userId: number, role: string): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}/role`,
      {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }
    );
  },

  async updateUserStatus(userId: number, isActive: boolean): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
      }
    );
  },

  async deleteUser(userId: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`,
      {
        method: 'DELETE',
      }
    );
  },
};