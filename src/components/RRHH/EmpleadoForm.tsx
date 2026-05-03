import { Button } from "../../components/UI";
import { FORM_STEPS, type EmpleadoFormData } from "../../application/hooks/useEmpleadoForm";
import styles from "./EmpleadoForm.module.css";

interface Props {
  formData: EmpleadoFormData;
  currentStep: number;
  editingId: string | null;
  onFieldChange: (path: string, value: unknown) => void;
  onStepChange: (step: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmpleadoForm({ formData, currentStep, editingId, onFieldChange, onStepChange, onSubmit }: Props) {
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

      <div className={styles.stepTitle}>Paso {currentStep}: {FORM_STEPS[currentStep - 1]?.title}</div>

      {currentStep === 1 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Nombre Completo *</label>
            <input type="text" value={formData.nombre} onChange={(e) => onFieldChange("nombre", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Cédula *</label>
            <input type="text" value={formData.informacionPersonal.cedula} onChange={(e) => onFieldChange("informacionPersonal.cedula", e.target.value)} placeholder="001-1234567-8" required />
          </div>
          <div className={styles.field}>
            <label>Fecha de Nacimiento *</label>
            <input type="date" value={formData.informacionPersonal.fechaNacimiento} onChange={(e) => onFieldChange("informacionPersonal.fechaNacimiento", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Género</label>
            <select value={formData.informacionPersonal.genero} onChange={(e) => onFieldChange("informacionPersonal.genero", e.target.value)}>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Estado Civil</label>
            <select value={formData.informacionPersonal.estadoCivil} onChange={(e) => onFieldChange("informacionPersonal.estadoCivil", e.target.value)}>
              <option value="soltero">Soltero</option>
              <option value="casado">Casado</option>
              <option value="divorciado">Divorciado</option>
              <option value="viudo">Viudo</option>
            </select>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Email Laboral *</label>
            <input type="email" value={formData.emailLaboral} onChange={(e) => onFieldChange("emailLaboral", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Email Personal</label>
            <input type="email" value={formData.emailPersonal} onChange={(e) => onFieldChange("emailPersonal", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Teléfono Laboral</label>
            <input type="tel" value={formData.telefonoLaboral} onChange={(e) => onFieldChange("telefonoLaboral", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Teléfono Personal *</label>
            <input type="tel" value={formData.telefonoPersonal} onChange={(e) => onFieldChange("telefonoPersonal", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Dirección</label>
            <input type="text" value={formData.direccion} onChange={(e) => onFieldChange("direccion", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Ciudad</label>
            <input type="text" value={formData.ciudad} onChange={(e) => onFieldChange("ciudad", e.target.value)} />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Nombre Contacto Emergencia *</label>
            <input type="text" value={formData.contactoEmergencia.nombre} onChange={(e) => onFieldChange("contactoEmergencia.nombre", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Teléfono Emergencia *</label>
            <input type="tel" value={formData.contactoEmergencia.telefono} onChange={(e) => onFieldChange("contactoEmergencia.telefono", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Relación</label>
            <input type="text" value={formData.contactoEmergencia.relacion} onChange={(e) => onFieldChange("contactoEmergencia.relacion", e.target.value)} placeholder="Esposo, Madre, Padre, etc." />
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>AFP</label>
            <select value={formData.informacionFiscal.afp} onChange={(e) => onFieldChange("informacionFiscal.afp", e.target.value)}>
              <option value="">Seleccionar AFP</option>
              <option value="AFP Reservas">AFP Reservas</option>
              <option value="AFP Popular">AFP Popular</option>
              <option value="AFP Senasa">AFP Senasa</option>
              <option value="AFP Capital">AFP Capital</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Número AFP</label>
            <input type="text" value={formData.informacionFiscal.afpNumero} onChange={(e) => onFieldChange("informacionFiscal.afpNumero", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>ARS</label>
            <select value={formData.informacionFiscal.ars} onChange={(e) => onFieldChange("informacionFiscal.ars", e.target.value)}>
              <option value="">Seleccionar ARS</option>
              <option value="ARS Humano">ARS Humano</option>
              <option value="ARS Senasa">ARS Senasa</option>
              <option value="ARS Universal">ARS Universal</option>
              <option value="ARS Palic">ARS Palic</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Número ARS</label>
            <input type="text" value={formData.informacionFiscal.arsNumero} onChange={(e) => onFieldChange("informacionFiscal.arsNumero", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>NSS</label>
            <input type="text" value={formData.informacionFiscal.nss} onChange={(e) => onFieldChange("informacionFiscal.nss", e.target.value)} placeholder="123456789012" />
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Cargo *</label>
            <input type="text" value={formData.cargo} onChange={(e) => onFieldChange("cargo", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Departamento *</label>
            <input type="text" value={formData.departamento} onChange={(e) => onFieldChange("departamento", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Tipo de Contrato</label>
            <select value={formData.tipoContrato} onChange={(e) => onFieldChange("tipoContrato", e.target.value)}>
              <option value="indefinido">Indefinido</option>
              <option value="temporal">Temporal</option>
              <option value="por_proyecto">Por Proyecto</option>
              <option value="suplencia">Suplencia</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Fecha de Ingreso *</label>
            <input type="date" value={formData.fechaIngreso} onChange={(e) => onFieldChange("fechaIngreso", e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Salario Base *</label>
            <input type="number" value={formData.salarioBase} onChange={(e) => onFieldChange("salarioBase", Number(e.target.value))} required />
          </div>
          <div className={styles.field}>
            <label>Estado</label>
            <select value={formData.estado} onChange={(e) => onFieldChange("estado", e.target.value)}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="licencia">Licencia</option>
            </select>
          </div>
        </div>
      )}

      {currentStep === 6 && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Banco</label>
            <select value={formData.cuentaBancaria.banco} onChange={(e) => onFieldChange("cuentaBancaria.banco", e.target.value)}>
              <option value="">Seleccionar Banco</option>
              <option value="Banco Popular Dominicano">Banco Popular Dominicano</option>
              <option value="Banco de la Nación">Banco de la Nación</option>
              <option value="Banco BDI">Banco BDI</option>
              <option value="Banco Scotiabank">Banco Scotiabank</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Número de Cuenta</label>
            <input type="text" value={formData.cuentaBancaria.numeroCuenta} onChange={(e) => onFieldChange("cuentaBancaria.numeroCuenta", e.target.value)} placeholder="XXXX-XXXX-XXXX" />
          </div>
          <div className={styles.field}>
            <label>Tipo de Cuenta</label>
            <select value={formData.cuentaBancaria.tipoCuenta} onChange={(e) => onFieldChange("cuentaBancaria.tipoCuenta", e.target.value)}>
              <option value="corriente">Corriente</option>
              <option value="ahorro">Ahorro</option>
            </select>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {currentStep > 1 && (
          <Button type="button" onClick={() => onStepChange(currentStep - 1)} variant="secondary">Anterior</Button>
        )}
        {currentStep < FORM_STEPS.length ? (
          <Button type="button" onClick={() => onStepChange(currentStep + 1)}>Siguiente</Button>
        ) : (
          <Button type="submit">{editingId ? "Guardar Cambios" : "Crear Empleado"}</Button>
        )}
      </div>
    </form>
  );
}