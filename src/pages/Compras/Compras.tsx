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
  DynamicFormFields,
  VolterpMark,
  ImageCell,
} from "../../components/UI";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { usePagination } from "../../hooks/usePagination";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useProductos, useProveedores } from "../../hooks/useColecciones";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { PurchaseDto } from "../../domain/types";
import styles from "./Compras.module.css";
import { useFilter } from "../../hooks/useFilter";
import { money } from "../../utils/currency";
import { LineasCompraEditor } from "./components/LineasCompraEditor";

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
  const proveedores = useProveedores();
  const productos = useProductos();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    fetchCompras(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchCompras]);

  const getSupplierById = (id: string | null) =>
    id ? proveedores.find((p) => p.id === id) : null;

  const COMPRA_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "supplierId",
        label: t("compras.supplier"),
        type: "combobox",
        required: true,
        section: "formSections.info",
        span: 6,
        placeholder: t("compras.supplierSearch"),
        emptyLabel: t("compras.noSuppliersFound"),
        options: proveedores.map((p) => ({
          value: p.id,
          label: p.name,
          description: p.code,
        })),
      },
      {
        name: "status",
        label: t("common.status"),
        type: "select",
        required: true,
        section: "formSections.info",
        span: 6,
        options: [
          { value: "Pending", label: t("common.pending") },
          { value: "Completed", label: t("common.completed") },
          { value: "Cancelled", label: t("common.cancelled") },
        ],
      },
      {
        name: "total",
        label: t("common.total"),
        type: "number",
        required: true,
        readonly: true,
        section: "formSections.pricing",
        span: 6,
      },
      {
        name: "notes",
        label: t("compras.notes"),
        type: "textarea",
        section: "formSections.detail",
        span: 6,
      },
    ],
    [t, proveedores],
  );

  const form = useCrudForm({
    fields: COMPRA_FIELDS,
    defaultValues: {
      supplierId: "",
      supplierName: "",
      total: 0,
      status: "Pending",
      notes: "",
      items: [],
    },
    mapEntityToForm: (entity) => {
      const purchase = entity as unknown as PurchaseDto;
      return {
        supplierId: purchase.supplierId ?? "",
        supplierName: purchase.supplierName ?? "",
        status: purchase.status,
        total: purchase.total,
        notes: purchase.notes ?? "",
        items: purchase.items.map((item) => ({ ...item })),
      };
    },
    onCreate: async (data) => {
      const items = (data.items as PurchaseDto["items"]) ?? [];
      if (items.length === 0) {
        throw new Error(t("compras.itemsRequired"));
      }
      const created = await addCompra({
        ...(data as PurchaseDto),
        supplierId: data.supplierId || null,
        supplierName: data.supplierName || null,
        items,
      } as Partial<PurchaseDto>);
      addToast(t("compras.purchaseCreated"), "success");
      return created;
    },
    onUpdate: async (id, data) => {
      const items = (data.items as PurchaseDto["items"]) ?? [];
      if (items.length === 0) {
        throw new Error(t("compras.itemsRequired"));
      }
      const updated = await updateCompra(id, {
        ...data,
        items,
      } as Partial<PurchaseDto>);
      addToast(t("compras.purchaseUpdated"), "success");
      await fetchCompras(pageNumber, ITEMS_PER_PAGE);
      return updated;
    },
    onSuccess: () => {
      setShowForm(false);
    },
  });

  const filteredCompras = useFilter({
    data: compras,
    searchTerm,
    searchFields: (c) => [c.supplierName, c.id.toString(), c.code],
  });

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (compra: PurchaseDto) => {
    form.handleEdit(compra, compra.id);
    setShowForm(true);
  };

  const {
    showDeleteConfirm,
    deleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
  } = useDeleteConfirm({
    onDelete: deleteCompra,
    successMessage: t("compras.purchaseDeleted"),
  });

  const pendingPurchase = compras.find((c) => c.id === deleteId) ?? null;

  const columns = [
    { key: "code", header: t("common.code") },
    {
      key: "supplierName",
      header: t("compras.supplier"),
      render: (c: PurchaseDto) => {
        const supplier = getSupplierById(c.supplierId);
        return supplier ? (
          <ImageCell
            src={
              supplier.imageUrl ||
              `https://i.pravatar.cc/150?img=${supplier.id}`
            }
            name={c.supplierName || ""}
            subtext={c.supplierName}
            type="avatar"
          />
        ) : (
          c.supplierName || "-"
        );
      },
    },
    {
      key: "total",
      header: t("common.total"),
      render: (c: PurchaseDto) => `$${c.total.toLocaleString()}`,
    },
    {
      key: "createdAt",
      header: t("common.date"),
      render: (c: PurchaseDto) => new Date(c.createdAt).toLocaleDateString(),
    },
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
        <Button
          onClick={() => {
            form.reset();
            setShowForm(true);
          }}
        >
          + {t("compras.newPurchase")}
        </Button>
      </PageHeader>

      <div className={styles.searchBar}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            goToPage(1);
          }}
          placeholder={t("compras.searchPurchases")}
          width="240px"
        />
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        size="lg"
        icon={<VolterpMark size={40} />}
        title={
          form.editingId ? t("compras.editPurchase") : t("compras.newPurchase")
        }
        subtitle={
          form.editingId
            ? form.values.supplierName || t("common.newRecordSubtitle")
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
          fields={COMPRA_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={(name, value) => {
            form.setFieldValue(name, value);
            if (name === "supplierId") {
              const supplier = proveedores.find((p) => p.id === value);
              form.setFieldValue("supplierName", supplier?.name ?? "");
            }
          }}
        />
        <LineasCompraEditor
          lineas={(form.values.items as PurchaseDto["items"]) ?? []}
          productos={productos}
          invalid={Boolean(form.errors.items)}
          onChange={(lineas) => {
            form.setFieldValue("items", lineas);
            form.setFieldValue(
              "total",
              lineas.reduce(
                (acc, linea) => acc + linea.quantity * linea.unitPrice,
                0,
              ),
            );
          }}
        />
      </Modal>

      <Table data={filteredCompras} columns={columns} />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={`${t("common.delete")} ${t("common.purchase")}`}
        message={t("compras.deleteConfirm")}
        confirmLabel={t("common.confirmDeleteAction")}
        cancelLabel={t("common.cancel")}
        context={
          pendingPurchase
            ? {
                title: `${t("common.purchase")} #${pendingPurchase.code}`,
                subtitle: [
                  pendingPurchase.supplierName,
                  `${pendingPurchase.items.length} ${t("compras.productCount")}`,
                ]
                  .filter(Boolean)
                  .join(" · "),
                amount: money(pendingPurchase.total),
              }
            : undefined
        }
      />
    </div>
  );
}
