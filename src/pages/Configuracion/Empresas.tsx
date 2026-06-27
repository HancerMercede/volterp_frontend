import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyStore } from "../../stores/companyStore";
import {
  Table,
  Button,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
  ActionButtons,
  DynamicFormFields,
} from "../../components/UI";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { usePagination } from "../../hooks/usePagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { CompanyRequest } from "../../domain/types";
import styles from "./Empresas.module.css";
import { useFilter } from "../../hooks/useFilter";

interface CompanyTableRow {
  id: string;
  name: string;
  taxId: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function Empresas() {
  const { t } = useTranslation();
  const {
    companies,
    totalCount,
    pageCount,
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
  } = useCompanyStore();

  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = useCallback(() => {
    fetchCompanies(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchCompanies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const EMPRESA_FIELDS: FormField[] = useMemo(
    () => [
      { name: "name", label: t("empresas.form.name"), type: "text", required: true },
      { name: "taxId", label: t("empresas.form.taxId"), type: "text", required: true },
      { name: "legalName", label: t("empresas.form.legalName"), type: "text" },
      { name: "email", label: t("empresas.form.email"), type: "email" },
      { name: "phone", label: t("empresas.form.phone"), type: "tel" },
      { name: "address", label: t("empresas.form.address"), type: "text" },
      { name: "logoUrl", label: t("empresas.form.logoUrl"), type: "url", placeholder: "https://..." },
      { name: "isActive", label: t("empresas.form.isActive"), type: "checkbox", showOnEdit: true },
    ],
    [t],
  );

  const form = useCrudForm({
    fields: EMPRESA_FIELDS,
    defaultValues: { name: "", taxId: "", legalName: "", address: "", phone: "", email: "", logoUrl: "", isActive: true },
    onCreate: (data) => addCompany(data as CompanyRequest),
    onUpdate: (id, data) => updateCompany(id, data as CompanyRequest),
    onSuccess: () => {
      setShowForm(false);
      fetchCompanies(pageNumber, ITEMS_PER_PAGE);
    },
  });

  const filteredCompanies = useFilter({
    data: companies,
    searchTerm,
    searchFields: (c) => [c.name, c.taxId, c.email],
  }).map((c) => ({ ...c, id: String(c.id) }));

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (company: CompanyTableRow) => {
    form.handleEdit(company as unknown as Record<string, unknown>, Number(company.id));
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(Number(id));
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteCompany(deleteId);
        setShowDeleteConfirm(false);
        setDeleteId(null);
      } catch {
        // Error is handled in store
      }
    }
  };

  const columns = [
    { key: "name", header: t("empresas.table.headers.name") },
    { key: "taxId", header: t("empresas.table.headers.taxId") },
    { key: "legalName", header: t("empresas.table.headers.legalName") },
    {
      key: "isActive",
      header: t("empresas.table.headers.status"),
      render: (company: CompanyTableRow) => (
        <span
          className={`${styles.status} ${
            company.isActive ? styles.active : styles.inactive
          }`}
        >
          {company.isActive
            ? t("empresas.status.active")
            : t("empresas.status.inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("empresas.table.headers.actions"),
      render: (company: CompanyTableRow) => (
        <ActionButtons
          onEdit={() => handleEdit(company)}
          onDelete={() => handleDeleteClick(company.id)}
        />
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("empresas.title")}</h2>
        <Button
          onClick={() => {
            form.reset();
            setShowForm(true);
          }}
        >
          + {t("empresas.actions.add")}
        </Button>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={t("common.search")}
        showIcon
      />

      <Table data={filteredCompanies} columns={columns} />

      {pageCount > 1 && (
        <Pagination pagination={paginationInfo} onPageChange={goToPage} />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        title={form.editingId ? t("empresas.form.titleEdit") : t("empresas.form.title")}
        onSubmit={form.handleSubmit}
        submitLabel={t("empresas.form.save")}
        cancelLabel={t("empresas.form.cancel")}
      >
        <DynamicFormFields
          fields={EMPRESA_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("empresas.confirmDelete")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
