import { useMemo } from "react";
import { useAuthStore } from "../stores/authStore";
import { usePermissionStore } from "../stores/permissionStore";
import { type Modulo, type PermisosModulo } from "../domain/constants/permisos";
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
  /** The permissions are not in yet: the caller may do nothing. */
  isLoading: boolean;
}

export function usePermission(): UsePermissionResult {
  const { user } = useAuthStore();
  const permissions = usePermissionStore((state) => state.permissions);
  const status = usePermissionStore((state) => state.status);

  const userRoles = useMemo(
    () => normalizeRoles(user?.roles ?? []),
    [user?.roles],
  );
  const userRole = userRoles[0] ?? null;
  const isAdmin = userRoles.includes(Rol.SUPER_ADMIN);

  // The permissions come from the API, already united by the server: the
  // front asks what the caller may do, it does not decide it.
  const hasPermission = (modulo: Modulo, permiso: Permiso): boolean =>
    permissions.has(`${modulo}.${permiso}`);

  const canRead = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.READ);
  const canWrite = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.WRITE);
  const canDelete = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.DELETE);

  const getModulePermissions = (modulo: Modulo): PermisosModulo | undefined => {
    const granted = {
      read: canRead(modulo),
      write: canWrite(modulo),
      delete: canDelete(modulo),
    };

    if (!granted.read && !granted.write && !granted.delete) return undefined;

    return granted;
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
    isLoading: status === 'idle' || status === 'loading',
  };
}
