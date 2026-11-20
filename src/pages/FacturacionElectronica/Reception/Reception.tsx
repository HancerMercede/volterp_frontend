import { useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useReceivedElectronicInvoiceStore } from "../../../stores/receivedElectronicInvoiceStore";
import { useUIStore } from "../../../stores/uiStore";
import {
  Button,
  DynamicFormFields,
  Modal,
  PageHeader,
  VolterpMark,
} from "../../../components/UI";
import { useCrudForm, type FormField } from "../../../hooks/useCrudForm";
import { usePermission } from "../../../hooks/usePermission";
import styles from "./Reception.module.css";

type ReceptionFormValues = {
  invoiceId: string;
  decision: string;
  reason: string;
};

const APPROVED = "approved";
const REJECTED = "rejected";

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

/**
 * Commercial approval of the third party e-CF the tenant receives
 * (task T9).
 *
 * There is no listing reachable from the browser: the real reception
 * endpoints require a client TLS certificate (mTLS). The only browser
 * endpoint is the commercial approval, so the screen asks for the id of
 * the received document and shows the DTO the backend answers with. No
 * list and no search are invented here.
 */
export const Reception: FC = () => {
  const { t } = useTranslation();
  const { canRead, canWrite } = usePermission();
  const { decision: lastDecision, decideCommercialApproval } =
    useReceivedElectronicInvoiceStore();
  const { addToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);

  const canManage = canRead("facturacion");

  const RECEPTION_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "invoiceId",
        label: t("facturacion.reception.invoiceId"),
        type: "text",
        required: true,
        section: "formSections.info",
        span: 6,
      },
      {
        name: "decision",
        label: t("facturacion.reception.decision"),
        type: "select",
        required: true,
        options: [
          { value: APPROVED, label: t("facturacion.reception.approve") },
          { value: REJECTED, label: t("facturacion.reception.reject") },
        ],
        section: "formSections.info",
        span: 6,
      },
      {
        name: "reason",
        label: t("facturacion.common.reason"),
        type: "textarea",
        section: "formSections.info",
        span: 6,
      },
    ],
    [t],
  );

  const form = useCrudForm<ReceptionFormValues>({
    fields: RECEPTION_FIELDS,
    defaultValues: {
      invoiceId: "",
      decision: APPROVED,
      reason: "",
    },
    onCreate: async (data) => {
      // The reason is required by the backend when the document is
      // rejected; the frontend does not duplicate that rule, it shows the
      // error the backend answers with.
      await decideCommercialApproval(data.invoiceId, {
        approved: data.decision === APPROVED,
        reason: data.reason,
      });
    },
    onUpdate: async () => {
      // A commercial approval is recorded once: the backend exposes no
      // update endpoint for it.
      throw new Error(
        "Commercial approvals cannot be updated: the backend exposes no update endpoint",
      );
    },
    onSuccess: () => {
      setShowForm(false);
      addToast(t("facturacion.reception.success"), "success");
    },
  });

  const detailRows = lastDecision
    ? [
        {
          label: t("facturacion.common.issuerTaxId"),
          value: lastDecision.issuerTaxId,
        },
        {
          label: t("facturacion.common.receiverTaxId"),
          value: lastDecision.receiverTaxId,
        },
        { label: t("facturacion.common.encf"), value: lastDecision.encf },
        {
          label: t("facturacion.common.documentType"),
          value: lastDecision.documentType,
        },
        {
          label: t("facturacion.common.signedAt"),
          value: formatDateTime(lastDecision.signedAt),
        },
        {
          label: t("facturacion.common.receivedAt"),
          value: formatDateTime(lastDecision.receivedAt),
        },
        {
          label: t("facturacion.reception.approvalStatus"),
          value: lastDecision.approvalStatus,
        },
        {
          label: t("facturacion.reception.approvalDecidedBy"),
          value:
            lastDecision.approvalDecidedBy ?? t("facturacion.common.unknown"),
        },
        {
          label: t("facturacion.reception.approvalDecidedAt"),
          value: lastDecision.approvalDecidedAt
            ? formatDateTime(lastDecision.approvalDecidedAt)
            : t("facturacion.common.unknown"),
        },
        {
          label: t("facturacion.reception.approvalReason"),
          value: lastDecision.approvalReason ?? t("facturacion.common.unknown"),
        },
        {
          label: t("facturacion.reception.alreadyReceived"),
          value: lastDecision.alreadyReceived
            ? t("common.yes")
            : t("common.no"),
        },
      ]
    : [];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("facturacion.reception.title")}
        subtitle={t("facturacion.reception.subtitle")}
      >
        {canManage && canWrite("facturacion") && (
          <Button
            onClick={() => {
              form.reset();
              setShowForm(true);
            }}
          >
            + {t("facturacion.reception.submit")}
          </Button>
        )}
      </PageHeader>

      {!canManage ? (
        <p className={styles.empty}>{t("permissions.noPermission")}</p>
      ) : detailRows.length === 0 ? (
        <p className={styles.empty}>{t("facturacion.reception.empty")}</p>
      ) : (
        <section className={styles.result}>
          <h2 className={styles.resultTitle}>
            {t("facturacion.reception.title")}
          </h2>
          <dl className={styles.resultList}>
            {detailRows.map((row) => (
              <div key={row.label} className={styles.resultRow}>
                <dt className={styles.resultLabel}>{row.label}</dt>
                <dd className={styles.resultValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        size="lg"
        icon={<VolterpMark size={40} />}
        title={t("facturacion.reception.submit")}
        subtitle={t("facturacion.reception.subtitle")}
        footerStatus={
          form.isDirty
            ? t("common.unsavedChanges")
            : t("common.noPendingChanges")
        }
        dirty={form.isDirty}
        error={form.submitError}
        noValidate
        onSubmit={form.handleSubmit}
        submitLabel={t("facturacion.reception.submit")}
        submitVariant="dark"
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <DynamicFormFields
          fields={RECEPTION_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>
    </div>
  );
};
