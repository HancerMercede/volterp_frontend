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
} from "../../components/UI";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
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

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const fetchData = useCallback(() => {
    fetchProveedores(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchProveedores]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const PROVEEDOR_FIELDS: FormField[] = useMemo(
    () => [
      { name: "name", label: t("common.name"), type: "text", required: true },
      {
        name: "email",
        label: t("common.email"),
        type: "email",
        required: true,
      },
      { name: "phone", label: t("common.phone"), type: "tel", required: true },
      {
        name: "address",
        label: t("common.address"),
        type: "text",
        required: true,
      },
      {
        name: "category",
        label: t("common.category"),
        type: "text",
        required: true,
      },
      { name: "contactPerson", label: "Contacto", type: "text" },
      {
        name: "imageUrl",
        label: t("common.image"),
        type: "file",
        accept: "image/*",
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
    searchFields: (p) => [p.name, p.email, p.category],
  });

  const paginatedProveedores = useMemo(() => {
    return paginate(filteredProveedores, pageNumber, ITEMS_PER_PAGE);
  }, [filteredProveedores, pageNumber]);

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (proveedor: SupplierDto) => {
    form.handleEdit(proveedor, proveedor.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteProveedor(deleteId);
  };

  const columns = [
    { key: "id", header: t("common.id") },
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
          width="300px"
        />
      </div>

      <Table
        columns={columns}
        data={paginatedProveedores}
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
        title={
          form.editingId
            ? t("proveedores.editProvider")
            : t("proveedores.newProvider")
        }
        onSubmit={form.handleSubmit}
        submitLabel={form.editingId ? t("common.save") : t("common.create")}
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
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("proveedores.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
