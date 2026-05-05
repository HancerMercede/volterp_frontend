import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useTokenExpiry } from '../../hooks/useTokenExpiry';
import styles from './Layout.module.css';

export function Layout() {
  const location = useLocation();

  // Mounts proactive timer + reactive 401 listener for auto-logout
  useTokenExpiry();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const main = document.querySelector(`.${styles.main}`);
    if (main) {
      main.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className={styles.appWrapper}>
      <div className={styles.appContainer}>
        <div className={styles.layout}>
          <Sidebar />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}