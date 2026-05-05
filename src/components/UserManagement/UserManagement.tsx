import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { userService, type UserDto, type CreateUserRequest } from '../../infrastructure/api/userService';
import { ROL_LABELS, ROL_COLORS } from '../../domain/constants/roles';
import { Button, Modal } from '../../components/UI';
import styles from './UserManagement.module.css';

const ROLES = ['admin', 'ventas', 'inventario', 'contabilidad', 'rrhh'] as const;

export function UserManagement() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'User',
  });

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  async function loadUsers() {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await userService.getUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const created = await userService.createUser(token, { ...newUser, role: newUser.role === 'User' ? 'User' : newUser.role });
      setUsers([...users, created]);
      setShowCreateModal(false);
      setNewUser({ username: '', password: '', email: '', fullName: '', role: 'User' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating user');
    }
  }

  async function handleRoleChange(userId: number, newRole: string) {
    if (!token) return;
    try {
      const updated = await userService.updateUserRole(token, userId, newRole);
      setUsers(users.map(u => u.id === userId ? updated : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating role');
    }
  }

  async function handleToggleStatus(userId: number, currentStatus: boolean) {
    if (!token) return;
    try {
      const updated = await userService.updateUserStatus(token, userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? updated : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status');
    }
  }

  async function handleDelete(userId: number) {
    if (!token || !confirm('¿Eliminar este usuario?')) return;
    try {
      await userService.deleteUser(token, userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Gestión de Usuarios</h3>
        <Button onClick={() => setShowCreateModal(true)}>+ Nuevo Usuario</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>No hay usuarios registrados</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className={styles.username}>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName}</td>
                  <td>
                    <select
                      value={user.role.toLowerCase()}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={styles.roleSelect}
                      style={{ 
                        borderColor: ROL_COLORS[user.role.toLowerCase() as keyof typeof ROL_COLORS],
                        color: ROL_COLORS[user.role.toLowerCase() as keyof typeof ROL_COLORS]
                      }}
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{ROL_LABELS[role]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${user.isActive ? styles.active : styles.inactive}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        title={user.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {user.isActive ? '⛔' : '✅'}
                      </button>
                      {user.role.toLowerCase() !== 'admin' && (
                        <button
                          className={`${styles.iconBtn} ${styles.deleteBtn}`}
                          onClick={() => handleDelete(user.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Usuario"
        onSubmit={handleCreate}
        submitLabel="Crear"
        cancelLabel="Cancelar"
      >
        <div className={styles.formGroup}>
          <label>Usuario</label>
          <input
            type="text"
            value={newUser.username}
            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
            required
            minLength={3}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Nombre Completo</label>
          <input
            type="text"
            value={newUser.fullName}
            onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Contraseña</label>
          <input
            type="password"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            required
            minLength={6}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Rol</label>
          <select
            value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          >
            {ROLES.map(role => (
              <option key={role} value={role}>{ROL_LABELS[role]}</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}