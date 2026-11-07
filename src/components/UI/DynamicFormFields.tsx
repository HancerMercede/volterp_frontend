import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import type { FormField } from "../../hooks/useCrudForm";
import { initialsOf } from "../../utils/initials";
import { SearchableSelect } from "./SearchableSelect";
import styles from "./DynamicFormFields.module.css";

interface Props {
  fields: FormField[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  editingId: string | null;
  onChange: (name: string, value: unknown) => void;
}

interface FieldGroup {
  section?: string;
  fields: FormField[];
}

const SPAN_CLASSES = [
  "",
  styles.span1,
  styles.span2,
  styles.span3,
  styles.span4,
  styles.span5,
  styles.span6,
];

export function DynamicFormFields({ fields, values, errors, editingId, onChange }: Props) {
  const visible = fields.filter((field) => {
    if (field.showOnEdit && editingId === null) return false;
    if (field.showOnCreate && editingId !== null) return false;
    return true;
  });

  const main = visible.filter((field) => !field.sidebar);
  const sidebar = visible.filter((field) => field.sidebar);
  const initials = initialsOf(String(values.name ?? ""));

  const groups = groupBySection(main);

  if (sidebar.length === 0) {
    return (
      <div className={styles.stack}>
        {groups.map((group) => (
          <Section key={group.section ?? "main"} group={group}>
            {(field) => (
              <FieldCell
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={onChange}
              />
            )}
          </Section>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.columns}>
      <div className={styles.stack}>
        {groups.map((group) => (
          <Section key={group.section ?? "main"} group={group}>
            {(field) => (
              <FieldCell
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={onChange}
              />
            )}
          </Section>
        ))}
      </div>

      <aside className={styles.sidebar}>
        {sidebar.map((field) => (
          <SidebarBlock
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={onChange}
            initials={initials}
          />
        ))}
      </aside>
    </div>
  );
}

function groupBySection(fields: FormField[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  for (const field of fields) {
    const last = groups[groups.length - 1];
    if (last && last.section === field.section) {
      last.fields.push(field);
    } else {
      groups.push({ section: field.section, fields: [field] });
    }
  }
  return groups;
}

function Section({
  group,
  children,
}: {
  group: FieldGroup;
  children: (field: FormField) => React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      {group.section && (
        <h4 className={styles.sectionTitle}>{t(group.section)}</h4>
      )}
      <div className={styles.grid}>
        {group.fields.map((field) => children(field))}
      </div>
    </section>
  );
}

function FieldCell({
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
  const spanClass = SPAN_CLASSES[field.span ?? 6];

  return (
    <div className={`${styles.field} ${spanClass} ${error ? styles.hasError : ""}`}>
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

      {field.hint && !error && <span className={styles.hint}>{field.hint}</span>}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

function SidebarBlock({
  field,
  value,
  error,
  onChange,
  initials,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
  initials?: string;
}) {
  const { t } = useTranslation();

  if (field.type === "checkbox") {
    return (
      <section className={styles.sidebarSection}>
        <h4 className={styles.sidebarTitle}>{t("common.status")}</h4>
        <div className={styles.statusCard}>
          <div className={styles.statusText}>
            <span className={styles.statusLabel}>{field.label}</span>
            {field.hint && <span className={styles.statusHint}>{field.hint}</span>}
          </div>
          <Switch
            checked={Boolean(value)}
            onChange={(checked) => onChange(field.name, checked)}
            label={field.label}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sidebarSection}>
      <h4 className={styles.sidebarTitle}>{field.label}</h4>
      <FieldRenderer
        field={field}
        value={value}
        error={error}
        onChange={onChange}
        panel
        initials={initials}
      />
    </section>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.switch} ${checked ? styles.switchOn : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}

// â”€â”€â”€ Internal: renders the right <input> / <select> per type â”€â”€â”€â”€â”€â”€
function FieldRenderer({
  field,
  value,
  error,
  onChange,
  panel = false,
  initials,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
  panel?: boolean;
  initials?: string;
}) {
  const id = `field-${field.name}`;
  const inputRef = useRef<HTMLInputElement>(null);

  // â”€â”€ combobox (select con búsqueda) â”€â”€
  if (field.type === "combobox") {
    return (
      <SearchableSelect
        id={id}
        label={field.label}
        options={field.options ?? []}
        value={String(value ?? "")}
        placeholder={field.placeholder}
        emptyLabel={field.emptyLabel ?? field.placeholder}
        invalid={Boolean(error)}
        onChange={(optionValue) => onChange(field.name, optionValue)}
      />
    );
  }

  // â”€â”€ select â”€â”€
  if (field.type === "select") {
    return (
      <select
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ""} ${
          field.readonly ? styles.inputReadonly : ""
        }`}
        value={String(value ?? "")}
        disabled={field.readonly}
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

  // â”€â”€ checkbox â”€â”€
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

  // â”€â”€ file (image with preview) â”€â”€
  if (field.type === "file") {
    return (
      <FileField
        id={id}
        field={field}
        value={value as string | null | undefined}
        error={error}
        onChange={onChange}
        inputRef={inputRef}
        panel={panel}
        initials={initials}
      />
    );
  }

  // â”€â”€ textarea â”€â”€
  if (field.type === "textarea") {
    return (
      <textarea
        id={id}
        rows={3}
        className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ""} ${
          field.readonly ? styles.inputReadonly : ""
        }`}
        value={String(value ?? "")}
        placeholder={field.placeholder}
        disabled={field.readonly}
        onChange={(e) => onChange(field.name, e.target.value)}
        required={field.required}
      />
    );
  }

  // â”€â”€ number â”€â”€
  if (field.type === "number") {
    return (
      <input
        ref={inputRef}
        id={id}
        type="number"
        className={`${styles.input} ${error ? styles.inputError : ""} ${
          field.readonly ? styles.inputReadonly : ""
        }`}
        value={String(value ?? "")}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        disabled={field.readonly}
        onChange={(e) => onChange(field.name, field.step && field.step < 1 ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
        required={field.required}
      />
    );
  }

  // â”€â”€ default: text, email, tel, date, url â”€â”€
  return (
    <input
      ref={inputRef}
      id={id}
      type={field.type}
      className={`${styles.input} ${error ? styles.inputError : ""} ${
        field.readonly ? styles.inputReadonly : ""
      }`}
      value={String(value ?? "")}
      placeholder={field.placeholder}
      minLength={field.minLength}
      min={field.min}
      max={field.max}
      disabled={field.readonly}
      onChange={(e) => onChange(field.name, e.target.value)}
      required={field.required}
    />
  );
}

// â”€â”€â”€ File field â€” modern drop zone with preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FileField({
  id,
  field,
  value,
  error,
  onChange,
  inputRef,
  panel = false,
  initials,
}: {
  id: string;
  field: FormField;
  value: string | null | undefined;
  error?: string;
  onChange: (name: string, value: unknown) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  panel?: boolean;
  initials?: string;
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

  if (!panel) {
    return (
      <div>
        {value ? (
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
              <Trash2 size={15} strokeWidth={1.8} />
            </button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className={zoneClass}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <ImageIcon className={styles.fileZoneIcon} size={32} strokeWidth={1.5} />
            <span className={styles.fileZoneText}>{t("fileUpload.dropzoneText")}</span>
            <span className={styles.fileZoneHint}>{t("fileUpload.dropzoneHint")}</span>
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

  // â”€â”€ panel layout (sidebar): tall preview + Cambiar / trash â”€â”€
  return (
    <div className={styles.panel}>
      {value ? (
        <div className={styles.panelPreview}>
          <img src={value} alt="Preview" className={styles.panelImg} />
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`${styles.panelDropzone} ${zoneClass}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {initials ? (
            <span className={styles.panelInitials}>{initials}</span>
          ) : (
            <ImageIcon className={styles.panelIcon} size={28} strokeWidth={1.5} />
          )}
          <span className={styles.panelDropTitle}>{t("fileUpload.dropzoneText")}</span>
          <span className={styles.panelDropHint}>{t("fileUpload.dropzoneHint")}</span>
        </label>
      )}

      <div className={styles.panelActions}>
        <label htmlFor={id} className={styles.panelChange}>
          {t("common.changeImage")}
        </label>
        <button
          type="button"
          className={styles.panelTrash}
          onClick={handleRemove}
          title={t("fileUpload.removeTitle")}
          aria-label={t("fileUpload.removeTitle")}
        >
          <Trash2 size={16} strokeWidth={1.8} />
        </button>
      </div>

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
