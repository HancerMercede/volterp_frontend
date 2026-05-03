import { createContext, useContext } from 'react';
import {
  ventas as initialVentas,
  compras as initialCompras,
  productos as initialProductos,
  clientes as initialClientes,
  dashboardStats,
  actividades,
  recordatorios,
  proveedores as initialProveedores,
  transaccionesContables as initialTransacciones,
  empleados as initialEmpleados,
  proyectos as initialProyectos,
} from '../data/mockData';
import type { Venta, Compra, Producto, Cliente, Proveedor, TransaccionContable, Proyecto } from '../data/mockData';
import type { Empleado } from '../domain/entities/Empleado';

export interface ERPState {
  ventas: Venta[];
  compras: Compra[];
  productos: Producto[];
  clientes: Cliente[];
  proveedores: Proveedor[];
  transaccionesContables: TransaccionContable[];
  empleados: Empleado[];
  proyectos: Proyecto[];
  stats: typeof dashboardStats;
  actividades: typeof actividades;
  recordatorios: typeof recordatorios;
}

export interface ERPActions {
  setVentas: React.Dispatch<React.SetStateAction<Venta[]>>;
  setCompras: React.Dispatch<React.SetStateAction<Compra[]>>;
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  setProveedores: React.Dispatch<React.SetStateAction<Proveedor[]>>;
  setTransaccionesContables: React.Dispatch<React.SetStateAction<TransaccionContable[]>>;
  setEmpleados: React.Dispatch<React.SetStateAction<Empleado[]>>;
  setProyectos: React.Dispatch<React.SetStateAction<Proyecto[]>>;
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
  proveedores: initialProveedores,
  transaccionesContables: initialTransacciones,
  empleados: initialEmpleados,
  proyectos: initialProyectos,
  stats: dashboardStats,
  actividades,
  recordatorios,
};