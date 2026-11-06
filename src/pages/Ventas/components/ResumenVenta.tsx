import { useTranslation } from "react-i18next";
import { FileText, CheckCircle, Save } from "lucide-react";
import { Button } from "../../../components/UI";
import { money } from "../../../utils/currency";
import styles from "./ResumenVenta.module.css";

interface Props {
  subtotal: number;
  itbis: number;
  total: number;
  totalItems: number;
  ventaEstado: "pendiente" | "completada";
  onEstadoChange: (estado: "pendiente" | "completada") => void;
  onCompletarVenta: () => void;
  onGuardarBorrador: () => void;
  onCancelar: () => void;
}

export function ResumenVenta({
  subtotal,
  itbis,
  total,
  ventaEstado,
  onEstadoChange,
  onCompletarVenta,
  onGuardarBorrador,
  onCancelar,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.panel}>
      <h3><FileText size={20} strokeWidth={1.8} /> {t("ventas.summary")}</h3>

      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>{t("common.subtotal")}</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>{t("ventas.itbisLabel")}</span>
          <span>{money(itbis)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.totalFinal}`}>
          <span>{t("ventas.totalAmount")}</span>
          <span>{money(total)}</span>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>{t("common.status")}</label>
        <select
          value={ventaEstado}
          onChange={(e) =>
            onEstadoChange(e.target.value as "pendiente" | "completada")
          }
        >
          <option value="pendiente">{t("ventas.pending")}</option>
          <option value="completada">{t("ventas.completed")}</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>{t("common.date")}</label>
        <input
          type="text"
          value={new Date().toISOString().split("T")[0]}
          disabled
        />
      </div>

      <Button onClick={onCompletarVenta} className={styles.completeBtn}>
        <CheckCircle size={18} strokeWidth={1.8} /> {t("ventas.checkout")}
      </Button>
      <Button variant="secondary" onClick={onGuardarBorrador}>
        <Save size={18} strokeWidth={1.8} /> {t("ventas.saveDraft")}
      </Button>
      <Button variant="secondary" onClick={onCancelar}>
        {t("common.cancel")}
      </Button>
    </div>
  );
}