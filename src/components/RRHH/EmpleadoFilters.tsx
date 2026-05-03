import { SearchInput } from "../../components/UI";
import type { EstadoEmpleado } from "../../domain/entities/Empleado";
import styles from "./EmpleadoFilters.module.css";

interface Props {
  searchTerm: string;
  filterEstado: "todos" | EstadoEmpleado;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: "todos" | EstadoEmpleado) => void;
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
        onChange={(e) => onEstadoChange(e.target.value as typeof filterEstado)}
        className={styles.select}
      >
        <option value="todos">Todos</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
        <option value="vacaciones">Vacaciones</option>
        <option value="licencia">Licencia</option>
      </select>
    </div>
  );
}