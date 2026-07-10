export interface KpiCard {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  change: number;
  changeLabel: string;
  isPositive: boolean;
  icon: string;
  iconBg: string;
  trend: 'up' | 'down';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface SalesChartData {
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
}

export interface DashboardApiResponse {
  data: DashboardApiData;
  salesChart: SalesChartData[];
  categories: CategoryData[];
  topProducts: DashboardApiTopProduct[];
  activities: DashboardApiActivity[];
  reminders: DashboardApiReminder[];
  stats: DashboardStats;
}