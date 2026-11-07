import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../../infrastructure/api/authService';
import styles from './ResetPassword.module.css';

type LinkState = 'checking' | 'valid' | 'invalid';

const MIN_PASSWORD_LENGTH = 6;

export function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [link, setLink] = useState<LinkState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/invalid-link', { replace: true });
      return;
    }

    // A response that lands after the user left must not hijack the navigation.
    let cancelled = false;

    const checkLink = async () => {
      try {
        const status = await authService.getLinkStatus(token, 'password-reset');
        if (cancelled) return;
        if (!status.valid) {
          setLink('invalid');
          navigate('/invalid-link', { replace: true });
          return;
        }
        setLink('valid');
      } catch {
        if (cancelled) return;
        setLink('invalid');
        navigate('/invalid-link', { replace: true });
      }
    };

    void checkLink();

    return () => {
      cancelled = true;
    };
  }, [navigate, token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      setIsSuccess(true);
    } catch {
      setLink('invalid');
      navigate('/invalid-link', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (!token || link === 'invalid') {
    return null;
  }

  if (link === 'checking') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('auth.resetPasswordTitle')}</h1>
            <p className={styles.subtitle}>{t('auth.checkingLink')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('auth.resetPasswordSuccessTitle')}</h1>
            <p className={styles.subtitle}>{t('auth.resetPasswordSuccessBody')}</p>
          </div>
          <div className={styles.footer}>
            <Link className={styles.link} to="/login">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.resetPasswordTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.resetPasswordSubtitle')}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="new-password">
              {t('auth.newPassword')}
            </label>
            <input
              className={styles.input}
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword ? t('auth.hidePassword') : t('auth.showPassword')
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm-password">
              {t('auth.confirmPassword')}
            </label>
            <input
              className={styles.input}
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword ? t('auth.hidePassword') : t('auth.showPassword')
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submit} disabled={loading}>
{t('auth.resetPasswordSubmit')}
          </button>
        </form>

        <div className={styles.footer}>
          <Link className={styles.link} to="/login">
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
