export const Rol = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  VENDEDOR: "vendedor",
  INVENTARIO: "inventario",
  CONTADOR: "contador",
  RRHH: "rrhh",
} as const;

export type Rol = (typeof Rol)[keyof typeof Rol];

export const Permiso = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
} as const;

export type Permiso = (typeof Permiso)[keyof typeof Permiso];

// The name the user sees for each role. A role is the function of a person
// (who sells, who counts) and not a module of the ERP (ventas, contabilidad):
// the roles were renamed so the two no longer look like the same thing.
export const ROL_LABELS: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: "Root",
  [Rol.ADMIN]: "Administrador",
  [Rol.VENDEDOR]: "Vendedor",
  [Rol.INVENTARIO]: "Inventario",
  [Rol.CONTADOR]: "Contador",
  [Rol.RRHH]: "Recursos Humanos",
};

export const ROL_COLORS: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: "#EF4444", // Red for super admin
  [Rol.ADMIN]: "#FACC15",
  [Rol.VENDEDOR]: "#10B981",
  [Rol.INVENTARIO]: "#3B82F6",
  [Rol.CONTADOR]: "#8B5CF6",
  [Rol.RRHH]: "#EC4899",
};

// Map integer from DB to string role
export const ROLE_NUMBER_TO_STRING: Record<number, Rol> = {
  1: Rol.SUPER_ADMIN,
  2: Rol.ADMIN,
  3: Rol.VENDEDOR,
  4: Rol.INVENTARIO,
  5: Rol.CONTADOR,
  6: Rol.RRHH,
};

// The backend sends the names of its roles in PascalCase ("SuperAdmin").
// A name that is not a role of the catalog is unknown, not "vendedor".
export function roleFromBackend(name: string): Rol | null {
  const normalized = name.toLowerCase() as Rol;
  return Object.values(Rol).includes(normalized) ? normalized : null;
}

// The roles a user holds. An unknown role is dropped and never turned into
// "vendedor": that would grant permissions the user does not have.
export function normalizeRoles(names: string[]): Rol[] {
  return names
    .map(roleFromBackend)
    .filter((role): role is Rol => role !== null);
}

// The name the backend expects on the wire.
export const ROL_TO_BACKEND: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: "SuperAdmin",
  [Rol.ADMIN]: "Admin",
  [Rol.VENDEDOR]: "Vendedor",
  [Rol.INVENTARIO]: "Inventario",
  [Rol.CONTADOR]: "Contador",
  [Rol.RRHH]: "RRHH",
};
