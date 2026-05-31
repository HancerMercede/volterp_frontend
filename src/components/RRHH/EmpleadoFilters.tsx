import { SearchInput } from "../../components/UI";
import styles from "./EmpleadoFilters.module.css";

interface Props {
  searchTerm: string;
  filterEstado: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export function EmpleadoFilters({ searchTerm, filterEstado, onSearchChange, onEstadoChange }: Props) {
  return (
    <div className={styles.filters}>
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Buscar empleados..."
        width="240px"
      />
      <select
        value={filterEstado}
        onChange={(e) => onEstadoChange(e.target.value)}
        className={styles.select}
      >
        <option value="todos">Todos</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>
    </div>
  );
}