import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransaccionStore } from "../../stores/transaccionStore";
import {
  Table,
  Button,
  PageHeader,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import type { TransaccionContable } from "../../data/mockData";
import styles from "./Contabilidad.module.css";
import { ITEMS_PER_PAGE } from "../../config/pagination";

export function Contabilidad() {
  const { t } = useTranslation();
  const {
    transacciones,
    addTransaccion,
    updateTransaccion,
    deleteTransaccion,
  } = useTransaccionStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | "ingreso" | "egreso">(
    "todos",
  );
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [formData, setFormData] = useState({
    descripcion: "",
    tipo: "ingreso" as "ingreso" | "egreso",
    monto: 0,
    fecha: "",
    categoria: "",
    estado: "pendiente" as "conciliada" | "pendiente",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredTransacciones = useMemo(() => {
    return transacciones.filter((t) => {
      const matchesSearch =
        t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = filterTipo === "todos" || t.tipo === filterTipo;
      return matchesSearch && matchesTipo;
    });
  }, [transacciones, searchTerm, filterTipo]);

  const paginatedTransacciones = useMemo(() => {
    return paginate(filteredTransacciones, pageNumber, ITEMS_PER_PAGE);
  }, [filteredTransacciones, pageNumber]);

  const paginationInfo = getInfo(filteredTransacciones.length);

  const totalIngresos = transacciones
    .filter((t) => t.tipo === "ingreso")
    .reduce((acc, t) => acc + t.monto, 0);
  const totalEgresos = transacciones
    .filter((t) => t.tipo === "egreso")
    .reduce((acc, t) => acc + t.monto, 0);
  const balance = totalIngresos - totalEgresos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTransaccion(editingId, formData);
      setEditingId(null);
    } else {
      const newTransaccion: TransaccionContable = {
        ...formData,
        id: `CNT${String(transacciones.length + 1).padStart(3, "0")}`,
      };
      addTransaccion(newTransaccion);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      descripcion: "",
      tipo: "ingreso",
      monto: 0,
      fecha: "",
      categoria: "",
      estado: "pendiente",
    });
  };

  const handleEdit = (t: TransaccionContable) => {
    setFormData({
      descripcion: t.descripcion,
      tipo: t.tipo,
      monto: t.monto,
      fecha: t.fecha,
      categoria: t.categoria,
      estado: t.estado,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteTransaccion(deleteId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    { key: "id", header: t("common.id") },
    { key: "descripcion", header: t("common.description") },
    {
      key: "tipo",
      header: t("common.type"),
      render: (tr: TransaccionContable) => (
        <span
          className={`${styles.badge} ${tr.tipo === "ingreso" ? styles.ingreso : styles.egreso}`}
        >
          {tr.tipo === "ingreso"
            ? t("contabilidad.income")
            : t("contabilidad.expense")}
        </span>
      ),
    },
    {
      key: "monto",
      header: t("common.amount"),
      render: (tr: TransaccionContable) => (
        <span
          className={tr.tipo === "ingreso" ? styles.positivo : styles.negativo}
        >
          {tr.tipo === "ingreso" ? "+" : "-"}
          {formatCurrency(tr.monto)}
        </span>
      ),
    },
    { key: "categoria", header: t("common.category") },
    { key: "fecha", header: t("common.date") },
    {
      key: "estado",
      header: t("common.status"),
      render: (tr: TransaccionContable) => (
        <span
          className={`${styles.badge} ${tr.estado === "conciliada" ? styles.conciliada : styles.pendiente}`}
        >
          {tr.estado === "conciliada"
            ? t("contabilidad.reconciled")
            : t("contabilidad.pending")}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("contabilidad.title")}
        subtitle={t("contabilidad.subtitle")}
      >
        <Button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + {t("contabilidad.newTransaction")}
        </Button>
      </PageHeader>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("contabilidad.income")}</span>
          <span className={`${styles.cardValue} ${styles.positivo}`}>
            {formatCurrency(totalIngresos)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("contabilidad.expenses")}</span>
          <span className={`${styles.cardValue} ${styles.negativo}`}>
            {formatCurrency(totalEgresos)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("contabilidad.balance")}</span>
          <span
            className={`${styles.cardValue} ${balance >= 0 ? styles.positivo : styles.negativo}`}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            goToPage(1);
          }}
          placeholder={t("contabilidad.searchTransaction")}
          width="240px"
        />
        <select
          value={filterTipo}
          onChange={(e) => {
            setFilterTipo(e.target.value as typeof filterTipo);
            goToPage(1);
          }}
          className={styles.select}
        >
          <option value="todos">{t("contabilidad.filterAll")}</option>
          <option value="ingreso">{t("contabilidad.income")}</option>
          <option value="egreso">{t("contabilidad.expenses")}</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={paginatedTransacciones}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          editingId
            ? t("contabilidad.editTransaction")
            : t("contabilidad.newTransaction")
        }
        onSubmit={handleSubmit}
        submitLabel={editingId ? t("common.save") : t("common.create")}
      >
        <div className="formGroup">
          <label>{t("common.description")}</label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("common.type")}</label>
          <select
            value={formData.tipo}
            onChange={(e) =>
              setFormData({
                ...formData,
                tipo: e.target.value as "ingreso" | "egreso",
              })
            }
          >
            <option value="ingreso">{t("contabilidad.income")}</option>
            <option value="egreso">{t("contabilidad.expenses")}</option>
          </select>
        </div>
        <div className="formGroup">
          <label>{t("common.amount")}</label>
          <input
            type="number"
            value={formData.monto}
            onChange={(e) =>
              setFormData({ ...formData, monto: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="formGroup">
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
        <div className="formGroup">
          <label>{t("common.category")}</label>
          <input
            type="text"
            value={formData.categoria}
            onChange={(e) =>
              setFormData({ ...formData, categoria: e.target.value })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("common.status")}</label>
          <select
            value={formData.estado}
            onChange={(e) =>
              setFormData({
                ...formData,
                estado: e.target.value as "conciliada" | "pendiente",
              })
            }
          >
            <option value="pendiente">{t("contabilidad.pending")}</option>
            <option value="conciliada">{t("contabilidad.reconciled")}</option>
          </select>
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
        message={t("contabilidad.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
