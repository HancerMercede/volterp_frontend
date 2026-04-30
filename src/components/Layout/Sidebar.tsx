import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const navItems = [
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Ventas", path: "/ventas", icon: "💰" },
  { label: "Compras", path: "/compras", icon: "🛒" },
  { label: "Inventario", path: "/inventario", icon: "📦" },
  { label: "Clientes", path: "/clientes", icon: "👥" },
  { label: "Reportes", path: "/reportes", icon: "📈" },
  { label: "Configuración", path: "/configuracion", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>M</span>
        Bohuco
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
            end={item.path === "/"}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.user}>
        <div className={styles.avatar}>HM</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Hancer Mercedes</p>
          <span className={styles.userRole}>Administrador</span>
        </div>
      </div>
    </aside>
  );
}
