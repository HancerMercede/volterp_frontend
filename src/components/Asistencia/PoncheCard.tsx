import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, Coffee, FileText, type LucideIcon } from 'lucide-react';
import type { RegistroPonche } from '../../domain/entities/Asistencia';
import styles from './AsistenciaComponents.module.css';

interface PoncheCardProps {
  registro: RegistroPonche;
  nombreEmpleado?: string;
}

export function PoncheCard({ registro, nombreEmpleado }: PoncheCardProps) {
  const { t } = useTranslation();

  const getTipoIcon = (tipo: string): LucideIcon => {
    switch (tipo) {
      case 'entrada': return LogIn;
      case 'salida': return LogOut;
      case 'pausa': return Coffee;
      default: return FileText;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'a_tiempo': return '#22C55E';
      case 'tardanza': return '#FACC15';
      case 'ausencia': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const Icon = getTipoIcon(registro.tipo);

  return (
    <div className={styles.poncheCard}>
      <div className={styles.poncheIcon}>
        <span><Icon size={20} strokeWidth={1.8} /></span>
      </div>
      <div className={styles.poncheInfo}>
        <div className={styles.poncheHeader}>
          <span className={styles.poncheTipo}>
            {t(`asistencia.${registro.tipo}`)}
          </span>
          {nombreEmpleado && (
            <span className={styles.poncheEmpleado}>{nombreEmpleado}</span>
          )}
        </div>
        <div className={styles.poncheMeta}>
          <span className={styles.poncheHora}>{registro.hora}</span>
          <span className={styles.poncheFecha}>{registro.fecha}</span>
        </div>
      </div>
      <div
        className={styles.poncheEstado}
        style={{ background: getEstadoColor(registro.estado) }}
      >
        {t(`asistencia.${registro.estado === 'a_tiempo' ? 'onTime' : registro.estado}`)}
      </div>
    </div>
  );
}