import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table, ImageCell, Pagination, SearchInput } from "../../../components/UI";
import { paginate } from "../../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import { useFilter } from "../../../hooks/useFilter";
import type { SaleDto, Client } from "../../../domain/types";
import styles from "./VentasList.module.css";

interface Props {
  ventas: SaleDto[];
  clientes: Client[];
  onVentaClick: (venta: SaleDto) => void;
  onDelete: (id: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  pageNumber: number;
  onPageChange: (page: number) => void;
}

export function VentasList({
  ventas,
  clientes,
  onVentaClick,
  onDelete,
  searchTerm,
  onSearchChange,
  pageNumber,
  onPageChange,
}: Props) {
  const { t } = useTranslation();

  const filteredVentas = useFilter({
    data: ventas,
    searchTerm,
    searchFields: (v: SaleDto) => [v.clienteName || "", String(v.id)],
  });

  const paginatedVentas = useMemo(() => {
    return paginate(filteredVentas, pageNumber, ITEMS_PER_PAGE);
  }, [filteredVentas, pageNumber]);

  const getClienteById = (id: number | null) =>
    id ? clientes.find((c) => Number(c.id) === id) : null;

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "cliente",
      header: t("ventas.client"),
      render: (v: SaleDto) => {
        const cliente = getClienteById(v.clienteId);
        return cliente ? (
          <ImageCell src={cliente.avatar} name={v.clienteName || ""} subtext={cliente.empresa} type="avatar" />
        ) : (
          v.clienteName || "-"
        );
      },
    },
    {
      key: "producto",
      header: t("ventas.product"),
      render: (v: SaleDto) => {
        if (!v.items?.length) return "-";
        const firstItem = v.items[0];
        return (
          <ImageCell
            src={firstItem.productImageUrl || ""}
            name={firstItem.productName}
            subtext={v.items.length > 1 ? `+${v.items.length - 1} más` : `x${firstItem.quantity}`}
            type="product"
          />
        );
      },
    },
    { key: "total", header: t("common.total"), render: (v: SaleDto) => `$${v.total.toLocaleString()}` },
    { key: "fecha", header: t("common.date"), render: (v: SaleDto) => new Date(v.createdAt).toLocaleDateString() },
    {
      key: "estado",
      header: t("common.status"),
      render: (v: SaleDto) => (
        <span className={`${styles.badge} ${styles[v.status === "Completed" ? "completada" : "pendiente"]}`}>
          {v.status === "Completed" ? t("ventas.completed") : t("ventas.pending")}
        </span>
      ),
    },
  ];

  return (
    <div>
      <SearchInput
        value={searchTerm}
        onChange={(value) => {
          onSearchChange(value);
          onPageChange(1);
        }}
        placeholder={t("ventas.searchSales")}
        width="240px"
      />

      <Table data={paginatedVentas} columns={columns} onEdit={onVentaClick} onDelete={onDelete} />

      <Pagination
        pagination={{
          total: filteredVentas.length,
          page: pageNumber,
          pageSize: ITEMS_PER_PAGE,
          totalPages: Math.ceil(filteredVentas.length / ITEMS_PER_PAGE),
          hasNext: pageNumber < Math.ceil(filteredVentas.length / ITEMS_PER_PAGE),
          hasPrev: pageNumber > 1,
        }}
        onPageChange={onPageChange}
      />
    </div>
  );
}