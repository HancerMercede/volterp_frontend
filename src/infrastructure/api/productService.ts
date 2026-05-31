import { API_CONFIG } from "../api/config";
import type {
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
} from "../api/types";
import type { PagedResult } from "../../domain/types";
import { fetchWithAuthJson } from "./fetchWithAuth";

export const productService = {
  async getProducts(
    pageNumber: number,
    pageSize: number,
  ): Promise<PagedResult<ProductDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}?${params}`,
    );
  },

  async getProduct(id: number): Promise<ProductDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`,
    );
  },

  async createProduct(data: CreateProductRequest): Promise<ProductDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateProduct(
    id: number,
    data: UpdateProductRequest,
  ): Promise<ProductDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deleteProduct(id: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
