import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, PageHeader, SearchInput } from "../../components/UI";
import { useEmpleadoStore } from "../../stores/empleadoStore";
import { NominaCalculator } from "../../components/RRHH/NominaCalculator";
import type { EmployeeDto } from "../../domain/types";
import styles from "./Nomina.module.css";
import { useFilter } from "../../hooks/useFilter";

export function Nomina() {
  const { t } = useTranslation();
  const { empleados } = useEmpleadoStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmployeeDto | null>(
    null,
  );

  const filteredEmpleados = useFilter({
    data: empleados,
    searchTerm,
    searchFields: (e) => [e.firstName, e.lastName, e.position, e.department],
    filter: (e) => e.status === "Active",
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className={styles.container}>
      <PageHeader title={t("nomina.title")} subtitle={t("nomina.subtitle")}>
        <Button variant="secondary" onClick={() => navigate("/rrhh")}>
          {t("nomina.backToRRHH")}
        </Button>
      </PageHeader>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h3>{t("nomina.selectEmployee")}</h3>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t("nomina.searchEmployee")}
            width="100%"
          />

          <div className={styles.empleadoList}>
            {filteredEmpleados.map((emp) => (
              <button
                key={emp.id}
                type="button"
                className={`${styles.empleadoItem} ${selectedEmpleado?.id === emp.id ? styles.selected : ""}`}
                onClick={() => setSelectedEmpleado(emp)}
              >
                <img
                  src={
                    emp.imageUrl ?? `https://i.pravatar.cc/150?img=${emp.id}`
                  }
                  alt={`${emp.firstName} ${emp.lastName}`}
                  className={styles.avatar}
                />
                <div className={styles.empleadoInfo}>
                  <span className={styles.nombre}>
                    {emp.firstName} {emp.lastName}
                  </span>
                  <span className={styles.cargo}>{emp.position}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.main}>
          {selectedEmpleado ? (
            <>
              <div className={styles.empleadoHeader}>
                <img
                  src={
                    selectedEmpleado.imageUrl ??
                    `https://i.pravatar.cc/150?img=${selectedEmpleado.id}`
                  }
                  alt={`${selectedEmpleado.firstName} ${selectedEmpleado.lastName}`}
                  className={styles.avatarLarge}
                />
                <div>
                  <h2>
                    {selectedEmpleado.firstName} {selectedEmpleado.lastName}
                  </h2>
                  <p>
                    {selectedEmpleado.position} - {selectedEmpleado.department}
                  </p>
                  <p className={styles.salario}>
                    {t("nomina.baseSalary")}:{" "}
                    {formatCurrency(selectedEmpleado.salary)}
                  </p>
                </div>
              </div>

              <NominaCalculator salarioBase={selectedEmpleado.salary} />

              <div className={styles.infoBox}>
                <h4>{t("nomina.paymentInfo")}</h4>
                <p>
                  <strong>{t("nomina.bank")}:</strong>{" "}
                  {selectedEmpleado.bank ?? "—"}
                </p>
                <p>
                  <strong>{t("nomina.account")}:</strong>{" "}
                  {selectedEmpleado.accountNumber ?? "—"}
                </p>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>{t("nomina.selectEmployeeEmpty")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
