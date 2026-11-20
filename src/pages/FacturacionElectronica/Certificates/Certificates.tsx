import { useEffect, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyCertificateStore } from "../../../stores/companyCertificateStore";
import { useUIStore } from "../../../stores/uiStore";
import {
  Button,
  DynamicFormFields,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Table,
  VolterpMark,
} from "../../../components/UI";
import { useCrudForm, type FormField } from "../../../hooks/useCrudForm";
import { usePagination } from "../../../hooks/usePagination";
import { usePermission } from "../../../hooks/usePermission";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import { parseEntityStatus } from "../../../domain/constants/electronicInvoicing";
import type {
  CompanyCertificate,
  CreateCompanyCertificateRequest,
} from "../../../domain/types";
import styles from "./Certificates.module.css";
import { useFilter } from "../../../hooks/useFilter";

type CertificateFormValues = {
  name: string;
  taxId: string;
  expiresAt: string;
  credential: string;
};

/**
 * The date input yields `YYYY-MM-DD` and the backend binds a `Date`, so the
 * value travels as an ISO 8601 date-time. The time is appended instead of
 * converted on purpose: a `new Date(...)` conversion would shift the day
 * depending on the timezone of the browser.
 */
function toBackendDate(value: string): string {
  if (!value) return value;
  return value.includes("T") ? value : `${value}T00:00:00`;
}

/**
 * Certificates the tenant signs with (task T7).
 *
 * The backend only exposes read and create: there is no update and no
 * delete endpoint, so the screen offers the upload and nothing else. The
 * credential is opaque — the backend encrypts it and never returns it — so
 * it is asked for once, at creation time, and never shown again.
 */
export const Certificates: FC = () => {
  const { t } = useTranslation();
  const { canRead, canWrite } = usePermission();
  const {
    certificates,
    loading,
    totalCount,
    fetchCertificates,
    addCertificate,
  } = useCompanyCertificateStore();
  const { addToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const canManage = canRead("facturacion");

  useEffect(() => {
    if (!canManage) return;

    let ignore = false;

    void (async () => {
      await fetchCertificates(pageNumber, ITEMS_PER_PAGE);
      if (ignore) return;
      const failure = useCompanyCertificateStore.getState().error;
      if (failure) addToast(failure, "error");
    })();

    return () => {
      ignore = true;
    };
  }, [addToast, canManage, fetchCertificates, pageNumber]);

  const CERTIFICATE_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: t("facturacion.common.name"),
        type: "text",
        required: true,
        section: "formSections.info",
        span: 6,
      },
      {
        name: "taxId",
        label: t("facturacion.common.taxId"),
        type: "text",
        required: true,
        section: "formSections.info",
        span: 3,
      },
      {
        name: "expiresAt",
        label: t("facturacion.common.expiresAt"),
        type: "date",
        required: true,
        section: "formSections.info",
        span: 3,
      },
      {
        name: "credential",
        label: t("facturacion.common.credential"),
        type: "textarea",
        required: true,
        section: "formSections.info",
        span: 6,
        hint: t("facturacion.settings.credentialSecretWarning"),
      },
    ],
    [t],
  );

  const form = useCrudForm<CertificateFormValues>({
    fields: CERTIFICATE_FIELDS,
    defaultValues: {
      name: "",
      taxId: "",
      expiresAt: "",
      credential: "",
    },
    onCreate: async (data) => {
      const payload: CreateCompanyCertificateRequest = {
        name: data.name,
        taxId: data.taxId,
        expiresAt: toBackendDate(data.expiresAt),
        credential: data.credential,
      };
      await addCertificate(payload);
    },
    onUpdate: async () => {
      // The backend exposes no update endpoint for certificates.
      throw new Error(
        "Certificates cannot be updated: the backend exposes no update endpoint",
      );
    },
    onSuccess: () => {
      setShowForm(false);
      addToast(t("facturacion.certificates.createSuccess"), "success");
      void fetchCertificates(pageNumber, ITEMS_PER_PAGE);
    },
  });

  const filteredCertificates = useFilter({
    data: certificates,
    searchTerm,
    searchFields: (certificate: CompanyCertificate) => [
      certificate.name,
      certificate.taxId,
    ],
  });

  const columns = [
    { key: "name", header: t("facturacion.common.name") },
    { key: "taxId", header: t("facturacion.common.taxId") },
    {
      key: "expiresAt",
      header: t("facturacion.common.expiresAt"),
      render: (certificate: CompanyCertificate) => (
        <span className={styles.expiresCell}>
          {new Date(certificate.expiresAt).toLocaleDateString()}
          {certificate.isExpired && (
            <span className={styles.expiredBadge}>
              {t("facturacion.certificates.expired")}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: t("facturacion.common.status"),
      render: (certificate: CompanyCertificate) => {
        // The raw value of the backend is the authority (S7); the parser is
        // only the guard against an enum that is not part of the contract.
        const isKnownStatus = parseEntityStatus(certificate.status) !== null;
        return (
          <span
            className={isKnownStatus ? styles.status : styles.statusUnknown}
          >
            {certificate.status || t("facturacion.common.unknown")}
          </span>
        );
      },
    },
  ];

  const paginationInfo = getInfo(totalCount);

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("facturacion.certificates.title")}
        subtitle={t("facturacion.certificates.subtitle")}
      >
        {canManage && canWrite("facturacion") && (
          <Button
            onClick={() => {
              form.reset();
              setShowForm(true);
            }}
          >
            + {t("facturacion.certificates.newCertificate")}
          </Button>
        )}
      </PageHeader>

      {!canManage ? (
        <p className={styles.empty}>{t("permissions.noPermission")}</p>
      ) : (
        <>
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

          {loading && certificates.length === 0 ? (
            <p className={styles.empty}>{t("common.loading")}</p>
          ) : filteredCertificates.length === 0 ? (
            <p className={styles.empty}>{t("facturacion.certificates.empty")}</p>
          ) : (
            <Table columns={columns} data={filteredCertificates} />
          )}

          <Pagination pagination={paginationInfo} onPageChange={goToPage} />
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        size="lg"
        icon={<VolterpMark size={40} />}
        title={t("facturacion.certificates.newCertificate")}
        subtitle={t("common.newRecordSubtitle")}
        footerStatus={
          form.isDirty
            ? t("common.unsavedChanges")
            : t("common.noPendingChanges")
        }
        dirty={form.isDirty}
        error={form.submitError}
        noValidate
        onSubmit={form.handleSubmit}
        submitLabel={t("common.create")}
        submitVariant="dark"
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <DynamicFormFields
          fields={CERTIFICATE_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>
    </div>
  );
};
