import { useAuthStore } from '../stores/authStore';
import { MATRIZ_PERMISOS, type Modulo, type PermisosModulo } from '../domain/constants/permisos';
import { Rol, Permiso } from '../domain/constants/roles';

interface UsePermissionResult {
  hasPermission: (modulo: Modulo, permiso: Permiso) => boolean;
  canRead: (modulo: Modulo) => boolean;
  canWrite: (modulo: Modulo) => boolean;
  canDelete: (modulo: Modulo) => boolean;
  getModulePermissions: (modulo: Modulo) => PermisosModulo | undefined;
  isAdmin: boolean;
  userRole: Rol | null;
}

export function usePermission(): UsePermissionResult {
  const { user } = useAuthStore();

  const userRole = user?.rol ? (user.rol as Rol) : null;
  const isAdmin = userRole === Rol.ADMIN;

  const hasPermission = (modulo: Modulo, permiso: Permiso): boolean => {
    if (!userRole) return false;
    return MATRIZ_PERMISOS[userRole]?.[modulo]?.[permiso] ?? false;
  };

  const canRead = (modulo: Modulo): boolean => hasPermission(modulo, Permiso.READ);
  const canWrite = (modulo: Modulo): boolean => hasPermission(modulo, Permiso.WRITE);
  const canDelete = (modulo: Modulo): boolean => hasPermission(modulo, Permiso.DELETE);

  const getModulePermissions = (modulo: Modulo): PermisosModulo | undefined => {
    if (!userRole) return undefined;
    return MATRIZ_PERMISOS[userRole]?.[modulo];
  };

  return {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getModulePermissions,
    isAdmin,
    userRole,
  };
}