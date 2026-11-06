import { useState, useCallback, useMemo } from "react";

// ─── Field definition ────────────────────────────────────────────────
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "select"
    | "date"
    | "file"
    | "checkbox"
    | "textarea"
    | "url";
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
  maxLength?: number;
  step?: number;
  /** Accepted file extensions (default: "image/*") */
  accept?: string;
  /** Custom validation: return error message or undefined */
  validate?: (
    value: unknown,
    values: Record<string, unknown>,
  ) => string | undefined;

  // ─── Presentation (optional) ──────────────────────────────────────
  /** Section this field belongs to. Fields with no section share the first group. */
  section?: string;
  /** How many of the 6 section columns the field occupies (6 = full width). */
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Helper text rendered under the control. */
  hint?: string;
  /** Renders the control as disabled (e.g. a server-generated code). */
  readonly?: boolean;
  /** Renders the field in the right sidebar instead of the main grid. */
  sidebar?: boolean;
}

// ─── Config ──────────────────────────────────────────────────────────
export interface CrudFormConfig<T extends Record<string, unknown>> {
  fields: FormField[];
  defaultValues: T;
  onCreate: (data: T) => Promise<unknown>;
  onUpdate: (id: string, data: T) => Promise<unknown>;
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
  editingId: string | null;
  /** True when the current values differ from the ones the form was opened with. */
  isDirty: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (entity: object, id: string) => void;
  reset: () => void;
}

// ─── Validators ─────────────────────────────────────────────────────
type Validator = (
  field: FormField,
  value: unknown,
  values: Record<string, unknown>,
) => string | undefined;

const typeValidators: Partial<Record<FormField["type"], Validator>> = {
  email: (v) =>
    typeof v === "string" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Email inválido"
      : undefined,

  number: (f, v) => {
    if (typeof v !== "number" || isNaN(v)) return;
    if (f.min !== undefined && v < f.min)
      return `${f.label} debe ser mayor o igual a ${f.min}`;
    if (f.max !== undefined && v > f.max)
      return `${f.label} debe ser menor o igual a ${f.max}`;
    if (f.step !== undefined && f.step > 0) {
      const offset = v - (f.min ?? 0);
      const decimals = (f.step.toString().split('.')[1] || '').length;
      const multiplier = Math.pow(10, decimals);
      const scaledOffset = Math.round(offset * multiplier);
      const scaledStep = Math.round(f.step * multiplier);
      if (scaledOffset % scaledStep !== 0)
        return `${f.label} debe ser múltiplo de ${f.step}`;
    }
  },

  file: (f, v) => {
    if (
      typeof v !== "string" ||
      !v.startsWith("data:") ||
      !f.accept ||
      f.accept === "*"
    )
      return;
    const mime = v.split(";")[0].split(":")[1];
    const ok = f.accept
      .split(",")
      .map((a) => a.trim())
      .some((a) =>
        a.endsWith("/*") ? mime.startsWith(a.replace("/*", "")) : a === mime,
      );
    if (!ok) return `Formato de archivo no válido. Permitidos: ${f.accept}`;
  },
};

function validateField(
  field: FormField,
  value: unknown,
  values: Record<string, unknown>,
): string | undefined {
  // 1. Required
  if (
    field.required &&
    (value === "" || value === null || value === undefined)
  ) {
    return `${field.label} es requerido`;
  }
  // 2. Type-specific format/range (email, number min/max/step, file accept)
  const typeErr = typeValidators[field.type]?.(field, value, values);
  if (typeErr !== undefined) return typeErr;
  // 3. String constraints (apply to any string value)
  if (typeof value === "string") {
    if (field.minLength && value.length < field.minLength)
      return `${field.label} debe tener al menos ${field.minLength} caracteres`;
    if (field.maxLength && value.length > field.maxLength)
      return `${field.label} debe tener máximo ${field.maxLength} caracteres`;
  }
  // 4. Custom
  return field.validate?.(value, values);
}

function validateForm<T extends Record<string, unknown>>(
  fields: FormField[],
  values: T,
): Record<string, string> {
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
  const {
    fields,
    defaultValues,
    onCreate,
    onUpdate,
    onSuccess,
    mapEntityToForm,
  } = config;
  const [values, setValues] = useState<T>({ ...defaultValues });
  const [initialValues, setInitialValues] = useState<T>({ ...defaultValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setSubmitError(null);
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
        setInitialValues({ ...defaultValues });
        onSuccess?.();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al guardar";
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fields, values, editingId, defaultValues, onSuccess, onUpdate, onCreate],
  );

  const handleEdit = useCallback(
    (entity: object, id: string) => {
      const dict = entity as Record<string, unknown>;
      const mapped = mapEntityToForm
        ? mapEntityToForm(dict)
        : pickKeys(defaultValues, dict);
      setValues(mapped);
      setInitialValues(mapped);
      setEditingId(id);
      setErrors({});
      setSubmitError(null);
    },
    [defaultValues, mapEntityToForm],
  );

  const reset = useCallback(() => {
    setValues({ ...defaultValues });
    setInitialValues({ ...defaultValues });
    setEditingId(null);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  }, [defaultValues]);

  const isDirty = useMemo(() => {
    const current = values as Record<string, unknown>;
    const initial = initialValues as Record<string, unknown>;
    const keys = new Set([...Object.keys(initial), ...Object.keys(current)]);
    for (const key of keys) {
      if (current[key] !== initial[key]) return true;
    }
    return false;
  }, [values, initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    editingId,
    isDirty,
    setFieldValue,
    handleSubmit,
    handleEdit,
    reset,
  };
}
