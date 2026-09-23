import { useTranslation } from "react-i18next";
import type { EmployeeDto } from "../../domain/types";
import { getVacacionesAnuales } from "../../domain/entities/Beneficio";
import styles from "./BeneficiosSection.module.css";

interface Props {
  empleado: EmployeeDto;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");

export function BeneficiosSection({ empleado }: Props) {
  const { t } = useTranslation();
  const diasVacaciones = getVacacionesAnuales(empleado.hireDate);

  return (
    <div className={styles.container}>
      <h3>{t("rrhh.benefits")}</h3>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h4>{t("rrhh.vacations")}</h4>
          <div className={styles.vacacionesInfo}>
            <div className={styles.diasBig}>
              <span className={styles.number}>{diasVacaciones}</span>
              <span className={styles.label}>{t("rrhh.daysPerYear")}</span>
            </div>
            <div className={styles.details}>
              <p>
                {t("rrhh.accumulatedThisYear")}: <strong>{diasVacaciones}</strong>
              </p>
              <p>
                {t("rrhh.usedDays")}: <strong>0</strong>
              </p>
              <p>
                {t("rrhh.available")}: <strong>{diasVacaciones}</strong>
              </p>
            </div>
          </div>
          <div className={styles.antiguedad}>
            <span>
              {t("rrhh.senioritySince")}: {formatDate(empleado.hireDate)}
            </span>
          </div>
        </div>

        <div className={styles.card}>
          <h4>{t("rrhh.healthInsurance")}</h4>
          {empleado.ars ? (
            <div className={styles.seguroInfo}>
              <p><strong>{t("rrhh.ars")}:</strong> {empleado.ars}</p>
              <p><strong>{t("rrhh.nss")}:</strong> {empleado.nss}</p>
              <p className={styles.noActivo}>{t("rrhh.basicPlanActive")}</p>
            </div>
          ) : (
            <p className={styles.noData}>{t("rrhh.noHealthInsurance")}</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>{t("rrhh.afpPension")}</h4>
          {empleado.afp ? (
            <div className={styles.afpInfo}>
              <p><strong>{t("rrhh.afp")}:</strong> {empleado.afp}</p>
              <p><strong>{t("rrhh.afpNumber")}:</strong> {empleado.afpNumber ?? "-"}</p>
            </div>
          ) : (
            <p className={styles.noData}>{t("rrhh.noAfpRegistered")}</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>{t("rrhh.permits")}</h4>
          <div className={styles.permisosInfo}>
            <p className={styles.noData}>{t("rrhh.noRecentPermits")}</p>
            <div className={styles.resumen}>
              <span className={styles.badgeOk}>{t("rrhh.medical")}: 0</span>
              <span className={styles.badgeOk}>{t("rrhh.personalPermit")}: 0</span>
              <span className={styles.badgeOk}>{t("rrhh.bereavement")}: 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
