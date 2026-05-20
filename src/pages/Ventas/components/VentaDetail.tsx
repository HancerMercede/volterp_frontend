import { useTranslation } from "react-i18next";
import { Button } from "../../../components/UI";
import type { SaleDto, Client } from "../../../domain/types";
import styles from "./VentaDetail.module.css";

interface Props {
  venta: SaleDto;
  cliente: Client | null;
  onClose: () => void;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString();

export function VentaDetail({ venta, cliente, onClose }: Props) {
  const { t } = useTranslation();

  const subtotal = venta.total / 1.18;
  const itbis = venta.total - subtotal;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t("ventas.saleDetail")} #{venta.id}</h2>
          <span className={`${styles.badge} ${styles[venta.status === "Completed" ? "completada" : "pendiente"]}`}>
            {venta.status === "Completed" ? t("ventas.completed") : t("ventas.pending")}
          </span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Client info */}
          <section className={styles.section}>
            <h3>{t("ventas.client")}</h3>
            {cliente ? (
              <div className={styles.clientInfo}>
                <img src={cliente.avatar} alt={cliente.nombre} className={styles.avatar} />
                <div>
                  <p className={styles.clientName}>{cliente.nombre}</p>
                  <p className={styles.clientEmail}>{cliente.email}</p>
                  {cliente.empresa && <p className={styles.clientEmpresa}>{cliente.empresa}</p>}
                </div>
              </div>
            ) : (
              <p>{venta.clienteName || "-"}</p>
            )}
          </section>

          {/* Sale items */}
          <section className={styles.section}>
            <h3>{t("ventas.items")} ({venta.items.length})</h3>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>{t("ventas.product")}</th>
                  <th>{t("ventas.quantity")}</th>
                  <th>{t("ventas.unitPrice")}</th>
                  <th>{t("common.subtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {venta.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className={styles.productCell}>
                        {item.productImageUrl && (
                          <img src={item.productImageUrl} alt={item.productName} className={styles.productImg} />
                        )}
                        <span>{item.productName}</span>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals breakdown */}
          <section className={styles.section}>
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>{t("common.subtotal")}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>{t("ventas.itbisLabel")}</span>
                <span>{formatCurrency(itbis)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                <span>{t("ventas.totalAmount")}</span>
                <span>{formatCurrency(venta.total)}</span>
              </div>
            </div>
          </section>

          {/* Notes */}
          {venta.notes && (
            <section className={styles.section}>
              <h3>{t("ventas.notes")}</h3>
              <p className={styles.notes}>{venta.notes}</p>
            </section>
          )}

          {/* Timestamps */}
          <section className={styles.section}>
            <div className={styles.timestamps}>
              <span>{t("ventas.createdAt")}: {formatDateTime(venta.createdAt)}</span>
              {venta.updatedAt && (
                <span>{t("ventas.updatedAt")}: {formatDateTime(venta.updatedAt)}</span>
              )}
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>{t("common.close")}</Button>
        </div>
      </div>
    </div>
  );
}