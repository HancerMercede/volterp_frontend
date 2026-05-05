import { API_CONFIG } from '../api/config';
export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  companyId: number;
}

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'An error occurred');
  }
  return response.json();
}

export const userService = {
  async getUsers(token: string): Promise<UserDto[]> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}/api/users`, token);
  },

  async createUser(token: string, data: CreateUserRequest): Promise<UserDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}/api/users`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUserRole(token: string, userId: number, role: string): Promise<UserDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}/api/users/${userId}/role`, token, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async updateUserStatus(token: string, userId: number, isActive: boolean): Promise<UserDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}/api/users/${userId}/status`, token, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  async deleteUser(token: string, userId: number): Promise<void> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}/api/users/${userId}`, token, {
      method: 'DELETE',
    });
  },
};