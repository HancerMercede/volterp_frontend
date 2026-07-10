import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson, fetchWithAuth } from "./fetchWithAuth";
import type { PagedResult, Project } from "../../domain/types";

export const proyectoService = {
  async getProjects(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<Project>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}?${params}`,
    );
  },

  async getProjectById(id: string): Promise<Project> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`,
    );
  },

  async createProject(project: Partial<Project>): Promise<Project> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`,
      {
        method: "POST",
        body: JSON.stringify(project),
      },
    );
  },

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(project),
      },
    );
  },

  async deleteProject(id: string): Promise<void> {
    await fetchWithAuth(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`,
      { method: "DELETE" },
    );
  },
};
