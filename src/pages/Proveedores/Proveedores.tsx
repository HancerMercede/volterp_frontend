import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useProveedorStore } from "../../stores/proveedorStore";
import {
  Table,
  Button,
  PageHeader,
  ImageCell,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
  DynamicFormFields,
  VolterpMark,
} from "../../components/UI";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { usePagination } from "../../hooks/usePagination";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { SupplierDto, SupplierRequest } from "../../domain/types";
import styles from "./Proveedores.module.css";
import { useFilter } from "../../hooks/useFilter";

export function Proveedores() {
  const { t } = useTranslation();
  const {
    proveedores,
    addProveedor,
    updateProveedor,
    deleteProveedor,
    fetchProveedores,
    totalCount,
  } = useProveedorStore();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const fetchData = useCallback(() => {
    fetchProveedores(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchProveedores]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const PROVEEDOR_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: t("common.name"),
        type: "text",
        required: true,
        section: "formSections.identity",
        span: 6,
      },
      {
        name: "email",
        label: t("common.email"),
        type: "email",
        required: true,
        section: "formSections.contact",
        span: 3,
      },
      {
        name: "phone",
        label: t("common.phone"),
        type: "tel",
        required: true,
        section: "formSections.contact",
        span: 3,
      },
      {
        name: "address",
        label: t("common.address"),
        type: "text",
        required: true,
        section: "formSections.location",
        span: 6,
      },
      {
        name: "category",
        label: t("common.category"),
        type: "text",
        required: true,
        section: "formSections.sector",
        span: 3,
      },
      {
        name: "contactPerson",
        label: t("proveedores.contactPerson"),
        type: "text",
        section: "formSections.sector",
        span: 3,
      },
      {
        name: "imageUrl",
        label: t("common.image"),
        type: "file",
        accept: "image/*",
        sidebar: true,
      },
    ],
    [t],
  );

  const form = useCrudForm({
    fields: PROVEEDOR_FIELDS,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      contactPerson: "",
      imageUrl: "",
    },
    onCreate: (data) =>
      addProveedor({ ...data, isActive: true } as SupplierRequest),
    onUpdate: (id, data) => updateProveedor(id, data as SupplierRequest),
    onSuccess: () => {
      setShowForm(false);
      fetchProveedores(pageNumber, ITEMS_PER_PAGE);
    },
  });

  const filteredProveedores = useFilter({
    data: proveedores,
    searchTerm,
    searchFields: (p) => [p.name, p.email, p.category, p.code],
  });

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (proveedor: SupplierDto) => {
    form.handleEdit(proveedor, proveedor.id);
    setShowForm(true);
  };

  const { showDeleteConfirm, deleteId, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: deleteProveedor,
      successMessage: t("proveedores.providerDeleted"),
    });

  const pendingSupplier = proveedores.find((p) => p.id === deleteId) ?? null;

  const columns = [
    { key: "code", header: t("common.code") },
    {
      key: "name",
      header: t("proveedores.supplier"),
      render: (p: SupplierDto) => (
        <ImageCell
          src={p.imageUrl || `https://i.pravatar.cc/150?img=${p.id}`}
          name={p.name}
        />
      ),
    },
    { key: "email", header: t("common.email") },
    { key: "phone", header: t("common.phone") },
    { key: "category", header: t("common.category") },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("proveedores.title")}
        subtitle={t("proveedores.subtitle")}
      >
        <Button
          onClick={() => {
            form.reset();
            setShowForm(true);
          }}
        >
          + {t("proveedores.newProvider")}
        </Button>
      </PageHeader>

      <div className={styles.searchBar}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            goToPage(1);
          }}
          placeholder={t("proveedores.searchProvider")}
          width="240px"
        />
      </div>

      <Table
        columns={columns}
        data={filteredProveedores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
            ? t("proveedores.editProvider")
            : t("proveedores.newProvider")
        }
        subtitle={
          form.editingId
            ? form.values.name || t("common.newRecordSubtitle")
            : t("common.newRecordSubtitle")
        }
        footerStatus={
          form.isDirty ? t("common.unsavedChanges") : t("common.noPendingChanges")
        }
        dirty={form.isDirty}
        onSubmit={form.handleSubmit}
        submitLabel={form.editingId ? t("common.saveChanges") : t("common.create")}
        submitVariant="dark"
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <DynamicFormFields
          fields={PROVEEDOR_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={`${t("common.delete")} ${t("common.supplier")}`}
        message={t("proveedores.deleteConfirm")}
        confirmLabel={t("common.confirmDeleteAction")}
        cancelLabel={t("common.cancel")}
        context={
          pendingSupplier
            ? {
                title: `${t("common.supplier")} #${pendingSupplier.code}`,
                subtitle: [pendingSupplier.name, pendingSupplier.category]
                  .filter(Boolean)
                  .join(" · "),
              }
            : undefined
        }
      />
    </div>
  );
}
