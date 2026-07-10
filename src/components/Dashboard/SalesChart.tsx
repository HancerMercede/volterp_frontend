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
              {period === 'semana' ? 'Semana' : period === 'mes' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
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