import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, Button } from '../../components/UI';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';
import styles from './Configuracion.module.css';

export function Configuracion() {
  const { t } = useTranslation();
  const [empresa, setEmpresa] = useState({
    nombre: 'Mi Empresa',
    rnc: '123-456789-0',
    telefono: '809-123-4567',
    email: 'contacto@miempresa.com',
    direccion: 'Av. Principal 123, Santo Domingo',
  });

  const [config, setConfig] = useState({
    iva: 18,
    moneda: 'DOP',
    zonaHoraria: 'America/Santo_Domingo',
  });

  return (
    <div>
      <PageHeader title={t('configuracion.title')} subtitle={t('configuracion.subtitle')} />

      <div className={styles.sections}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('configuracion.companyData')}</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>{t('configuracion.companyName')}</label>
              <input
                type="text"
                value={empresa.nombre}
                onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('configuracion.companyRNC')}</label>
              <input
                type="text"
                value={empresa.rnc}
                onChange={(e) => setEmpresa({...empresa, rnc: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('configuracion.companyPhone')}</label>
              <input
                type="tel"
                value={empresa.telefono}
                onChange={(e) => setEmpresa({...empresa, telefono: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('configuracion.companyEmail')}</label>
              <input
                type="email"
                value={empresa.email}
                onChange={(e) => setEmpresa({...empresa, email: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('configuracion.companyAddress')}</label>
              <input
                type="text"
                value={empresa.direccion}
                onChange={(e) => setEmpresa({...empresa, direccion: e.target.value})}
              />
            </div>
            <Button>{t('common.save')}</Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('configuracion.generalSettings')}</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>{t('configuracion.ivaPercentage')}</label>
              <input
                type="number"
                value={config.iva}
                onChange={(e) => setConfig({...config, iva: parseInt(e.target.value)})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('configuracion.currency')}</label>
              <select
                value={config.moneda}
                onChange={(e) => setConfig({...config, moneda: e.target.value})}
              >
                <option value="DOP">{t('configuracion.currencyDOP')}</option>
                <option value="USD">{t('configuracion.currencyUSD')}</option>
                <option value="EUR">{t('configuracion.currencyEUR')}</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>{t('configuracion.timezone')}</label>
              <select
                value={config.zonaHoraria}
                onChange={(e) => setConfig({...config, zonaHoraria: e.target.value})}
              >
                <option value="America/Santo_Domingo">Santo Domingo (GMT-4)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>
            <Button>{t('common.save')}</Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('configuracion.language')}</h3>
          <div className={styles.form}>
            <LanguageSwitcher />
            <p className={styles.hint}>{t('configuracion.languageHint')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}