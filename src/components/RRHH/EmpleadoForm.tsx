import { useTranslation } from "react-i18next";
import { Button } from "../../components/UI";
import { FORM_STEPS } from "../../application/hooks/useEmpleadoForm";
import type { EmployeeRequest } from "../../domain/types";
import styles from "./EmpleadoForm.module.css";

const SCHEDULE_PRESETS = [
  "schedulePresetWeekday9to6",
  "schedulePresetWeekday8to5",
  "schedulePresetSaturday9to6",
  "schedulePresetSaturday8to5",
  "schedulePresetRotating",
] as const;

const isCustomSchedule = (v: string | null | undefined) =>
  !!v && v !== "otro" && !(SCHEDULE_PRESETS as readonly string[]).includes(v);

const STEP_TITLE_KEYS: Record<number, string> = {
  1: "rrhh.formStep1Title",
  2: "rrhh.formStep2Title",
  3: "rrhh.formStep3Title",
};

const AFP_OPTIONS = [
  "AFP Reservas",
  "AFP Popular",
  "AFP Crecer",
  "AFP Capital",
] as const;

const ARS_OPTIONS = [
  "ARS Humano",
  "ARS Senasa",
  "ARS Universal",
  "ARS Palic",
] as const;

const BANK_OPTIONS = [
  "Banco Popular Dominicano",
  "Banco de la Nación",
  "Banco BDI",
  "Banco Scotiabank",
] as const;

interface Props {
  formData: EmployeeRequest;
  currentStep: number;
  editingId: number | null;
  onFieldChange: (path: string, value: unknown) => void;
  onStepChange: (step: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmpleadoForm({
  formData,
  currentStep,
  editingId,
  onFieldChange,
  onStepChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep !== FORM_STEPS.length) return;
        onSubmit(e);
      }}
    >
      <div className={styles.stepIndicator}>
        {FORM_STEPS.map((step) => (
          <button
            key={step.id}
            type="button"
            className={`${styles.stepBtn} ${currentStep === step.id ? styles.active : ""} ${currentStep > step.id ? styles.completed : ""}`}
            onClick={() => onStepChange(step.id)}
          >
            {step.id}
          </button>
        ))}
      </div>

      <div className={styles.stepTitle}>
        {t("rrhh.stepLabel")} {currentStep}: {t(STEP_TITLE_KEYS[currentStep] ?? "rrhh.formStep1Title")}
      </div>

      {currentStep === 1 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>{t("rrhh.employeeName")} *</label>
            <input
              type="text"
              value={formData.firstName ?? ""}
              onChange={(e) => onFieldChange("firstName", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.employeeLastName")} *</label>
            <input
              type="text"
              value={formData.lastName ?? ""}
              onChange={(e) => onFieldChange("lastName", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.employeeEmail")} *</label>
            <input
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => onFieldChange("email", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.employeePhone")}</label>
            <input
              type="tel"
              value={formData.phone ?? ""}
              onChange={(e) => onFieldChange("phone", e.target.value)}
            />
          </div>
          <div className={styles.field} style={{ gridColumn: "span 2" }}>
            <label>{t("rrhh.photo")}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    onFieldChange("imageUrl", ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
            {formData.imageUrl && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <img
                  src={formData.imageUrl}
                  alt={t("rrhh.previewAlt")}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => onFieldChange("imageUrl", null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#EF4444",
                    cursor: "pointer",
                    fontSize: 12,
                    textDecoration: "underline",
                  }}
                >
                  {t("common.delete")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>{t("rrhh.employeePosition")} *</label>
            <input
              type="text"
              value={formData.position ?? ""}
              onChange={(e) => onFieldChange("position", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.employeeDepartment")} *</label>
            <input
              type="text"
              value={formData.department ?? ""}
              onChange={(e) => onFieldChange("department", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.employeeHireDate")} *</label>
            <input
              type="date"
              value={formData.hireDate ?? ""}
              onChange={(e) => onFieldChange("hireDate", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.employeeStatus")}</label>
            <select
              value={formData.status ?? "Active"}
              onChange={(e) => onFieldChange("status", e.target.value)}
            >
              <option value="Active">{t("common.active")}</option>
              <option value="Inactive">{t("common.inactive")}</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.workSchedule")}</label>
            <select
              value={
                isCustomSchedule(formData.workSchedule)
                  ? "otro"
                  : formData.workSchedule || ""
              }
              onChange={(e) => onFieldChange("workSchedule", e.target.value)}
            >
              <option value="">{t("rrhh.selectSchedule")}</option>
              {SCHEDULE_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {t(`rrhh.${s}`)}
                </option>
              ))}
              <option value="otro">{t("common.other")}</option>
            </select>
            {(isCustomSchedule(formData.workSchedule) ||
              formData.workSchedule === "otro") && (
              <input
                type="text"
                value={
                  formData.workSchedule === "otro"
                    ? ""
                    : (formData.workSchedule ?? "")
                }
                onChange={(e) => onFieldChange("workSchedule", e.target.value)}
                placeholder={t("rrhh.specifySchedule")}
                style={{ marginTop: 4 }}
              />
            )}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>{t("rrhh.salary")} *</label>
            <input
              type="number"
              value={formData.salary ?? 0}
              onChange={(e) => onFieldChange("salary", Number(e.target.value))}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.afp")}</label>
            <select
              value={formData.afp ?? ""}
              onChange={(e) => onFieldChange("afp", e.target.value || null)}
            >
              <option value="">{t("rrhh.selectAFP")}</option>
              {AFP_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.ars")}</label>
            <select
              value={formData.ars ?? ""}
              onChange={(e) => onFieldChange("ars", e.target.value || null)}
            >
              <option value="">{t("rrhh.selectARS")}</option>
              {ARS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.nss")}</label>
            <input
              type="text"
              value={formData.nss ?? ""}
              onChange={(e) => onFieldChange("nss", e.target.value || null)}
              placeholder="123456789012"
            />
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.bankName")}</label>
            <select
              value={formData.bank ?? ""}
              onChange={(e) => onFieldChange("bank", e.target.value || null)}
            >
              <option value="">{t("rrhh.selectBank")}</option>
              {BANK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>{t("rrhh.accountNumber")}</label>
            <input
              type="text"
              value={formData.accountNumber ?? ""}
              onChange={(e) =>
                onFieldChange("accountNumber", e.target.value || null)
              }
              placeholder="XXXX-XXXX-XXXX"
            />
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {currentStep > 1 && (
          <Button
            type="button"
            onClick={() => onStepChange(currentStep - 1)}
            variant="secondary"
          >
            {t("common.previous")}
          </Button>
        )}
        <Button
          type="button"
          onClick={() => onStepChange(currentStep + 1)}
          style={{
            display: currentStep < FORM_STEPS.length ? undefined : "none",
          }}
        >
          {t("common.next")}
        </Button>
        <Button
          type="submit"
          style={{
            display: currentStep === FORM_STEPS.length ? undefined : "none",
          }}
        >
          {editingId ? t("rrhh.saveChanges") : t("rrhh.createEmployee")}
        </Button>
      </div>
    </form>
  );
}
