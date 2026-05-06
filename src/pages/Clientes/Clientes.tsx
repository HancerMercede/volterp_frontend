import { useState, useMemo } from "react";
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
import type { Cliente } from "../../data/mockData";
import styles from "./Clientes.module.css";

export function Clientes() {
  const { t } = useTranslation();
  const { clientes, addCliente, updateCliente, deleteCliente } = useClienteStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { page, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    empresa: "",
    ciudad: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredClientes = useMemo(() => {
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefono.includes(searchTerm),
    );
  }, [clientes, searchTerm]);

  const paginatedClientes = useMemo(() => {
    return paginate(filteredClientes, page, ITEMS_PER_PAGE);
  }, [filteredClientes, page]);

  const paginationInfo = getInfo(filteredClientes.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCliente(editingId, formData);
      setEditingId(null);
    } else {
      const newCliente: Cliente = {
        ...formData,
        id: `CL${String(clientes.length + 1).padStart(3, "0")}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      addCliente(newCliente);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      totalCompras: 0,
      empresa: "",
    });
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      totalCompras: cliente.totalCompras,
      empresa: cliente.empresa || "",
    });
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteCliente(deleteId);
  };

  const columns = [
    { key: "id", header: t('common.id') },
    {
      key: "nombre",
      header: t('clientes.client'),
      render: (c: Cliente) => (
        <ImageCell
          src={c.avatar}
          name={c.nombre}
          subtext={c.empresa}
          type="avatar"
        />
      ),
    },
    { key: "email", header: t('common.email') },
    { key: "telefono", header: t('common.phone') },
    {
      key: "totalCompras",
      header: t('clientes.totalPurchases'),
      render: (c: Cliente) =>
        `$${c.totalCompras.toLocaleString()}`,
    },
    {
      key: "actions",
      header: t('common.actions'),
      render: (c: Cliente) => (
        <ActionButtons
          onEdit={() => handleEdit(c)}
          onDelete={() => handleDelete(c.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t('clientes.title')} subtitle={t('clientes.subtitle')}>
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              goToPage(1);
            }}
            placeholder={t('clientes.searchClient')}
            width="240px"
          />
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + {t('clientes.newClient')}
          </Button>
        </div>
      </PageHeader>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        title={editingId ? t('clientes.editClient') : t('clientes.newClient')}
        onSubmit={handleSubmit}
        submitLabel={editingId ? t('common.update') : t('common.create')}
      >
        <div className={styles.formGroup}>
          <label>{t('clientes.clientName')}</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('clientes.clientEmail')}</label>
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
          <label>{t('clientes.clientPhone')}</label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            placeholder="809-XXX-XXXX"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('common.address')}</label>
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
          />
        </div>
        {!editingId && (
          <div className={styles.formGroup}>
            <label>{t('clientes.totalPurchases')}</label>
            <input
              type="number"
              min="0"
              value={formData.totalCompras}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalCompras: parseInt(e.target.value),
                })
              }
            />
          </div>
        )}
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