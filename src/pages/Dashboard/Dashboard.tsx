import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../application/hooks/useDashboard";
import { useDashboardStore } from "../../stores/dashboardStore";
import {
  KpiCard,
  StatsRow,
  SalesChart,
  CategoryDonut,
  TopProducts,
  RecentActivities,
  Reminders,
} from "../../components/Dashboard";
import { formatCurrency } from "../../domain/dashboard/constants";
import styles from "./Dashboard.module.css";

const PERIOD_LABELS: Record<string, string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
};

export function Dashboard() {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<string>("month");
  const {
    kpis,
    topProducts,
    activities,
    reminders,
    dashboardStats,
    salesChartData,
    categoryData,
  } = useDashboard();

  useEffect(() => {
    useDashboardStore.getState().fetchDashboard();
  }, []);

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleAccent}></span>
            {t("dashboard.title")}
          </h1>
          <p className={styles.pageSubtitle}>{t("dashboard.subtitle")}</p>
        </div>
        <div className={styles.periodPills}>
          {Object.entries(PERIOD_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.periodPill} ${activePeriod === key ? styles.periodPillActive : ""}`}
              onClick={() => setActivePeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <StatsRow
        stats={
          dashboardStats ?? {
            ordersCompleted: 0,
            ordersPending: 0,
            newProducts: 0,
            activeSuppliers: 0,
          }
        }
      />

      <section className={styles.cards}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <div className={styles.chartsSection}>
        <SalesChart data={salesChartData} />
        <CategoryDonut
          data={categoryData}
          totalLabel={formatCurrency(145660)}
        />
      </div>

      <section className={styles.grid}>
        <TopProducts products={topProducts} />
        <RecentActivities activities={activities} />
        <Reminders reminders={reminders} />
      </section>
    </>
  );
}
