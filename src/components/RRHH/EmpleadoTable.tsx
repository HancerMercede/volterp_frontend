import { useTranslation } from "react-i18next";
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

const statusClasses: Record<string, string> = {
  Active: styles.badgeActivo,
  Inactive: styles.badgeInactivo,
};

export function EmpleadoTable({ empleados, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  const statusLabels: Record<string, string> = {
    Active: t("common.active"),
    Inactive: t("common.inactive"),
  };

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "nombre",
      header: t("rrhh.tableHeaders.employee"),
      render: (e: EmployeeDto) => (
        <ImageCell
          src={e.imageUrl ?? `https://i.pravatar.cc/150?img=${e.id}`}
          name={`${e.firstName} ${e.lastName}`}
        />
      ),
    },
    { key: "position", header: t("rrhh.employeePosition") },
    { key: "department", header: t("rrhh.employeeDepartment") },
    { key: "email", header: t("rrhh.employeeEmail") },
    { key: "phone", header: t("rrhh.employeePhone") },
    {
      key: "salary",
      header: t("rrhh.salary"),
      render: (e: EmployeeDto) => formatCurrency(e.salary),
    },
    {
      key: "status",
      header: t("rrhh.employeeStatus"),
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
