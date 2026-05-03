import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { usePermission } from "../../hooks/usePermission";
import { MODULOS } from "../../domain/constants/permisos";
import { ROL_LABELS } from "../../domain/constants/roles";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { canRead } = usePermission();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNavItems = MODULOS.filter(modulo => 
    canRead(modulo.key as any)
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src="/src/assets/logo.svg"
          alt="Logo"
          className={styles.logoIcon}
        />
        <span className={styles.logoText}>VOLTERP</span>
      </div>
      <nav className={styles.navScroll}>
        <nav className={styles.nav}>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={`/${item.key === 'dashboard' ? '' : item.key}`}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
              end={item.key === 'dashboard'}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </nav>
      <div className={styles.userSection}>
        <div className={styles.user}>
          <img
            src={user?.avatar || "https://i.pravatar.cc/150?img=68"}
            alt="Avatar"
            className={styles.avatarImg}
          />
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.nombre || 'Usuario'}</p>
            <span className={styles.userRole}>
              {user?.rol ? ROL_LABELS[user.rol as keyof typeof ROL_LABELS] || user.rol : 'Usuario'}
            </span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
          ⏻
        </button>
      </div>
    </aside>
  );
}
