import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { Dashboard } from '../../pages/Dashboard/Dashboard';

const CHART_WIDTH = 800;
const CHART_HEIGHT = 180;

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
  salesChart: [
    { day: 'Lun', sales: 12000, purchases: 8000 },
    { day: 'Mar', sales: 15000, purchases: 12000 },
  ],
  categories: [
    { name: 'Bebidas', percent: 40, color: '#FACC15', total: 120000 },
    { name: 'Aseo', percent: 60, color: '#6366F1', total: 180000 },
  ],
  topProducts: [],
  activities: [],
  reminders: [
    { text: 'Ordenes por despachar', count: 3, badgeColor: '#FEF3C7', isAmount: false },
    { text: 'Facturas por cobrar', count: 61741.14, badgeColor: '#FEF3C7', isAmount: true },
  ],
  stats: { ordersCompleted: 1, ordersPending: 2, newProducts: 3, activeSuppliers: 4 },
};

/**
 * recharts needs a measurable DOM: jsdom reports every element as 0x0, so the
 * responsive container would never render a chart. The stub gives the chart
 * container a real size and the text measurement span a width proportional to
 * the text it measures, which is what recharts uses to lay out the ticks.
 */
const installChartGeometry = () => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;

  Element.prototype.getBoundingClientRect = function (this: Element) {
    const isChartContainer = this.classList?.contains('recharts-responsive-container');
    const width = isChartContainer ? CHART_WIDTH : (this.textContent?.trim().length ?? 0) * 6;
    const height = isChartContainer ? CHART_HEIGHT : 12;

    return {
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  };
};

let fetchMock: ReturnType<typeof vi.fn>;

const lastRequestedUrl = (): string =>
  fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;

beforeAll(async () => {
  installChartGeometry();
  await i18n.changeLanguage('es');
});

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => DASHBOARD_RESPONSE,
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Dashboard', () => {
  describe('global scope pills', () => {
    it('renders the three global scopes', () => {
      render(<Dashboard />);

      expect(screen.getByRole('button', { name: 'Hoy' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Esta semana' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Este mes' })).toBeInTheDocument();
    });

    it('refetches with the scope of the pill that was clicked', async () => {
      render(<Dashboard />);

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      fireEvent.click(screen.getByRole('button', { name: 'Hoy' }));

      await waitFor(() => expect(lastRequestedUrl()).toContain('period=today'));
    });

    it('states the scope in effect in the KPI labels', async () => {
      render(<Dashboard />);

      await waitFor(() => expect(screen.getByText('Ventas · Este mes')).toBeInTheDocument());
    });
  });

  describe('chart window tabs', () => {
    it('refetches with the chart window of the tab that was clicked, keeping the scope', async () => {
      render(<Dashboard />);

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      fireEvent.click(screen.getByRole('button', { name: 'Mes' }));

      await waitFor(() => expect(lastRequestedUrl()).toContain('chartPeriod=month'));
      expect(lastRequestedUrl()).toContain('period=month');
    });
  });

  describe('donut total', () => {
    it('computes the total from the categories of the response', async () => {
      render(<Dashboard />);

      await waitFor(() => expect(screen.getByText('RD$300,000')).toBeInTheDocument());
      expect(screen.queryByText('RD$145,660')).toBeNull();
    });
  });

  describe('KPI change rendering', () => {
    it('renders an undefined comparison as "—" and never as a percentage of zero', async () => {
      render(<Dashboard />);

      // The clientes card has no comparable previous period, so its change is
      // undefined: it shows "—" and the scope's comparison, never a percentage.
      // The exact match is the proof: a card rendering "0.0% vs mes anterior"
      // would not match it.
      await waitFor(() => expect(screen.getByText('— vs mes anterior')).toBeInTheDocument());
      expect(screen.queryByText(/—.*%/)).toBeNull();
    });
  });

  describe('reminders', () => {
    it('renders the amount reminder as currency and the count reminder as a count', async () => {
      render(<Dashboard />);

      await waitFor(() => expect(screen.getByText('RD$61,741')).toBeInTheDocument());

      const countReminder = screen.getByText('Ordenes por despachar').closest('div');
      expect(countReminder).not.toBeNull();
      expect(within(countReminder as HTMLElement).getByText('3')).toBeInTheDocument();
    });
  });
});
