export const Rol = {
  ADMIN: 'admin',
  VENTAS: 'ventas',
  INVENTARIO: 'inventario',
  CONTABILIDAD: 'contabilidad',
  RRHH: 'rrhh',
} as const;

export type Rol = typeof Rol[keyof typeof Rol];

export const Permiso = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
} as const;

export type Permiso = typeof Permiso[keyof typeof Permiso];

export const ROL_LABELS: Record<Rol, string> = {
  [Rol.ADMIN]: 'Administrador',
  [Rol.VENTAS]: 'Ventas',
  [Rol.INVENTARIO]: 'Inventario',
  [Rol.CONTABILIDAD]: 'Contabilidad',
  [Rol.RRHH]: 'Recursos Humanos',
};

export const ROL_COLORS: Record<Rol, string> = {
  [Rol.ADMIN]: '#FACC15',
  [Rol.VENTAS]: '#10B981',
  [Rol.INVENTARIO]: '#3B82F6',
  [Rol.CONTABILIDAD]: '#8B5CF6',
  [Rol.RRHH]: '#EC4899',
};