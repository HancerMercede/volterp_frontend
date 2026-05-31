import { Button } from "../../components/UI";
import { FORM_STEPS } from "../../application/hooks/useEmpleadoForm";
import type { EmployeeRequest } from "../../domain/types";
import styles from "./EmpleadoForm.module.css";

interface Props {
  formData: EmployeeRequest;
  currentStep: number;
  editingId: string | null;
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
  return (
    <form onSubmit={onSubmit}>
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
        Paso {currentStep}: {FORM_STEPS[currentStep - 1]?.title}
      </div>

      {currentStep === 1 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.firstName ?? ""}
              onChange={(e) => onFieldChange("firstName", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Apellido *</label>
            <input
              type="text"
              value={formData.lastName ?? ""}
              onChange={(e) => onFieldChange("lastName", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Email *</label>
            <input
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => onFieldChange("email", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.phone ?? ""}
              onChange={(e) => onFieldChange("phone", e.target.value)}
            />
          </div>
          <div className={styles.field} style={{ gridColumn: "span 2" }}>
            <label>Foto</label>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => onFieldChange("imageUrl", null)}
                  style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Cargo *</label>
            <input
              type="text"
              value={formData.position ?? ""}
              onChange={(e) => onFieldChange("position", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Departamento *</label>
            <input
              type="text"
              value={formData.department ?? ""}
              onChange={(e) => onFieldChange("department", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Fecha de Ingreso *</label>
            <input
              type="date"
              value={formData.hireDate ?? ""}
              onChange={(e) => onFieldChange("hireDate", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Estado</label>
            <select
              value={formData.status ?? "Active"}
              onChange={(e) => onFieldChange("status", e.target.value)}
            >
              <option value="Active">Activo</option>
              <option value="Inactive">Inactivo</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Horario Laboral</label>
            <input
              type="text"
              value={formData.workSchedule ?? ""}
              onChange={(e) => onFieldChange("workSchedule", e.target.value)}
              placeholder="Lunes a Viernes 9:00 - 18:00"
            />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Salario *</label>
            <input
              type="number"
              value={formData.salary ?? 0}
              onChange={(e) => onFieldChange("salary", Number(e.target.value))}
              required
            />
          </div>
          <div className={styles.field}>
            <label>AFP</label>
            <select
              value={formData.afp ?? ""}
              onChange={(e) => onFieldChange("afp", e.target.value || null)}
            >
              <option value="">Seleccionar AFP</option>
              <option value="AFP Reservas">AFP Reservas</option>
              <option value="AFP Popular">AFP Popular</option>
              <option value="AFP Crecer">AFP Crecer</option>
              <option value="AFP Capital">AFP Capital</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>ARS</label>
            <select
              value={formData.ars ?? ""}
              onChange={(e) => onFieldChange("ars", e.target.value || null)}
            >
              <option value="">Seleccionar ARS</option>
              <option value="ARS Humano">ARS Humano</option>
              <option value="ARS Senasa">ARS Senasa</option>
              <option value="ARS Universal">ARS Universal</option>
              <option value="ARS Palic">ARS Palic</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>NSS</label>
            <input
              type="text"
              value={formData.nss ?? ""}
              onChange={(e) => onFieldChange("nss", e.target.value || null)}
              placeholder="123456789012"
            />
          </div>
          <div className={styles.field}>
            <label>Banco</label>
            <select
              value={formData.bank ?? ""}
              onChange={(e) => onFieldChange("bank", e.target.value || null)}
            >
              <option value="">Seleccionar Banco</option>
              <option value="Banco Popular Dominicano">Banco Popular Dominicano</option>
              <option value="Banco de la Nación">Banco de la Nación</option>
              <option value="Banco BDI">Banco BDI</option>
              <option value="Banco Scotiabank">Banco Scotiabank</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Número de Cuenta</label>
            <input
              type="text"
              value={formData.accountNumber ?? ""}
              onChange={(e) => onFieldChange("accountNumber", e.target.value || null)}
              placeholder="XXXX-XXXX-XXXX"
            />
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {currentStep > 1 && (
          <Button type="button" onClick={() => onStepChange(currentStep - 1)} variant="secondary">
            Anterior
          </Button>
        )}
        {currentStep < FORM_STEPS.length ? (
          <Button type="button" onClick={() => onStepChange(currentStep + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button type="submit">
            {editingId ? "Guardar Cambios" : "Crear Empleado"}
          </Button>
        )}
      </div>
    </form>
  );
}
