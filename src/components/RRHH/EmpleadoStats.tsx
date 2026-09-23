import { useTranslation } from "react-i18next";
import { useEmpleadoStore } from "../../stores/empleadoStore";
import styles from "./EmpleadoStats.module.css";

export function EmpleadoStats() {
  const { t } = useTranslation();
  const { empleados } = useEmpleadoStore();
  const activos = empleados.filter((e) => e.status === "Active").length;
  const totalSalarios = empleados
    .filter((e) => e.status === "Active")
    .reduce((acc, e) => acc + e.salary, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.label}>{t("rrhh.totalEmployees")}</span>
        <span className={styles.value}>{empleados.length}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>{t("rrhh.activeEmployees")}</span>
        <span className={`${styles.value} ${styles.activo}`}>{activos}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>{t("rrhh.monthlyPayroll")}</span>
        <span className={styles.value}>{formatCurrency(totalSalarios)}</span>
      </div>
    </div>
  );
}
