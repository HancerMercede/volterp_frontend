import { API_CONFIG } from '../api/config';
import { fetchWithAuthJson } from './fetchWithAuth';
import type { PagedResult, UserDto, InviteUserRequest } from '../../domain/types';
import { ROL_TO_BACKEND, type Rol } from '../../domain/constants/roles';

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

  // The backend creates the user with a password: there is no invitation
  // endpoint, the user is created and starts with that password.
  async inviteUser(data: InviteUserRequest): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
      {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          email: data.email,
          fullName: data.fullName,
          roles: data.roles.map((rol) => ROL_TO_BACKEND[rol as Rol]),
        }),
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

  // The endpoint sets the COMPLETE set of roles of the user: the screen
  // picks one, and that one becomes the whole set.
  async updateUserRoles(userId: string, roles: string[]): Promise<UserDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}/roles`,
      {
        method: 'PUT',
        body: JSON.stringify({
          roles: roles.map((rol) => ROL_TO_BACKEND[rol as Rol]),
        }),
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
