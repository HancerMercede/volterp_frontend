import type { Empleado } from "../../domain/entities/Empleado";
import styles from "./EmpleadoStats.module.css";

interface Props {
  empleados: Empleado[];
}

export function EmpleadoStats({ empleados }: Props) {
  const activos = empleados.filter((e) => e.estado === "activo").length;
  const enVacaciones = empleados.filter((e) => e.estado === "vacaciones").length;
  const enLicencia = empleados.filter((e) => e.estado === "licencia").length;
  const totalSalarios = empleados
    .filter((e) => e.estado === "activo")
    .reduce((acc, e) => acc + e.salarioBase, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.label}>Total Empleados</span>
        <span className={styles.value}>{empleados.length}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>Activos</span>
        <span className={`${styles.value} ${styles.activo}`}>{activos}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>Nómina Mensual</span>
        <span className={styles.value}>{formatCurrency(totalSalarios)}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>En Vacaciones</span>
        <span className={`${styles.value} ${styles.vacaciones}`}>{enVacaciones}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>En Licencia</span>
        <span className={`${styles.value} ${styles.licencia}`}>{enLicencia}</span>
      </div>
    </div>
  );
}