import { useState, useCallback } from "react";

// ─── Field definition ────────────────────────────────────────────────
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "date" | "file" | "checkbox" | "url";
  required?: boolean;
  placeholder?: string;
  /** Options for <select> fields */
  options?: { value: string; label: string }[];
  /** Only show when editing */
  showOnEdit?: boolean;
  /** Only show when creating */
  showOnCreate?: boolean;
  // Passthrough to <input>
  min?: number;
  max?: number;
  minLength?: number;
  step?: number;
  /** Accepted file extensions (default: "image/*") */
  accept?: string;
  /** Custom validation: return error message or undefined */
  validate?: (value: unknown, values: Record<string, unknown>) => string | undefined;
}

// ─── Config ──────────────────────────────────────────────────────────
export interface CrudFormConfig<T extends Record<string, unknown>> {
  fields: FormField[];
  defaultValues: T;
  onCreate: (data: T) => Promise<unknown>;
  onUpdate: (id: number, data: T) => Promise<unknown>;
  /** Called after successful create/update */
  onSuccess?: () => void;
  /** Custom mapper: entity → form values. Default picks keys from defaultValues */
  mapEntityToForm?: (entity: Record<string, unknown>) => T;
}

// ─── Return ──────────────────────────────────────────────────────────
export interface CrudFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitError: string | null;
  editingId: number | null;
  setFieldValue: (name: string, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (entity: object, id: number) => void;
  reset: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────
function validateField(field: FormField, value: unknown, values: Record<string, unknown>): string | undefined {
  if (field.required) {
    const isEmpty = value === "" || value === null || value === undefined;
    if (isEmpty) return `${field.label} es requerido`;
  }
  if (field.type === "email" && value && typeof value === "string") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
  }
  if (field.minLength && typeof value === "string" && value.length < field.minLength) {
    return `${field.label} debe tener al menos ${field.minLength} caracteres`;
  }
  if (field.validate) return field.validate(value, values);
  return undefined;
}

function validateForm<T extends Record<string, unknown>>(fields: FormField[], values: T): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const err = validateField(field, values[field.name], values);
    if (err) errors[field.name] = err;
  }
  return errors;
}

function pickKeys<T extends Record<string, unknown>>(
  template: T,
  source: Record<string, unknown>,
): T {
  const result = { ...template } as T;
  const dict = result as Record<string, unknown>;
  for (const key of Object.keys(template)) {
    if (key in source) dict[key] = source[key];
  }
  return result;
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useCrudForm<T extends Record<string, unknown>>(
  config: CrudFormConfig<T>,
): CrudFormReturn<T> {
  const { fields, defaultValues, onCreate, onUpdate, onSuccess, mapEntityToForm } = config;
  const [values, setValues] = useState<T>({ ...defaultValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateForm(fields, values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        if (editingId !== null) {
          await onUpdate(editingId, values);
        } else {
          await onCreate(values);
        }
        setEditingId(null);
        setErrors({});
        setValues({ ...defaultValues });
        onSuccess?.();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al guardar";
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fields, values, defaultValues, onCreate, onUpdate, onSuccess],
  );

  const handleEdit = useCallback(
    (entity: object, id: number) => {
      const dict = entity as Record<string, unknown>;
      const mapped = mapEntityToForm ? mapEntityToForm(dict) : pickKeys(defaultValues, dict);
      setValues(mapped);
      setEditingId(id);
      setErrors({});
      setSubmitError(null);
    },
    [defaultValues, mapEntityToForm],
  );

  const reset = useCallback(() => {
    setValues({ ...defaultValues });
    setEditingId(null);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  }, [defaultValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    editingId,
    setFieldValue,
    handleSubmit,
    handleEdit,
    reset,
  };
}
