import { Users, DollarSign, BarChart3, ShoppingCart, ClipboardList, CheckCircle, Package } from 'lucide-react';
import type { KpiCard, CategoryData, Activity, Reminder, DashboardStats, SalesChartData } from './types';

export type { SalesChartData };

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-DO', { 
    style: 'currency', 
    currency: 'DOP',
    maximumFractionDigits: 0 
  }).format(value);
};

export const KPI_CONFIG: Omit<KpiCard, 'id' | 'value' | 'formattedValue' | 'change'>[] = [
  { label: 'Ventas del mes', icon: <BarChart3 size={20} strokeWidth={1.8} />, iconBg: '#FEF3C7', trend: 'up', isPositive: true, changeLabel: '+12.5%' },
  { label: 'Compras del mes', icon: <ShoppingCart size={20} strokeWidth={1.8} />, iconBg: '#F3F4F6', trend: 'down', isPositive: false, changeLabel: '-8.3%' },
  { label: 'Clientes activos', icon: <Users size={20} strokeWidth={1.8} />, iconBg: '#DCFCE7', trend: 'up', isPositive: true, changeLabel: '+15.2%' },
  { label: 'Utilidad neta', icon: <DollarSign size={20} strokeWidth={1.8} />, iconBg: '#DBEAFE', trend: 'up', isPositive: true, changeLabel: '+18.7%' },
];

export const SALES_CHART_DATA: SalesChartData[] = [
  { day: 'Lun', sales: 12000, purchases: 8000 },
  { day: 'Mar', sales: 15000, purchases: 12000 },
  { day: 'Mié', sales: 11000, purchases: 9000 },
  { day: 'Jue', sales: 18000, purchases: 14000 },
  { day: 'Vie', sales: 22000, purchases: 16000 },
  { day: 'Sáb', sales: 25000, purchases: 18000 },
  { day: 'Dom', sales: 8000, purchases: 5000 },
];

export const CATEGORY_DATA: CategoryData[] = [
  { name: 'Computación', color: '#FACC15', percent: 40 },
  { name: 'Accesorios', color: '#6366F1', percent: 25 },
  { name: 'Muebles', color: '#10B981', percent: 20 },
  { name: 'Otros', color: '#F59E0B', percent: 15 },
];

export const TOP_PRODUCTS_CONFIG = [
  { name: 'Laptop HP Pavilion', category: 'Computación', sales: 45, value: 675000, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100', rankColor: '#FACC15' },
  { name: 'Mouse Logitech MX', category: 'Accesorios', sales: 38, value: 171000, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100', rankColor: '#6366F1' },
  { name: 'Monitor Samsung 27"', category: 'Computación', sales: 28, value: 812000, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100', rankColor: '#10B981' },
  { name: 'Teclado Corsair K70', category: 'Accesorios', sales: 22, value: 195800, imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100', rankColor: '#F59E0B' },
];

export const ACTIVITY_ICONS: Record<Activity['type'], { bg: string; icon: React.ReactNode }> = {
  sale: { bg: '#FEF3C7', icon: <DollarSign size={18} strokeWidth={1.8} /> },
  payment: { bg: '#DCFCE7', icon: <CheckCircle size={18} strokeWidth={1.8} /> },
  purchase: { bg: '#FEF3C7', icon: <Package size={18} strokeWidth={1.8} /> },
  info: { bg: '#F3F4F6', icon: <ClipboardList size={18} strokeWidth={1.8} /> },
};

export const REMINDERS_CONFIG: Omit<Reminder, 'id'>[] = [
  { text: 'Facturas por cobrar', count: 12, badgeColor: '#FEF3C7' },
  { text: 'Órdenes por despachar', count: 8, badgeColor: '#FEF3C7' },
  { text: 'Stock bajo', count: 15, badgeColor: '#FEF3C7' },
  { text: 'Pagos por realizar', count: 7, badgeColor: '#FEF3C7' },
];

export const DASHBOARD_STATS: DashboardStats = {
  ordersCompleted: 124,
  ordersPending: 89,
  newProducts: 35,
  activeSuppliers: 12,
};

export type ChartPeriod = 'semana' | 'mes' | 'año';

export const CHART_PERIODS: ChartPeriod[] = ['semana', 'mes', 'año'];
