import { useEffect, useMemo, useRef, useState } from "react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import { useCompanyIssuerStore } from "../../../stores/companyIssuerStore";
import { useUIStore } from "../../../stores/uiStore";
import {
  Table,
  Button,
  PageHeader,
  Pagination,
  SearchInput,
  Modal,
  DynamicFormFields,
  VolterpMark,
} from "../../../components/UI";
import { useCrudForm, type FormField } from "../../../hooks/useCrudForm";
import { usePagination } from "../../../hooks/usePagination";
import { usePermission } from "../../../hooks/usePermission";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import type { CompanyIssuer } from "../../../domain/types";
import styles from "./Issuers.module.css";
import { useFilter } from "../../../hooks/useFilter";

type IssuerFormValues = {
  taxId: string;
  legalName: string;
  isActive: boolean;
};

/**
 * Issuers of the tenant (spec T5, S3/S6/S7/S11).
 *
 * The backend resolves the tenant from the JWT, so nothing here sends a
 * companyId (spec S6). The backend has no DELETE for issuers: the page only
 * creates and edits.
 */
export const Issuers: React.FC = () => {
  const { t } = useTranslation();
  const { canWrite } = usePermission();
  const addToast = useUIStore((state) => state.addToast);
  const {
    issuers,
    loading,
    error,
    totalCount,
    fetchIssuers,
    addIssuer,
    updateIssuer,
  } = useCompanyIssuerStore();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const pageRef = useRef(pageNumber);
  pageRef.current = pageNumber;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const requestedPage = pageNumber;
      await fetchIssuers(requestedPage, ITEMS_PER_PAGE);
      if (cancelled) return;
      // The store keeps the last answer that lands: when the user already
      // moved to another page, ask again for the page that is on screen.
      if (requestedPage !== pageRef.current) {
        await fetchIssuers(pageRef.current, ITEMS_PER_PAGE);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, fetchIssuers]);

  // The backend does not update the RNC of an issuer, so the edit form does
  // not offer it at all. The fields of each mode are declared apart on
  // purpose: the form validates every field it declares, hidden ones too.
  const ISSUER_FIELDS: FormField[] = useMemo(() => {
    if (mode === "edit") {
      return [
        {
          name: "legalName",
          label: t("facturacion.common.legalName"),
          type: "text",
          required: true,
          span: 3,
        },
        {
          name: "isActive",
          label: t("facturacion.common.isActive"),
          type: "checkbox",
          sidebar: true,
        },
      ];
    }

    return [
      {
        name: "taxId",
        label: t("facturacion.common.taxId"),
        type: "text",
        required: true,
        span: 3,
      },
      {
        name: "legalName",
        label: t("facturacion.common.legalName"),
        type: "text",
        required: true,
        span: 3,
      },
    ];
  }, [t, mode]);

  const form = useCrudForm<IssuerFormValues>({
    fields: ISSUER_FIELDS,
    defaultValues: {
      taxId: "",
      legalName: "",
      isActive: false,
    },
    onCreate: async (data) => {
      await addIssuer({
        taxId: data.taxId.trim(),
        legalName: data.legalName.trim(),
      });
      addToast(t("facturacion.issuers.createSuccess"), "success");
    },
    onUpdate: async (id, data) => {
      await updateIssuer(id, {
        legalName: data.legalName.trim(),
        isActive: data.isActive,
      });
      addToast(t("facturacion.issuers.updateSuccess"), "success");
    },
    onSuccess: () => {
      setShowForm(false);
      void fetchIssuers(pageNumber, ITEMS_PER_PAGE);
    },
    // The DTO and the form do not match 1:1: the RNC is not editable, so it
    // is not even mapped into the edit form.
    mapEntityToForm: (entity) => ({
      taxId: "",
      legalName: String(entity.legalName ?? ""),
      isActive: Boolean(entity.isActive),
    }),
  });

  const filteredIssuers = useFilter({
    data: issuers,
    searchTerm,
    searchFields: (issuer: CompanyIssuer) => [issuer.taxId, issuer.legalName],
  });

  const paginationInfo = getInfo(totalCount);

  const handleCreate = () => {
    setMode("create");
    form.reset();
    setShowForm(true);
  };

  const handleEdit = (issuer: CompanyIssuer) => {
    setMode("edit");
    form.handleEdit(issuer, issuer.id);
    setShowForm(true);
  };

  const columns = [
    { key: "taxId", header: t("facturacion.common.taxId") },
    { key: "legalName", header: t("facturacion.common.legalName") },
    {
      key: "isActive",
      header: t("facturacion.common.isActive"),
      render: (issuer: CompanyIssuer) =>
        issuer.isActive ? t("common.active") : t("common.inactive"),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("facturacion.issuers.title")}
        subtitle={t("facturacion.issuers.subtitle")}
      >
        {canWrite("facturacion") && (
          <Button onClick={handleCreate}>
            + {t("facturacion.issuers.newIssuer")}
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

      {filteredIssuers.length > 0 ? (
        <Table
          columns={columns}
          data={filteredIssuers}
          onEdit={canWrite("facturacion") ? handleEdit : undefined}
          getEditAction={() => ({
            label: t("common.edit"),
            variant: "edit",
          })}
        />
      ) : (
        <p className={styles.empty}>
          {loading ? t("common.loading") : t("facturacion.issuers.empty")}
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
            ? t("facturacion.issuers.editIssuer")
            : t("facturacion.issuers.newIssuer")
        }
        subtitle={
          form.editingId
            ? form.values.legalName || t("common.newRecordSubtitle")
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
          fields={ISSUER_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>
    </div>
  );
};
