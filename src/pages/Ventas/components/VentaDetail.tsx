import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Clock, Copy, Package, RefreshCw } from "lucide-react";
import { Button, Modal, VolterpMark } from "../../../components/UI";
import { useClienteStore } from "../../../stores/clienteStore";
import { useUIStore } from "../../../stores/uiStore";
import { electronicInvoiceService } from "../../../infrastructure/api/electronicInvoiceService";
import { initialsOf } from "../../../utils/initials";
import { money } from "../../../utils/currency";
import {
  FISCAL_STATE_PALETTE,
  FISCAL_STATE_VOCABULARY,
  type ElectronicInvoiceDto,
  type SaleDto,
} from "../../../domain/types";
import styles from "./VentaDetail.module.css";

interface Props {
  venta: SaleDto;
  clienteId: string | null;
  onClose: () => void;
}

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function VentaDetail({ venta, clienteId, onClose }: Props) {
  const { t } = useTranslation();
  const { clientes } = useClienteStore();
  const { addToast } = useUIStore();
  const cliente = clienteId
    ? (clientes.find((c) => c.id === clienteId) ?? null)
    : null;

  const [invoice, setInvoice] = useState<ElectronicInvoiceDto | null>(null);
  const [qrObjectUrl, setQrObjectUrl] = useState<string | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [fiscalError, setFiscalError] = useState<string | null>(null);

  // The document of the sale: its state and its verdict are read once, when
  // the detail opens.
  useEffect(() => {
    const invoiceId = venta.electronicInvoiceId;
    if (!invoiceId) {
      setInvoice(null);
      setFiscalError(null);
      return;
    }

    let cancelled = false;
    setLoadingInvoice(true);
    setFiscalError(null);

    electronicInvoiceService
      .getById(invoiceId)
      .then((loaded) => {
        if (!cancelled) setInvoice(loaded);
      })
      .catch(() => {
        if (!cancelled) setFiscalError(t("ventas.fiscalLoadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoadingInvoice(false);
      });

    return () => {
      cancelled = true;
    };
  }, [venta.electronicInvoiceId, t]);

  const invoiceId = invoice?.id ?? null;

  // The QR is behind the authorization of the caller: it comes as a blob and
  // it lives as an object url while the detail is open.
  useEffect(() => {
    if (!invoiceId) {
      setQrObjectUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    electronicInvoiceService
      .getQrBlob(invoiceId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setQrObjectUrl(objectUrl);
      })
      .catch(() => {
        // The QR is a bonus: the section is complete without it.
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [invoiceId]);

  const subtotal = venta.total / 1.18;
  const itbis = venta.total - subtotal;
  const units = venta.items.reduce((sum, item) => sum + item.quantity, 0);
  const completed = venta.status === "Completed";
  const clientName = cliente?.name ?? venta.clienteName ?? "-";

  const fiscalVocabulary = invoice
    ? FISCAL_STATE_VOCABULARY[invoice.status]
    : null;
  const fiscalPalette = fiscalVocabulary
    ? FISCAL_STATE_PALETTE[fiscalVocabulary.color]
    : null;
  const verdict = invoice?.verdictNote ?? venta.fiscalNote ?? null;
  // A document that the DGII rejected, or that a human has to take, is
  // resolved from the sale: the user does not have to leave the screen.
  const canRetry =
    invoice?.status === "Rejected" ||
    invoice?.requiresReview === true ||
    venta.fiscalState === "Rejected" ||
    venta.fiscalState === "RequiresReview";

  const copyId = () => {
    navigator.clipboard?.writeText(venta.id);
  };

  const handleRetry = async () => {
    const documentId = invoice?.id ?? venta.electronicInvoiceId;
    if (!documentId) return;

    setRetrying(true);
    try {
      const updated = await electronicInvoiceService.retry(documentId);
      setInvoice(updated);
      addToast(t("ventas.retrySent"), "success");
    } catch {
      addToast(t("ventas.retryFailed"), "error");
    } finally {
      setRetrying(false);
    }
  };

  // TODO: the PDF action still goes through the print dialog; replace it with
  // the project PDF utility (template, pagination, branding) built for reports.
  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      icon={<VolterpMark size={40} />}
      title={`${t("ventas.saleDetail")} #${venta.code}`}
      badge={
        <span
          className={`${styles.statusBadge} ${
            completed ? styles.statusDone : styles.statusPending
          }`}
        >
          {completed ? (
            <Check size={13} strokeWidth={3} />
          ) : (
            <Clock size={13} strokeWidth={2.5} />
          )}
          {completed ? t("ventas.completed") : t("ventas.pending")}
        </span>
      }
      subtitle={`${t("ventas.createdAt")} ${formatDateTime(venta.createdAt)}`}
      footerActions={
        <Button variant="dark" accent onClick={() => window.print()}>
          {t("ventas.downloadPdf")}
        </Button>
      }
    >
      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.section}>
            <h4 className={styles.eyebrow}>{t("ventas.client")}</h4>
            <div className={styles.clientCard}>
              {cliente?.imageUrl ? (
                <img
                  src={cliente.imageUrl}
                  alt={clientName}
                  className={styles.clientAvatarImg}
                />
              ) : (
                <span className={styles.clientAvatar}>
                  {initialsOf(clientName)}
                </span>
              )}
              <div className={styles.clientInfo}>
                <p className={styles.clientName}>{clientName}</p>
                <p className={styles.clientMeta}>
                  {cliente?.email}
                  {cliente?.phone && ` · ${cliente.phone}`}
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h4 className={styles.eyebrow}>
              {t("ventas.items")} · {venta.items.length}
            </h4>
            <div className={styles.itemsCard}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>{t("ventas.product")}</th>
                    <th className={styles.num}>{t("ventas.quantity")}</th>
                    <th className={styles.num}>{t("ventas.unitPrice")}</th>
                    <th className={styles.num}>{t("common.subtotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.productCell}>
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className={styles.productImg}
                            />
                          ) : (
                            <span className={styles.productPlaceholder}>
                              <Package size={16} strokeWidth={1.6} />
                            </span>
                          )}
                          <div>
                            <p className={styles.productName}>
                              {item.productName}
                            </p>
                            {item.productCategory && (
                              <p className={styles.productCategory}>
                                {item.productCategory}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={styles.num}>{item.quantity}</td>
                      <td className={styles.num}>{money(item.unitPrice)}</td>
                      <td className={`${styles.num} ${styles.subtotal}`}>
                        {money(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {venta.electronicInvoiceId && (
            <section className={styles.section}>
              <h4 className={styles.eyebrow}>{t("ventas.fiscalDocument")}</h4>
              <div className={styles.itemsCard}>
                <div
                  style={{
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    {fiscalVocabulary && fiscalPalette && (
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: fiscalPalette.background,
                          color: fiscalPalette.color,
                        }}
                      >
                        {t(fiscalVocabulary.labelKey)}
                      </span>
                    )}
                    {loadingInvoice && !invoice && (
                      <span className={styles.productCategory}>
                        {t("common.loading")}
                      </span>
                    )}
                    {invoice?.encf && (
                      <span className={styles.productCategory}>
                        {t("ventas.fiscalEncf")} {invoice.encf}
                      </span>
                    )}
                  </div>

                  {invoice?.trackId && (
                    <div className={styles.detailRow}>
                      <span>{t("ventas.fiscalTrackId")}</span>
                      <span>{invoice.trackId}</span>
                    </div>
                  )}

                  {verdict && (
                    <div>
                      <p
                        className={styles.productCategory}
                        style={{ marginBottom: "4px" }}
                      >
                        {t("ventas.fiscalVerdict")}
                      </p>
                      <p className={styles.notes}>{verdict}</p>
                    </div>
                  )}

                  {fiscalError && <p className={styles.notes}>{fiscalError}</p>}

                  {(qrObjectUrl || canRetry) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      {qrObjectUrl && (
                        <img
                          src={qrObjectUrl}
                          alt={t("ventas.fiscalQr")}
                          style={{
                            width: "128px",
                            height: "128px",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            background: "#fff",
                          }}
                        />
                      )}
                      {canRetry && (
                        <Button
                          variant="dark"
                          onClick={handleRetry}
                          disabled={retrying}
                        >
                          <RefreshCw size={14} strokeWidth={2.2} />
                          {t("ventas.retryIssuance")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {venta.notes && (
            <section className={styles.section}>
              <h4 className={styles.eyebrow}>{t("ventas.notes")}</h4>
              <p className={styles.notes}>{venta.notes}</p>
            </section>
          )}
        </div>

        <aside className={styles.side}>
          <section className={styles.section}>
            <h4 className={styles.eyebrow}>{t("ventas.summary")}</h4>
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span>{t("common.subtotal")}</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t("ventas.itbisLabel")}</span>
                <span>{money(itbis)}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>{t("ventas.totalAmount")}</span>
                <strong>{money(venta.total)}</strong>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h4 className={styles.eyebrow}>{t("ventas.details")}</h4>
            <div className={styles.detailRow}>
              <span>{t("ventas.itemsCount")}</span>
              <span>
                {units} {t("ventas.units")}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span>{t("ventas.linesCount")}</span>
              <span>
                {venta.items.length} {t("ventas.productCount")}
              </span>
            </div>
            {venta.updatedAt && (
              <div className={styles.detailRow}>
                <span>{t("ventas.updatedAt")}</span>
                <span>{formatDateTime(venta.updatedAt)}</span>
              </div>
            )}
            <div className={styles.idChip}>
              <span className={styles.idText}>{venta.id}</span>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={copyId}
                title={t("ventas.copyId")}
                aria-label={t("ventas.copyId")}
              >
                <Copy size={13} strokeWidth={1.8} />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </Modal>
  );
}
