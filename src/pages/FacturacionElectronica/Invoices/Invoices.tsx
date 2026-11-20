import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { useElectronicInvoiceStore } from "../../../stores/electronicInvoiceStore";
import { useUIStore } from "../../../stores/uiStore";
import {
  Button,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Table,
} from "../../../components/UI";
import { useFilter } from "../../../hooks/useFilter";
import { usePagination } from "../../../hooks/usePagination";
import { usePermission } from "../../../hooks/usePermission";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import { paginate } from "../../../utils/pagination";
import {
  EcfStatus,
  parseEcfStatus,
} from "../../../domain/constants/electronicInvoicing";
import type { ElectronicInvoiceStateDto } from "../../../domain/types";
import styles from "./Invoices.module.css";

/** The state surface is the only list of comprobantes the backend exposes. */
const STATE_SURFACE_LIMIT = 50;

/** The backend leaves a cell empty; the UI never invents a value for it. */
const EMPTY_CELL = "—";

const COUNT_CARDS = [
  { key: "pendingEmission", labelKey: "facturacion.invoices.counts.pendingEmission" },
  { key: "inProcess", labelKey: "facturacion.invoices.counts.inProcess" },
  { key: "rejected", labelKey: "facturacion.invoices.counts.rejected" },
  { key: "requiresReview", labelKey: "facturacion.invoices.counts.requiresReview" },
  { key: "total", labelKey: "facturacion.invoices.counts.total" },
] as const;

/**
 * Only a rejected comprobante or one the backend flagged for review can be
 * sent again; the parser guards the comparison against an invalid enum.
 */
function needsRetry(invoice: ElectronicInvoiceStateDto): boolean {
  return (
    parseEcfStatus(invoice.status) === EcfStatus.Rejected ||
    invoice.requiresReview
  );
}

export const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const { canWrite } = usePermission();
  const { addToast } = useUIStore();
  const {
    invoices,
    counts,
    loading,
    error,
    fetchStateSurface,
    retryInvoice,
    getQrSvg,
    getPrintableInvoice,
  } = useElectronicInvoiceStore();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [qrInvoice, setQrInvoice] = useState<ElectronicInvoiceStateDto | null>(
    null,
  );
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const qrUrlsRef = useRef<Record<string, string>>({});
  const printUrlsRef = useRef<string[]>([]);

  const { pageNumber, pageSize, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      await fetchStateSurface(STATE_SURFACE_LIMIT);
      if (ignore) return;
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [fetchStateSurface]);

  useEffect(() => {
    const qrEntries = qrUrlsRef.current;
    const printEntries = printUrlsRef.current;

    return () => {
      Object.values(qrEntries).forEach((url) => URL.revokeObjectURL(url));
      printEntries.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const filtered = useFilter({
    data: invoices,
    searchTerm,
    searchFields: (invoice) => [
      invoice.encf,
      invoice.documentType,
      invoice.status,
      invoice.fiscalState ?? "",
      invoice.verdictNote ?? "",
      invoice.lastError ?? "",
    ],
  });

  const pageItems = paginate(filtered, pageNumber, pageSize);

  const handleRetry = useCallback(
    async (invoice: ElectronicInvoiceStateDto) => {
      try {
        await retryInvoice(invoice.id);
        // The answer of the retry does not carry the whole state of the
        // comprobante (lastError, fiscalState, nextCheckAt), so the surface is
        // read again: the backend is the one that says how it really is.
        await fetchStateSurface(STATE_SURFACE_LIMIT);
        addToast(t("facturacion.invoices.retrySuccess"), "success");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : t("facturacion.messages.loadError"),
          "error",
        );
      }
    },
    [retryInvoice, fetchStateSurface, addToast, t],
  );

  const handleViewQr = useCallback(
    async (invoice: ElectronicInvoiceStateDto) => {
      try {
        const blob = await getQrSvg(invoice.id);
        const url = URL.createObjectURL(blob);
        const previous = qrUrlsRef.current[invoice.id];
        if (previous) URL.revokeObjectURL(previous);
        qrUrlsRef.current[invoice.id] = url;
        setQrUrls((current) => ({ ...current, [invoice.id]: url }));
        setQrInvoice(invoice);
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : t("facturacion.messages.loadError"),
          "error",
        );
      }
    },
    [getQrSvg, addToast, t],
  );

  const handlePrint = useCallback(
    async (invoice: ElectronicInvoiceStateDto) => {
      try {
        const blob = await getPrintableInvoice(invoice.id);
        const url = URL.createObjectURL(blob);
        printUrlsRef.current.push(url);
        window.open(url, "_blank", "noopener");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : t("facturacion.messages.loadError"),
          "error",
        );
      }
    },
    [getPrintableInvoice, addToast, t],
  );

  const columns = [
    { key: "encf", header: t("facturacion.common.encf") },
    { key: "documentType", header: t("facturacion.common.documentType") },
    { key: "status", header: t("facturacion.common.status") },
    {
      key: "fiscalState",
      header: t("facturacion.common.fiscalState"),
      render: (invoice: ElectronicInvoiceStateDto) =>
        invoice.fiscalState ?? EMPTY_CELL,
    },
    {
      key: "sentAt",
      header: t("facturacion.common.sentAt"),
      render: (invoice: ElectronicInvoiceStateDto) =>
        invoice.sentAt ?? EMPTY_CELL,
    },
    {
      key: "receivedAt",
      header: t("facturacion.common.receivedAt"),
      render: (invoice: ElectronicInvoiceStateDto) =>
        invoice.receivedAt ?? EMPTY_CELL,
    },
    {
      key: "nextCheckAt",
      header: t("facturacion.common.nextCheckAt"),
      render: (invoice: ElectronicInvoiceStateDto) =>
        invoice.nextCheckAt ?? EMPTY_CELL,
    },
    {
      key: "statusCheckCount",
      header: t("facturacion.common.statusCheckCount"),
    },
    {
      key: "requiresReview",
      header: t("facturacion.common.requiresReview"),
      render: (invoice: ElectronicInvoiceStateDto) =>
        invoice.requiresReview ? t("common.yes") : t("common.no"),
    },
    {
      key: "verdictNote",
      header: t("facturacion.common.verdict"),
      render: (invoice: ElectronicInvoiceStateDto) =>
        invoice.verdictNote ?? EMPTY_CELL,
    },
    {
      key: "lastError",
      header: t("facturacion.common.lastError"),
      render: (invoice: ElectronicInvoiceStateDto) =>
        invoice.lastError ?? EMPTY_CELL,
    },
    {
      key: "actions",
      header: t("facturacion.common.actions"),
      render: (invoice: ElectronicInvoiceStateDto) => (
        <div className={styles.rowActions}>
          {canWrite("facturacion") && needsRetry(invoice) && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => void handleRetry(invoice)}
            >
              {t("facturacion.invoices.retry")}
            </Button>
          )}
          <Button
            size="small"
            variant="secondary"
            onClick={() => void handleViewQr(invoice)}
          >
            {t("facturacion.invoices.viewQr")}
          </Button>
          <Button
            size="small"
            variant="secondary"
            title={t("facturacion.invoices.printOpen")}
            onClick={() => void handlePrint(invoice)}
          >
            {t("facturacion.invoices.print")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("facturacion.invoices.title")}
        subtitle={t("facturacion.invoices.subtitle")}
      />

      <div className={styles.counts}>
        {COUNT_CARDS.map((card) => (
          <div key={card.key} className={styles.countCard}>
            <span className={styles.countLabel}>{t(card.labelKey)}</span>
            <span className={styles.countValue}>{counts?.[card.key] ?? 0}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.searchBar}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            goToPage(1);
          }}
          placeholder={t("common.search")}
          width="240px"
        />
      </div>

      {loading && <p className={styles.loading}>{t("common.loading")}</p>}

      {invoices.length === 0 ? (
        <p className={styles.empty}>{t("facturacion.invoices.empty")}</p>
      ) : (
        <Table columns={columns} data={pageItems} />
      )}

      <Pagination pagination={getInfo(filtered.length)} onPageChange={goToPage} />

      <Modal
        isOpen={qrInvoice !== null}
        onClose={() => setQrInvoice(null)}
        title={t("facturacion.invoices.viewQr")}
        subtitle={qrInvoice?.encf}
        cancelLabel={t("common.close")}
        closeLabel={t("common.close")}
      >
        {qrInvoice && qrUrls[qrInvoice.id] && (
          <img
            className={styles.qrImage}
            src={qrUrls[qrInvoice.id]}
            alt={qrInvoice.encf}
          />
        )}
      </Modal>
    </div>
  );
};
