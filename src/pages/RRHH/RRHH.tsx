import { useState, useEffect } from "react";
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
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import { useEmpleadoForm } from "../../application/hooks/useEmpleadoForm";
import type { EmployeeDto, EmployeeRequest } from "../../domain/types";
import { EmpleadoStats } from "../../components/RRHH/EmpleadoStats";
import { EmpleadoFilters } from "../../components/RRHH/EmpleadoFilters";
import { EmpleadoTable } from "../../components/RRHH/EmpleadoTable";
import { EmpleadoFormModal } from "../../components/RRHH/EmpleadoFormModal";
import styles from "./RRHH.module.css";
import { useFilter } from "../../hooks/useFilter";
import { money } from "../../utils/currency";

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

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | string>("todos");
  const [showForm, setShowForm] = useState(false);
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    fetchEmpleados(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchEmpleados]);

  const handleSubmit = (
    formData: EmployeeRequest,
    editingId: string | null,
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
      e.code,
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

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (empleado: EmployeeDto) => {
    startEdit(empleado);
    setShowForm(true);
  };

  const { showDeleteConfirm, deleteId, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: deleteEmpleado,
      successMessage: t("rrhh.employeeDeleted"),
    });

  const pendingEmployee = empleados.find((e) => e.id === deleteId) ?? null;

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
        empleados={filteredEmpleados}
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
        onCancel={cancelDelete}
        title={`${t("common.delete")} ${t("common.employee")}`}
        message={t("rrhh.deleteConfirm")}
        confirmLabel={t("common.confirmDeleteAction")}
        cancelLabel={t("common.cancel")}
        context={
          pendingEmployee
            ? {
                title: `${t("common.employee")} #${pendingEmployee.code}`,
                subtitle: [
                  `${pendingEmployee.firstName} ${pendingEmployee.lastName}`,
                  pendingEmployee.position,
                ]
                  .filter(Boolean)
                  .join(" · "),
                amount: money(pendingEmployee.salary),
              }
            : undefined
        }
      />
    </div>
  );
}
