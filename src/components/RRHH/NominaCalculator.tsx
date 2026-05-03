import { useState } from "react";
import { Button } from "../../components/UI";
import { useNominaCalculator } from "../../application/hooks/useNominaCalculator";
import styles from "./NominaCalculator.module.css";

interface Props {
  salarioBase: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 2 }).format(amount);

export function NominaCalculator({ salarioBase }: Props) {
  const { bonificaciones, deducciones, calculo, updateBonificacion, reset } = useNominaCalculator(salarioBase);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>Calculadora de Nómina</h4>
        <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Ocultar" : "Ver Detalle"}
        </Button>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span>Salario Base</span>
          <span>{formatCurrency(salarioBase)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span>Total Bonificaciones</span>
          <span className={styles.bono}>+{formatCurrency(calculo.totalBonificaciones)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span>Total Deducciones</span>
          <span className={styles.deduccion}>-{formatCurrency(calculo.totalDeducciones)}</span>
        </div>
        <div className={`${styles.summaryItem} ${styles.total}`}>
          <span>Salario Neto</span>
          <span>{formatCurrency(calculo.salarioNeto)}</span>
        </div>
      </div>

      {isOpen && (
        <div className={styles.details}>
          <div className={styles.section}>
            <h5>Bonificaciones</h5>
            {bonificaciones.map((b) => (
              <div key={b.id} className={styles.row}>
                <span>{b.nombre}</span>
                <input
                  type="number"
                  value={b.monto}
                  onChange={(e) => updateBonificacion(b.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <h5>Deducciones</h5>
            {deducciones.map((d) => (
              <div key={d.id} className={styles.row}>
                <span>
                  {d.nombre}
                  {d.porcentaje && <small> ({d.porcentaje}%)</small>}
                </span>
                <span className={styles.montoFijo}>{formatCurrency(d.porcentaje ? (salarioBase * d.porcentaje) / 100 : d.monto)}</span>
              </div>
            ))}
          </div>

          <Button variant="secondary" onClick={reset}>Resetear</Button>
        </div>
      )}
    </div>
  );
}