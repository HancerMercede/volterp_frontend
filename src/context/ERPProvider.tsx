import { useState, type ReactNode } from 'react';
import { ERPContext, initialERPState, type ERPContextType } from './ERPContext';

interface ERPProviderProps {
  children: ReactNode;
}

export function ERPProvider({ children }: ERPProviderProps) {
  const [ventas, setVentas] = useState(initialERPState.ventas);
  const [compras, setCompras] = useState(initialERPState.compras);
  const [productos, setProductos] = useState(initialERPState.productos);
  const [clientes, setClientes] = useState(initialERPState.clientes);

  const value: ERPContextType = {
    ventas,
    setVentas,
    compras,
    setCompras,
    productos,
    setProductos,
    clientes,
    setClientes,
    stats: initialERPState.stats,
    actividades: initialERPState.actividades,
    recordatorios: initialERPState.recordatorios,
  };

  return (
    <ERPContext.Provider value={value}>
      {children}
    </ERPContext.Provider>
  );
}