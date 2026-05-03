import { useState, useCallback } from "react";
import type { Empleado, EstadoEmpleado } from "../../domain/entities/Empleado";

export interface EmpleadoFormData {
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
  contactoEmergencia: { nombre: string; telefono: string; relacion: string };
  informacionFiscal: { afp: string; afpNumero: string; ars: string; arsNumero: string; nss: string };
  cargo: string;
  departamento: string;
  tipoContrato: "indefinido" | "temporal" | "por_proyecto" | "suplencia";
  fechaIngreso: string;
  salarioBase: number;
  estado: EstadoEmpleado;
  cuentaBancaria: { banco: string; numeroCuenta: string; tipoCuenta: "ahorro" | "corriente" };
}

export const FORM_STEPS = [
  { id: 1, title: "Datos Personales" },
  { id: 2, title: "Contacto" },
  { id: 3, title: "Emergencia" },
  { id: 4, title: "Fiscal" },
  { id: 5, title: "Laboral" },
  { id: 6, title: "Bancario" },
] as const;

export function getInitialFormData(): EmpleadoFormData {
  return {
    nombre: "",
    informacionPersonal: { cedula: "", fechaNacimiento: "", genero: "M", estadoCivil: "soltero" },
    emailLaboral: "",
    emailPersonal: "",
    telefonoLaboral: "",
    telefonoPersonal: "",
    direccion: "",
    ciudad: "",
    contactoEmergencia: { nombre: "", telefono: "", relacion: "" },
    informacionFiscal: { afp: "", afpNumero: "", ars: "", arsNumero: "", nss: "" },
    cargo: "",
    departamento: "",
    tipoContrato: "indefinido",
    fechaIngreso: "",
    salarioBase: 0,
    estado: "activo",
    cuentaBancaria: { banco: "", numeroCuenta: "", tipoCuenta: "corriente" },
  };
}

export function useEmpleadoForm(onSubmit: (data: EmpleadoFormData, id: string | null) => void) {
  const [formData, setFormData] = useState<EmpleadoFormData>(getInitialFormData());
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateField = useCallback((path: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let current: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setFormData(getInitialFormData());
    setCurrentStep(1);
    setEditingId(null);
  }, []);

  const startEdit = useCallback((empleado: Empleado) => {
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
  }, []);

  const submit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, editingId);
    reset();
  }, [formData, editingId, onSubmit, reset]);

  return {
    formData,
    currentStep,
    editingId,
    setCurrentStep,
    updateField,
    reset,
    startEdit,
    submit,
  };
}