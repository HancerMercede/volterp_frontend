import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useProyectoStore } from "../../stores/proyectoStore";
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
import type { Proyecto } from "../../data/mockData";
import styles from "./Proyectos.module.css";
import { ITEMS_PER_PAGE } from "../../config/pagination";

export function Proyectos() {
  const { t } = useTranslation();
  const { proyectos, addProyecto, updateProyecto, deleteProyecto } =
    useProyectoStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<
    "todos" | "en_progreso" | "completado" | "pendiente"
  >("todos");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [formData, setFormData] = useState({
    nombre: "",
    cliente: "",
    estado: "pendiente" as "en_progreso" | "completado" | "pendiente",
    presupuesto: 0,
    gastado: 0,
    fechaInicio: "",
    fechaFin: "",
    progreso: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredProyectos = useMemo(() => {
    return proyectos.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado =
        filterEstado === "todos" || p.estado === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [proyectos, searchTerm, filterEstado]);

  const paginatedProyectos = useMemo(() => {
    return paginate(filteredProyectos, pageNumber, ITEMS_PER_PAGE);
  }, [filteredProyectos, pageNumber]);

  const paginationInfo = getInfo(filteredProyectos.length);

  const totalPresupuesto = proyectos.reduce((acc, p) => acc + p.presupuesto, 0);
  const enProgreso = proyectos.filter((p) => p.estado === "en_progreso").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProyecto(editingId, formData);
      setEditingId(null);
    } else {
      const newProyecto: Proyecto = {
        ...formData,
        id: `PRY${String(proyectos.length + 1).padStart(3, "0")}`,
      };
      addProyecto(newProyecto);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      cliente: "",
      estado: "pendiente",
      presupuesto: 0,
      gastado: 0,
      fechaInicio: "",
      fechaFin: "",
      progreso: 0,
    });
  };

  const handleEdit = (proyecto: Proyecto) => {
    setFormData({
      nombre: proyecto.nombre,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      presupuesto: proyecto.presupuesto,
      gastado: proyecto.gastado,
      fechaInicio: proyecto.fechaInicio,
      fechaFin: proyecto.fechaFin,
      progreso: proyecto.progreso,
    });
    setEditingId(proyecto.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteProyecto(deleteId);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "en_progreso":
        return (
          <span className={`${styles.badge} ${styles.enProgreso}`}>
            {t("proyectos.inProgress")}
          </span>
        );
      case "completado":
        return (
          <span className={`${styles.badge} ${styles.completado}`}>
            {t("proyectos.completed")}
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.pendiente}`}>
            {t("proyectos.pending")}
          </span>
        );
    }
  };

  const columns = [
    { key: "id", header: t("common.id") },
    { key: "nombre", header: t("proyectos.project") },
    { key: "cliente", header: t("common.client") },
    {
      key: "estado",
      header: t("common.status"),
      render: (p: Proyecto) => getEstadoBadge(p.estado),
    },
    {
      key: "presupuesto",
      header: t("proyectos.budget"),
      render: (p: Proyecto) => formatCurrency(p.presupuesto),
    },
    {
      key: "gastado",
      header: t("proyectos.spent"),
      render: (p: Proyecto) => formatCurrency(p.gastado),
    },
    {
      key: "progreso",
      header: t("proyectos.progress"),
      render: (p: Proyecto) => (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${p.progreso}%` }}
          ></div>
          <span className={styles.progressText}>{p.progreso}%</span>
        </div>
      ),
    },
    { key: "fechaInicio", header: t("proyectos.startDate") },
    { key: "fechaFin", header: t("proyectos.endDate") },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("proyectos.title")}
        subtitle={t("proyectos.subtitle")}
      >
        <Button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + {t("proyectos.newProject")}
        </Button>
      </PageHeader>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>
            {t("proyectos.totalProjects")}
          </span>
          <span className={styles.cardValue}>{proyectos.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("proyectos.inProgress")}</span>
          <span className={`${styles.cardValue} ${styles.enProgreso}`}>
            {enProgreso}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("proyectos.totalBudget")}</span>
          <span className={styles.cardValue}>
            {formatCurrency(totalPresupuesto)}
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
          placeholder={t("proyectos.searchProject")}
          width="240px"
        />
        <select
          value={filterEstado}
          onChange={(e) => {
            setFilterEstado(e.target.value as typeof filterEstado);
            goToPage(1);
          }}
          className={styles.select}
        >
          <option value="todos">{t("proyectos.filterAll")}</option>
          <option value="en_progreso">{t("proyectos.inProgress")}</option>
          <option value="completado">{t("proyectos.completed")}</option>
          <option value="pendiente">{t("proyectos.pending")}</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={paginatedProyectos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          editingId ? t("proyectos.editProject") : t("proyectos.newProject")
        }
        onSubmit={handleSubmit}
        submitLabel={editingId ? t("common.save") : t("common.create")}
      >
        <div className="formGroup">
          <label>{t("proyectos.projectName")}</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("common.client")}</label>
          <input
            type="text"
            value={formData.cliente}
            onChange={(e) =>
              setFormData({ ...formData, cliente: e.target.value })
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
                estado: e.target.value as
                  | "en_progreso"
                  | "completado"
                  | "pendiente",
              })
            }
          >
            <option value="pendiente">{t("proyectos.pending")}</option>
            <option value="en_progreso">{t("proyectos.inProgress")}</option>
            <option value="completado">{t("proyectos.completed")}</option>
          </select>
        </div>
        <div className="formGroup">
          <label>{t("proyectos.budget")}</label>
          <input
            type="number"
            value={formData.presupuesto}
            onChange={(e) =>
              setFormData({ ...formData, presupuesto: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.spent")}</label>
          <input
            type="number"
            value={formData.gastado}
            onChange={(e) =>
              setFormData({ ...formData, gastado: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.progress")}</label>
          <input
            type="number"
            value={formData.progreso}
            onChange={(e) =>
              setFormData({ ...formData, progreso: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.startDate")}</label>
          <input
            type="date"
            value={formData.fechaInicio}
            onChange={(e) =>
              setFormData({ ...formData, fechaInicio: e.target.value })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.endDate")}</label>
          <input
            type="date"
            value={formData.fechaFin}
            onChange={(e) =>
              setFormData({ ...formData, fechaFin: e.target.value })
            }
            required
          />
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
        message={t("proyectos.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
