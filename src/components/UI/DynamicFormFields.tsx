import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormField } from "../../hooks/useCrudForm";
import styles from "./DynamicFormFields.module.css";

interface Props {
  fields: FormField[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  editingId: number | null;
  onChange: (name: string, value: unknown) => void;
}

export function DynamicFormFields({ fields, values, errors, editingId, onChange }: Props) {
  return (
    <div className={styles.fields}>
      {fields.map((field) => {
        // Visibility rules
        if (field.showOnEdit && editingId === null) return null;
        if (field.showOnCreate && editingId !== null) return null;

        const value = values[field.name];
        const error = errors[field.name];

        return (
          <div key={field.name} className={`${styles.field} ${error ? styles.hasError : ""}`}>
            <label className={styles.label} htmlFor={`field-${field.name}`}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>

            <FieldRenderer
              field={field}
              value={value}
              error={error}
              onChange={onChange}
            />

            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Internal: renders the right <input> / <select> per type ──────
function FieldRenderer({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
}) {
  const id = `field-${field.name}`;
  const inputRef = useRef<HTMLInputElement>(null);

  // ── select ──
  if (field.type === "select") {
    return (
      <select
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.name, e.target.value)}
      >
        <option value="">{field.placeholder ?? `Seleccionar ${field.label.toLowerCase()}`}</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  // ── checkbox ──
  if (field.type === "checkbox") {
    return (
      <label className={styles.checkWrapper}>
        <input
          id={id}
          type="checkbox"
          className={styles.checkbox}
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
        />
        <span>{field.placeholder ?? field.label}</span>
      </label>
    );
  }

  // ── file (image with preview) ──
  if (field.type === "file") {
    return (
      <FileField
        id={id}
        field={field}
        value={value as string | null | undefined}
        error={error}
        onChange={onChange}
        inputRef={inputRef}
      />
    );
  }

  // ── number ──
  if (field.type === "number") {
    return (
      <input
        ref={inputRef}
        id={id}
        type="number"
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        value={String(value ?? "")}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(e) => onChange(field.name, field.step && field.step < 1 ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
        required={field.required}
      />
    );
  }

  // ── default: text, email, tel, date, url ──
  return (
    <input
      ref={inputRef}
      id={id}
      type={field.type}
      className={`${styles.input} ${error ? styles.inputError : ""}`}
      value={String(value ?? "")}
      placeholder={field.placeholder}
      minLength={field.minLength}
      min={field.min}
      max={field.max}
      onChange={(e) => onChange(field.name, e.target.value)}
      required={field.required}
    />
  );
}

// ─── File field — modern drop zone with preview ────────────────────
function FileField({
  id,
  field,
  value,
  error,
  onChange,
  inputRef,
}: {
  id: string;
  field: FormField;
  value: string | null | undefined;
  error?: string;
  onChange: (name: string, value: unknown) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const { t } = useTranslation();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      setFileSize(formatSize(file.size));
      const reader = new FileReader();
      reader.onloadend = () => onChange(field.name, reader.result as string);
      reader.readAsDataURL(file);
    },
    [field.name, onChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile],
  );

  const handleRemove = useCallback(() => {
    onChange(field.name, null);
    setFileName(null);
    setFileSize(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [field.name, onChange, inputRef]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile],
  );

  const zoneClass = `${styles.fileZone}${dragging ? ` ${styles.fileZoneDragging}` : ""}${error ? ` ${styles.inputError}` : ""}`;

  return (
    <div>
      {value ? (
        /* ── preview card ── */
        <div className={styles.previewCard}>
          <img src={value} alt="Preview" className={styles.previewImg} />
          <div className={styles.previewInfo}>
            <span className={styles.previewName}>{fileName ?? t("fileUpload.fallbackName")}</span>
            {fileSize && <span className={styles.previewSize}>{fileSize}</span>}
          </div>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            title={t("fileUpload.removeTitle")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : (
        /* ── drop zone ── */
        <label
          htmlFor={id}
          className={zoneClass}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg className={styles.fileZoneIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className={styles.fileZoneText}>
            {t("fileUpload.dropzoneText")}
          </span>
          <span className={styles.fileZoneHint}>
            {t("fileUpload.dropzoneHint")}
          </span>
        </label>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        className={styles.fileInputHidden}
        accept={field.accept ?? "image/*"}
        onChange={handleFileChange}
      />
    </div>
  );
}
