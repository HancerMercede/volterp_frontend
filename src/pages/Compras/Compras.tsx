import { useState, useMemo, useEffect, useCallback } from "react";
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
  DynamicFormFields,
} from "../../components/UI";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { PurchaseDto } from "../../domain/types";
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
  const [searchTerm, setSearchTerm] = useState("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = useCallback(() => {
    fetchCompras(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchCompras]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const COMPRA_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "supplierName",
        label: t("compras.supplier"),
        type: "text",
        required: true,
      },
      {
        name: "total",
        label: t("common.total"),
        type: "number",
        required: true,
      },
      {
        name: "status",
        label: t("common.status"),
        type: "select",
        required: true,
        options: [
          { value: "Pending", label: t("pending") },
          { value: "Completed", label: t("completed") },
          { value: "Cancelled", label: t("cancelled") },
        ],
      },
    ],
    [t],
  );

  const form = useCrudForm({
    fields: COMPRA_FIELDS,
    defaultValues: { supplierName: "", total: 0, status: "Pending" },
    onCreate: (data) => {
      addToast(t("compras.purchaseCreated"), "success");
      return addCompra({
        supplierId: null,
        items: [],
        ...data,
      } as Partial<PurchaseDto>);
    },
    onUpdate: (id, data) => {
      addToast(t("compras.purchaseUpdated"), "success");
      return updateCompra(id, data as Partial<PurchaseDto>);
    },
    onSuccess: () => {
      setShowForm(false);
      fetchCompras();
    },
  });

  const filteredCompras = useFilter({
    data: compras,
    searchTerm,
    searchFields: (c) => [c.supplierName, c.id.toString()],
  });

  const paginatedCompras = useMemo(() => {
    return paginate(filteredCompras, pageNumber, ITEMS_PER_PAGE);
  }, [filteredCompras, pageNumber]);

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (compra: PurchaseDto) => {
    form.handleEdit(compra, compra.id);
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
              form.reset();
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
          form.reset();
        }}
        title={
          form.editingId ? t("compras.editPurchase") : t("compras.newPurchase")
        }
        onSubmit={form.handleSubmit}
        submitLabel={form.editingId ? t("common.update") : t("common.create")}
      >
        <DynamicFormFields
          fields={COMPRA_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
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
