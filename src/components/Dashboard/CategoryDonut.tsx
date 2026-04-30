import type { CategoryData } from '../../domain/dashboard/types';
import styles from './DashboardComponents.module.css';

interface CategoryDonutProps {
  data: CategoryData[];
  totalLabel: string;
}

export function CategoryDonut({ data, totalLabel }: CategoryDonutProps) {
  const gradientStops = data.reduce((acc, item, index) => {
    const prevPercent = index === 0 ? 0 : data.slice(0, index).reduce((sum, d) => sum + d.percent, 0);
    const nextPercent = prevPercent + item.percent;
    return `${acc}, ${item.color} ${prevPercent}% ${nextPercent}%`;
  }, '');

  return (
    <div className={styles.donutCard}>
      <h3 className={styles.chartTitle}>Ventas por categoría</h3>
      <div 
        className={styles.donutChart}
        style={{ background: `conic-gradient(${gradientStops.slice(1)})` }}
      />
      <div className={styles.donutCenter}>
        <div className={styles.donutValue}>{totalLabel}</div>
        <div className={styles.donutLabel}>Total</div>
      </div>
      <div className={styles.donutLegend}>
        {data.map((item, i) => (
          <div key={i} className={styles.donutRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className={styles.donutDot} style={{ background: item.color }} />
              {item.name}
            </span>
            <strong>{item.percent}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}