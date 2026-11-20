import { useMemo } from "react";
import { useAuthStore } from "../stores/authStore";
import {
  MATRIZ_PERMISOS,
  type Modulo,
  type PermisosModulo,
} from "../domain/constants/permisos";
import { Permiso, Rol, normalizeRoles } from "../domain/constants/roles";

interface UsePermissionResult {
  hasPermission: (modulo: Modulo, permiso: Permiso) => boolean;
  canRead: (modulo: Modulo) => boolean;
  canWrite: (modulo: Modulo) => boolean;
  canDelete: (modulo: Modulo) => boolean;
  getModulePermissions: (modulo: Modulo) => PermisosModulo | undefined;
  isAdmin: boolean;
  /** The first role of the user: the one the screens show. */
  userRole: Rol | null;
  /** Every role the user holds. */
  userRoles: Rol[];
  hasRole: (role: Rol) => boolean;
}

export function usePermission(): UsePermissionResult {
  const { user } = useAuthStore();

  const userRoles = useMemo(
    () => normalizeRoles(user?.roles ?? []),
    [user?.roles],
  );
  const userRole = userRoles[0] ?? null;
  const isAdmin = userRoles.includes(Rol.SUPER_ADMIN);

  // The permissions of a user with N roles are the UNION of the permissions
  // of those roles.
  const hasPermission = (modulo: Modulo, permiso: Permiso): boolean =>
    userRoles.some((rol) => MATRIZ_PERMISOS[rol]?.[modulo]?.[permiso] ?? false);

  const canRead = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.READ);
  const canWrite = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.WRITE);
  const canDelete = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.DELETE);

  const getModulePermissions = (modulo: Modulo): PermisosModulo | undefined => {
    const granted = userRoles
      .map((rol) => MATRIZ_PERMISOS[rol]?.[modulo])
      .filter((permisos): permisos is PermisosModulo => permisos !== undefined);

    if (granted.length === 0) return undefined;

    return {
      read: granted.some((permisos) => permisos.read),
      write: granted.some((permisos) => permisos.write),
      delete: granted.some((permisos) => permisos.delete),
    };
  };

  const hasRole = (role: Rol): boolean => userRoles.includes(role);

  return {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getModulePermissions,
    isAdmin,
    userRole,
    userRoles,
    hasRole,
  };
}
