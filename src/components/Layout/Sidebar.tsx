import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const navItems = [
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Ventas", path: "/ventas", icon: "💰" },
  { label: "Compras", path: "/compras", icon: "🛒" },
  { label: "Inventario", path: "/inventario", icon: "📦" },
  { label: "Clientes", path: "/clientes", icon: "👥" },
  { label: "Proveedores", path: "/proveedores", icon: "🚚" },
  { label: "Contabilidad", path: "/contabilidad", icon: "💳" },
  { label: "RRHH", path: "/rrhh", icon: "👔" },
  { label: "Proyectos", path: "/proyectos", icon: "📋" },
  { label: "Reportes", path: "/reportes", icon: "📈" },
  { label: "Configuración", path: "/configuracion", icon: "⚙️" },
];

export function Sidebar() {
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
      </nav>
      <div className={styles.user}>
        <img
          src="https://i.pravatar.cc/150?img=68"
          alt="Avatar"
          className={styles.avatarImg}
        />
        <div className={styles.userInfo}>
          <p className={styles.userName}>Hancer Mercedes</p>
          <span className={styles.userRole}>Administrador</span>
        </div>
      </div>
    </aside>
  );
}
