import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { useDashboard } from '../../application/hooks/useDashboard';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { DashboardApiResponse } from '../../domain/dashboard/types';

const RESPONSE: DashboardApiResponse = {
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

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(createFetchResponse(RESPONSE));
  vi.stubGlobal('fetch', fetchMock);
  useDashboardStore.setState({
    dashboard: RESPONSE,
    loading: false,
    error: null,
    scope: 'month',
    chartWindow: 'week',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useDashboard', () => {
  describe('KPI cards', () => {
    it('builds the change percentage from the response', () => {
      const { result } = renderHook(() => useDashboard());
      const [ventas, compras, , utilidad] = result.current.kpis;

      expect(ventas.change).toBe(12.5);
      expect(ventas.changeLabel).toBe('+12.5%');
      expect(ventas.isPositive).toBe(true);
      expect(ventas.trend).toBe('up');

      expect(compras.change).toBe(-8.3);
      expect(compras.changeLabel).toBe('-8.3%');
      expect(compras.isPositive).toBe(false);
      expect(compras.trend).toBe('down');

      expect(utilidad.change).toBe(18.7);
      expect(utilidad.changeLabel).toBe('+18.7%');
    });

    it('takes the direction of the change from the sign of the response', () => {
      useDashboardStore.setState({
        dashboard: {
          ...RESPONSE,
          data: { ...RESPONSE.data, ventasChangePercent: -4.2 },
        },
      });

      const { result } = renderHook(() => useDashboard());
      const ventas = result.current.kpis[0];

      expect(ventas.change).toBe(-4.2);
      expect(ventas.changeLabel).toBe('-4.2%');
      expect(ventas.isPositive).toBe(false);
      expect(ventas.trend).toBe('down');
    });

    it('renders "—" when the comparison is undefined', () => {
      const { result } = renderHook(() => useDashboard());
      const clientes = result.current.kpis[2];

      expect(clientes.change).toBeNull();
      expect(clientes.changeLabel).toBe('—');
      expect(clientes.isPositive).toBe(false);
      expect(clientes.trend).toBe('none');
    });

    it('formats the client count as a plain number', () => {
      const { result } = renderHook(() => useDashboard());

      expect(result.current.kpis[2].formattedValue).toBe('7');
      expect(result.current.kpis[0].formattedValue).toBe('RD$100,000');
    });
  });

  describe('scope aware labels', () => {
    it('states the scope in effect in the KPI label', () => {
      const { result } = renderHook(() => useDashboard());

      expect(result.current.kpis[0].label).toBe('Ventas · Este mes');
      expect(result.current.kpis[2].label).toBe('Clientes nuevos · Este mes');
    });

    it('states the scope in effect in the comparison text', () => {
      const { result } = renderHook(() => useDashboard());

      expect(result.current.kpis[0].compareLabel).toBe('vs mes anterior');
    });

    it('follows the scope when it changes', () => {
      useDashboardStore.setState({ scope: 'today' });

      const { result } = renderHook(() => useDashboard());

      expect(result.current.kpis[0].label).toBe('Ventas · Hoy');
      expect(result.current.kpis[0].compareLabel).toBe('vs hoy anterior');
    });
  });

  describe('exposed filters', () => {
    it('exposes the current scope, the chart window and the actions', () => {
      const { result } = renderHook(() => useDashboard());

      expect(result.current.scope).toBe('month');
      expect(result.current.chartWindow).toBe('week');
      expect(typeof result.current.setScope).toBe('function');
      expect(typeof result.current.setChartWindow).toBe('function');
    });
  });

  describe('chart window isolation', () => {
    it('keeps the KPIs untouched when only the chart window changes', async () => {
      const { result } = renderHook(() => useDashboard());
      const before = result.current.kpis.map((kpi) => kpi.formattedValue);

      await act(async () => {
        await result.current.setChartWindow('year');
      });

      expect(result.current.chartWindow).toBe('year');
      expect(result.current.scope).toBe('month');
      expect(result.current.kpis.map((kpi) => kpi.formattedValue)).toEqual(before);
      expect(result.current.kpis[0].label).toBe('Ventas · Este mes');
    });
  });

  describe('category total', () => {
    it('exposes the total of the categories of the response', () => {
      const { result } = renderHook(() => useDashboard());

      expect(result.current.categoryTotal).toBe(100000);
    });
  });
});
