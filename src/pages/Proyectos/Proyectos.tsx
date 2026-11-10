import { useState, useEffect, useCallback, useMemo } from "react";
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
  DynamicFormFields,
  VolterpMark,
} from "../../components/UI";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { useClientes } from "../../hooks/useColecciones";
import { useFilter } from "../../hooks/useFilter";
import { usePagination } from "../../hooks/usePagination";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import type { Project } from "../../domain/types";
import styles from "./Proyectos.module.css";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import { money } from "../../utils/currency";

type ProjectStatus = Project["status"];

export function Proyectos() {
  const { t } = useTranslation();
  const {
    proyectos,
    totalCount,
    fetchProyectos,
    addProyecto,
    updateProyecto,
    deleteProyecto,
  } = useProyectoStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ProjectStatus>(
    "all",
  );
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const clientes = useClientes();

  const fetchData = useCallback(() => {
    fetchProyectos(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchProyectos]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProyectos = useFilter({
    data: proyectos,
    searchTerm,
    searchFields: (p) => [p.name, p.client],
    filter: (p) => filterStatus === "all" || p.status === filterStatus,
  });

  const paginationInfo = getInfo(totalCount);

  const totalBudget = proyectos.reduce((acc, p) => acc + p.budget, 0);
  const inProgressCount = proyectos.filter(
    (p) => p.status === "InProgress",
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const GENERAL_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: t("proyectos.projectName"),
        type: "text",
        required: true,
        span: 6,
        section: "proyectos.sectionGeneral",
        placeholder: t("proyectos.namePlaceholder"),
      },
      {
        name: "client",
        label: t("common.client"),
        type: "combobox",
        required: true,
        span: 3,
        section: "proyectos.sectionGeneral",
        placeholder: t("proyectos.selectClient"),
        emptyLabel: t("proyectos.noClientsFound"),
        options: clientes.map((c) => ({
          value: c.name,
          label: c.name,
          keywords: [c.code, c.email].filter(Boolean),
        })),
      },
      {
        name: "status",
        label: t("common.status"),
        type: "select",
        span: 3,
        section: "proyectos.sectionGeneral",
        options: [
          { value: "Pending", label: t("proyectos.pending") },
          { value: "InProgress", label: t("proyectos.inProgress") },
          { value: "Completed", label: t("proyectos.completed") },
        ],
      },
    ],
    [t, clientes],
  );

  // Presupuesto, gastado y progreso los dibuja la pagina.
  const LOCAL_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "budget",
        label: t("proyectos.budget"),
        type: "number",
        required: true,
      },
      { name: "spent", label: t("proyectos.spent"), type: "number" },
      { name: "progress", label: t("proyectos.progress"), type: "number" },
    ],
    [t],
  );

  const CRONOGRAMA_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "startDate",
        label: t("proyectos.startDate"),
        type: "date",
        span: 3,
        section: "proyectos.sectionSchedule",
      },
      {
        name: "endDate",
        label: t("proyectos.endDate"),
        type: "date",
        span: 3,
        section: "proyectos.sectionSchedule",
      },
    ],
    [t],
  );

  const form = useCrudForm({
    fields: [...GENERAL_FIELDS, ...LOCAL_FIELDS, ...CRONOGRAMA_FIELDS],
    defaultValues: {
      name: "",
      client: "",
      status: "Pending",
      budget: 0,
      spent: 0,
      startDate: "",
      endDate: "",
      progress: 0,
    },
    onCreate: (data) => addProyecto(data as Partial<Project>),
    onUpdate: (id, data) => updateProyecto(id, data as Partial<Project>),
    onSuccess: () => {
      setShowForm(false);
      fetchData();
    },
  });

  const handleEdit = (project: Project) => {
    form.handleEdit(project, project.id);
    setShowForm(true);
  };

  const { showDeleteConfirm, deleteId, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: deleteProyecto,
      successMessage: t("proyectos.projectDeleted"),
    });

  const pendingProject = proyectos.find((p) => p.id === deleteId) ?? null;

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
            form.reset();
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
        data={filteredProyectos}
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
            ? t("proyectos.editProject")
            : t("proyectos.newProject")
        }
        icon={<VolterpMark size={40} />}
        subtitle={
          form.editingId
            ? t("proyectos.editProjectHint")
            : t("proyectos.newProjectHint")
        }
        size="lg"
        error={form.submitError}
        noValidate
        onSubmit={form.handleSubmit}
        submitLabel={
          form.editingId ? t("common.save") : t("proyectos.createProject")
        }
        submitVariant="dark"
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <div className={styles.form}>
          <DynamicFormFields
            fields={GENERAL_FIELDS}
            values={form.values}
            errors={form.errors}
            editingId={form.editingId}
            onChange={form.setFieldValue}
          />

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>
              {t("proyectos.sectionBudget")}
            </h4>
            <div className={styles.budgetRow}>
              <div className={styles.formField}>
                <div className={styles.formLabelRow}>
                  <label>
                    {t("proyectos.budget")}
                    <span className={styles.required}>*</span>
                  </label>
                </div>
                <div className={styles.amountField}>
                  <span className={styles.amountPrefix}>RD$</span>
                  <input
                    type="number"
                    className={styles.amountInput}
                    value={form.values.budget}
                    onChange={(e) =>
                      form.setFieldValue("budget", Number(e.target.value))
                    }
                    required
                  />
                </div>
                {form.errors.budget && (
                  <span className={styles.error}>{form.errors.budget}</span>
                )}
              </div>
              <div className={styles.formField}>
                <div className={styles.formLabelRow}>
                  <label>{t("proyectos.spent")}</label>
                </div>
                <div className={styles.amountField}>
                  <span className={styles.amountPrefix}>RD$</span>
                  <input
                    type="number"
                    className={styles.amountInput}
                    value={form.values.spent}
                    onChange={(e) =>
                      form.setFieldValue("spent", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
            <div className={styles.formField}>
              <div className={styles.formLabelRow}>
                <label>{t("proyectos.progress")}</label>
                <span className={styles.progressValue}>
                  {form.values.progress} %
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                className={styles.range}
                value={form.values.progress}
                onChange={(e) =>
                  form.setFieldValue("progress", Number(e.target.value))
                }
              />
            </div>
          </section>

          <DynamicFormFields
            fields={CRONOGRAMA_FIELDS}
            values={form.values}
            errors={form.errors}
            editingId={form.editingId}
            onChange={form.setFieldValue}
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={`${t("common.delete")} ${t("common.project")}`}
        message={t("proyectos.deleteConfirm")}
        confirmLabel={t("common.confirmDeleteAction")}
        cancelLabel={t("common.cancel")}
        context={
          pendingProject
            ? {
                title: `${t("common.project")} ${pendingProject.name}`,
                subtitle: `${t("proyectos.projectClient")}: ${pendingProject.client}`,
                amount: money(pendingProject.budget),
              }
            : undefined
        }
      />
    </div>
  );
}
