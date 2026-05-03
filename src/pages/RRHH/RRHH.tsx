import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, PageHeader, Pagination } from "../../components/UI";
import { useERP } from "../../context/ERPContext";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import { useEmpleadoForm, type EmpleadoFormData } from "../../application/hooks/useEmpleadoForm";
import type { Empleado, EstadoEmpleado } from "../../domain/entities/Empleado";
import { EmpleadoStats } from "../../components/RRHH/EmpleadoStats";
import { EmpleadoFilters } from "../../components/RRHH/EmpleadoFilters";
import { EmpleadoTable } from "../../components/RRHH/EmpleadoTable";
import { EmpleadoFormModal } from "../../components/RRHH/EmpleadoFormModal";
import styles from "./RRHH.module.css";

export function RRHH() {
  const { empleados, setEmpleados } = useERP();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoEmpleado>("todos");
  const [showForm, setShowForm] = useState(false);
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });

  const handleSubmit = (formData: EmpleadoFormData, editingId: string | null) => {
    const now = new Date().toISOString();
    if (editingId) {
      setEmpleados(empleados.map((e) => (e.id === editingId ? { ...e, ...formData, updatedAt: now } : e)));
    } else {
      const newEmpleado: Empleado = {
        ...formData,
        id: `EMP${String(empleados.length + 1).padStart(3, "0")}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        fechaAntiguedad: formData.fechaIngreso,
        horarioLaboral: "L-V 8:00 AM - 5:00 PM",
        ubicacion: "Santo Domingo - Oficina Principal",
        periodicidadPago: "quincenal",
        jefeDirectoId: null,
        createdAt: now,
        updatedAt: now,
      };
      setEmpleados([...empleados, newEmpleado]);
    }
    setShowForm(false);
  };

  const { formData, currentStep, editingId, setCurrentStep, updateField, reset, startEdit, submit } = useEmpleadoForm(handleSubmit);

  const filteredEmpleados = useMemo(() => {
    return empleados.filter((e) => {
      const matchesSearch =
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.departamento.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && (filterEstado === "todos" || e.estado === filterEstado);
    });
  }, [empleados, searchTerm, filterEstado]);

  const paginatedEmpleados = useMemo(() => paginate(filteredEmpleados, page, ITEMS_PER_PAGE), [filteredEmpleados, page]);
  const paginationInfo = getInfo(filteredEmpleados.length);

  const handleEdit = (empleado: Empleado) => {
    startEdit(empleado);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar empleado?")) setEmpleados(empleados.filter((e) => e.id !== id));
  };

  const openNewForm = () => {
    reset();
    setShowForm(true);
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Recursos Humanos" subtitle="Gestión de empleados">
        <>
          <Button variant="secondary" onClick={() => navigate("/rrhh/nomina")}>Ver Nómina</Button>
          <Button onClick={openNewForm}>+ Nuevo Empleado</Button>
        </>
      </PageHeader>

      <EmpleadoStats empleados={empleados} />

      <EmpleadoFilters
        searchTerm={searchTerm}
        filterEstado={filterEstado}
        onSearchChange={(v) => { setSearchTerm(v); goToPage(1); }}
        onEstadoChange={(v) => { setFilterEstado(v); goToPage(1); }}
      />

      <EmpleadoTable empleados={paginatedEmpleados} onEdit={handleEdit} onDelete={handleDelete} />

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
    </div>
  );
}