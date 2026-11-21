import { useTranslation } from "react-i18next";
import { FileText, CheckCircle, Save } from "lucide-react";
import { Button, SearchableSelect } from "../../../components/UI";
import { money } from "../../../utils/currency";
import styles from "./ResumenVenta.module.css";

export type DocumentoVenta = "consumo" | "credito" | "comercial";

interface Props {
  subtotal: number;
  itbis: number;
  total: number;
  /**
   * True when every line of the cart pays the 18% rate, so the label can
   * name it. A cart with an exempt line or with two rates pays several,
   * and the label says so.
   */
  itbisRateIsUniform: boolean;
  documento: DocumentoVenta;
  /** The state of the sale: a pending sale is a draft, it can keep growing. */
  estado: "pendiente" | "completada";
  onDocumentoChange: (documento: DocumentoVenta) => void;
  onCompletarVenta: () => void;
  onGuardarBorrador: () => void;
  onCancelar: () => void;
}

export function ResumenVenta({
  subtotal,
  itbis,
  total,
  itbisRateIsUniform,
  documento,
  estado,
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
          <span>
            {itbisRateIsUniform
              ? t("ventas.itbisLabel")
              : t("ventas.itbisLabelGeneric")}
          </span>
          <span>{money(itbis)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.totalFinal}`}>
          <span>{t("ventas.totalAmount")}</span>
          <span>{money(total)}</span>
        </div>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.estadoBadge}>
          {estado === "completada" ? t("ventas.completed") : t("ventas.pending")}
        </span>
        <SearchableSelect
          id="venta-documento"
          label={t("ventas.documentType")}
          options={[
            { value: "consumo", label: t("ventas.documentConsumption") },
            { value: "credito", label: t("ventas.documentFiscalCredit") },
            { value: "comercial", label: t("ventas.documentCommercial") },
          ]}
          value={documento}
          onChange={(value) => onDocumentoChange(value as DocumentoVenta)}
        />
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
