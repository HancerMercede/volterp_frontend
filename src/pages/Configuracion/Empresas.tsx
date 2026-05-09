import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyStore } from "../../stores/companyStore";
import {
  Table,
  Button,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { CompanyRequest } from "../../infrastructure/api/companyService";
import styles from "./Empresas.module.css";
import { useFilter } from "../../hooks/useFilter";

interface FormData {
  name: string;
  taxId: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  isActive: boolean;
}

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

const initialFormData: FormData = {
  name: "",
  taxId: "",
  legalName: "",
  address: "",
  phone: "",
  email: "",
  logoUrl: null,
  isActive: true,
};

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = useCallback(() => {
    fetchCompanies(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchCompanies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log(pageNumber);
  console.log(companies);

  const filteredCompanies = useFilter({
    data: companies,
    searchTerm,
    searchFields: (c) => [c.name, c.taxId, c.email],
  }).map((c) => ({ ...c, id: String(c.id) }));

  const paginationInfo = getInfo(totalCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: CompanyRequest = {
        name: formData.name,
        taxId: formData.taxId,
        logoUrl: formData.logoUrl,
        address: formData.address,
        legalName: formData.legalName,
        phone: formData.phone,
        email: formData.email,
      };
      if (editingId) {
        await updateCompany(editingId, data);
        setEditingId(null);
      } else {
        await addCompany(data);
      }
      setShowForm(false);
      resetForm();
      fetchCompanies(pageNumber, ITEMS_PER_PAGE);
    } catch {
      // Error is handled in store
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleEdit = (company: CompanyTableRow) => {
    setEditingId(Number(company.id));
    setFormData({
      name: company.name,
      taxId: company.taxId,
      legalName: company.legalName,
      address: company.address,
      phone: company.phone,
      email: company.email,
      logoUrl: company.logoUrl,
      isActive: company.isActive,
    });
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
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => handleEdit(company)}
            title={t("empresas.actions.edit")}
          >
            ✏️
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => handleDeleteClick(company.id)}
            title={t("empresas.actions.delete")}
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("empresas.title")}</h2>
        <Button
          onClick={() => {
            resetForm();
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
          setEditingId(null);
          resetForm();
        }}
        title={
          editingId ? t("empresas.form.titleEdit") : t("empresas.form.title")
        }
        onSubmit={handleSubmit}
        submitLabel={t("empresas.form.save")}
        cancelLabel={t("empresas.form.cancel")}
      >
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>{t("empresas.form.name")} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("empresas.form.taxId")} *</label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) =>
                setFormData({ ...formData, taxId: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("empresas.form.legalName")}</label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) =>
                setFormData({ ...formData, legalName: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("empresas.form.email")}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("empresas.form.phone")}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("empresas.form.address")}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("empresas.form.logoUrl")}</label>
            <input
              type="url"
              value={formData.logoUrl || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  logoUrl: e.target.value || null,
                })
              }
              placeholder="https://..."
            />
          </div>

          {editingId && (
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                {t("empresas.form.isActive")}
              </label>
            </div>
          )}
        </div>
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
