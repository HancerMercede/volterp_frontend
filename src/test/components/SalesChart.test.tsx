import { createElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { SalesChart } from '../../components/Dashboard/SalesChart';
import type { SalesChartData } from '../../domain/dashboard/types';

/**
 * recharts does not lay the bars out in jsdom, so the rendered bar geometry
 * cannot be measured. The chart is wrapped instead to capture the bar size it
 * is given, which is the value the window in effect has to adapt.
 */
const chartProps = vi.hoisted(() => ({ barSize: undefined as number | undefined }));

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();

  return {
    ...actual,
    BarChart: (props: Record<string, unknown>) => {
      chartProps.barSize = props.barSize as number | undefined;
      return createElement(actual.BarChart, props);
    },
  };
});

/**
 * recharts needs a measurable DOM: jsdom reports every element as 0x0, so the
 * responsive container would never render a chart. The stub gives the chart
 * container a real size, which is what recharts uses to lay out the chart.
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
    const width = isChartContainer ? 800 : (this.textContent?.trim().length ?? 0) * 6;
    const height = isChartContainer ? 180 : 12;

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

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const buildBuckets = (count: number): SalesChartData[] =>
  Array.from({ length: count }, (_, index) => ({
    day: DAY_LABELS[index % DAY_LABELS.length] + (index >= DAY_LABELS.length ? ` ${index}` : ''),
    sales: 12000 + index * 100,
    purchases: 8000 + index * 100,
  }));

beforeAll(async () => {
  installChartGeometry();
  await i18n.changeLanguage('es');
});

describe('SalesChart', () => {
  describe('bucket labels', () => {
    it('renders the label of every bucket on the X axis', () => {
      const { container } = render(
        <SalesChart
          data={buildBuckets(3)}
          chartWindow="week"
          onChartWindowChange={vi.fn()}
        />,
      );

      expect(screen.getByText('Lun')).toBeInTheDocument();
      expect(screen.getByText('Mar')).toBeInTheDocument();
      expect(screen.getByText('Mié')).toBeInTheDocument();
      expect(container.querySelectorAll('.recharts-cartesian-axis-tick-value').length).toBeGreaterThan(0);
    });
  });

  describe('chart window tabs', () => {
    it('sends the chart window when a tab is clicked', () => {
      const onChartWindowChange = vi.fn();
      render(
        <SalesChart data={buildBuckets(7)} chartWindow="week" onChartWindowChange={onChartWindowChange} />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Mes' }));

      expect(onChartWindowChange).toHaveBeenCalledWith('month');
    });

    it('marks the tab of the chart window in effect as active', () => {
      render(
        <SalesChart data={buildBuckets(7)} chartWindow="month" onChartWindowChange={vi.fn()} />,
      );

      expect(screen.getByRole('button', { name: 'Mes' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('bar sizing', () => {
    it('keeps the bar size of a week of buckets', () => {
      render(
        <SalesChart data={buildBuckets(7)} chartWindow="week" onChartWindowChange={vi.fn()} />,
      );

      expect(chartProps.barSize).toBe(28);
    });

    it('shrinks the bars when the window holds more buckets', () => {
      render(
        <SalesChart data={buildBuckets(7)} chartWindow="week" onChartWindowChange={vi.fn()} />,
      );
      const weekBarSize = chartProps.barSize;

      render(
        <SalesChart data={buildBuckets(31)} chartWindow="month" onChartWindowChange={vi.fn()} />,
      );

      expect(chartProps.barSize).toBeLessThan(weekBarSize as number);
    });
  });
});
