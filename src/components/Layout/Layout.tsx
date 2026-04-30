import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const navItems = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Ventas', path: '/ventas', icon: '💰' },
  { label: 'Compras', path: '/compras', icon: '🛒' },
  { label: 'Inventario', path: '/inventario', icon: '📦' },
  { label: 'Clientes', path: '/clientes', icon: '👥' },
  { label: 'Reportes', path: '/reportes', icon: '📈' },
  { label: 'Configuración', path: '/configuracion', icon: '⚙️' },
];

export function Layout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>M</span>
          Mi Empresa
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
          <p className={styles.userName}>Juan Pérez</p>
          <span className={styles.userRole}>Administrador</span>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}