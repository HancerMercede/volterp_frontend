import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const navItems = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Ventas', path: '/ventas', icon: '💰' },
  { label: 'Compras', path: '/compras', icon: '🛒' },
  { label: 'Inventario', path: '/inventario', icon: '📦' },
  { label: 'Clientes', path: '/clientes', icon: '👥' },
  { label: 'Proveedores', path: '/proveedores', icon: '🚚' },
  { label: 'Contabilidad', path: '/contabilidad', icon: '💳' },
  { label: 'RRHH', path: '/rrhh', icon: '👔' },
  { label: 'Proyectos', path: '/proyectos', icon: '📋' },
  { label: 'Reportes', path: '/reportes', icon: '📈' },
  { label: 'Configuración', path: '/configuracion', icon: '⚙️' },
];

export function Layout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/src/assets/logo.svg" alt="Logo" className={styles.logoIcon} />
          Volterp
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              end={item.path === '/'}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
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
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}