import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { DashboardApiResponse } from "../../domain/dashboard/types";

export const dashboardService = {
  async getDashboard(): Promise<DashboardApiResponse> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}`,
    );
  },
};
