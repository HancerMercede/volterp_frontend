import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { useProductoStore } from "../../stores/productoStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useCompanyStore } from "../../stores/companyStore";
import {
  Table,
  Button,
  PageHeader,
  ImageCell,
  ActionButtons,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
  DynamicFormFields,
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { ProductDto } from "../../domain/types";
import styles from "./Inventario.module.css";
import { useFilter } from "../../hooks/useFilter";

export function Inventario() {
  const { t } = useTranslation();
  const {
    productos,
    loading,
    error,
    totalCount,
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
  } = useProductoStore();

  type stockStatus = "all" | "low" | "out";

  const { categories, fetchCategories } = useCategoryStore();
  const { currentCompany } = useCompanyStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState<stockStatus>("all");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = useCallback(() => {
    fetchProductos(pageNumber, ITEMS_PER_PAGE);
    fetchCategories(pageNumber, 100);
  }, [pageNumber, fetchProductos, fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fields: FormField[] = useMemo(
    () => [
      { name: "name", label: t("common.name"), type: "text", required: true },
      {
        name: "categoryId",
        label: t("common.category"),
        type: "select",
        required: true,
        options: categories.map((c) => ({
          value: String(c.id),
          label: c.name,
        })),
      },
      {
        name: "stock",
        label: t("inventario.stock"),
        type: "number",
        min: 0,
        required: true,
      },
      {
        name: "price",
        label: t("common.price"),
        type: "number",
        min: 0,
        step: 0.01,
        required: true,
      },
      {
        name: "imageUrl",
        label: t("common.image"),
        type: "file",
        accept: "image/*",
      },
      {
        name: "description",
        label: t("common.description"),
        type: "text",
      },
      {
        name: "isActive",
        label: t("inventario.active"),
        type: "checkbox",
        showOnEdit: true,
      },
    ],
    [t, categories],
  );

  const form = useCrudForm({
    fields,
    defaultValues: {
      name: "",
      categoryId: "",
      stock: 0,
      price: 0,
      imageUrl: "",
      description: "",
      isActive: true,
    },
    onCreate: async (data) => {
      const catId = data.categoryId ? parseInt(data.categoryId) : null;
      const cat = categories.find((c) => c.id === catId);
      await createProducto({
        name: data.name,
        category: cat?.name || "",
        description: data.description || null,
        stock: data.stock,
        price: data.price,
        categoryId: catId,
        companyId: currentCompany?.id || 1,
        imageUrl: data.imageUrl || null,
      });
    },
    onUpdate: async (id, data) => {
      const catId = data.categoryId ? parseInt(data.categoryId) : null;
      const cat = categories.find((c) => c.id === catId);
      await updateProducto(id, {
        name: data.name,
        category: cat?.name || "",
        description: data.description || null,
        stock: data.stock,
        price: data.price,
        categoryId: catId,
        isActive: data.isActive,
        imageUrl: data.imageUrl || null,
      });
    },
    onSuccess: () => {
      setShowForm(false);
    },
    mapEntityToForm: (entity) => ({
      name: (entity.name as string) ?? "",
      categoryId: entity.categoryId != null ? String(entity.categoryId) : "",
      stock: (entity.stock as number) ?? 0,
      price: (entity.price as number) ?? 0,
      imageUrl: (entity.imageUrl as string) ?? "",
      description: (entity.description as string) ?? "",
      isActive: (entity.isActive as boolean) ?? true,
    }),
  });

  // Intercept category select to also update the category name string
  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      if (name === "categoryId") {
        const catId = value ? parseInt(value as string) : null;
        const cat = categories.find((c) => c.id === catId);
        form.setFieldValue("categoryId", value);
        form.setFieldValue("category", cat?.name ?? "");
      } else {
        form.setFieldValue(name, value);
      }
    },
    [categories, form],
  );

  const filteredProductos = useFilter({
    data: productos,
    searchTerm,
    searchFields: (p) => [p.name, p.category],
    filter: (p) => {
      if (filterStock === "low") return p.stock > 0 && p.stock < 10;
      if (filterStock === "out") return p.stock === 0;
      return true;
    },
  });

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (producto: ProductDto) => {
    form.handleEdit(producto, producto.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(String(id));
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteProducto(Number(deleteId));
      } catch {
        // Error is handled in store
      }
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "name",
      header: t("common.product"),
      render: (p: ProductDto) => (
        <ImageCell
          src={p.imageUrl || ""}
          name={p.name}
          subtext={p.category}
          type="product"
        />
      ),
    },
    { key: "category", header: t("common.category") },
    { key: "description", header: t("common.description") },
    {
      key: "stock",
      header: t("inventario.stock"),
      render: (p: ProductDto) => (
        <span
          className={
            p.stock === 0
              ? styles.outOfStock
              : p.stock < 10
                ? styles.lowStock
                : ""
          }
        >
          {p.stock}
        </span>
      ),
    },
    {
      key: "price",
      header: t("common.price"),
      render: (p: ProductDto) => `$${p.price.toLocaleString()}`,
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (p: ProductDto) => (
        <ActionButtons
          onEdit={() => handleEdit(p)}
          onDelete={() => handleDelete(p.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("inventario.title")}
        subtitle={t("inventario.subtitle")}
      >
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              goToPage(1);
            }}
            placeholder={t("inventario.searchPlaceholder")}
            width="240px"
          />
          <select
            className={styles.filter}
            value={filterStock}
            onChange={(e) => {
              setFilterStock(e.target.value as stockStatus);
              goToPage(1);
            }}
          >
            <option value="all">{t("inventario.all")}</option>
            <option value="low">{t("inventario.lowStock")}</option>
            <option value="out">{t("inventario.outOfStock")}</option>
          </select>
          <Button
            onClick={() => {
              form.reset();
              setShowForm(true);
            }}
          >
            + {t("inventario.newProduct")}
          </Button>
        </div>
      </PageHeader>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        title={
          form.editingId
            ? t("inventario.editProduct")
            : t("inventario.newProduct")
        }
        onSubmit={form.handleSubmit}
        submitLabel={form.editingId ? t("common.update") : t("common.create")}
      >
        <DynamicFormFields
          fields={fields}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={handleFieldChange}
        />
      </Modal>

      <Table data={filteredProductos} columns={columns} />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("inventario.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
