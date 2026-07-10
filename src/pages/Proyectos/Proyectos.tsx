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
import { useFilter } from "../../hooks/useFilter";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import type { Project } from "../../domain/types";
import styles from "./Proyectos.module.css";
import { ITEMS_PER_PAGE } from "../../config/pagination";

type ProjectStatus = Project["status"];

export function Proyectos() {
  const { t } = useTranslation();
  const { proyectos, fetchProyectos, addProyecto, updateProyecto, deleteProyecto } =
    useProyectoStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ProjectStatus>("all");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    status: "Pending" as ProjectStatus,
    budget: 0,
    spent: 0,
    startDate: "",
    endDate: "",
    progress: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  const filteredProyectos = useFilter({
    data: proyectos,
    searchTerm,
    searchFields: (p) => [p.name, p.client],
    filter: (p) => filterStatus === "all" || p.status === filterStatus,
  });

  const paginatedProyectos = useMemo(() => {
    return paginate(filteredProyectos, pageNumber, ITEMS_PER_PAGE);
  }, [filteredProyectos, pageNumber]);

  const paginationInfo = getInfo(filteredProyectos.length);

  const totalBudget = proyectos.reduce((acc, p) => acc + p.budget, 0);
  const inProgressCount = proyectos.filter((p) => p.status === "InProgress").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProyecto(editingId, formData);
        setEditingId(null);
      } else {
        await addProyecto(formData);
      }
      setShowForm(false);
      resetForm();
    } catch {
      // error se maneja en el store
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      client: "",
      status: "Pending",
      budget: 0,
      spent: 0,
      startDate: "",
      endDate: "",
      progress: 0,
    });
  };

  const handleEdit = (project: Project) => {
    setFormData({
      name: project.name,
      client: project.client,
      status: project.status,
      budget: project.budget,
      spent: project.spent,
      startDate: project.startDate,
      endDate: project.endDate,
      progress: project.progress,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteProyecto(deleteId);
      } catch {
        // error se maneja en el store
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "InProgress":
        return (
          <span className={`${styles.badge} ${styles.enProgreso}`}>
            {t("proyectos.inProgress")}
          </span>
        );
      case "Completed":
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
    { key: "name", header: t("proyectos.project") },
    { key: "client", header: t("common.client") },
    {
      key: "status",
      header: t("common.status"),
      render: (p: Project) => getStatusBadge(p.status),
    },
    {
      key: "budget",
      header: t("proyectos.budget"),
      render: (p: Project) => formatCurrency(p.budget),
    },
    {
      key: "spent",
      header: t("proyectos.spent"),
      render: (p: Project) => formatCurrency(p.spent),
    },
    {
      key: "progress",
      header: t("proyectos.progress"),
      render: (p: Project) => (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${p.progress}%` }}
          ></div>
          <span className={styles.progressText}>{p.progress}%</span>
        </div>
      ),
    },
    { key: "startDate", header: t("proyectos.startDate") },
    { key: "endDate", header: t("proyectos.endDate") },
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
            {inProgressCount}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("proyectos.totalBudget")}</span>
          <span className={styles.cardValue}>
            {formatCurrency(totalBudget)}
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
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as typeof filterStatus);
            goToPage(1);
          }}
          className={styles.select}
        >
          <option value="all">{t("proyectos.filterAll")}</option>
          <option value="InProgress">{t("proyectos.inProgress")}</option>
          <option value="Completed">{t("proyectos.completed")}</option>
          <option value="Pending">{t("proyectos.pending")}</option>
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
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("common.client")}</label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) =>
              setFormData({ ...formData, client: e.target.value })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("common.status")}</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as ProjectStatus,
              })
            }
          >
            <option value="Pending">{t("proyectos.pending")}</option>
            <option value="InProgress">{t("proyectos.inProgress")}</option>
            <option value="Completed">{t("proyectos.completed")}</option>
          </select>
        </div>
        <div className="formGroup">
          <label>{t("proyectos.budget")}</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.spent")}</label>
          <input
            type="number"
            value={formData.spent}
            onChange={(e) =>
              setFormData({ ...formData, spent: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.progress")}</label>
          <input
            type="number"
            value={formData.progress}
            onChange={(e) =>
              setFormData({ ...formData, progress: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.startDate")}</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
          />
        </div>
        <div className="formGroup">
          <label>{t("proyectos.endDate")}</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
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
