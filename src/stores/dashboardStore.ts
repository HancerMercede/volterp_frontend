import { create } from 'zustand';
import { dashboardStats, actividades, recordatorios } from '../data/mockData';

interface DashboardData {
  ventas: number;
  compras: number;
  clientes: number;
  utilidad: number;
}

interface Actividad {
  id: number;
  texto: string;
  hora: string;
  tipo: string;
}

interface Recordatorio {
  id: number;
  texto: string;
  fecha: string;
}

interface DashboardStore {
  stats: DashboardData;
  actividades: Actividad[];
  recordatorios: Recordatorio[];
}

export const useDashboardStore = create<DashboardStore>(() => ({
  stats: dashboardStats,
  actividades,
  recordatorios,
}));