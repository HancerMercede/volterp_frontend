import { useState, useMemo } from "react";
import { useERP } from "../../context/ERPContext";
import {
  Table,
  Button,
  PageHeader,
  ImageCell,
  Pagination,
  SearchInput,
  Modal,
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { Empleado, EstadoEmpleado } from "../../domain/entities/Empleado";
import styles from "./RRHH.module.css";

interface EmpleadoFormData {
  nombre: string;
  informacionPersonal: {
    cedula: string;
    fechaNacimiento: string;
    genero: "M" | "F" | "Otro";
    estadoCivil: "soltero" | "casado" | "divorciado" | "viudo";
  };
  emailLaboral: string;
  emailPersonal: string;
  telefonoLaboral: string;
  telefonoPersonal: string;
  direccion: string;
  ciudad: string;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  informacionFiscal: {
    afp: string;
    afpNumero: string;
    ars: string;
    arsNumero: string;
    nss: string;
  };
  cargo: string;
  departamento: string;
  tipoContrato: "indefinido" | "temporal" | "por_proyecto" | "suplencia";
  fechaIngreso: string;
  salarioBase: number;
  estado: EstadoEmpleado;
  cuentaBancaria: {
    banco: string;
    numeroCuenta: string;
    tipoCuenta: "ahorro" | "corriente";
  };
}

const getInitialFormData = (): EmpleadoFormData => ({
  nombre: "",
  informacionPersonal: {
    cedula: "",
    fechaNacimiento: "",
    genero: "M",
    estadoCivil: "soltero",
  },
  emailLaboral: "",
  emailPersonal: "",
  telefonoLaboral: "",
  telefonoPersonal: "",
  direccion: "",
  ciudad: "",
  contactoEmergencia: {
    nombre: "",
    telefono: "",
    relacion: "",
  },
  informacionFiscal: {
    afp: "",
    afpNumero: "",
    ars: "",
    arsNumero: "",
    nss: "",
  },
  cargo: "",
  departamento: "",
  tipoContrato: "indefinido",
  fechaIngreso: "",
  salarioBase: 0,
  estado: "activo",
  cuentaBancaria: {
    banco: "",
    numeroCuenta: "",
    tipoCuenta: "corriente",
  },
});

const FORM_STEPS = [
  { id: 1, title: "Datos Personales", fields: ["nombre", "cedula", "fechaNacimiento", "genero", "estadoCivil"] },
  { id: 2, title: "Información de Contacto", fields: ["emailLaboral", "emailPersonal", "telefonoLaboral", "telefonoPersonal", "direccion", "ciudad"] },
  { id: 3, title: "Contacto de Emergencia", fields: ["contactoEmergencia"] },
  { id: 4, title: "Información Fiscal", fields: ["informacionFiscal"] },
  { id: 5, title: "Datos Laborales", fields: ["cargo", "departamento", "tipoContrato", "fechaIngreso", "salarioBase", "estado"] },
  { id: 6, title: "Datos Bancarios", fields: ["cuentaBancaria"] },
];

export function RRHH() {
  const { empleados, setEmpleados } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoEmpleado>("todos");
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState<EmpleadoFormData>(getInitialFormData());
  const [currentStep, setCurrentStep] = useState(1);

  const filteredEmpleados = useMemo(() => {
    return empleados.filter((e) => {
      const matchesSearch =
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.departamento.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "todos" || e.estado === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [empleados, searchTerm, filterEstado]);

  const paginatedEmpleados = useMemo(() => {
    return paginate(filteredEmpleados, page, ITEMS_PER_PAGE);
  }, [filteredEmpleados, page]);

  const paginationInfo = getInfo(filteredEmpleados.length);

  const totalSalarios = useMemo(() => {
    return empleados
      .filter((e) => e.estado === "activo")
      .reduce((acc, e) => acc + e.salarioBase, 0);
  }, [empleados]);

  const activos = useMemo(() => empleados.filter((e) => e.estado === "activo").length, [empleados]);
  const enVacaciones = useMemo(() => empleados.filter((e) => e.estado === "vacaciones").length, [empleados]);
  const enLicencia = useMemo(() => empleados.filter((e) => e.estado === "licencia").length, [empleados]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (editingId) {
      setEmpleados(empleados.map((e) => (e.id === editingId ? { ...e, ...formData, updatedAt: now } : e)));
      setEditingId(null);
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
    resetForm();
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setCurrentStep(1);
  };

  const handleEdit = (empleado: Empleado) => {
    setFormData({
      nombre: empleado.nombre,
      informacionPersonal: { ...empleado.informacionPersonal },
      emailLaboral: empleado.emailLaboral,
      emailPersonal: empleado.emailPersonal,
      telefonoLaboral: empleado.telefonoLaboral,
      telefonoPersonal: empleado.telefonoPersonal,
      direccion: empleado.direccion,
      ciudad: empleado.ciudad,
      contactoEmergencia: { ...empleado.contactoEmergencia },
      informacionFiscal: { ...empleado.informacionFiscal },
      cargo: empleado.cargo,
      departamento: empleado.departamento,
      tipoContrato: empleado.tipoContrato,
      fechaIngreso: empleado.fechaIngreso,
      salarioBase: empleado.salarioBase,
      estado: empleado.estado,
      cuentaBancaria: { ...empleado.cuentaBancaria },
    });
    setEditingId(empleado.id);
    setCurrentStep(1);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar empleado?")) {
      setEmpleados(empleados.filter((e) => e.id !== id));
    }
  };

  const updateFormField = (path: string, value: unknown) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current: Record<string, unknown> = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const getStatusBadgeClass = (status: EstadoEmpleado) => {
    switch (status) {
      case "activo": return styles.badgeActivo;
      case "inactivo": return styles.badgeInactivo;
      case "vacaciones": return styles.badgeVacaciones;
      case "licencia": return styles.badgeLicencia;
      default: return "";
    }
  };

  const getStatusLabel = (status: EstadoEmpleado) => {
    switch (status) {
      case "activo": return "Activo";
      case "inactivo": return "Inactivo";
      case "vacaciones": return "Vacaciones";
      case "licencia": return "Licencia";
      default: return status;
    }
  };

  const columns = [
    { key: "id", header: "ID" },
    {
      key: "avatar",
      header: "Empleado",
      render: (e: Empleado) => <ImageCell src={e.avatar} name={e.nombre} />,
    },
    { key: "cargo", header: "Cargo" },
    { key: "departamento", header: "Departamento" },
    { key: "emailLaboral", header: "Email" },
    { key: "telefonoLaboral", header: "Teléfono" },
    {
      key: "salarioBase",
      header: "Salario",
      render: (e: Empleado) => formatCurrency(e.salarioBase),
    },
    {
      key: "estado",
      header: "Estado",
      render: (e: Empleado) => (
        <span className={`${styles.badge} ${getStatusBadgeClass(e.estado)}`}>
          {getStatusLabel(e.estado)}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="Recursos Humanos" subtitle="Gestión de empleados">
        <Button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Nuevo Empleado
        </Button>
      </PageHeader>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total Empleados</span>
          <span className={styles.cardValue}>{empleados.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Activos</span>
          <span className={`${styles.cardValue} ${styles.textActivo}`}>{activos}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Nómina Mensual</span>
          <span className={styles.cardValue}>{formatCurrency(totalSalarios)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>En Vacaciones</span>
          <span className={`${styles.cardValue} ${styles.textVacaciones}`}>{enVacaciones}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>En Licencia</span>
          <span className={`${styles.cardValue} ${styles.textLicencia}`}>{enLicencia}</span>
        </div>
      </div>

      <div className={styles.filters}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => { setSearchTerm(value); goToPage(1); }}
          placeholder="Buscar empleados..."
          width="240px"
        />
        <select
          value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value as typeof filterEstado); goToPage(1); }}
          className={styles.select}
        >
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="vacaciones">Vacaciones</option>
          <option value="licencia">Licencia</option>
        </select>
      </div>

      <Table columns={columns} data={paginatedEmpleados} onEdit={handleEdit} onDelete={handleDelete} />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Editar Empleado" : "Nuevo Empleado"}
        onSubmit={handleSubmit}
        submitLabel={editingId ? "Guardar" : "Crear"}
      >
        <div className={styles.stepIndicator}>
          {FORM_STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              className={`${styles.stepBtn} ${currentStep === step.id ? styles.stepActive : ""} ${currentStep > step.id ? styles.stepCompleted : ""}`}
              onClick={() => setCurrentStep(step.id)}
            >
              {step.id}
            </button>
          ))}
        </div>
        <div className={styles.stepTitle}>Paso {currentStep}: {FORM_STEPS[currentStep - 1]?.title}</div>

        {currentStep === 1 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nombre Completo *</label>
              <input type="text" value={formData.nombre} onChange={(e) => updateFormField("nombre", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Cédula *</label>
              <input type="text" value={formData.informacionPersonal.cedula} onChange={(e) => updateFormField("informacionPersonal.cedula", e.target.value)} placeholder="001-1234567-8" required />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha de Nacimiento *</label>
              <input type="date" value={formData.informacionPersonal.fechaNacimiento} onChange={(e) => updateFormField("informacionPersonal.fechaNacimiento", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Género</label>
              <select value={formData.informacionPersonal.genero} onChange={(e) => updateFormField("informacionPersonal.genero", e.target.value)}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Estado Civil</label>
              <select value={formData.informacionPersonal.estadoCivil} onChange={(e) => updateFormField("informacionPersonal.estadoCivil", e.target.value)}>
                <option value="soltero">Soltero</option>
                <option value="casado">Casado</option>
                <option value="divorciado">Divorciado</option>
                <option value="viudo">Viudo</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Email Laboral *</label>
              <input type="email" value={formData.emailLaboral} onChange={(e) => updateFormField("emailLaboral", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Email Personal</label>
              <input type="email" value={formData.emailPersonal} onChange={(e) => updateFormField("emailPersonal", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Teléfono Laboral</label>
              <input type="tel" value={formData.telefonoLaboral} onChange={(e) => updateFormField("telefonoLaboral", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Teléfono Personal *</label>
              <input type="tel" value={formData.telefonoPersonal} onChange={(e) => updateFormField("telefonoPersonal", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Dirección</label>
              <input type="text" value={formData.direccion} onChange={(e) => updateFormField("direccion", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Ciudad</label>
              <input type="text" value={formData.ciudad} onChange={(e) => updateFormField("ciudad", e.target.value)} />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nombre Contacto Emergencia *</label>
              <input type="text" value={formData.contactoEmergencia.nombre} onChange={(e) => updateFormField("contactoEmergencia.nombre", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Teléfono Emergencia *</label>
              <input type="tel" value={formData.contactoEmergencia.telefono} onChange={(e) => updateFormField("contactoEmergencia.telefono", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Relación</label>
              <input type="text" value={formData.contactoEmergencia.relacion} onChange={(e) => updateFormField("contactoEmergencia.relacion", e.target.value)} placeholder="Esposo, Madre, Padre, etc." />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>AFP</label>
              <select value={formData.informacionFiscal.afp} onChange={(e) => updateFormField("informacionFiscal.afp", e.target.value)}>
                <option value="">Seleccionar AFP</option>
                <option value="AFP Reservas">AFP Reservas</option>
                <option value="AFP Popular">AFP Popular</option>
                <option value="AFP Senasa">AFP Senasa</option>
                <option value="AFP Capital">AFP Capital</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Número AFP</label>
              <input type="text" value={formData.informacionFiscal.afpNumero} onChange={(e) => updateFormField("informacionFiscal.afpNumero", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>ARS</label>
              <select value={formData.informacionFiscal.ars} onChange={(e) => updateFormField("informacionFiscal.ars", e.target.value)}>
                <option value="">Seleccionar ARS</option>
                <option value="ARS Humano">ARS Humano</option>
                <option value="ARS Senasa">ARS Senasa</option>
                <option value="ARS Universal">ARS Universal</option>
                <option value="ARS Palic">ARS Palic</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Número ARS</label>
              <input type="text" value={formData.informacionFiscal.arsNumero} onChange={(e) => updateFormField("informacionFiscal.arsNumero", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>NSS (Número Seguro Social)</label>
              <input type="text" value={formData.informacionFiscal.nss} onChange={(e) => updateFormField("informacionFiscal.nss", e.target.value)} placeholder="123456789012" />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Cargo *</label>
              <input type="text" value={formData.cargo} onChange={(e) => updateFormField("cargo", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Departamento *</label>
              <input type="text" value={formData.departamento} onChange={(e) => updateFormField("departamento", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Tipo de Contrato</label>
              <select value={formData.tipoContrato} onChange={(e) => updateFormField("tipoContrato", e.target.value)}>
                <option value="indefinido">Indefinido</option>
                <option value="temporal">Temporal</option>
                <option value="por_proyecto">Por Proyecto</option>
                <option value="suplencia">Suplencia</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Fecha de Ingreso *</label>
              <input type="date" value={formData.fechaIngreso} onChange={(e) => updateFormField("fechaIngreso", e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Salario Base *</label>
              <input type="number" value={formData.salarioBase} onChange={(e) => updateFormField("salarioBase", Number(e.target.value))} required />
            </div>
            <div className={styles.formGroup}>
              <label>Estado</label>
              <select value={formData.estado} onChange={(e) => updateFormField("estado", e.target.value)}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="licencia">Licencia</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Banco</label>
              <select value={formData.cuentaBancaria.banco} onChange={(e) => updateFormField("cuentaBancaria.banco", e.target.value)}>
                <option value="">Seleccionar Banco</option>
                <option value="Banco Popular Dominicano">Banco Popular Dominicano</option>
                <option value="Banco de la Nación">Banco de la Nación</option>
                <option value="Banco BDI">Banco BDI</option>
                <option value="Banco Scotiabank">Banco Scotiabank</option>
                <option value="Banco de la Florida">Banco de la Florida</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Número de Cuenta</label>
              <input type="text" value={formData.cuentaBancaria.numeroCuenta} onChange={(e) => updateFormField("cuentaBancaria.numeroCuenta", e.target.value)} placeholder="XXXX-XXXX-XXXX" />
            </div>
            <div className={styles.formGroup}>
              <label>Tipo de Cuenta</label>
              <select value={formData.cuentaBancaria.tipoCuenta} onChange={(e) => updateFormField("cuentaBancaria.tipoCuenta", e.target.value)}>
                <option value="corriente">Corriente</option>
                <option value="ahorro">Ahorro</option>
              </select>
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          {currentStep > 1 && (
            <Button type="button" onClick={() => setCurrentStep(currentStep - 1)} variant="secondary">
              Anterior
            </Button>
          )}
          {currentStep < FORM_STEPS.length ? (
            <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button type="submit">{editingId ? "Guardar Cambios" : "Crear Empleado"}</Button>
          )}
        </div>
      </Modal>
    </div>
  );
}