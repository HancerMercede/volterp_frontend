import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTransaccionStore } from "../../stores/transaccionStore";
import {
  Table,
  Button,
  PageHeader,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
  DynamicFormFields,
} from "../../components/UI";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import type {
  AccountingTransactionDto,
  AccountingTransactionRequest,
} from "../../domain/types";
import styles from "./Contabilidad.module.css";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import { useFilter } from "../../hooks/useFilter";

export function Contabilidad() {
  const { t } = useTranslation();
  const {
    transacciones,
    totalCount,
    fetchTransacciones,
    addTransaccion,
    updateTransaccion,
    deleteTransaccion,
  } = useTransaccionStore();

  type typeStatus = "todos" | "Income" | "Expense";

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<typeStatus>("todos");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchTransacciones(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchTransacciones]);

  const TRANSACCION_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "description",
        label: t("common.description"),
        type: "text",
        required: true,
      },
      {
        name: "type",
        label: t("common.type"),
        type: "select",
        required: true,
        options: [
          { value: "Income", label: t("contabilidad.income") },
          { value: "Expense", label: t("contabilidad.expenses") },
        ],
      },
      {
        name: "amount",
        label: t("common.amount"),
        type: "number",
        required: true,
      },
      { name: "date", label: t("common.date"), type: "date", required: true },
      {
        name: "category",
        label: t("common.category"),
        type: "text",
        required: true,
      },
      {
        name: "status",
        label: t("common.status"),
        type: "select",
        required: true,
        options: [
          { value: "Pending", label: t("contabilidad.pending") },
          { value: "Reconciled", label: t("contabilidad.reconciled") },
        ],
      },
    ],
    [t],
  );

  const form = useCrudForm({
    fields: TRANSACCION_FIELDS,
    defaultValues: {
      description: "",
      type: "Income",
      amount: 0,
      date: "",
      category: "",
      status: "Pending",
    },
    onCreate: (data) => addTransaccion(data as AccountingTransactionRequest),
    onUpdate: (id, data) =>
      updateTransaccion(id, data as AccountingTransactionRequest),
    onSuccess: () => {
      setShowForm(false);
      fetchTransacciones();
    },
  });

  const filteredTransacciones = useFilter({
    data: transacciones,
    searchTerm,
    searchFields: (t) => [t.description, t.category],
    filter: (t) => filterTipo === "todos" || t.type == filterTipo,
  });

  const paginatedTransacciones = useMemo(() => {
    return paginate(filteredTransacciones, pageNumber, ITEMS_PER_PAGE);
  }, [filteredTransacciones, pageNumber]);

  const paginationInfo = getInfo(totalCount);

  const totalIngresos = transacciones
    .filter((t) => t.type === "Income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalEgresos = transacciones
    .filter((t) => t.type === "Expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIngresos - totalEgresos;

  const handleEdit = (t: AccountingTransactionDto) => {
    form.handleEdit(t, t.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteTransaccion(deleteId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "descripcion",
      header: t("common.description"),
      render: (tr: AccountingTransactionDto) => tr.description,
    },
    {
      key: "tipo",
      header: t("common.type"),
      render: (tr: AccountingTransactionDto) => (
        <span
          className={`${styles.badge} ${tr.type === "Income" ? styles.ingreso : styles.egreso}`}
        >
          {tr.type === "Income"
            ? t("contabilidad.income")
            : t("contabilidad.expense")}
        </span>
      ),
    },
    {
      key: "monto",
      header: t("common.amount"),
      render: (tr: AccountingTransactionDto) => (
        <span
          className={tr.type === "Income" ? styles.positivo : styles.negativo}
        >
          {tr.type === "Income" ? "+" : "-"}
          {formatCurrency(tr.amount)}
        </span>
      ),
    },
    {
      key: "categoria",
      header: t("common.category"),
      render: (tr: AccountingTransactionDto) => tr.category,
    },
    {
      key: "fecha",
      header: t("common.date"),
      render: (tr: AccountingTransactionDto) => tr.date,
    },
    {
      key: "estado",
      header: t("common.status"),
      render: (tr: AccountingTransactionDto) => (
        <span
          className={`${styles.badge} ${tr.status === "Reconciled" ? styles.conciliada : styles.pendiente}`}
        >
          {tr.status === "Reconciled"
            ? t("contabilidad.reconciled")
            : t("contabilidad.pending")}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("contabilidad.title")}
        subtitle={t("contabilidad.subtitle")}
      >
        <Button
          onClick={() => {
            form.reset();
            setShowForm(true);
          }}
        >
          + {t("contabilidad.newTransaction")}
        </Button>
      </PageHeader>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("contabilidad.income")}</span>
          <span className={`${styles.cardValue} ${styles.positivo}`}>
            {formatCurrency(totalIngresos)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("contabilidad.expenses")}</span>
          <span className={`${styles.cardValue} ${styles.negativo}`}>
            {formatCurrency(totalEgresos)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("contabilidad.balance")}</span>
          <span
            className={`${styles.cardValue} ${balance >= 0 ? styles.positivo : styles.negativo}`}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            goToPage(1);
          }}
          placeholder={t("contabilidad.searchTransaction")}
          width="240px"
        />
        <select
          value={filterTipo}
          onChange={(e) => {
            setFilterTipo(e.target.value as typeof filterTipo);
            goToPage(1);
          }}
          className={styles.select}
        >
          <option value="todos">{t("contabilidad.filterAll")}</option>
          <option value="Income">{t("contabilidad.income")}</option>
          <option value="Expense">{t("contabilidad.expenses")}</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={paginatedTransacciones}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        title={
          form.editingId
            ? t("contabilidad.editTransaction")
            : t("contabilidad.newTransaction")
        }
        onSubmit={form.handleSubmit}
        submitLabel={form.editingId ? t("common.save") : t("common.create")}
      >
        <DynamicFormFields
          fields={TRANSACCION_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("contabilidad.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
