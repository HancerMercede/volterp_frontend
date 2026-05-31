import { Rol, Permiso } from './roles';

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
  | 'configuracion';

export type PermisosModulo = Record<Permiso, boolean>;

export type MatrizPermisos = Record<Rol, Record<Modulo, PermisosModulo>>;

export const MATRIZ_PERMISOS: MatrizPermisos = {
  [Rol.SUPER_ADMIN]: {
    dashboard: { read: true, write: true, delete: true },
    ventas: { read: true, write: true, delete: true },
    compras: { read: true, write: true, delete: true },
    inventario: { read: true, write: true, delete: true },
    clientes: { read: true, write: true, delete: true },
    proveedores: { read: true, write: true, delete: true },
    contabilidad: { read: true, write: true, delete: true },
    rrhh: { read: true, write: true, delete: true },
    proyectos: { read: true, write: true, delete: true },
    reportes: { read: true, write: true, delete: true },
    configuracion: { read: true, write: true, delete: true },
  },
  [Rol.ADMIN]: {
    dashboard: { read: true, write: true, delete: true },
    ventas: { read: true, write: true, delete: true },
    compras: { read: true, write: true, delete: true },
    inventario: { read: true, write: true, delete: true },
    clientes: { read: true, write: true, delete: true },
    proveedores: { read: true, write: true, delete: true },
    contabilidad: { read: true, write: true, delete: true },
    rrhh: { read: true, write: true, delete: true },
    proyectos: { read: true, write: true, delete: true },
    reportes: { read: true, write: true, delete: true },
    configuracion: { read: true, write: true, delete: true },
  },
  [Rol.VENTAS]: {
    dashboard: { read: true, write: true, delete: false },
    ventas: { read: true, write: true, delete: false },
    compras: { read: false, write: false, delete: false },
    inventario: { read: false, write: false, delete: false },
    clientes: { read: true, write: true, delete: false },
    proveedores: { read: true, write: false, delete: false },
    contabilidad: { read: false, write: false, delete: false },
    rrhh: { read: false, write: false, delete: false },
    proyectos: { read: false, write: false, delete: false },
    reportes: { read: true, write: false, delete: false },
    configuracion: { read: false, write: false, delete: false },
  },
  [Rol.INVENTARIO]: {
    dashboard: { read: true, write: true, delete: false },
    ventas: { read: false, write: false, delete: false },
    compras: { read: true, write: true, delete: false },
    inventario: { read: true, write: true, delete: false },
    clientes: { read: false, write: false, delete: false },
    proveedores: { read: true, write: true, delete: false },
    contabilidad: { read: false, write: false, delete: false },
    rrhh: { read: false, write: false, delete: false },
    proyectos: { read: false, write: false, delete: false },
    reportes: { read: true, write: false, delete: false },
    configuracion: { read: false, write: false, delete: false },
  },
  [Rol.CONTABILIDAD]: {
    dashboard: { read: true, write: true, delete: false },
    ventas: { read: false, write: false, delete: false },
    compras: { read: false, write: false, delete: false },
    inventario: { read: false, write: false, delete: false },
    clientes: { read: false, write: false, delete: false },
    proveedores: { read: false, write: false, delete: false },
    contabilidad: { read: true, write: true, delete: false },
    rrhh: { read: false, write: false, delete: false },
    proyectos: { read: false, write: false, delete: false },
    reportes: { read: true, write: false, delete: false },
    configuracion: { read: false, write: false, delete: false },
  },
  [Rol.RRHH]: {
    dashboard: { read: true, write: true, delete: false },
    ventas: { read: false, write: false, delete: false },
    compras: { read: false, write: false, delete: false },
    inventario: { read: false, write: false, delete: false },
    clientes: { read: false, write: false, delete: false },
    proveedores: { read: false, write: false, delete: false },
    contabilidad: { read: false, write: false, delete: false },
    rrhh: { read: true, write: true, delete: false },
    proyectos: { read: false, write: false, delete: false },
    reportes: { read: true, write: false, delete: false },
    configuracion: { read: false, write: false, delete: false },
  },
};

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
];