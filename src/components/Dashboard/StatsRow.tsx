import type { DashboardStats } from '../../domain/dashboard/types';
import styles from './DashboardComponents.module.css';

interface StatsRowProps {
  stats: DashboardStats;
}

const STATS_LABELS: Record<keyof DashboardStats, string> = {
  ordersCompleted: 'Pedidos realizados',
  ordersPending: 'Pedidos pendientes',
  newProducts: 'Productos nuevos',
  activeSuppliers: 'Proveedores activos',
};

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className={styles.statsRow}>
      {(Object.keys(STATS_LABELS) as Array<keyof DashboardStats>).map((key) => (
        <div key={key} className={styles.statItem}>
          <div className={styles.statValue}>{stats[key]}</div>
          <div className={styles.statLabel}>{STATS_LABELS[key]}</div>
        </div>
      ))}
    </div>
  );
}