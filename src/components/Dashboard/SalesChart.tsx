import { useState } from 'react';
import type { SalesChartData } from '../../domain/dashboard/types';
import type { ChartPeriod } from '../../domain/dashboard/constants';
import styles from './DashboardComponents.module.css';

interface SalesChartProps {
  data: SalesChartData[];
  maxValue: number;
}

const PERIODS: ChartPeriod[] = ['semana', 'mes', 'año'];

export function SalesChart({ data, maxValue }: SalesChartProps) {
  const [activePeriod, setActivePeriod] = useState<ChartPeriod>('semana');

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Ventas vs Compras</h3>
        <div className={styles.chartTabs}>
          {PERIODS.map((period) => (
            <button
              key={period}
              className={`${styles.chartTab} ${activePeriod === period ? styles.chartTabActive : ''}`}
              onClick={() => setActivePeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.barChart}>
        {data.map((d, i) => (
          <div key={i} className={styles.barItem}>
            <div 
              className={styles.bar}
              style={{ height: `${(d.sales / maxValue) * 140}px` }}
            />
            <span className={styles.barLabel}>{d.day}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#FACC15' }} />
          <span>Ventas</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#9CA3AF' }} />
          <span>Compras</span>
        </div>
      </div>
    </div>
  );
}