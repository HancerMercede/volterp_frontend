import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type { ChartWindow, DashboardApiResponse, DashboardScope } from "../../domain/dashboard/types";

export const dashboardService = {
  /**
   * Both filters are always sent: `period` scopes every flow metric of the
   * dashboard and `chartPeriod` scopes only the "Ventas vs Compras" chart.
   */
  async getDashboard(scope: DashboardScope, chartWindow: ChartWindow): Promise<DashboardApiResponse> {
    const query = new URLSearchParams({ period: scope, chartPeriod: chartWindow });

    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}?${query.toString()}`,
    );
  },
};
