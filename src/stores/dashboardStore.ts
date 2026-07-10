import { create } from 'zustand';
import { dashboardService } from '../infrastructure/api/dashboardService';
import type { DashboardApiResponse } from '../domain/dashboard/types';

interface DashboardStore {
  dashboard: DashboardApiResponse | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  dashboard: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const response = await dashboardService.getDashboard();
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

  setError: (error: string | null) => set({ error }),
}));
