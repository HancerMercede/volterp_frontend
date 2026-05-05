import { API_CONFIG } from '../api/config';
import type { ProductDto, CreateProductRequest, UpdateProductRequest } from '../api/types';

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
  if (response.status === 204) return null;
  return response.json();
}

export const productService = {
  async getProducts(token: string): Promise<ProductDto[]> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`, token);
  },

  async getProduct(token: string, id: number): Promise<ProductDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, token);
  },

  async createProduct(token: string, data: CreateProductRequest): Promise<ProductDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(token: string, id: number, data: UpdateProductRequest): Promise<ProductDto> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(token: string, id: number): Promise<void> {
    return fetchWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, token, {
      method: 'DELETE',
    });
  },
};