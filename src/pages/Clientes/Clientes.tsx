import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClienteStore } from "../../stores/clienteStore";
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
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { Client, ClientRequest } from "../../domain/types";
import styles from "./Clientes.module.css";
import { useFilter } from "../../hooks/useFilter";

export function Clientes() {
  const { t } = useTranslation();
  const {
    clientes,
    totalCount,
    fetchClientes,
    addCliente,
    updateCliente,
    deleteCliente,
  } = useClienteStore();

  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    fetchClientes(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchClientes]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<ClientRequest>({
    name: "",
    email: "",
    phone: "",
    address: "",
    isActive: true,
    imageUrl: "",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredClientes = useFilter({
    data: clientes,
    searchTerm,
    searchFields: (c) => [c.name, c.email, c.phone],
  });

  const paginatedClientes = useMemo(() => {
    return paginate(filteredClientes, pageNumber, ITEMS_PER_PAGE);
  }, [filteredClientes, pageNumber]);

  const paginationInfo = getInfo(totalCount);

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
      updateCliente(editingId, formData);
      setEditingId(null);
    } else {
      addCliente(formData);
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
      isActive: true,
      imageUrl: "",
    });
  };

  const handleEdit = (cliente: Client) => {
    setFormData({
      name: cliente.name,
      email: cliente.email,
      phone: cliente.phone,
      address: cliente.address,
      isActive: cliente.isActive,
      imageUrl: cliente.imageUrl || "",
    });
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteCliente(deleteId);
  };

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "name",
      header: t("clientes.client"),
      render: (c: Client) => (
        <ImageCell
          src={
            c.imageUrl || c.avatar || `https://i.pravatar.cc/150?img=${c.id}`
          }
          name={c.name}
          subtext={c.empresa}
          type="avatar"
        />
      ),
    },
    { key: "email", header: t("common.email") },
    { key: "phone", header: t("common.phone") },
    {
      key: "isActive",
      header: t("common.status"),
      render: (c: Client) => (
        <span style={{ color: c.isActive ? "green" : "red" }}>
          {c.isActive ? t("common.active") : t("common.inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (c: Client) => (
        <ActionButtons
          onEdit={() => handleEdit(c)}
          onDelete={() => handleDelete(c.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("clientes.title")} subtitle={t("clientes.subtitle")}>
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              goToPage(1);
            }}
            placeholder={t("clientes.searchClient")}
            width="240px"
          />
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + {t("clientes.newClient")}
          </Button>
        </div>
      </PageHeader>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        title={editingId ? t("clientes.editClient") : t("clientes.newClient")}
        onSubmit={handleSubmit}
        submitLabel={editingId ? t("common.update") : t("common.create")}
      >
        <div className={styles.formGroup}>
          <label>{t("clientes.clientName")}</label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("clientes.clientEmail")}</label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("clientes.clientPhone")}</label>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="809-XXX-XXXX"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.address")}</label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.image")}</label>
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

      <Table data={paginatedClientes} columns={columns} />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("clientes.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
