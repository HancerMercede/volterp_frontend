import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { PagedResult, CategoryDto, CategoryRequest } from "../../domain/types";

export const categoryService = {
  async getCategories(
    pageNumber: number,
    pageSize: number,
  ): Promise<PagedResult<CategoryDto>> {
    const params = new URLSearchParams({
      page: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}?${params}`,
    );
  },

  async getCategory(id: number): Promise<CategoryDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`,
    );
  },

  async createCategory(data: CategoryRequest): Promise<CategoryDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async deleteCategory(id: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
