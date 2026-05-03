import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, PageHeader, SearchInput } from "../../components/UI";
import { useERP } from "../../context/ERPContext";
import { NominaCalculator } from "../../components/RRHH/NominaCalculator";
import type { Empleado } from "../../domain/entities/Empleado";
import styles from "./Nomina.module.css";

export function Nomina() {
  const { empleados } = useERP();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  const empleadosActivos = useMemo(
    () => empleados.filter((e) => e.estado === "activo"),
    [empleados],
  );

  const filteredEmpleados = useMemo(() => {
    if (!searchTerm) return empleadosActivos.slice(0, 10);
    return empleadosActivos.filter((e) =>
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.departamento.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [empleadosActivos, searchTerm]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Nómina"
        subtitle="Cálculo y procesamiento de nómina"
      >
        <Button variant="secondary" onClick={() => navigate("/rrhh")}>
          ← Volver a RRHH
        </Button>
      </PageHeader>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h3>Seleccionar Empleado</h3>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar empleado..."
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
                <img src={emp.avatar} alt={emp.nombre} className={styles.avatar} />
                <div className={styles.empleadoInfo}>
                  <span className={styles.nombre}>{emp.nombre}</span>
                  <span className={styles.cargo}>{emp.cargo}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.main}>
          {selectedEmpleado ? (
            <>
              <div className={styles.empleadoHeader}>
                <img src={selectedEmpleado.avatar} alt={selectedEmpleado.nombre} className={styles.avatarLarge} />
                <div>
                  <h2>{selectedEmpleado.nombre}</h2>
                  <p>{selectedEmpleado.cargo} - {selectedEmpleado.departamento}</p>
                  <p className={styles.salario}>Salario Base: {formatCurrency(selectedEmpleado.salarioBase)}</p>
                </div>
              </div>

              <NominaCalculator salarioBase={selectedEmpleado.salarioBase} />

              <div className={styles.infoBox}>
                <h4>Información de Pago</h4>
                <p><strong>Periodicidad:</strong> {selectedEmpleado.periodicidadPago}</p>
                <p><strong>Banco:</strong> {selectedEmpleado.cuentaBancaria.banco}</p>
                <p><strong>Cuenta:</strong> {selectedEmpleado.cuentaBancaria.numeroCuenta}</p>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Seleccione un empleado para calcular su nómina</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}