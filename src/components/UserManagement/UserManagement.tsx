import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { userService } from '../../infrastructure/api/userService';
import type { UserDto, InviteUserRequest } from '../../domain/types';
import { resolveUserStatus, UserStatus } from '../../domain/constants/userStatus';
import {
  ROL_LABELS,
  ROL_COLORS,
  Rol,
  normalizeRole,
} from '../../domain/constants/roles';
import {
  Button,
  Modal,
  ConfirmModal,
  Pagination,
  ActionButtons,
} from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { useDeleteConfirm } from '../../hooks/useDeleteConfirm';
import { isForbidden } from '../../utils/apiError';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import styles from './UserManagement.module.css';

// Basic roles that all admins can assign
const BASIC_ROLES = [
  Rol.ADMIN,
  Rol.VENTAS,
  Rol.INVENTARIO,
  Rol.CONTABILIDAD,
  Rol.RRHH,
] as const;

// All roles including SuperAdmin (only for SuperAdmin)
const ALL_ROLES = [
  Rol.SUPER_ADMIN,
  Rol.ADMIN,
  Rol.VENTAS,
  Rol.INVENTARIO,
  Rol.CONTABILIDAD,
  Rol.RRHH,
] as const;

const INITIAL_INVITE: InviteUserRequest = {
  email: '',
  fullName: '',
  role: 'ventas',
  username: '',
};

const STATUS_LABEL_KEY: Record<UserStatus, string> = {
  [UserStatus.INVITED]: 'configuracion.userManagement.statusInvited',
  [UserStatus.ACTIVE]: 'configuracion.userManagement.statusActive',
  [UserStatus.INACTIVE]: 'configuracion.userManagement.statusInactive',
};

const STATUS_CLASS: Record<UserStatus, string> = {
  [UserStatus.INVITED]: styles.invited,
  [UserStatus.ACTIVE]: styles.active,
  [UserStatus.INACTIVE]: styles.inactive,
};

export function UserManagement() {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();
  const { addToast } = useUIStore();

  // Get current user role (normalized to lowercase)
  const currentRole = user?.role?.toLowerCase();
  console.log(currentRole);
  const isSuperAdmin = currentRole === Rol.SUPER_ADMIN;

  // SuperAdmin can assign all roles, Admin can only assign basic roles
  const availableRoles = isSuperAdmin ? ALL_ROLES : BASIC_ROLES;
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invite, setInvite] = useState<InviteUserRequest>(INITIAL_INVITE);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserDto | null>(
    null,
  );

  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const describeError = useCallback(
    (err: unknown, fallback: string) => {
      if (isForbidden(err)) return t('permissions.noPermission');
      return err instanceof Error && err.message ? err.message : fallback;
    },
    [t],
  );

  useEffect(() => {
    if (!token) return;

    async function loadUsers() {
      setLoading(true);
      setError('');
      try {
        const data = await userService.getUsers(pageNumber, ITEMS_PER_PAGE);
        setUsers(data.items);
        setTotalCount(data.rowCount);
        setPageCount(data.pageCount);
      } catch (err) {
        setError(describeError(err, 'Error loading users'));
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [token, pageNumber, reloadKey, describeError]);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await userService.inviteUser({
        email: invite.email,
        fullName: invite.fullName,
        role: invite.role,
        username: invite.username?.trim() || undefined,
      });
      setShowInviteModal(false);
      setInvite(INITIAL_INVITE);
      setReloadKey((key) => key + 1);
      addToast(t('configuracion.userManagement.inviteSuccess'), 'success');
    } catch (err) {
      addToast(
        describeError(err, t('configuracion.userManagement.inviteError')),
        'error',
      );
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (!token) return;
    try {
      const updated = await userService.updateUserRole(userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError(describeError(err, 'Error updating role'));
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    if (!token) return;
    try {
      const updated = await userService.updateUserStatus(
        userId,
        !currentStatus,
      );
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError(describeError(err, 'Error updating status'));
    }
  }

  async function handleResendInvite(userId: string) {
    if (!token) return;
    try {
      await userService.resendInvitation(userId);
      addToast(t('configuracion.userManagement.resendInviteSuccess'), 'success');
    } catch (err) {
      addToast(
        describeError(err, t('configuracion.userManagement.resendInviteError')),
        'error',
      );
    }
  }

  async function handleSendPasswordReset() {
    if (!resetPasswordUser) return;
    try {
      await userService.sendPasswordReset(resetPasswordUser.id);
      addToast(t('configuracion.userManagement.resetPasswordSuccess'), 'success');
    } catch (err) {
      addToast(
        describeError(err, t('configuracion.userManagement.resetPasswordError')),
        'error',
      );
    }
  }

  const { showDeleteConfirm, deleteId, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: async (id) => {
        if (!token) throw new Error('No autenticado');
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      },
      successMessage: t('configuracion.userDeleted'),
    });

  const pendingUser = users.find((u) => u.id === deleteId) ?? null;

  const paginationInfo = getInfo(totalCount);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{t('configuracion.userManagement.title')}</h3>
        <Button onClick={() => setShowInviteModal(true)}>
          {t('configuracion.userManagement.invite')}
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>{t('common.loading')}</div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>{t('table.noData')}</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('common.user')}</th>
                <th>{t('common.email')}</th>
                <th>{t('common.name')}</th>
                <th>{t('configuracion.userManagement.role')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const status = resolveUserStatus(user);
                const role = normalizeRole(user.role);
                const isProtected =
                  role === Rol.ADMIN || role === Rol.SUPER_ADMIN;
                const isInvited = status === UserStatus.INVITED;

                return (
                  <tr key={user.id}>
                    <td className={styles.username}>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.fullName}</td>
                    <td>
                      <select
                        value={role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={styles.roleSelect}
                        style={{
                          borderColor: ROL_COLORS[role],
                          color: ROL_COLORS[role],
                        }}
                      >
                        {availableRoles.map((availableRole) => (
                          <option key={availableRole} value={availableRole}>
                            {ROL_LABELS[availableRole]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${STATUS_CLASS[status]}`}
                      >
                        {t(STATUS_LABEL_KEY[status])}
                      </span>
                    </td>
                    <td>
                      <ActionButtons
                        onToggle={
                          isInvited
                            ? undefined
                            : () => handleToggleStatus(user.id, user.isActive)
                        }
                        onResend={
                          isInvited ? () => handleResendInvite(user.id) : undefined
                        }
                        onResetPassword={
                          isInvited ? undefined : () => setResetPasswordUser(user)
                        }
                        onDelete={
                          isProtected ? undefined : () => handleDelete(user.id)
                        }
                        resendLabel={t('configuracion.userManagement.resendInvite')}
                        resetPasswordLabel={t(
                          'configuracion.userManagement.resetPassword',
                        )}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <Pagination pagination={paginationInfo} onPageChange={goToPage} />
      )}

      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title={t('configuracion.userManagement.inviteTitle')}
        subtitle={t('configuracion.userManagement.inviteSubtitle')}
        onSubmit={handleInvite}
        submitLabel={t('configuracion.userManagement.inviteSend')}
        cancelLabel={t('common.cancel')}
      >
        <div className={styles.formGroup}>
          <label htmlFor="invite-email">{t('common.email')}</label>
          <input
            id="invite-email"
            type="email"
            value={invite.email}
            onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="invite-full-name">{t('common.name')}</label>
          <input
            id="invite-full-name"
            type="text"
            value={invite.fullName}
            onChange={(e) =>
              setInvite({ ...invite, fullName: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="invite-role">
            {t('configuracion.userManagement.role')}
          </label>
          <select
            id="invite-role"
            value={invite.role}
            onChange={(e) => setInvite({ ...invite, role: e.target.value })}
            required
          >
            {availableRoles.map((availableRole) => (
              <option key={availableRole} value={availableRole}>
                {ROL_LABELS[availableRole]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="invite-username">{t('auth.username')}</label>
          <input
            id="invite-username"
            type="text"
            value={invite.username ?? ''}
            onChange={(e) =>
              setInvite({ ...invite, username: e.target.value })
            }
          />
          <span className={styles.hint}>
            {t('configuracion.userManagement.usernameHint')}
          </span>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={resetPasswordUser !== null}
        onConfirm={handleSendPasswordReset}
        onCancel={() => setResetPasswordUser(null)}
        title={t('configuracion.userManagement.resetPasswordConfirmTitle')}
        message={t('configuracion.userManagement.resetPasswordConfirmBody', {
          email: resetPasswordUser?.email ?? '',
        })}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant="warning"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={`${t('common.delete')} ${t('common.user')}`}
        message={t('configuracion.deleteUserConfirm')}
        confirmLabel={t('common.confirmDeleteAction')}
        cancelLabel={t('common.cancel')}
        context={
          pendingUser
            ? {
                title: `${t('common.user')} ${pendingUser.fullName}`,
                subtitle: [pendingUser.username, String(pendingUser.role)]
                  .filter(Boolean)
                  .join(' · '),
              }
            : undefined
        }
      />
    </div>
  );
}
