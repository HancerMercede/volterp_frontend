import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { usePermission } from "../../hooks/usePermission";
import { MODULOS } from "../../domain/constants/permisos";
import { ROL_LABELS } from "../../domain/constants/roles";
import { getFirstName } from "../../utils/name";
import styles from "./Sidebar.module.css";

const MODULE_TRANSLATIONS: Record<string, string> = {
  dashboard: "sidebar.dashboard",
  ventas: "sidebar.ventas",
  compras: "sidebar.compras",
  inventario: "sidebar.inventario",
  clientes: "sidebar.clientes",
  proveedores: "sidebar.proveedores",
  contabilidad: "sidebar.contabilidad",
  rrhh: "sidebar.rrhh",
  proyectos: "sidebar.proyectos",
  reportes: "sidebar.reportes",
  configuracion: "sidebar.configuracion",
};

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { canRead } = usePermission();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleNavItems = MODULOS.filter((modulo) =>
    canRead(modulo.key as any),
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
              to={`/${item.key === "dashboard" ? "" : item.key}`}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
              end={item.key === "dashboard"}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {t(MODULE_TRANSLATIONS[item.key] || item.key)}
            </NavLink>
          ))}
          <NavLink
            to="/soporte"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            <span className={styles.navIcon}>💬</span>
            {t("sidebar.soporte")}
          </NavLink>
        </nav>
      </nav>
      <div className={styles.userSection}>
        <div className={styles.user}>
          <img
            src={"https://i.pravatar.cc/150?img=68"}
            alt="Avatar"
            className={styles.avatarImg}
          />
          <div className={styles.userInfo}>
            <p className={styles.userName}>
              {getFirstName(user?.fullName) || user?.username || t("auth.username")}
            </p>
            <span className={styles.userRole}>
              {user?.role
                ? ROL_LABELS[user.role as keyof typeof ROL_LABELS] || user.role
                : "Usuario"}
            </span>
          </div>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title={t("auth.logout")}
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
