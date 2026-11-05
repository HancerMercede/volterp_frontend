import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartWindow, SalesChartData } from '../../domain/dashboard/types';
import { CHART_PERIOD_WINDOWS, type ChartPeriod } from '../../domain/dashboard/constants';
import styles from './DashboardComponents.module.css';

interface SalesChartProps {
  data: SalesChartData[];
  /** Chart window in effect: the tab that is active. */
  chartWindow: ChartWindow;
  /** Requests another window; the caller refetches the dashboard for it. */
  onChartWindowChange: (chartWindow: ChartWindow) => void;
}

const PERIODS: ChartPeriod[] = ['semana', 'mes', 'año'];

/** Chart window of each tab, in the order the tabs are rendered. */
const CHART_WINDOWS: ChartWindow[] = PERIODS.map((period) => CHART_PERIOD_WINDOWS[period]);

/**
 * Bar size of the reference week. A wider window holds more buckets, so the
 * bars shrink with the bucket count to keep the same density on the band.
 */
const REFERENCE_BUCKETS = 7;
const MAX_BAR_SIZE = 28;
const MIN_BAR_SIZE = 4;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#FFFAF5',
        border: '1px solid #E7E5E4',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: 600, margin: '0 0 6px 0', color: '#292524' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '2px 0', color: entry.color }}>
            {entry.name}: <strong>${entry.value.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart({ data, chartWindow, onChartWindowChange }: SalesChartProps) {
  const { t } = useTranslation();

  const barSize = Math.max(
    MIN_BAR_SIZE,
    Math.min(MAX_BAR_SIZE, Math.floor((MAX_BAR_SIZE * REFERENCE_BUCKETS) / Math.max(data.length, 1))),
  );

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Ventas vs Compras</h3>
        <div className={styles.chartTabs}>
          {CHART_WINDOWS.map((tabWindow) => (
            <button
              key={tabWindow}
              type="button"
              aria-pressed={chartWindow === tabWindow}
              className={`${styles.chartTab} ${chartWindow === tabWindow ? styles.chartTabActive : ''}`}
              onClick={() => onChartWindowChange(tabWindow)}
            >
              {t(`dashboard.chartWindow.${tabWindow}`)}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={barSize}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 11, fill: '#A8A29E' }}
            axisLine={{ stroke: '#E7E5E4' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#A8A29E' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="sales" name="Ventas" radius={[4, 4, 0, 0]} maxBarSize={36} fill="url(#salesGradient)" />
          <Bar dataKey="purchases" name="Compras" radius={[4, 4, 0, 0]} maxBarSize={36} fill="url(#purchasesGradient)" />
        </BarChart>
      </ResponsiveContainer>
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)' }} />
          <span>Ventas</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'linear-gradient(180deg, #2DD4BF 0%, #0D9488 100%)' }} />
          <span>Compras</span>
        </div>
      </div>
    </div>
  );
}