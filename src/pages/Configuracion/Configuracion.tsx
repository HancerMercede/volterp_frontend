import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, Button } from '../../components/UI';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';
import { UserManagement } from '../../components/UserManagement/UserManagement';
import { Empresas } from './Empresas';
import styles from './Configuracion.module.css';

export function Configuracion() {
  const { t } = useTranslation();
  const { isAdmin } = usePermission();
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'companies'>('general');

  const [empresa, setEmpresa] = useState({
    nombre: 'HM Software Solutions',
    rnc: 'HM123456789',
    telefono: '809-123-4567',
    email: 'admin@hm.com',
    direccion: 'Santo Domingo, República Dominicana',
  });

  const [config, setConfig] = useState({
    iva: 18,
    moneda: 'DOP',
    zonaHoraria: 'America/Santo_Domingo',
  });

  return (
    <div>
      <PageHeader title={t('configuracion.title')} subtitle={t('configuracion.subtitle')} />

      {isAdmin && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'companies' ? styles.active : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            {t('empresas.title')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            {t('configuracion.users')}
          </button>
        </div>
      )}

      {activeTab === 'general' && (
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
      )}

      {activeTab === 'companies' && <Empresas />}

      {activeTab === 'users' && <UserManagement />}
    </div>
  );
}