import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDashboardStore } from '../../stores/dashboardStore';
import { dashboardService } from '../../infrastructure/api/dashboardService';
import { API_CONFIG } from '../../infrastructure/api/config';

const DASHBOARD_RESPONSE = {
  data: {
    ventas: 100000,
    compras: 40000,
    clientes: 7,
    utilidad: 60000,
    ventasChangePercent: 12.5,
    comprasChangePercent: -8.3,
    clientesChangePercent: null,
    utilidadChangePercent: 18.7,
  },
  salesChart: [{ day: 'Lun', sales: 12000, purchases: 8000 }],
  categories: [{ name: 'Bebidas', percent: 100, color: '#FACC15', total: 100000 }],
  topProducts: [],
  activities: [],
  reminders: [],
  stats: { ordersCompleted: 1, ordersPending: 2, newProducts: 3, activeSuppliers: 4 },
};

const createFetchResponse = (payload: unknown) => ({
  ok: true,
  status: 200,
  json: async () => payload,
});

let fetchMock: ReturnType<typeof vi.fn>;

const requestedUrl = (callIndex = 0): string =>
  fetchMock.mock.calls[callIndex][0] as string;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(createFetchResponse(DASHBOARD_RESPONSE));
  vi.stubGlobal('fetch', fetchMock);
  useDashboardStore.setState({
    dashboard: null,
    loading: false,
    error: null,
    scope: 'month',
    chartWindow: 'week',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('dashboardStore', () => {
  describe('initial state', () => {
    it('starts with null dashboard data', () => {
      const state = useDashboardStore.getState();
      expect(state.dashboard).toBeNull();
    });

    it('starts with loading false', () => {
      const { loading } = useDashboardStore.getState();
      expect(loading).toBe(false);
    });

    it('starts with null error', () => {
      const { error } = useDashboardStore.getState();
      expect(error).toBeNull();
    });

    it('starts on the month scope and the week chart window', () => {
      const { scope, chartWindow } = useDashboardStore.getInitialState();
      expect(scope).toBe('month');
      expect(chartWindow).toBe('week');
    });
  });

  describe('actions', () => {
    it('sets error correctly', () => {
      const { setError } = useDashboardStore.getState();
      setError('Something went wrong');
      expect(useDashboardStore.getState().error).toBe('Something went wrong');

      useDashboardStore.getState().setError(null);
      expect(useDashboardStore.getState().error).toBeNull();
    });
  });
});

describe('dashboardService', () => {
  it('always sends the global scope and the chart window', async () => {
    await dashboardService.getDashboard('today', 'year');

    expect(requestedUrl()).toBe(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}?period=today&chartPeriod=year`,
    );
  });

  it('sends the values it is given for both filters', async () => {
    await dashboardService.getDashboard('week', 'month');

    const url = requestedUrl();
    expect(url).toContain('period=week');
    expect(url).toContain('chartPeriod=month');
  });
});

describe('useDashboardStore filters', () => {
  it('refetches with the new scope when the scope changes', async () => {
    await useDashboardStore.getState().setScope('today');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestedUrl()).toContain('period=today');
    expect(useDashboardStore.getState().scope).toBe('today');
  });

  it('keeps the chart window when only the scope changes', async () => {
    await useDashboardStore.getState().setScope('week');

    const url = requestedUrl();
    expect(url).toContain('period=week');
    expect(url).toContain('chartPeriod=week');
  });

  it('refetches with the new chart window when the chart window changes', async () => {
    await useDashboardStore.getState().setChartWindow('month');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestedUrl()).toContain('chartPeriod=month');
    expect(useDashboardStore.getState().chartWindow).toBe('month');
  });

  it('keeps the scope when only the chart window changes', async () => {
    await useDashboardStore.getState().setChartWindow('year');

    const url = requestedUrl();
    expect(url).toContain('period=month');
    expect(url).toContain('chartPeriod=year');
  });

  it('stores the dashboard payload returned for the current filters', async () => {
    await useDashboardStore.getState().setScope('today');

    expect(useDashboardStore.getState().dashboard).toEqual(DASHBOARD_RESPONSE);
    expect(useDashboardStore.getState().loading).toBe(false);
    expect(useDashboardStore.getState().error).toBeNull();
  });

  it('keeps the filters in effect when no filter is given', async () => {
    useDashboardStore.setState({ scope: 'today', chartWindow: 'year' });

    await useDashboardStore.getState().fetchDashboard();

    const url = requestedUrl();
    expect(url).toContain('period=today');
    expect(url).toContain('chartPeriod=year');
  });
});
