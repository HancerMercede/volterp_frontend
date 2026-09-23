import { useTranslation } from "react-i18next";
import { SearchInput } from "../../components/UI";
import styles from "./EmpleadoFilters.module.css";

interface Props {
  searchTerm: string;
  filterEstado: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export function EmpleadoFilters({
  searchTerm,
  filterEstado,
  onSearchChange,
  onEstadoChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.filters}>
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={t("rrhh.searchEmployee")}
        width="240px"
      />
      <select
        value={filterEstado}
        onChange={(e) => onEstadoChange(e.target.value)}
        className={styles.select}
      >
        <option value="todos">{t("rrhh.allStatuses")}</option>
        <option value="activo">{t("rrhh.activeEmployees")}</option>
        <option value="inactivo">{t("rrhh.inactiveEmployees")}</option>
      </select>
    </div>
  );
}
