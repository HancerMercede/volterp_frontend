import { useState, useCallback } from "react";
import type { EmployeeDto, EmployeeRequest } from "../../domain/types";

export const FORM_STEPS = [
  { id: 1, title: "Datos Personales" },
  { id: 2, title: "Información Laboral" },
  { id: 3, title: "Datos de Pago" },
] as const;

export function getInitialFormData(): EmployeeRequest {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hireDate: "",
    salary: 0,
    status: "Active",
    workSchedule: "",
    afp: null,
    ars: null,
    nss: null,
    bank: null,
    accountNumber: null,
    imageUrl: null,
  };
}

export function useEmpleadoForm(
  onSubmit: (data: EmployeeRequest, id: number | null) => void,
) {
  const [formData, setFormData] =
    useState<EmployeeRequest>(getInitialFormData());
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

  const startEdit = useCallback((empleado: EmployeeDto) => {
    setFormData({
      firstName: empleado.firstName,
      lastName: empleado.lastName,
      email: empleado.email,
      phone: empleado.phone,
      position: empleado.position,
      department: empleado.department,
      hireDate: empleado.hireDate,
      salary: empleado.salary,
      status: empleado.status,
      workSchedule: empleado.workSchedule,
      afp: empleado.afp,
      ars: empleado.ars,
      nss: empleado.nss,
      bank: empleado.bank,
      accountNumber: empleado.accountNumber,
      imageUrl: empleado.imageUrl ?? null,
    });
    setEditingId(String(empleado.id));
    setCurrentStep(1);
  }, []);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData, editingId);
      reset();
    },
    [formData, editingId, onSubmit, reset],
  );

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
