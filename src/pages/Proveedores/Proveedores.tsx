import { useState, useMemo, useEffect } from "react";
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
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { SupplierDto } from "../../domain/types";
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
  } = useProveedorStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    contactPerson: "",
    imageUrl: "",
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProveedores(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchProveedores]);

  const filteredProveedores = useFilter({
    data: proveedores,
    searchTerm,
    searchFields: (p) => [p.name, p.email, p.category],
  });

  const paginatedProveedores = useMemo(() => {
    return paginate(filteredProveedores, pageNumber, ITEMS_PER_PAGE);
  }, [filteredProveedores, pageNumber]);

  const paginationInfo = getInfo(filteredProveedores.length);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProveedor(editingId, formData);
      setEditingId(null);
    } else {
      addProveedor({ ...formData, isActive: true });
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      contactPerson: "",
      imageUrl: "",
    });
  };

  const handleEdit = (proveedor: SupplierDto) => {
    setFormData({
      name: proveedor.name,
      email: proveedor.email,
      phone: proveedor.phone,
      address: proveedor.address,
      category: proveedor.category,
      contactPerson: proveedor.contactPerson,
      imageUrl: proveedor.imageUrl || "",
    });
    setEditingId(proveedor.id);
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
      header: "proveedor",
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
            resetForm();
            setEditingId(null);
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
        onClose={() => setShowForm(false)}
        title={
          editingId
            ? t("proveedores.editProvider")
            : t("proveedores.newProvider")
        }
        onSubmit={handleSubmit}
        submitLabel={editingId ? t("common.save") : t("common.create")}
      >
        <div className={styles.formGroup}>
          <label>{t("common.name")}</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.email")}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.phone")}</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.address")}</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.category")}</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Contacto</label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) =>
              setFormData({ ...formData, contactPerson: e.target.value })
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label>Imagen</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt="Preview"
              style={{ width: "80px", marginTop: "8px", borderRadius: "4px" }}
            />
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
        message={t("proveedores.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
