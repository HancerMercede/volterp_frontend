import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader, Button, Pagination } from "../../components/UI";
import { useAsistenciaStore } from "../../stores/asistenciaStore";
import { useEmpleadoStore } from "../../stores/empleadoStore";
import { AsistenciaDashboard } from "../../components/Asistencia/AsistenciaDashboard";
import { AsistenciaStats } from "../../components/Asistencia/AsistenciaStats";
import { PoncheCard } from "../../components/Asistencia/PoncheCard";
import { getPaginationInfo } from "../../utils/pagination";
import styles from "./Asistencia.module.css";
import { ITEMS_PER_PAGE } from "../../config/pagination";

export function Asistencia() {
  const { t } = useTranslation();
  const { registros, configuracion, registrarPonche } = useAsistenciaStore();
  const { empleados } = useEmpleadoStore();
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("EMP001");
  const [page, setPage] = useState(1);

  const hoy = new Date().toISOString().split("T")[0];
  const registrosHoy = registros
    .filter((r) => r.fecha === hoy && r.empleadoId === empleadoSeleccionado)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));

  const todosRegistrosEmpleado = useMemo(() => {
    return registros
      .filter((r) => r.empleadoId === empleadoSeleccionado)
      .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  }, [registros, empleadoSeleccionado]);

  const paginatedRegistros = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return todosRegistrosEmpleado.slice(start, start + ITEMS_PER_PAGE);
  }, [todosRegistrosEmpleado, page]);

  const paginationInfo = useMemo(() => {
    return getPaginationInfo(
      todosRegistrosEmpleado.length,
      page,
      ITEMS_PER_PAGE,
    );
  }, [todosRegistrosEmpleado.length, page]);

  const handlePonche = (tipo: "entrada" | "salida" | "pausa") => {
    if (!configuracion.enabled) return;
    registrarPonche(empleadoSeleccionado, tipo);
  };

  const handleEmpleadoChange = (id: string) => {
    setEmpleadoSeleccionado(id);
    setPage(1);
  };

  const empleadoInfo = empleados.find((e) => e.id === empleadoSeleccionado);

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("asistencia.title")}
        subtitle={t("asistencia.subtitle")}
      />

      <AsistenciaStats />

      <AsistenciaDashboard />

      {configuracion.enabled && (
        <div className={styles.registroSection}>
          <div className={styles.empleadoSelector}>
            <label>{t("asistencia.selectEmployee")}:</label>
            <select
              value={empleadoSeleccionado}
              onChange={(e) => handleEmpleadoChange(e.target.value)}
              className={styles.select}
            >
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} - {emp.cargo}
                </option>
              ))}
            </select>
          </div>

          <h3 className={styles.sectionTitle}>
            {t("asistencia.registerPunch")}
          </h3>
          <div className={styles.poncheButtons}>
            <Button onClick={() => handlePonche("entrada")} variant="secondary">
              ➡️ {t("asistencia.entry")}
            </Button>
            <Button onClick={() => handlePonche("pausa")} variant="secondary">
              ☕ {t("asistencia.pause")}
            </Button>
            <Button onClick={() => handlePonche("salida")}>
              ⬅️ {t("asistencia.exit")}
            </Button>
          </div>

          <div className={styles.ponchesList}>
            <h4 className={styles.listTitle}>
              {t("asistencia.todayPunches")}{" "}
              {empleadoInfo && `- ${empleadoInfo.nombre}`}
            </h4>
            {registrosHoy.length === 0 ? (
              <p className={styles.emptyText}>
                {t("asistencia.noPunchesToday")}
              </p>
            ) : (
              registrosHoy.map((reg) => (
                <PoncheCard key={reg.id} registro={reg} />
              ))
            )}
          </div>

          <div className={styles.ponchesList}>
            <h4 className={styles.listTitle}>{t("asistencia.punchHistory")}</h4>
            {paginatedRegistros.length === 0 ? (
              <p className={styles.emptyText}>{t("asistencia.noPunches")}</p>
            ) : (
              <>
                {paginatedRegistros.map((reg) => (
                  <PoncheCard key={reg.id} registro={reg} />
                ))}
                {paginationInfo.totalPages > 1 && (
                  <div className={styles.paginationWrapper}>
                    <Pagination
                      pagination={paginationInfo}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
