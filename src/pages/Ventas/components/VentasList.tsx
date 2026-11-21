import { useTranslation } from "react-i18next";
import {
  Table,
  ImageCell,
  Pagination,
  SearchInput,
} from "../../../components/UI";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import { useFilter } from "../../../hooks/useFilter";
import { useClienteStore } from "../../../stores/clienteStore";
import { Link } from "react-router-dom";
import {
  FISCAL_STATE_PALETTE,
  FISCAL_STATE_VOCABULARY,
  SALE_FISCAL_STATE_VOCABULARY,
  type SaleDto,
} from "../../../domain/types";
import { COMPROBANTES_ROUTE } from "./comprobantesRoute";
import styles from "./VentasList.module.css";

interface Props {
  ventas: SaleDto[];
  totalCount: number;
  onVentaClick: (venta: SaleDto) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  pageNumber: number;
  onPageChange: (page: number) => void;
}

export function VentasList({
  ventas,
  totalCount,
  onVentaClick,
  onDelete,
  searchTerm,
  onSearchChange,
  pageNumber,
  onPageChange,
}: Props) {
  const { t } = useTranslation();
  const { clientes } = useClienteStore();

  const filteredVentas = useFilter({
    data: ventas,
    searchTerm,
    searchFields: (v: SaleDto) => [v.clienteName || "", String(v.id), v.code],
  });

  const getClienteById = (id: string | null) =>
    id ? clientes.find((c) => c.id === id) : null;

  const columns = [
    { key: "code", header: t("common.code") },
    {
      key: "cliente",
      header: t("ventas.client"),
      render: (v: SaleDto) => {
        const cliente = getClienteById(v.clienteId);
        return cliente ? (
          <ImageCell
            src={
              cliente.imageUrl ||
              cliente.avatar ||
              `https://i.pravatar.cc/150?img=${cliente.id}`
            }
            name={v.clienteName || ""}
            subtext={cliente.name}
            type="avatar"
          />
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
            src={
              firstItem.productImageUrl ||
              `https://i.pravatar.cc/150?img=${firstItem.id}`
            }
            name={firstItem.productName}
            subtext={
              v.items.length > 1
                ? `+${v.items.length - 1} más`
                : `x${firstItem.quantity}`
            }
            type="product"
          />
        );
      },
    },
    {
      key: "total",
      header: t("common.total"),
      render: (v: SaleDto) => `$${v.total.toLocaleString()}`,
    },
    {
      key: "fecha",
      header: t("common.date"),
      render: (v: SaleDto) => new Date(v.createdAt).toLocaleDateString(),
    },
    {
      key: "estado",
      header: t("common.status"),
      render: (v: SaleDto) => (
        <span
          className={`${styles.badge} ${styles[v.status === "Completed" ? "completada" : "pendiente"]}`}
        >
          {v.status === "Completed"
            ? t("ventas.completed")
            : t("ventas.pending")}
        </span>
      ),
    },
    {
      // The fiscal state travels in its own column: it is not the state of
      // the payment, and a rejected document does not cancel a paid sale.
      // The fine state of the document wins; while the document is still in
      // flight, the coarse state of the sale is the only thing there is.
      key: "fiscalState",
      header: t("ventas.fiscalState"),
      render: (v: SaleDto) => {
        const state = v.fiscalStatus
          ? FISCAL_STATE_VOCABULARY[v.fiscalStatus]
          : v.fiscalState
            ? SALE_FISCAL_STATE_VOCABULARY[v.fiscalState]
            : null;

        const badge = state ? (
          <span
            className={styles.badge}
            style={{
              background: FISCAL_STATE_PALETTE[state.color].background,
              color: FISCAL_STATE_PALETTE[state.color].color,
            }}
          >
            {t(state.labelKey)}
          </span>
        ) : (
          <span className={styles.emptyValue}>{t("ventas.emptyValue")}</span>
        );

        // A sale that has a document can go to the comprobantes module; one
        // without it has nothing to show there.
        if (!v.electronicInvoiceId) return badge;

        return (
          <span className={styles.fiscalCell}>
            {badge}
            <Link to={COMPROBANTES_ROUTE} className={styles.comprobanteLink}>
              {t("ventas.viewInvoice")}
            </Link>
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <div className={styles.searchBar}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            onSearchChange(value);
            onPageChange(1);
          }}
          placeholder={t("ventas.searchSales")}
          width="240px"
        />
      </div>

      <Table
        data={filteredVentas}
        columns={columns}
        onEdit={onVentaClick}
        onDelete={onDelete}
        getEditAction={(v) =>
          v.status === "Completed"
            ? { label: t("common.detail"), variant: "detail" }
            : { label: t("common.edit"), variant: "edit" }
        }
      />

      <Pagination
        pagination={{
          total: totalCount,
          page: pageNumber,
          pageSize: ITEMS_PER_PAGE,
          totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
          hasNext: pageNumber < Math.ceil(totalCount / ITEMS_PER_PAGE),
          hasPrev: pageNumber > 1,
        }}
        onPageChange={onPageChange}
      />
    </div>
  );
}
