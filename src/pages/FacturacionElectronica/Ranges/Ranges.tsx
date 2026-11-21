import { useEffect, useMemo, useRef, useState } from "react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import { useElectronicInvoiceSequenceStore } from "../../../stores/electronicInvoiceSequenceStore";
import { useUIStore } from "../../../stores/uiStore";
import {
  Table,
  ActionButtons,
  Button,
  PageHeader,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
  DynamicFormFields,
  VolterpMark,
} from "../../../components/UI";
import { useCrudForm, type FormField } from "../../../hooks/useCrudForm";
import { usePagination } from "../../../hooks/usePagination";
import { usePermission } from "../../../hooks/usePermission";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import {
  ISSUABLE_DOCUMENT_TYPES,
  parseEcfDocumentType,
  type EcfDocumentType,
} from "../../../domain/constants/electronicInvoicing";
import type {
  ElectronicInvoiceSequence,
  RangeAnnulmentResult,
  SaveElectronicInvoiceSequenceRequest,
} from "../../../domain/types";
import styles from "./Ranges.module.css";
import { useFilter } from "../../../hooks/useFilter";

type RangeFormValues = {
  issuerTaxId: string;
  documentType: string;
  from: number;
  to: number;
  position: number;
  expiresAt: string;
};

/**
 * The type of comprobante travels as the backend names it (spec S7/S10).
 *
 * Only the types this company issues have a range: the reception types are
 * the sequences of the supplier.
 */
const DOCUMENT_TYPE_OPTIONS = ISSUABLE_DOCUMENT_TYPES.map((value) => ({
  value,
  label: value,
}));

/**
 * e-NCF ranges of the tenant (spec T6, S3/S6/S7/S11).
 *
 * The backend has no DELETE for ranges: the annulment is the only destructive
 * action, and it answers with the messages of the DGII, which are shown
 * literally (spec S7).
 */
export const Ranges: React.FC = () => {
  const { t } = useTranslation();
  const { canWrite, canDelete } = usePermission();
  const addToast = useUIStore((state) => state.addToast);
  const {
    sequences,
    loading,
    error,
    totalCount,
    fetchSequences,
    addSequence,
    updateSequence,
    annulSequence,
  } = useElectronicInvoiceSequenceStore();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [annulTarget, setAnnullTarget] = useState<ElectronicInvoiceSequence | null>(
    null,
  );
  const [annulResult, setAnnulResult] = useState<RangeAnnulmentResult | null>(
    null,
  );
  const [annulError, setAnnulError] = useState<string | null>(null);
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const pageRef = useRef(pageNumber);
  pageRef.current = pageNumber;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const requestedPage = pageNumber;
      await fetchSequences(requestedPage, ITEMS_PER_PAGE);
      if (cancelled) return;
      // The store keeps the last answer that lands: when the user already
      // moved to another page, ask again for the page that is on screen.
      if (requestedPage !== pageRef.current) {
        await fetchSequences(pageRef.current, ITEMS_PER_PAGE);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, fetchSequences]);

  const RANGE_FIELDS: FormField[] = useMemo(() => {
    // The backend rejects a change of the issuer, the type or the start of a
    // range, so those three are read-only while editing.
    const editing = mode === "edit";

    return [
      {
        name: "issuerTaxId",
        label: t("facturacion.common.issuerTaxId"),
        type: "text",
        required: true,
        readonly: editing,
        span: 3,
      },
      {
        name: "documentType",
        label: t("facturacion.common.documentType"),
        type: "select",
        required: true,
        readonly: editing,
        placeholder: t("facturacion.common.documentType"),
        options: DOCUMENT_TYPE_OPTIONS,
        span: 3,
      },
      {
        name: "from",
        label: t("facturacion.common.from"),
        type: "number",
        required: true,
        readonly: editing,
        min: 1,
        span: 3,
      },
      {
        name: "to",
        label: t("facturacion.common.to"),
        type: "number",
        required: true,
        min: 1,
        span: 3,
      },
      {
        name: "position",
        label: t("facturacion.common.position"),
        type: "number",
        required: true,
        min: 0,
        span: 3,
      },
      {
        name: "expiresAt",
        label: t("facturacion.common.expiresAt"),
        type: "date",
        span: 3,
      },
    ];
  }, [t, mode]);

  const buildRequest = (
    values: RangeFormValues,
  ): SaveElectronicInvoiceSequenceRequest => {
    const documentType = parseEcfDocumentType(values.documentType);
    if (!documentType) {
      throw new Error(
        "The document type of the range is not part of the e-CF contract.",
      );
    }

    return {
      issuerTaxId: values.issuerTaxId.trim(),
      documentType,
      from: values.from,
      to: values.to,
      position: values.position,
      expiresAt: values.expiresAt ? values.expiresAt : null,
    };
  };

  const form = useCrudForm<RangeFormValues>({
    fields: RANGE_FIELDS,
    defaultValues: {
      issuerTaxId: "",
      documentType: "",
      from: 0,
      to: 0,
      position: 0,
      expiresAt: "",
    },
    onCreate: async (data) => {
      await addSequence(buildRequest(data));
      addToast(t("facturacion.ranges.createSuccess"), "success");
    },
    onUpdate: async (id, data) => {
      await updateSequence(id, buildRequest(data));
      addToast(t("facturacion.ranges.updateSuccess"), "success");
    },
    onSuccess: () => {
      setShowForm(false);
      void fetchSequences(pageNumber, ITEMS_PER_PAGE);
    },
    // The DTO and the form do not match 1:1: the DTO carries the current
    // sequence where the form asks for the position, and the expiry date
    // arrives as a full timestamp where the input wants a plain date.
    mapEntityToForm: (entity) => ({
      issuerTaxId: String(entity.issuerTaxId ?? ""),
      documentType: String(entity.documentType ?? ""),
      from: Number(entity.from ?? 0),
      to: Number(entity.to ?? 0),
      position: Number(entity.currentSequence ?? 0),
      expiresAt: entity.expiresAt ? String(entity.expiresAt).slice(0, 10) : "",
    }),
  });

  const filteredSequences = useFilter({
    data: sequences,
    searchTerm,
    searchFields: (sequence: ElectronicInvoiceSequence) => [
      sequence.issuerTaxId,
      String(sequence.documentType),
    ],
  });

  const paginationInfo = getInfo(totalCount);

  const handleCreate = () => {
    setMode("create");
    form.reset();
    setShowForm(true);
  };

  const handleEdit = (sequence: ElectronicInvoiceSequence) => {
    setMode("edit");
    form.handleEdit(sequence, sequence.id);
    setShowForm(true);
  };

  const handleAnnul = (sequence: ElectronicInvoiceSequence) => {
    setAnnullTarget(sequence);
    setAnnulResult(null);
    setAnnulError(null);
  };

  const confirmAnnul = async () => {
    if (!annulTarget) return;

    try {
      const result = await annulSequence(annulTarget.id);
      setAnnulResult(result);
      setAnnulError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to annul the range";
      setAnnulResult(null);
      setAnnulError(message);
      addToast(message, "error");
    } finally {
      setAnnullTarget(null);
    }
  };

  const rangeLabel = (sequence: ElectronicInvoiceSequence) =>
    `${sequence.issuerTaxId} · ${sequence.from}-${sequence.to}`;

  const renderDocumentType = (raw: EcfDocumentType) => {
    const parsed = parseEcfDocumentType(raw);

    if (!parsed) {
      // The backend sent a value outside the contract: it is not
      // reinterpreted by the frontend, it is marked as unknown (spec S7/S10).
      return (
        <span title={String(raw)}>{t("facturacion.common.unknown")}</span>
      );
    }

    return <span>{String(raw)}</span>;
  };

  const columns = [
    { key: "issuerTaxId", header: t("facturacion.common.issuerTaxId") },
    {
      key: "documentType",
      header: t("facturacion.common.documentType"),
      render: (sequence: ElectronicInvoiceSequence) =>
        renderDocumentType(sequence.documentType),
    },
    {
      key: "from",
      header: t("facturacion.common.from"),
      render: (sequence: ElectronicInvoiceSequence) => String(sequence.from),
    },
    {
      key: "to",
      header: t("facturacion.common.to"),
      render: (sequence: ElectronicInvoiceSequence) => String(sequence.to),
    },
    {
      key: "currentSequence",
      header: t("facturacion.common.currentSequence"),
      render: (sequence: ElectronicInvoiceSequence) =>
        String(sequence.currentSequence),
    },
    {
      key: "expiresAt",
      header: t("facturacion.common.expiresAt"),
      render: (sequence: ElectronicInvoiceSequence) =>
        sequence.expiresAt
          ? sequence.expiresAt.slice(0, 10)
          : t("facturacion.common.noData"),
    },
    {
      key: "hasRoom",
      header: t("facturacion.common.hasRoom"),
      render: (sequence: ElectronicInvoiceSequence) =>
        sequence.hasRoom ? t("common.yes") : t("common.no"),
    },
    {
      key: "actions",
      header: t("facturacion.common.actions"),
      render: (sequence: ElectronicInvoiceSequence) => (
        <div className={styles.rowActions}>
          {canWrite("facturacion") && (
            <ActionButtons
              onEdit={() => handleEdit(sequence)}
              editLabel={t("common.edit")}
            />
          )}
          {canDelete("facturacion") && (
            <Button
              variant="ghost"
              size="small"
              aria-label={t("facturacion.ranges.annul")}
              onClick={() => handleAnnul(sequence)}
            >
              {t("facturacion.ranges.annul")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("facturacion.ranges.title")}
        subtitle={t("facturacion.ranges.subtitle")}
      >
        {canWrite("facturacion") && (
          <Button onClick={handleCreate}>
            + {t("facturacion.ranges.newRange")}
          </Button>
        )}
      </PageHeader>

      {error && (
        <div className={styles.error} role="alert">
          <span className={styles.errorTitle}>
            {t("facturacion.messages.loadError")}
          </span>
          <span>{error}</span>
        </div>
      )}

      {annulError && (
        <div className={styles.error} role="alert">
          <span className={styles.errorTitle}>
            {t("facturacion.messages.saveError")}
          </span>
          <span>{annulError}</span>
        </div>
      )}

      {annulResult && (
        <div className={styles.result} role="status">
          <p className={styles.resultTitle}>
            {t("facturacion.ranges.annulSuccess")}
          </p>
          {annulResult.code && (
            <p className={styles.resultMeta}>{annulResult.code}</p>
          )}
          {annulResult.name && (
            <p className={styles.resultMeta}>{annulResult.name}</p>
          )}
          <ul className={styles.resultMessages}>
            {annulResult.messages.map((message, index) => (
              <li key={`${index}-${message}`}>{message}</li>
            ))}
          </ul>
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

      {filteredSequences.length > 0 ? (
        <Table columns={columns} data={filteredSequences} />
      ) : (
        <p className={styles.empty}>
          {loading ? t("common.loading") : t("facturacion.ranges.empty")}
        </p>
      )}

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        size="lg"
        icon={<VolterpMark size={40} />}
        title={
          form.editingId
            ? t("facturacion.ranges.editRange")
            : t("facturacion.ranges.newRange")
        }
        subtitle={
          form.editingId
            ? form.values.issuerTaxId || t("common.newRecordSubtitle")
            : t("common.newRecordSubtitle")
        }
        footerStatus={
          form.isDirty
            ? t("common.unsavedChanges")
            : t("common.noPendingChanges")
        }
        dirty={form.isDirty}
        error={form.submitError}
        noValidate
        onSubmit={form.handleSubmit}
        submitLabel={
          form.editingId ? t("common.saveChanges") : t("common.create")
        }
        submitVariant="dark"
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <DynamicFormFields
          fields={RANGE_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>

      <ConfirmModal
        isOpen={annulTarget !== null}
        onConfirm={() => {
          void confirmAnnul();
        }}
        onCancel={() => setAnnullTarget(null)}
        variant="warning"
        title={t("facturacion.ranges.annul")}
        message={t("facturacion.ranges.annulConfirm", {
          range: annulTarget ? rangeLabel(annulTarget) : "",
        })}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
        context={
          annulTarget
            ? {
                title: rangeLabel(annulTarget),
                subtitle: String(annulTarget.documentType),
              }
            : undefined
        }
      />
    </div>
  );
};
