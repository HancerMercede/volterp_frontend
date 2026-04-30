import { createContext, useState, type ReactNode } from "react";
import {
  ventas as initialVentas,
  compras as initialCompras,
  productos as initialProductos,
  clientes as initialClientes,
  dashboardStats,
  actividades,
  recordatorios,
} from "../data/mockData";
import type { Venta, Compra, Producto, Cliente } from "../data/mockData";

interface ERPContextType {
  ventas: Venta[];
  setVentas: React.Dispatch<React.SetStateAction<Venta[]>>;
  compras: Compra[];
  setCompras: React.Dispatch<React.SetStateAction<Compra[]>>;
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  stats: typeof dashboardStats;
  actividades: typeof actividades;
  recordatorios: typeof recordatorios;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: ReactNode }) {
  const [ventas, setVentas] = useState<Venta[]>(initialVentas);
  const [compras, setCompras] = useState<Compra[]>(initialCompras);
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);

  return (
    <ERPContext.Provider
      value={{
        ventas,
        setVentas,
        compras,
        setCompras,
        productos,
        setProductos,
        clientes,
        setClientes,
        stats: dashboardStats,
        actividades,
        recordatorios,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}
