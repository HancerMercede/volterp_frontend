import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CategoryData } from '../../domain/dashboard/types';
import styles from './DashboardComponents.module.css';

interface CategoryDonutProps {
  data: CategoryData[];
  totalLabel: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: 600, margin: '0 0 4px 0', color: '#374151' }}>{entry.name}</p>
        <p style={{ margin: 0, color: entry.color }}>
          <strong>{entry.percent}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryDonut({ data, totalLabel }: CategoryDonutProps) {
  return (
    <div className={styles.donutCard}>
      <h3 className={styles.chartTitle}>Ventas por categoría</h3>
      <div className={styles.donutChartWrapper}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`categoryGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="percent"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#categoryGradient-${index})`}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.donutCenter}>
          <div className={styles.donutValue}>{totalLabel}</div>
          <div className={styles.donutLabel}>Total</div>
        </div>
      </div>
      <div className={styles.donutLegend}>
        {data.map((item, i) => (
          <div key={i} className={styles.donutRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className={styles.donutDot} style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}88 100%)` }} />
              <span>{item.name}</span>
            </span>
            <strong>{item.percent}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}