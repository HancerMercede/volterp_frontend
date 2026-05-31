export const Rol = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  VENTAS: "ventas",
  INVENTARIO: "inventario",
  CONTABILIDAD: "contabilidad",
  RRHH: "rrhh",
} as const;

export type Rol = (typeof Rol)[keyof typeof Rol];

export const Permiso = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
} as const;

export type Permiso = (typeof Permiso)[keyof typeof Permiso];

export const ROL_LABELS: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: "Root",
  [Rol.ADMIN]: "Administrador",
  [Rol.VENTAS]: "Ventas",
  [Rol.INVENTARIO]: "Inventario",
  [Rol.CONTABILIDAD]: "Contabilidad",
  [Rol.RRHH]: "Recursos Humanos",
};

export const ROL_COLORS: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: "#EF4444", // Red for super admin
  [Rol.ADMIN]: "#FACC15",
  [Rol.VENTAS]: "#10B981",
  [Rol.INVENTARIO]: "#3B82F6",
  [Rol.CONTABILIDAD]: "#8B5CF6",
  [Rol.RRHH]: "#EC4899",
};

// Map integer from DB to string role
export const ROLE_NUMBER_TO_STRING: Record<number, Rol> = {
  1: Rol.SUPER_ADMIN,
  2: Rol.ADMIN,
  3: Rol.VENTAS,
  4: Rol.INVENTARIO,
  5: Rol.CONTABILIDAD,
  6: Rol.RRHH,
};

// Helper to normalize role (number from DB or string to lowercase string)
export function normalizeRole(role: string | number): Rol {
  if (typeof role === "number") {
    return ROLE_NUMBER_TO_STRING[role] || Rol.VENTAS;
  }
  const normalized = role.toLowerCase() as Rol;
  return Object.values(Rol).includes(normalized) ? normalized : Rol.VENTAS;
}
