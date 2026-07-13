import { useMemo } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { KpiCard, TopProduct, Activity, Reminder, DashboardStats, SalesChartData, CategoryData } from '../../domain/dashboard/types';
import { KPI_CONFIG, formatCurrency } from '../../domain/dashboard/constants';

const ACTIVITY_TYPES = ['sale', 'payment', 'purchase', 'info'] as const;

export function useDashboard() {
  const { dashboard, loading } = useDashboardStore();

  const kpis = useMemo((): KpiCard[] => {
    if (!dashboard) return [];
    const { data } = dashboard;
    const values = [data.ventas, data.compras, data.clientes, data.utilidad];

    return KPI_CONFIG.map((config, index) => ({
      id: `kpi-${index}`,
      label: config.label,
      value: index === 2 ? Number(data.clientes) : values[index],
      formattedValue: index === 2
        ? data.clientes.toString()
        : formatCurrency(values[index]),
      change: index === 2 ? 15.2 : (index === 0 ? 12.5 : index === 3 ? 18.7 : -8.3),
      changeLabel: config.changeLabel,
      isPositive: config.isPositive,
      icon: config.icon,
      iconBg: config.iconBg,
      trend: config.trend,
    }));
  }, [dashboard]);

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
    }));
  }, [dashboard]);

  const dashboardStats: DashboardStats | null = dashboard?.stats ?? null;
  const salesChartData: SalesChartData[] = dashboard?.salesChart ?? [];
  const categoryData: CategoryData[] = dashboard?.categories ?? [];

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
    maxSales,
    loading,
  };
}
