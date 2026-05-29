import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCompraStore } from "../../stores/compraStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
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
import type { Compra } from "../../data/mockData";
import styles from "./Compras.module.css";
import { useFilter } from "../../hooks/useFilter";

export function Compras() {
  const { t } = useTranslation();
  const { compras, totalCount, fetchCompras, addCompra, updateCompra, deleteCompra } = useCompraStore();
  const { productos } = useProductoStore();
  const { addToast } = useUIStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [formData, setFormData] = useState({
    proveedor: "",
    producto: "",
    cantidad: 1,
    total: 0,
    fecha: new Date().toISOString().split("T")[0],
    estado: "pendiente" as "recibida" | "pendiente" | "cancelada",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  const filteredCompras = useFilter({
    data: compras,
    searchTerm,
    searchFields: (c) => [c.proveedor, c.producto, c.id],
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
      const newCompra: Compra = {
        ...formData,
        id: `C${String(compras.length + 1).padStart(3, "0")}`,
      };
      addCompra(newCompra);
      addToast(t("compras.purchaseCreated"), "success");
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      proveedor: "",
      producto: "",
      cantidad: 1,
      total: 0,
      fecha: new Date().toISOString().split("T")[0],
      estado: "pendiente",
    });
  };

  const handleEdit = (compra: Compra) => {
    setFormData(compra);
    setEditingId(compra.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteCompra(deleteId);
      addToast(t("compras.purchaseDeleted"), "error");
    }
  };

  const getProductoByName = (nombre: string) =>
    productos.find((p) => p.name === nombre);

  const columns = [
    { key: "id", header: t("common.id") },
    { key: "proveedor", header: t("compras.supplier") },
    {
      key: "producto",
      header: t("compras.product"),
      render: (c: Compra) => {
        const producto = getProductoByName(c.producto);
        return producto ? (
          <ImageCell
            src={producto.imageUrl || ""}
            name={c.producto}
            subtext={`x${c.cantidad}`}
            type="product"
          />
        ) : (
          c.producto
        );
      },
    },
    {
      key: "total",
      header: t("common.total"),
      render: (c: Compra) => `$${c.total.toLocaleString()}`,
    },
    { key: "fecha", header: t("common.date") },
    {
      key: "estado",
      header: t("common.status"),
      render: (c: Compra) => (
        <span className={`${styles.badge} ${styles[c.estado]}`}>
          {c.estado === "pendiente"
            ? t("compras.pending")
            : c.estado === "recibida"
              ? t("compras.received")
              : t("compras.cancelled")}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (c: Compra) => (
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
            value={formData.proveedor}
            onChange={(e) =>
              setFormData({ ...formData, proveedor: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("compras.product")}</label>
          <input
            type="text"
            value={formData.producto}
            onChange={(e) =>
              setFormData({ ...formData, producto: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.quantity")}</label>
          <input
            type="number"
            min="1"
            value={formData.cantidad}
            onChange={(e) =>
              setFormData({ ...formData, cantidad: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.total")}</label>
          <input
            type="number"
            value={formData.total}
            onChange={(e) =>
              setFormData({ ...formData, total: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.date")}</label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t("common.status")}</label>
          <select
            value={formData.estado}
            onChange={(e) =>
              setFormData({ ...formData, estado: e.target.value as any })
            }
          >
            <option value="pendiente">{t("pending")}</option>
            <option value="recibida">{t("received")}</option>
            <option value="cancelada">{t("cancelled")}</option>
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
