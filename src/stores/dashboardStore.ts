import { create } from 'zustand';
import { dashboardService } from '../infrastructure/api/dashboardService';
import { DEFAULT_CHART_WINDOW, DEFAULT_SCOPE } from '../domain/dashboard/constants';
import type { ChartWindow, DashboardApiResponse, DashboardScope } from '../domain/dashboard/types';

interface DashboardStore {
  dashboard: DashboardApiResponse | null;
  /** Global scope in effect: it filters every flow metric of the dashboard. */
  scope: DashboardScope;
  /** Chart window in effect: it filters only the "Ventas vs Compras" chart. */
  chartWindow: ChartWindow;
  loading: boolean;
  error: string | null;
  /** Fetches the dashboard for the given filters and adopts them as current. */
  fetchDashboard: (scope?: DashboardScope, chartWindow?: ChartWindow) => Promise<void>;
  /** Changes the global scope and refetches. */
  setScope: (scope: DashboardScope) => Promise<void>;
  /** Changes the chart window and refetches. */
  setChartWindow: (chartWindow: ChartWindow) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboard: null,
  scope: DEFAULT_SCOPE,
  chartWindow: DEFAULT_CHART_WINDOW,
  loading: false,
  error: null,

  fetchDashboard: async (scope = get().scope, chartWindow = get().chartWindow) => {
    set({ loading: true, error: null, scope, chartWindow });
    try {
      const response = await dashboardService.getDashboard(scope, chartWindow);
      set({ dashboard: response, loading: false });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch dashboard data',
      });
    }
  },

  setScope: async (scope) => {
    await get().fetchDashboard(scope, get().chartWindow);
  },

  setChartWindow: async (chartWindow) => {
    await get().fetchDashboard(get().scope, chartWindow);
  },

  setError: (error: string | null) => set({ error }),
}));
