import { Modal } from "../../components/UI";
import { BeneficiosSection } from "./BeneficiosSection";
import type { EmployeeDto } from "../../domain/types";
import styles from "./EmpleadoDetailModal.module.css";

interface Props {
  empleado: EmployeeDto | null;
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
          <img src={empleado.imageUrl ?? ""} alt={`${empleado.firstName} ${empleado.lastName}`} className={styles.avatar} />
          <div className={styles.headerInfo}>
            <h2>{`${empleado.firstName} ${empleado.lastName}`}</h2>
            <p>{empleado.position} - {empleado.department}</p>
            <span className={`${styles.badge} ${styles[empleado.status.toLowerCase()]}`}>{empleado.status}</span>
          </div>
        </div>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h3>Información Personal</h3>
            <div className={styles.grid}>
              <div><label>Cédula</label><span>{empleado.governmentId ?? "-"}</span></div>
              <div><label>Fecha Nac.</label><span>{empleado.dateOfBirth ? formatDate(empleado.dateOfBirth) : "-"}</span></div>
              <div><label>Género</label><span>{empleado.gender ?? "-"}</span></div>
              <div><label>Estado Civil</label><span>{empleado.maritalStatus ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Contacto</h3>
            <div className={styles.grid}>
              <div><label>Email Laboral</label><span>{empleado.email}</span></div>
              <div><label>Email Personal</label><span>{empleado.personalEmail ?? "-"}</span></div>
              <div><label>Tel. Laboral</label><span>{empleado.phone}</span></div>
              <div><label>Tel. Personal</label><span>{empleado.personalPhone ?? "-"}</span></div>
              <div><label>Dirección</label><span>{empleado.address ?? "-"}</span></div>
              <div><label>Ciudad</label><span>{empleado.city ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Emergencia</h3>
            <div className={styles.grid}>
              <div><label>Nombre</label><span>{empleado.emergencyContactName ?? "-"}</span></div>
              <div><label>Teléfono</label><span>{empleado.emergencyContactPhone ?? "-"}</span></div>
              <div><label>Relación</label><span>{empleado.emergencyContactRelationship ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Información Laboral</h3>
            <div className={styles.grid}>
              <div><label>Tipo Contrato</label><span>{empleado.contractType ?? "-"}</span></div>
              <div><label>Fecha Ingreso</label><span>{formatDate(empleado.hireDate)}</span></div>
              <div><label>Horario</label><span>{empleado.workSchedule}</span></div>
              <div><label>Ubicación</label><span>{empleado.location ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Compensación</h3>
            <div className={styles.grid}>
              <div><label>Salario Base</label><span className={styles.highlight}>{formatCurrency(empleado.salary)}</span></div>
              <div><label>Periodicidad</label><span>{empleado.payFrequency ?? "-"}</span></div>
              <div><label>Banco</label><span>{empleado.bank ?? "-"}</span></div>
              <div><label>Tipo Cuenta</label><span>{empleado.accountType ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Información Fiscal (RD)</h3>
            <div className={styles.grid}>
              <div><label>AFP</label><span>{empleado.afp ?? "-"}</span></div>
              <div><label>Número AFP</label><span>{empleado.afpNumber ?? "-"}</span></div>
              <div><label>ARS</label><span>{empleado.ars ?? "-"}</span></div>
              <div><label>NSS</label><span>{empleado.nss ?? "-"}</span></div>
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