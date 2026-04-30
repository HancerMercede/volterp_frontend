import { createContext, useContext } from 'react';
import {
  ventas as initialVentas,
  compras as initialCompras,
  productos as initialProductos,
  clientes as initialClientes,
  dashboardStats,
  actividades,
  recordatorios,
} from '../data/mockData';
import type { Venta, Compra, Producto, Cliente } from '../data/mockData';

export interface ERPState {
  ventas: Venta[];
  compras: Compra[];
  productos: Producto[];
  clientes: Cliente[];
  stats: typeof dashboardStats;
  actividades: typeof actividades;
  recordatorios: typeof recordatorios;
}

export interface ERPActions {
  setVentas: React.Dispatch<React.SetStateAction<Venta[]>>;
  setCompras: React.Dispatch<React.SetStateAction<Compra[]>>;
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
}

export type ERPContextType = ERPState & ERPActions;

export const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within ERPProvider');
  }
  return context;
}

export const initialERPState: ERPState = {
  ventas: initialVentas,
  compras: initialCompras,
  productos: initialProductos,
  clientes: initialClientes,
  stats: dashboardStats,
  actividades,
  recordatorios,
};