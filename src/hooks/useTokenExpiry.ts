import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { msUntilExpiry } from '../utils/jwt';

/**
 * Mounts a proactive timer that auto-logouts the user when the JWT expires.
 * Also listens for the reactive 'auth:session-expired' event fired by fetchWithAuth
 * when a 401 is intercepted.
 *
 * Mount this hook ONCE in Layout.tsx so it's active for all protected routes.
 */
export function useTokenExpiry(): void {
  const { token, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const ms = msUntilExpiry(token);

    // Token already expired (e.g. restored from localStorage after long inactivity)
    if (ms <= 0) {
      logout();
      navigate('/login', { state: { expired: true } });
      return;
    }

    // Proactive timer — fires exactly when the token expires
    const timerId = setTimeout(() => {
      logout();
      navigate('/login', { state: { expired: true } });
    }, ms);

    // Reactive listener — fired by fetchWithAuth on 401
    const handleExpired = () => {
      clearTimeout(timerId);
      navigate('/login', { state: { expired: true } });
    };

    window.addEventListener('auth:session-expired', handleExpired);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('auth:session-expired', handleExpired);
    };
  }, [token, isAuthenticated, logout, navigate, t]);
}
