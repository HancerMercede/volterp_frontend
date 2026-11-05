import { useEffect } from "react";
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
import { formatCurrency, DEFAULT_CHART_WINDOW, DEFAULT_SCOPE } from "../../domain/dashboard/constants";
import type { DashboardScope } from "../../domain/dashboard/types";
import styles from "./Dashboard.module.css";

/** Global scopes of the dashboard header, in display order. */
const PERIOD_LABELS: Record<DashboardScope, string> = {
  today: "dashboard.scope.today",
  week: "dashboard.scope.week",
  month: "dashboard.scope.month",
};

export function Dashboard() {
  const { t } = useTranslation();
  const {
    kpis,
    topProducts,
    activities,
    reminders,
    dashboardStats,
    salesChartData,
    categoryData,
    categoryTotal,
    scope,
    chartWindow,
    setScope,
    setChartWindow,
  } = useDashboard();

  useEffect(() => {
    // The dashboard opens with the calendar month and the current week, the
    // same filters the page showed before they reached the backend.
    useDashboardStore.getState().fetchDashboard(DEFAULT_SCOPE, DEFAULT_CHART_WINDOW);
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
              className={`${styles.periodPill} ${scope === key ? styles.periodPillActive : ""}`}
              onClick={() => setScope(key as DashboardScope)}
            >
              {t(label)}
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
        <SalesChart
          data={salesChartData}
          chartWindow={chartWindow}
          onChartWindowChange={setChartWindow}
        />
        <CategoryDonut
          data={categoryData}
          totalLabel={formatCurrency(categoryTotal)}
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
