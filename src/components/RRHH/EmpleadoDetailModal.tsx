import { useTranslation } from "react-i18next";
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

const SCHEDULE_LABELS: Record<string, string> = {
  schedulePresetWeekday9to6: "Lunes a Viernes 9:00 AM - 6:00 PM",
  schedulePresetWeekday8to5: "Lunes a Viernes 8:00 AM - 5:00 PM",
  schedulePresetSaturday9to6: "Lunes a Sábado 9:00 AM - 6:00 PM",
  schedulePresetSaturday8to5: "Lunes a Sábado 8:00 AM - 5:00 PM",
  schedulePresetRotating: "Horario Rotativo / Turnos",
};

export function EmpleadoDetailModal({ empleado, isOpen, onClose }: Props) {
  const { t } = useTranslation();

  if (!empleado) return null;

  const scheduleDisplay =
    empleado.workSchedule && SCHEDULE_LABELS[empleado.workSchedule]
      ? t(`rrhh.${empleado.workSchedule}`)
      : empleado.workSchedule;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("rrhh.employeeDetail")}>
      <div className={styles.content}>
        <div className={styles.header}>
          <img src={empleado.imageUrl ?? ""} alt={`${empleado.firstName} ${empleado.lastName}`} className={styles.avatar} />
          <div className={styles.headerInfo}>
            <h2>{`${empleado.firstName} ${empleado.lastName}`}</h2>
            <p>{empleado.position} - {empleado.department}</p>
            <span className={`${styles.badge} ${styles[empleado.status.toLowerCase()]}`}>{t(empleado.status === "Active" ? "common.active" : "common.inactive")}</span>
          </div>
        </div>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h3>{t("rrhh.personalInfo")}</h3>
            <div className={styles.grid}>
              <div><label>{t("rrhh.governmentId")}</label><span>{empleado.governmentId ?? "-"}</span></div>
              <div><label>{t("rrhh.dateOfBirth")}</label><span>{empleado.dateOfBirth ? formatDate(empleado.dateOfBirth) : "-"}</span></div>
              <div><label>{t("rrhh.gender")}</label><span>{empleado.gender ?? "-"}</span></div>
              <div><label>{t("rrhh.maritalStatus")}</label><span>{empleado.maritalStatus ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>{t("rrhh.contact")}</h3>
            <div className={styles.grid}>
              <div><label>{t("rrhh.workEmail")}</label><span>{empleado.email}</span></div>
              <div><label>{t("rrhh.personalEmail")}</label><span>{empleado.personalEmail ?? "-"}</span></div>
              <div><label>{t("rrhh.workPhone")}</label><span>{empleado.phone}</span></div>
              <div><label>{t("rrhh.personalPhone")}</label><span>{empleado.personalPhone ?? "-"}</span></div>
              <div><label>{t("common.address")}</label><span>{empleado.address ?? "-"}</span></div>
              <div><label>{t("rrhh.city")}</label><span>{empleado.city ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>{t("rrhh.emergency")}</h3>
            <div className={styles.grid}>
              <div><label>{t("rrhh.employeeName")}</label><span>{empleado.emergencyContactName ?? "-"}</span></div>
              <div><label>{t("rrhh.employeePhone")}</label><span>{empleado.emergencyContactPhone ?? "-"}</span></div>
              <div><label>{t("rrhh.relationship")}</label><span>{empleado.emergencyContactRelationship ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>{t("rrhh.jobInformationSection")}</h3>
            <div className={styles.grid}>
              <div><label>{t("rrhh.contractType")}</label><span>{empleado.contractType ?? "-"}</span></div>
              <div><label>{t("rrhh.employeeHireDate")}</label><span>{formatDate(empleado.hireDate)}</span></div>
              <div><label>{t("rrhh.schedule")}</label><span>{scheduleDisplay}</span></div>
              <div><label>{t("rrhh.location")}</label><span>{empleado.location ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>{t("rrhh.compensation")}</h3>
            <div className={styles.grid}>
              <div><label>{t("rrhh.employeeSalary")}</label><span className={styles.highlight}>{formatCurrency(empleado.salary)}</span></div>
              <div><label>{t("nomina.periodicity")}</label><span>{empleado.payFrequency ?? "-"}</span></div>
              <div><label>{t("rrhh.bankName")}</label><span>{empleado.bank ?? "-"}</span></div>
              <div><label>{t("rrhh.accountType")}</label><span>{empleado.accountType ?? "-"}</span></div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>{t("rrhh.fiscalInfoRD")}</h3>
            <div className={styles.grid}>
              <div><label>{t("rrhh.afp")}</label><span>{empleado.afp ?? "-"}</span></div>
              <div><label>{t("rrhh.afpNumber")}</label><span>{empleado.afpNumber ?? "-"}</span></div>
              <div><label>{t("rrhh.ars")}</label><span>{empleado.ars ?? "-"}</span></div>
              <div><label>{t("rrhh.nss")}</label><span>{empleado.nss ?? "-"}</span></div>
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
