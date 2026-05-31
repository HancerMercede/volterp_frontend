import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCompraStore } from "../../stores/compraStore";
import { useUIStore } from "../../stores/uiStore";
import {
  Table,
  Button,
  PageHeader,
  ActionButtons,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { PurchaseRequest, PurchaseDto } from "../../domain/types";
import styles from "./Compras.module.css";
import { useFilter } from "../../hooks/useFilter";

export function Compras() {
  const { t } = useTranslation();
  const {
    compras,
    totalCount,
    fetchCompras,
    addCompra,
    updateCompra,
    deleteCompra,
  } = useCompraStore();
  const { addToast } = useUIStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [formData, setFormData] = useState<PurchaseRequest>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  const filteredCompras = useFilter({
    data: compras,
    searchTerm,
    searchFields: (c) => [c.supplierName, c.id.toString()],
  });

  const paginatedCompras = useMemo(() => {
    return paginate(filteredCompras, pageNumber, ITEMS_PER_PAGE);
  }, [filteredCompras, pageNumber]);

  const paginationInfo = getInfo(totalCount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCompra(editingId, formData);
      setEditingId(null);
      addToast(t("compras.purchaseUpdated"), "success");
    } else {
      addCompra({
        supplierId: null,
        supplierName: formData.supplierName ?? "",
        status: formData.status ?? "Pending",
        total: formData.total ?? 0,
        notes: formData.notes ?? null,
        items: [],
      } as PurchaseRequest);
      addToast(t("compras.purchaseCreated"), "success");
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      supplierName: undefined,
      status: "Pending",
      total: 0,
      notes: undefined,
    });
  };

  const handleEdit = (compra: PurchaseDto) => {
    setFormData({
      supplierName: compra.supplierName,
      status: compra.status,
      total: compra.total,
      notes: compra.notes,
    });
    setEditingId(compra.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteCompra(deleteId);
      addToast(t("compras.purchaseDeleted"), "error");
    }
  };

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "supplierName",
      header: t("compras.supplier"),
      render: (c: PurchaseDto) => c.supplierName,
    },
    {
      key: "total",
      header: t("common.total"),
      render: (c: PurchaseDto) => `$${c.total.toLocaleString()}`,
    },
    { key: "createdAt", header: t("common.date") },
    {
      key: "status",
      header: t("common.status"),
      render: (c: PurchaseDto) => (
        <span className={`${styles.badge} ${styles[c.status.toLowerCase()]}`}>
          {c.status === "Pending"
            ? t("compras.pending")
            : c.status === "Completed"
              ? t("compras.received")
              : t("compras.cancelled")}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (c: PurchaseDto) => (
        <ActionButtons
          onEdit={() => handleEdit(c)}
          onDelete={() => handleDelete(c.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("compras.title")} subtitle={t("compras.subtitle")}>
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              goToPage(1);
            }}
            placeholder={t("compras.searchPurchases")}
            width="240px"
          />
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + {t("compras.newPurchase")}
          </Button>
        </div>
      </PageHeader>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        title={editingId ? t("compras.editPurchase") : t("compras.newPurchase")}
        onSubmit={handleSubmit}
        submitLabel={editingId ? t("common.update") : t("common.create")}
      >
        <div className={styles.formGroup}>
          <label>{t("compras.supplier")}</label>
          <input
            type="text"
            value={formData.supplierName ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, supplierName: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.total")}</label>
          <input
            type="number"
            value={formData.total ?? 0}
            onChange={(e) =>
              setFormData({ ...formData, total: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.status")}</label>
          <select
            value={formData.status ?? "Pending"}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "Pending" | "Completed" | "Cancelled",
              })
            }
          >
            <option value="Pending">{t("pending")}</option>
            <option value="Completed">{t("completed")}</option>
            <option value="Cancelled">{t("cancelled")}</option>
          </select>
        </div>
      </Modal>

      <Table data={paginatedCompras} columns={columns} />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("compras.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
