import { useTranslation } from "react-i18next";
import { FileText, CheckCircle, Save } from "lucide-react";
import { Button } from "../../../components/UI";
import { money } from "../../../utils/currency";
import styles from "./ResumenVenta.module.css";

export type DocumentoVenta = "consumo" | "credito" | "comercial";

interface Props {
  subtotal: number;
  itbis: number;
  total: number;
  documento: DocumentoVenta;
  onDocumentoChange: (documento: DocumentoVenta) => void;
  onCompletarVenta: () => void;
  onGuardarBorrador: () => void;
  onCancelar: () => void;
}

export function ResumenVenta({
  subtotal,
  itbis,
  total,
  documento,
  onDocumentoChange,
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
        <label>{t("ventas.documentType")}</label>
        <select
          value={documento}
          onChange={(e) =>
            onDocumentoChange(e.target.value as DocumentoVenta)
          }
        >
          <option value="consumo">{t("ventas.documentConsumption")}</option>
          <option value="credito">{t("ventas.documentFiscalCredit")}</option>
          <option value="comercial">{t("ventas.documentCommercial")}</option>
        </select>
        <span className={styles.hint}>{t("ventas.documentHint")}</span>
      </div>

      <Button onClick={onCompletarVenta} className={styles.completeBtn}>
        <CheckCircle size={18} strokeWidth={1.8} /> {t("ventas.checkout")}{" "}
        {money(total)}
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
