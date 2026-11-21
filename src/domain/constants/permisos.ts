import { Permiso } from './roles';

// The modules of the ERP. The keys are the ones the API uses for its
// permissions: the permission of a module and an action is
// "<modulo>.<accion>" (for example, "ventas.read").
export type Modulo =
  | 'dashboard'
  | 'ventas'
  | 'compras'
  | 'inventario'
  | 'clientes'
  | 'proveedores'
  | 'contabilidad'
  | 'rrhh'
  | 'proyectos'
  | 'reportes'
  | 'configuracion'
  | 'facturacion'
  | 'pos';

export type PermisosModulo = Record<Permiso, boolean>;

// The modules the menu walks through. The key of a module is the one the
// API uses for its permissions.
export const MODULOS: { key: Modulo; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'ventas', label: 'Ventas', icon: '💰' },
  { key: 'compras', label: 'Compras', icon: '🛒' },
  { key: 'inventario', label: 'Inventario', icon: '📦' },
  { key: 'clientes', label: 'Clientes', icon: '👥' },
  { key: 'proveedores', label: 'Proveedores', icon: '🚚' },
  { key: 'contabilidad', label: 'Contabilidad', icon: '📈' },
  { key: 'rrhh', label: 'RRHH', icon: '👤' },
  { key: 'proyectos', label: 'Proyectos', icon: '📋' },
  { key: 'reportes', label: 'Reportes', icon: '📑' },
  { key: 'configuracion', label: 'Configuración', icon: '⚙️' },
  { key: 'facturacion', label: 'Facturación', icon: '🧾' },
];

// The matrix of the roles does not live here any more: the API answers what
// each caller may do (GET /api/permissions/me) and the server resolves the
// union of the permissions of the roles.
