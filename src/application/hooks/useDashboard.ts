import { useMemo } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { KpiCard, TopProduct, Activity, Reminder, DashboardStats, SalesChartData, CategoryData } from '../../domain/dashboard/types';
import { KPI_CONFIG, TOP_PRODUCTS_CONFIG, REMINDERS_CONFIG, DASHBOARD_STATS, SALES_CHART_DATA, CATEGORY_DATA, formatCurrency } from '../../domain/dashboard/constants';

export function useDashboard() {
  const { stats, actividades } = useDashboardStore();

  const kpis = useMemo((): KpiCard[] => {
    const values = [stats.ventas, stats.compras, stats.clientes, stats.utilidad];

    return KPI_CONFIG.map((config, index) => ({
      id: `kpi-${index}`,
      label: config.label,
      value: index === 2 ? Number(stats.clientes) : values[index],
      formattedValue: index === 2 ? stats.clientes.toString() : formatCurrency(values[index]),
      change: index === 2 ? 15.2 : (index === 0 ? 12.5 : index === 3 ? 18.7 : -8.3),
      changeLabel: config.changeLabel,
      isPositive: config.isPositive,
      icon: config.icon,
      iconBg: config.iconBg,
      trend: config.trend,
    }));
  }, [stats]);

  const topProducts = useMemo((): TopProduct[] => {
    return TOP_PRODUCTS_CONFIG.map((product, index) => ({
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
  }, []);

  const activities = useMemo((): Activity[] => {
    const types: Activity['type'][] = ['sale', 'payment', 'purchase', 'info'];
    return actividades.slice(0, 4).map((a, index) => ({
      id: String(a.id),
      text: a.texto,
      time: a.hora,
      type: types[index] || 'info',
    }));
  }, [actividades]);

  const reminders = useMemo((): Reminder[] => {
    return REMINDERS_CONFIG.map((config, index) => ({
      id: `reminder-${index}`,
      ...config,
    }));
  }, []);

  const dashboardStats: DashboardStats = DASHBOARD_STATS;
  const salesChartData: SalesChartData[] = SALES_CHART_DATA;
  const categoryData: CategoryData[] = CATEGORY_DATA;

  const maxSales = useMemo(() => {
    return Math.max(...salesChartData.map(d => d.sales));
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
  };
}