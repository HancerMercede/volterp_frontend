import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../infrastructure/api/authService';
import styles from './ForgotPassword.module.css';

export function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword({ email });
      setIsSent(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message ? err.message : t('auth.genericError'),
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('auth.forgotPasswordSentTitle')}</h1>
            <p className={styles.subtitle}>{t('auth.forgotPasswordSentBody')}</p>
          </div>
          <div className={styles.form}>
            <button
              type="button"
              className={styles.submit}
              onClick={() => setIsSent(false)}
            >
              {t('auth.forgotPasswordResend')}
            </button>
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
          <h1 className={styles.title}>{t('auth.forgotPasswordTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              {t('auth.email')}
            </label>
            <input
              className={styles.input}
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.email')}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {t('auth.forgotPasswordSend')}
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
