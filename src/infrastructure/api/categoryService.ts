import { API_CONFIG } from '../api/config';
import type { ApiError } from '../api/types';

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
    const error: ApiError = await response.json();
    throw new Error(error.error || 'An error occurred');
  }
  if (response.status === 204) return null;
  return response.json();
}

export interface CategoryDto {
  id: number;
  name: string;
  description: string | null;
  companyId: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string | null;
  companyId: number;
}

export const categoryService = {
  async getCategories(token: string): Promise<CategoryDto[]> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`, token);
  },

  async getCategory(token: string, id: number): Promise<CategoryDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, token);
  },

  async createCategory(token: string, data: CreateCategoryRequest): Promise<CategoryDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(token: string, id: number): Promise<void> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, token, {
      method: 'DELETE',
    });
  },
};