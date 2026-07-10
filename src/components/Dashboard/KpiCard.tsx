import type { KpiCard } from '../../domain/dashboard/types';
import styles from './DashboardComponents.module.css';

interface KpiCardProps {
  kpi: KpiCard;
}

export function KpiCard({ kpi }: KpiCardProps) {
  return (
    <div className={styles.kpiCard} style={{ '--accent-color': kpi.iconBg } as React.CSSProperties}>
      <div className={styles.kpiContent}>
        <div className={styles.kpiHeader}>
          <span 
            className={styles.kpiIcon} 
            style={{ background: kpi.iconBg }}
          >
            {kpi.icon}
          </span>
          <span className={styles.kpiLabel}>{kpi.label}</span>
        </div>
        <div className={styles.kpiValue}>{kpi.formattedValue}</div>
        <div className={`${styles.kpiChange} ${kpi.isPositive ? styles.positive : styles.negative}`}>
          {kpi.trend === 'up' ? '↑' : '↓'} {kpi.changeLabel} vs mes anterior
        </div>
      </div>
      <div 
        className={styles.kpiIconRight} 
        style={{ background: kpi.iconBg }}
      >
        {kpi.icon}
      </div>
    </div>
  );
}