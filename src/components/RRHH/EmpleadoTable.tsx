import { Table, ImageCell } from "../../components/UI";
import type { Empleado, EstadoEmpleado } from "../../domain/entities/Empleado";
import styles from "./EmpleadoTable.module.css";

interface Props {
  empleados: Empleado[];
  onEdit: (e: Empleado) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 0 }).format(amount);

const statusLabels: Record<EstadoEmpleado, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  vacaciones: "Vacaciones",
  licencia: "Licencia",
};

const statusClasses: Record<EstadoEmpleado, string> = {
  activo: styles.badgeActivo,
  inactivo: styles.badgeInactivo,
  vacaciones: styles.badgeVacaciones,
  licencia: styles.badgeLicencia,
};

export function EmpleadoTable({ empleados, onEdit, onDelete }: Props) {
  const columns = [
    { key: "id", header: "ID" },
    {
      key: "avatar",
      header: "Empleado",
      render: (e: Empleado) => <ImageCell src={e.avatar} name={e.nombre} />,
    },
    { key: "cargo", header: "Cargo" },
    { key: "departamento", header: "Departamento" },
    { key: "emailLaboral", header: "Email" },
    { key: "telefonoLaboral", header: "Teléfono" },
    {
      key: "salarioBase",
      header: "Salario",
      render: (e: Empleado) => formatCurrency(e.salarioBase),
    },
    {
      key: "estado",
      header: "Estado",
      render: (e: Empleado) => (
        <span className={`${styles.badge} ${statusClasses[e.estado]}`}>
          {statusLabels[e.estado]}
        </span>
      ),
    },
  ];

  return <Table columns={columns} data={empleados} onEdit={onEdit} onDelete={onDelete} />;
}