import type { EmployeeDto } from "../../domain/types";
import { getVacacionesAnuales } from "../../domain/entities/Beneficio";
import styles from "./BeneficiosSection.module.css";

interface Props {
  empleado: EmployeeDto;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");

export function BeneficiosSection({ empleado }: Props) {
  const diasVacaciones = getVacacionesAnuales(empleado.hireDate);

  return (
    <div className={styles.container}>
      <h3>Beneficios</h3>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h4>Vacaciones</h4>
          <div className={styles.vacacionesInfo}>
            <div className={styles.diasBig}>
              <span className={styles.number}>{diasVacaciones}</span>
              <span className={styles.label}>días anuales</span>
            </div>
            <div className={styles.details}>
              <p>Acumulados este año: <strong>{diasVacaciones}</strong></p>
              <p>Usados: <strong>0</strong></p>
              <p>Disponibles: <strong>{diasVacaciones}</strong></p>
            </div>
          </div>
          <div className={styles.antiguedad}>
            <span>Antigüedad desde: {formatDate(empleado.hireDate)}</span>
          </div>
        </div>

        <div className={styles.card}>
          <h4>Seguro Médico</h4>
          {empleado.ars ? (
            <div className={styles.seguroInfo}>
              <p><strong>ARS:</strong> {empleado.ars}</p>
              <p><strong>NSS:</strong> {empleado.nss}</p>
              <p className={styles.noActivo}>Plan básico activo</p>
            </div>
          ) : (
            <p className={styles.noData}>Sin seguro médico registrado</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>AFP - Pensión</h4>
          {empleado.afp ? (
            <div className={styles.afpInfo}>
              <p><strong>AFP:</strong> {empleado.afp}</p>
              <p><strong>Número:</strong> {empleado.afpNumber ?? "-"}</p>
            </div>
          ) : (
            <p className={styles.noData}>Sin AFP registrado</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>Permisos</h4>
          <div className={styles.permisosInfo}>
            <p className={styles.noData}>Sin permisos recientes</p>
            <div className={styles.resumen}>
              <span className={styles.badgeOk}>Médico: 0</span>
              <span className={styles.badgeOk}>Personal: 0</span>
              <span className={styles.badgeOk}>Luto: 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}