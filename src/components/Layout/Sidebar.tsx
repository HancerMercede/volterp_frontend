import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { usePermission } from "../../hooks/usePermission";
import { usePermissionStore } from "../../stores/permissionStore";
import { ROL_LABELS } from "../../domain/constants/roles";
import { getFirstName } from "../../utils/name";
import { SideMenu, useMenuTree, type LeafProps } from "../SideMenu";
import { useMenuItems } from "../../application/hooks/useMenuItems";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { userRoles } = usePermission();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Los permisos del llamante: el menu lateral los filtra (los modulos sin
  // permiso desaparecen, y con ellos sus grupos), la app no los filtra otra
  // vez.
  const granted = usePermissionStore((state) => state.permissions);
  const permissions = useMemo(() => [...granted], [granted]);

  const { routes, groups } = useMenuItems();
  const { items, activeId } = useMenuTree(routes, { pathname, groups });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Las hojas las dibuja la app con su propio router: el modulo no conoce
  // ningun router.
  const renderLeaf = ({ item, active, disabled }: LeafProps) => {
    const content = (
      <>
        <span className={styles.navIcon}>{item.icon}</span>
        {item.label}
      </>
    );

    if (disabled) {
      return (
        <span
          className={`${styles.navLink} ${styles.navLinkDisabled}`}
          aria-disabled="true"
        >
          {content}
        </span>
      );
    }

    return (
      <NavLink
        to={item.href ?? "/"}
        // Cada hoja es una pantalla exacta: sin esto el enlace de un grupo
        // ("/contabilidad") tambien se markaria activo dentro de "/contabilidad/cuentas".
        end
        className={({ isActive }) =>
          `${styles.navLink} ${isActive || active ? styles.navLinkActive : ""}`
        }
      >
        {content}
      </NavLink>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src="/src/assets/logo.svg"
          alt="Logo"
          className={styles.logoIcon}
        />
        <span className={styles.logoText}>
          VOLT<span className={styles.logoTextAccent}> ERP</span>
        </span>
      </div>
      <div className={styles.navScroll}>
        <SideMenu
          items={items}
          activeId={activeId}
          permissions={permissions}
          renderLeaf={renderLeaf}
          ariaLabel={t("sidebar.menuLabel")}
          className={styles.navMenu}
        />
      </div>
      <div className={styles.userSection}>
        <div className={styles.user}>
          <img
            src={"https://i.pravatar.cc/150?img=68"}
            alt="Avatar"
            className={styles.avatarImg}
          />
          <div className={styles.userInfo}>
            <p className={styles.userName}>
              {getFirstName(user?.fullName) ||
                user?.username ||
                t("auth.username")}
            </p>
            <span className={styles.userRole}>
              {userRoles.length > 0
                ? userRoles.map((rol) => ROL_LABELS[rol]).join(", ")
                : "Usuario"}
            </span>
          </div>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title={t("auth.logout")}
        >
          <LogOut size={18} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
