import { useTranslation } from 'react-i18next';
import { Users, Clock, Timer, BarChart3 } from 'lucide-react';
import { useAsistenciaStore } from '../../stores/asistenciaStore';
import styles from './AsistenciaComponents.module.css';

export function AsistenciaStats() {
  const { t } = useTranslation();
  const { getResumen, configuracion, toggleHabilitado } = useAsistenciaStore();
  const resumen = getResumen();

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <h3>{t('asistencia.attendanceStats')}</h3>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={configuracion.enabled}
            onChange={toggleHabilitado}
          />
          <span className={styles.toggleSlider}></span>
          <span className={styles.toggleLabel}>{t('asistencia.moduleEnabled')}</span>
        </label>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#DBEAFE' }}>
            <Users size={24} strokeWidth={1.5} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{resumen.empleadosHoy}/{resumen.totalEmpleados}</span>
            <span className={styles.statLabel}>{t('asistencia.employeesToday')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FEF3C7' }}>
            <Clock size={24} strokeWidth={1.5} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{resumen.tardanzasSemana}</span>
            <span className={styles.statLabel}>{t('asistencia.latesThisWeek')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FEE2E2' }}>
            <Timer size={24} strokeWidth={1.5} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{resumen.horasExtrasMes}h</span>
            <span className={styles.statLabel}>{t('asistencia.overtimeThisMonth')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#D1FAE5' }}>
            <BarChart3 size={24} strokeWidth={1.5} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{resumen.porcentajeAsistenciaMes}%</span>
            <span className={styles.statLabel}>{t('asistencia.attendanceRate')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}