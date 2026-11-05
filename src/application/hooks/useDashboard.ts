import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { KpiCard, TopProduct, Activity, Reminder, DashboardStats, SalesChartData, CategoryData } from '../../domain/dashboard/types';
import { KPI_CONFIG, formatCurrency } from '../../domain/dashboard/constants';

const ACTIVITY_TYPES = ['sale', 'payment', 'purchase', 'info'] as const;

/** Shown when the API reports no comparable previous period. */
const UNDEFINED_CHANGE = '—';

const formatChange = (change: number | null): string => {
  if (change === null) return UNDEFINED_CHANGE;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

export function useDashboard() {
  const { t } = useTranslation();
  const { dashboard, scope, chartWindow, loading, setScope, setChartWindow } = useDashboardStore();

  const kpis = useMemo((): KpiCard[] => {
    if (!dashboard) return [];
    const { data } = dashboard;
    const values = [data.ventas, data.compras, data.clientes, data.utilidad];
    const changes = [
      data.ventasChangePercent,
      data.comprasChangePercent,
      data.clientesChangePercent,
      data.utilidadChangePercent,
    ];
    const scopeLabel = t(`dashboard.scope.${scope}`);
    const compareLabel = t(`dashboard.compare.${scope}`);

    return KPI_CONFIG.map((config, index) => {
      const change = changes[index] ?? null;
      const isPositive = change !== null && change >= 0;

      return {
        id: `kpi-${index}`,
        label: `${t(config.label)} · ${scopeLabel}`,
        value: index === 2 ? Number(data.clientes) : values[index],
        formattedValue: index === 2
          ? data.clientes.toString()
          : formatCurrency(values[index]),
        change,
        changeLabel: formatChange(change),
        compareLabel,
        isPositive,
        icon: config.icon,
        iconBg: config.iconBg,
        trend: change === null ? 'none' : isPositive ? 'up' : 'down',
      };
    });
  }, [dashboard, scope, t]);

  const topProducts = useMemo((): TopProduct[] => {
    if (!dashboard) return [];
    return dashboard.topProducts.map((product, index) => ({
      id: `product-${index}`,
      name: product.name,
      category: product.category,
      sales: product.sales,
      value: product.value,
      formattedValue: formatCurrency(product.value),
      imageUrl: product.imageUrl,
      rank: index + 1,
      rankColor: product.rankColor,
    }));
  }, [dashboard]);

  const activities = useMemo((): Activity[] => {
    if (!dashboard) return [];
    return dashboard.activities.map((a, index) => ({
      id: String(index + 1),
      text: a.text,
      time: a.time,
      type: (ACTIVITY_TYPES as readonly string[]).includes(a.type)
        ? a.type as Activity['type']
        : 'info',
    }));
  }, [dashboard]);

  const reminders = useMemo((): Reminder[] => {
    if (!dashboard) return [];
    return dashboard.reminders.map((r, index) => ({
      id: `reminder-${index}`,
      text: r.text,
      count: r.count,
      badgeColor: r.badgeColor,
      isAmount: r.isAmount,
    }));
  }, [dashboard]);

  const dashboardStats: DashboardStats | null = dashboard?.stats ?? null;
  const salesChartData: SalesChartData[] = dashboard?.salesChart ?? [];
  const categoryData: CategoryData[] = dashboard?.categories ?? [];
  const categoryTotal = (dashboard?.categories ?? []).reduce(
    (total, category) => total + category.total,
    0,
  );

  const maxSales = useMemo(() => {
    return Math.max(...salesChartData.map(d => d.sales), 0);
  }, [salesChartData]);

  return {
    kpis,
    topProducts,
    activities,
    reminders,
    dashboardStats,
    salesChartData,
    categoryData,
    categoryTotal,
    maxSales,
    loading,
    scope,
    chartWindow,
    setScope,
    setChartWindow,
  };
}
