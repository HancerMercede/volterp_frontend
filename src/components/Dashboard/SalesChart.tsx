import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SalesChartData } from '../../domain/dashboard/types';
import type { ChartPeriod } from '../../domain/dashboard/constants';
import styles from './DashboardComponents.module.css';

interface SalesChartProps {
  data: SalesChartData[];
}

const PERIODS: ChartPeriod[] = ['semana', 'mes', 'año'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: 600, margin: '0 0 6px 0', color: '#374151' }}>{label}</p>
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

export function SalesChart({ data }: SalesChartProps) {
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
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
            <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="100%" stopColor="#6B7280" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6B7280' }}
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
          <div className={styles.legendDot} style={{ background: 'linear-gradient(180deg, #FACC15 0%, #EAB308 100%)' }} />
          <span>Ventas</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'linear-gradient(180deg, #9CA3AF 0%, #6B7280 100%)' }} />
          <span>Compras</span>
        </div>
      </div>
    </div>
  );
}