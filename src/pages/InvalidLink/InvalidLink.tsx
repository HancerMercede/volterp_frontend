import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './InvalidLink.module.css';

export function InvalidLink() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.invalidLinkTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.invalidLinkBody')}</p>
        </div>

        <div className={styles.form}>
          <Link className={styles.submit} to="/forgot-password">
            {t('auth.invalidLinkCta')}
          </Link>
          <div className={styles.footer}>
            <Link className={styles.link} to="/login">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
