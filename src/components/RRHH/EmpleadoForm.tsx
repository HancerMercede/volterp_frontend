import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
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

const STEP_HINT_KEYS: Record<number, string> = {
  1: "rrhh.formStep1Hint",
  2: "rrhh.formStep2Hint",
  3: "rrhh.formStep3Hint",
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
  onFieldChange: (path: string, value: unknown) => void;
  onStepChange: (step: number) => void;
}

export function EmpleadoForm({
  formData,
  currentStep,
  onFieldChange,
  onStepChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.stepIndicator}>
        {FORM_STEPS.map((step) => (
          <button
            key={step.id}
            type="button"
            className={`${styles.stepBtn} ${currentStep === step.id ? styles.active : ""} ${currentStep > step.id ? styles.completed : ""}`}
            onClick={() => onStepChange(step.id)}
          >
            <span className={styles.stepCircle}>{step.id}</span>
            <span className={styles.stepName}>{t(STEP_TITLE_KEYS[step.id])}</span>
          </button>
        ))}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          {t(STEP_TITLE_KEYS[currentStep] ?? "rrhh.formStep1Title")}
        </h4>
        <p className={styles.sectionHint}>
          {t(STEP_HINT_KEYS[currentStep] ?? "rrhh.formStep1Hint")}
        </p>
      </div>

      {currentStep === 1 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>
                {t("rrhh.employeeName")}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.firstName ?? ""}
              onChange={(e) => onFieldChange("firstName", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>
                {t("rrhh.employeeLastName")}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.lastName ?? ""}
              onChange={(e) => onFieldChange("lastName", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>
                {t("rrhh.employeeEmail")}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <input
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => onFieldChange("email", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>{t("rrhh.employeePhone")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
            <input
              type="tel"
              value={formData.phone ?? ""}
              onChange={(e) => onFieldChange("phone", e.target.value)}
            />
          </div>
          <div className={styles.field} style={{ gridColumn: "span 2" }}>
            <div className={styles.fieldHead}>
              <label>{t("rrhh.photo")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
            <div className={styles.dropzone}>
              <span className={styles.dropzoneIcon}>
                <User size={18} />
              </span>
              <div className={styles.dropzoneText}>
                <p className={styles.dropzoneTitle}>{t("rrhh.photoDropTitle")}</p>
                <p className={styles.dropzoneHint}>{t("rrhh.photoDropHint")}</p>
              </div>
              <span className={styles.dropzoneAction}>{t("rrhh.chooseFile")}</span>
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
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
            </div>
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
            <div className={styles.fieldHead}>
              <label>
                {t("rrhh.employeePosition")}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.position ?? ""}
              onChange={(e) => onFieldChange("position", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>
                {t("rrhh.employeeDepartment")}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.department ?? ""}
              onChange={(e) => onFieldChange("department", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>
                {t("rrhh.employeeHireDate")}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <input
              type="date"
              value={formData.hireDate ?? ""}
              onChange={(e) => onFieldChange("hireDate", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>{t("rrhh.employeeStatus")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
            <select
              value={formData.status ?? "Active"}
              onChange={(e) => onFieldChange("status", e.target.value)}
            >
              <option value="Active">{t("common.active")}</option>
              <option value="Inactive">{t("common.inactive")}</option>
            </select>
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>{t("rrhh.workSchedule")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
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
                onChange={(e) =>
                  onFieldChange("workSchedule", e.target.value || null)
                }
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
            <div className={styles.fieldHead}>
              <label>
                {t("rrhh.salary")}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <input
              type="number"
              value={formData.salary ?? 0}
              onChange={(e) => onFieldChange("salary", Number(e.target.value))}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>{t("rrhh.afp")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
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
            <div className={styles.fieldHead}>
              <label>{t("rrhh.ars")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
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
            <div className={styles.fieldHead}>
              <label>{t("rrhh.nss")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
            <input
              type="text"
              value={formData.nss ?? ""}
              onChange={(e) => onFieldChange("nss", e.target.value || null)}
              placeholder="123456789012"
            />
          </div>
          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <label>{t("rrhh.bankName")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
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
            <div className={styles.fieldHead}>
              <label>{t("rrhh.accountNumber")}</label>
              <span className={styles.optional}>{t("common.optional")}</span>
            </div>
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
    </>
  );
}
