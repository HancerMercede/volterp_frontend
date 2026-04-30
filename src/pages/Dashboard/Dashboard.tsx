import { useDashboard } from '../../application/hooks/useDashboard';
import { KpiCard, StatsRow, SalesChart, CategoryDonut, TopProducts, RecentActivities, Reminders } from '../../components/Dashboard';
import { formatCurrency } from '../../domain/dashboard/constants';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { 
    kpis, 
    topProducts, 
    activities, 
    reminders, 
    dashboardStats, 
    salesChartData, 
    categoryData,
    maxSales 
  } = useDashboard();

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <input type="text" placeholder="Buscar..." className={styles.search} />
      </header>

      <StatsRow stats={dashboardStats} />

      <section className={styles.cards}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <div className={styles.chartsSection}>
        <SalesChart data={salesChartData} maxValue={maxSales} />
        <CategoryDonut data={categoryData} totalLabel={formatCurrency(145660)} />
      </div>

      <section className={styles.grid}>
        <TopProducts products={topProducts} />
        <RecentActivities activities={activities} />
        <Reminders reminders={reminders} />
      </section>
    </>
  );
}