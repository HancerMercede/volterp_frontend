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
  const [proveedores, setProveedores] = useState(initialERPState.proveedores);
  const [transaccionesContables, setTransaccionesContables] = useState(initialERPState.transaccionesContables);
  const [empleados, setEmpleados] = useState(initialERPState.empleados);
  const [proyectos, setProyectos] = useState(initialERPState.proyectos);

  const value: ERPContextType = {
    ventas,
    setVentas,
    compras,
    setCompras,
    productos,
    setProductos,
    clientes,
    setClientes,
    proveedores,
    setProveedores,
    transaccionesContables,
    setTransaccionesContables,
    empleados,
    setEmpleados,
    proyectos,
    setProyectos,
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