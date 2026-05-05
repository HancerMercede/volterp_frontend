import { Modal } from "../../components/UI";
import { BeneficiosSection } from "./BeneficiosSection";
import type { Empleado } from "../../domain/entities/Empleado";
import styles from "./EmpleadoDetailModal.module.css";

interface Props {
  empleado: Empleado | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 0 }).format(amount);

const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");

export function EmpleadoDetailModal({ empleado, isOpen, onClose }: Props) {
  if (!empleado) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de Empleado">
      <div className={styles.content}>
        <div className={styles.header}>
          <img src={empleado.avatar} alt={empleado.nombre} className={styles.avatar} />
          <div className={styles.headerInfo}>
            <h2>{empleado.nombre}</h2>
            <p>{empleado.cargo} - {empleado.departamento}</p>
            <span className={`${styles.badge} ${styles[empleado.estado]}`}>{empleado.estado}</span>
          </div>
        </div>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h3>Información Personal</h3>
            <div className={styles.grid}>
              <div><label>Cédula</label><span>{empleado.informacionPersonal.cedula}</span></div>
              <div><label>Fecha Nac.</label><span>{formatDate(empleado.informacionPersonal.fechaNacimiento)}</span></div>
              <div><label>Género</label><span>{empleado.informacionPersonal.genero}</span></div>
              <div><label>Estado Civil</label><span>{empleado.informacionPersonal.estadoCivil}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Contacto</h3>
            <div className={styles.grid}>
              <div><label>Email Laboral</label><span>{empleado.emailLaboral}</span></div>
              <div><label>Email Personal</label><span>{empleado.emailPersonal}</span></div>
              <div><label>Tel. Laboral</label><span>{empleado.telefonoLaboral}</span></div>
              <div><label>Tel. Personal</label><span>{empleado.telefonoPersonal}</span></div>
              <div><label>Dirección</label><span>{empleado.direccion}</span></div>
              <div><label>Ciudad</label><span>{empleado.ciudad}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Emergencia</h3>
            <div className={styles.grid}>
              <div><label>Nombre</label><span>{empleado.contactoEmergencia.nombre}</span></div>
              <div><label>Teléfono</label><span>{empleado.contactoEmergencia.telefono}</span></div>
              <div><label>Relación</label><span>{empleado.contactoEmergencia.relacion}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Información Laboral</h3>
            <div className={styles.grid}>
              <div><label>Tipo Contrato</label><span>{empleado.tipoContrato}</span></div>
              <div><label>Fecha Ingreso</label><span>{formatDate(empleado.fechaIngreso)}</span></div>
              <div><label>Horario</label><span>{empleado.horarioLaboral}</span></div>
              <div><label>Ubicación</label><span>{empleado.ubicacion}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Compensación</h3>
            <div className={styles.grid}>
              <div><label>Salario Base</label><span className={styles.highlight}>{formatCurrency(empleado.salarioBase)}</span></div>
              <div><label>Periodicidad</label><span>{empleado.periodicidadPago}</span></div>
              <div><label>Banco</label><span>{empleado.cuentaBancaria.banco}</span></div>
              <div><label>Tipo Cuenta</label><span>{empleado.cuentaBancaria.tipoCuenta}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Información Fiscal (RD)</h3>
            <div className={styles.grid}>
              <div><label>AFP</label><span>{empleado.informacionFiscal.afp}</span></div>
              <div><label>Número AFP</label><span>{empleado.informacionFiscal.afpNumero}</span></div>
              <div><label>ARS</label><span>{empleado.informacionFiscal.ars}</span></div>
              <div><label>NSS</label><span>{empleado.informacionFiscal.nss}</span></div>
            </div>
          </section>

          <section className={styles.sectionFull}>
            <BeneficiosSection empleado={empleado} />
          </section>
        </div>
      </div>
    </Modal>
  );
}