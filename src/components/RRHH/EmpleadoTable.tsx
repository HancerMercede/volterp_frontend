import { Table, ImageCell } from "../../components/UI";
import type { EmployeeDto } from "../../domain/types";
import styles from "./EmpleadoTable.module.css";

interface Props {
  empleados: EmployeeDto[];
  onEdit: (e: EmployeeDto) => void;
  onDelete: (id: number) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
  }).format(amount);

const statusLabels: Record<string, string> = {
  Active: "Activo",
  Inactive: "Inactivo",
};

const statusClasses: Record<string, string> = {
  Active: styles.badgeActivo,
  Inactive: styles.badgeInactivo,
};

export function EmpleadoTable({ empleados, onEdit, onDelete }: Props) {
  const columns = [
    { key: "id", header: "ID" },
    {
      key: "nombre",
      header: "Empleado",
      render: (e: EmployeeDto) => (
        <ImageCell
          src={e.imageUrl ?? `https://i.pravatar.cc/150?img=${e.id}`}
          name={`${e.firstName} ${e.lastName}`}
        />
      ),
    },
    { key: "position", header: "Cargo" },
    { key: "department", header: "Departamento" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Teléfono" },
    {
      key: "salary",
      header: "Salario",
      render: (e: EmployeeDto) => formatCurrency(e.salary),
    },
    {
      key: "status",
      header: "Estado",
      render: (e: EmployeeDto) => (
        <span className={`${styles.badge} ${statusClasses[e.status]}`}>
          {statusLabels[e.status]}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={empleados}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
