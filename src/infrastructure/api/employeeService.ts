import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { 
  PagedResult, 
  EmployeeDto, 
  CreateEmployeeRequest 
} from "../../domain/types";

export const employeeService = {
  async getEmployees(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<EmployeeDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}?${params}`,
    );
  },

  async getEmployee(id: number): Promise<EmployeeDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`,
    );
  },

  async createEmployee(data: CreateEmployeeRequest): Promise<EmployeeDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateEmployee(id: number, data: Partial<EmployeeDto>): Promise<EmployeeDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deleteEmployee(id: number): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
