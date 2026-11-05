import type { ReactNode } from 'react';

/**
 * Global scope of the dashboard: it filters every flow metric of the page.
 * Mirrors the `period` query parameter of GET /api/dashboard.
 */
export type DashboardScope = 'today' | 'week' | 'month';

/**
 * Window of the "Ventas vs Compras" chart only: it never filters the KPIs,
 * the stats row, the donut or the top products.
 * Mirrors the `chartPeriod` query parameter of GET /api/dashboard.
 */
export type ChartWindow = 'week' | 'month' | 'year';

export interface KpiCard {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  /** Percentage change against the preceding period, or null when undefined. */
  change: number | null;
  /** Formatted change: the signed percentage, or "—" when it is undefined. */
  changeLabel: string;
  /** Comparison text that follows the scope in effect, e.g. "vs mes anterior". */
  compareLabel: string;
  isPositive: boolean;
  icon: ReactNode;
  iconBg: string;
  trend: 'up' | 'down' | 'none';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface SalesChartData {
  /** Bucket label: a day name for a daily bucket, a short month name for a monthly one. */
  day: string;
  sales: number;
  purchases: number;
}

export interface CategoryData {
  name: string;
  percent: number;
  color: string;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  value: number;
  formattedValue: string;
  imageUrl: string;
  rank: number;
  rankColor: string;
}

export interface Activity {
  id: string;
  text: string;
  time: string;
  type: 'sale' | 'payment' | 'purchase' | 'info';
}

export interface Reminder {
  id: string;
  text: string;
  count: number;
  badgeColor: string;
  /** True when the value is an amount to collect rather than a count of items. */
  isAmount?: boolean;
}

export interface DashboardStats {
  ordersCompleted: number;
  ordersPending: number;
  newProducts: number;
  activeSuppliers: number;
}

// ========================
// Raw API response types
// ========================
export interface DashboardApiData {
  ventas: number;
  compras: number;
  clientes: number;
  utilidad: number;
  /** null when the preceding period has no value to compare against. */
  ventasChangePercent: number | null;
  comprasChangePercent: number | null;
  clientesChangePercent: number | null;
  utilidadChangePercent: number | null;
}

export interface DashboardApiTopProduct {
  name: string;
  category: string;
  sales: number;
  value: number;
  imageUrl: string;
  rankColor: string;
}

export interface DashboardApiActivity {
  text: string;
  time: string;
  type: string;
}

export interface DashboardApiReminder {
  text: string;
  count: number;
  badgeColor: string;
  /** True when the value is an amount to collect rather than a count of items. */
  isAmount: boolean;
}

/** Category as the API returns it: the category of the chart plus the amount it represents. */
export interface DashboardApiCategory extends CategoryData {
  /** Amount of the category inside the scope in effect. */
  total: number;
}

export interface DashboardApiResponse {
  data: DashboardApiData;
  salesChart: SalesChartData[];
  categories: DashboardApiCategory[];
  topProducts: DashboardApiTopProduct[];
  activities: DashboardApiActivity[];
  reminders: DashboardApiReminder[];
  stats: DashboardStats;
}