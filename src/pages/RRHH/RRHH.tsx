import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  PageHeader,
  Pagination,
  ConfirmModal,
} from "../../components/UI";
import { useEmpleadoStore } from "../../stores/empleadoStore";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import { useEmpleadoForm } from "../../application/hooks/useEmpleadoForm";
import type { EmployeeDto, EmployeeRequest } from "../../domain/types";
import { EmpleadoStats } from "../../components/RRHH/EmpleadoStats";
import { EmpleadoFilters } from "../../components/RRHH/EmpleadoFilters";
import { EmpleadoTable } from "../../components/RRHH/EmpleadoTable";
import { EmpleadoFormModal } from "../../components/RRHH/EmpleadoFormModal";
import styles from "./RRHH.module.css";
import { useFilter } from "../../hooks/useFilter";

export function RRHH() {
  const { t } = useTranslation();
  const {
    empleados,
    totalCount,
    fetchEmpleados,
    addEmpleado,
    updateEmpleado,
    deleteEmpleado,
  } = useEmpleadoStore();

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | string>("todos");
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const handleSubmit = (
    formData: EmployeeRequest,
    editingId: number | null,
  ) => {
    if (editingId) {
      updateEmpleado(editingId, formData);
    } else {
      addEmpleado(formData);
    }
    setShowForm(false);
  };

  const {
    formData,
    currentStep,
    editingId,
    setCurrentStep,
    updateField,
    reset,
    startEdit,
    submit,
  } = useEmpleadoForm(handleSubmit);

  const filteredEmpleados = useFilter({
    data: empleados,
    searchTerm,
    searchFields: (e: EmployeeDto) => [
      e.firstName,
      e.lastName,
      e.position,
      e.department,
    ],
    filter: (e: EmployeeDto) => {
      if (filterEstado === "todos") return true;
      const estadoMap: Record<string, string> = {
        activo: "Active",
        inactivo: "Inactive",
      };
      return e.status === estadoMap[filterEstado as string];
    },
  });

  const paginatedEmpleados = useMemo(
    () => paginate(filteredEmpleados, pageNumber, ITEMS_PER_PAGE),
    [filteredEmpleados, pageNumber],
  );
  const paginationInfo = getInfo(totalCount);

  const handleEdit = (empleado: EmployeeDto) => {
    startEdit(empleado);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteEmpleado(deleteId);
    }
  };

  const openNewForm = () => {
    reset();
    setShowForm(true);
  };

  return (
    <div className={styles.container}>
      <PageHeader title={t("rrhh.title")} subtitle={t("rrhh.subtitle")}>
        <>
          <Button
            variant="secondary"
            onClick={() => navigate("/rrhh/asistencia")}
          >
            {t("rrhh.viewAttendance")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/rrhh/nomina")}>
            {t("rrhh.viewPayroll")}
          </Button>
          <Button onClick={openNewForm}>+ {t("rrhh.newEmployee")}</Button>
        </>
      </PageHeader>

      <EmpleadoStats />

      <EmpleadoFilters
        searchTerm={searchTerm}
        filterEstado={filterEstado}
        onSearchChange={(v) => {
          setSearchTerm(v);
          goToPage(1);
        }}
        onEstadoChange={(v) => {
          setFilterEstado(v);
          goToPage(1);
        }}
      />

      <EmpleadoTable
        empleados={paginatedEmpleados}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <EmpleadoFormModal
        isOpen={showForm}
        editingId={editingId}
        formData={formData}
        currentStep={currentStep}
        onClose={() => setShowForm(false)}
        onFieldChange={updateField}
        onStepChange={setCurrentStep}
        onSubmit={submit}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("rrhh.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
