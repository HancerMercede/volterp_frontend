import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useTransaccionStore } from '../../../stores/transaccionStore';
import {
  Table,
  Button,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
  DynamicFormFields,
  VolterpMark,
} from '../../../components/UI';
import { useCrudForm, type FormField } from '../../../hooks/useCrudForm';
import { usePagination } from '../../../hooks/usePagination';
import { useDeleteConfirm } from '../../../hooks/useDeleteConfirm';
import type { AccountingTransactionDto } from '../../../domain/types';
import styles from '../Contabilidad.module.css';
import { ITEMS_PER_PAGE } from '../../../config/pagination';
import { useFilter } from '../../../hooks/useFilter';
import { money } from '../../../utils/currency';

type TransactionFormValues = {
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
  date: string;
  category: string;
  status: 'Pending' | 'Reconciled';
}

const DEFAULT_TRANSACTION_VALUES: TransactionFormValues = {
  description: '',
  type: 'Income',
  amount: 0,
  date: '',
  category: '',
  status: 'Pending',
};

const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  minimumFractionDigits: 0,
});

const currencySymbol =
  currencyFormatter
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value ?? '';

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function TransactionsPanel() {
  const { t } = useTranslation();
  const {
    transacciones,
    totalCount,
    fetchTransacciones,
    addTransaccion,
    updateTransaccion,
    deleteTransaccion,
  } = useTransaccionStore();

  type typeStatus = 'todos' | 'Income' | 'Expense';

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<typeStatus>('todos');
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    fetchTransacciones(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchTransacciones]);

  const PAGE_FIELDS: FormField[] = [
    {
      name: 'type',
      label: t('common.type'),
      type: 'select',
      required: true,
      options: [
        { value: 'Income', label: t('contabilidad.income') },
        { value: 'Expense', label: t('contabilidad.expense') },
      ],
    },
    {
      name: 'amount',
      label: t('common.amount'),
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      label: t('common.status'),
      type: 'select',
      required: true,
      options: [
        { value: 'Pending', label: t('contabilidad.pending') },
        { value: 'Reconciled', label: t('contabilidad.reconciled') },
      ],
    },
  ];

  const SHARED_FIELDS: FormField[] = [
    {
      name: 'description',
      label: t('common.description'),
      type: 'text',
      required: true,
      span: 6,
      placeholder: t('contabilidad.descriptionPlaceholder'),
    },
    {
      name: 'date',
      label: t('common.date'),
      type: 'date',
      required: true,
      span: 3,
    },
    {
      name: 'category',
      label: t('common.category'),
      type: 'text',
      required: true,
      span: 3,
    },
  ];

  const handleSuccess = useCallback(() => {
    setShowForm(false);
    fetchTransacciones(pageNumber, ITEMS_PER_PAGE);
  }, [fetchTransacciones, pageNumber]);

  const form = useCrudForm<TransactionFormValues>({
    fields: [...PAGE_FIELDS, ...SHARED_FIELDS],
    defaultValues: DEFAULT_TRANSACTION_VALUES,
    onCreate: addTransaccion,
    onUpdate: updateTransaccion,
    onSuccess: handleSuccess,
  });

  const { reset: resetForm, handleEdit: editTransaction } = form;

  const searchFields = useCallback(
    (t: AccountingTransactionDto) => [
      t.description,
      t.category,
      t.code,
    ],
    [],
  );

  const matchesType = useCallback(
    (t: AccountingTransactionDto) =>
      filterTipo === 'todos' || t.type == filterTipo,
    [filterTipo],
  );

  const filteredTransacciones = useFilter({
    data: transacciones,
    searchTerm,
    searchFields,
    filter: matchesType,
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      goToPage(1);
    },
    [goToPage],
  );

  const handleTypeFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFilterTipo(e.target.value as typeStatus);
      goToPage(1);
    },
    [goToPage],
  );

  const handleNewTransaction = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    resetForm();
  }, [resetForm]);

  const handleEdit = useCallback(
    (t: AccountingTransactionDto) => {
      editTransaction(t, t.id);
      setShowForm(true);
    },
    [editTransaction],
  );

  const paginationInfo = getInfo(totalCount);

  const totalIngresos = transacciones
    .filter((t) => t.type === 'Income')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalEgresos = transacciones
    .filter((t) => t.type === 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIngresos - totalEgresos;

  const { showDeleteConfirm, deleteId, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: deleteTransaccion,
      successMessage: t('contabilidad.transactionDeleted'),
    });

  const pendingTransaction =
    transacciones.find((x) => x.id === deleteId) ?? null;

  const columns = [
    { key: 'id', header: t('common.id') },
    {
      key: 'descripcion',
      header: t('common.description'),
      render: (tr: AccountingTransactionDto) => tr.description,
    },
    {
      key: 'tipo',
      header: t('common.type'),
      render: (tr: AccountingTransactionDto) => (
        <span
          className={`${styles.badge} ${tr.type === 'Income' ? styles.ingreso : styles.egreso}`}
        >
          {tr.type === 'Income'
            ? t('contabilidad.income')
            : t('contabilidad.expense')}
        </span>
      ),
    },
    {
      key: 'monto',
      header: t('common.amount'),
      render: (tr: AccountingTransactionDto) => (
        <span className={tr.type === 'Income' ? styles.positivo : styles.negativo}>
          {tr.type === 'Income' ? '+' : '-'}
          {formatCurrency(tr.amount)}
        </span>
      ),
    },
    {
      key: 'categoria',
      header: t('common.category'),
      render: (tr: AccountingTransactionDto) => tr.category,
    },
    {
      key: 'fecha',
      header: t('common.date'),
      render: (tr: AccountingTransactionDto) => tr.date,
    },
    {
      key: 'estado',
      header: t('common.status'),
      render: (tr: AccountingTransactionDto) => (
        <span
          className={`${styles.badge} ${tr.status === 'Reconciled' ? styles.conciliada : styles.pendiente}`}
        >
          {tr.status === 'Reconciled'
            ? t('contabilidad.reconciled')
            : t('contabilidad.pending')}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t('contabilidad.income')}</span>
          <span className={`${styles.cardValue} ${styles.positivo}`}>
            {formatCurrency(totalIngresos)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t('contabilidad.expenses')}</span>
          <span className={`${styles.cardValue} ${styles.negativo}`}>
            {formatCurrency(totalEgresos)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t('contabilidad.balance')}</span>
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
          onChange={handleSearchChange}
          placeholder={t('contabilidad.searchTransaction')}
          width='240px'
        />
        <select
          value={filterTipo}
          onChange={handleTypeFilterChange}
          className={styles.select}
        >
          <option value='todos'>{t('contabilidad.filterAll')}</option>
          <option value='Income'>{t('contabilidad.income')}</option>
          <option value='Expense'>{t('contabilidad.expenses')}</option>
        </select>
        <Button
          className={styles.newTransaction}
          onClick={handleNewTransaction}
        >
          + {t('contabilidad.newTransaction')}
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredTransacciones}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={
          form.editingId
            ? t('contabilidad.editTransaction')
            : t('contabilidad.newTransaction')
        }
        icon={<VolterpMark size={40} />}
        subtitle={
          form.editingId
            ? t('contabilidad.editTransactionHint')
            : t('contabilidad.newTransactionHint')
        }
        size='lg'
        error={form.submitError}
        noValidate
        onSubmit={form.handleSubmit}
        submitLabel={
          form.editingId ? t('common.save') : t('contabilidad.createTransaction')
        }
        submitVariant='dark'
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
      >
        <div className={styles.form}>
          <div className={styles.formField}>
            <div className={styles.formLabelRow}>
              <label>
                {t('common.type')}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <div className={styles.segmented}>
              <button
                type='button'
                className={`${styles.segment} ${form.values.type === 'Income' ? styles.segmentActive : ''}`}
                onClick={() => form.setFieldValue('type', 'Income')}
              >
                <ArrowUp size={16} />
                {t('contabilidad.income')}
              </button>
              <button
                type='button'
                className={`${styles.segment} ${form.values.type === 'Expense' ? styles.segmentActive : ''}`}
                onClick={() => form.setFieldValue('type', 'Expense')}
              >
                <ArrowDown size={16} />
                {t('contabilidad.expense')}
              </button>
            </div>
            {form.errors.type && (
              <span className={styles.error}>{form.errors.type}</span>
            )}
          </div>

          <div className={styles.formField}>
            <div className={styles.formLabelRow}>
              <label>
                {t('common.amount')}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <div className={styles.amount}>
              <span className={styles.amountPrefix}>{currencySymbol}</span>
              <input
                type='number'
                className={styles.amountInput}
                value={form.values.amount}
                onChange={(e) =>
                  form.setFieldValue('amount', Number(e.target.value))
                }
                required
              />
            </div>
            {form.errors.amount && (
              <span className={styles.error}>{form.errors.amount}</span>
            )}
          </div>

          <DynamicFormFields
            fields={SHARED_FIELDS}
            values={form.values}
            errors={form.errors}
            editingId={form.editingId}
            onChange={form.setFieldValue}
          />

          <div className={styles.formField}>
            <div className={styles.formLabelRow}>
              <label>
                {t('common.status')}
                <span className={styles.required}>*</span>
              </label>
            </div>
            <div className={styles.segmented}>
              <button
                type='button'
                className={`${styles.segment} ${form.values.status === 'Pending' ? styles.segmentActive : ''}`}
                onClick={() => form.setFieldValue('status', 'Pending')}
              >
                {t('contabilidad.pending')}
              </button>
              <button
                type='button'
                className={`${styles.segment} ${form.values.status === 'Reconciled' ? styles.segmentActive : ''}`}
                onClick={() => form.setFieldValue('status', 'Reconciled')}
              >
                {t('contabilidad.reconciled')}
              </button>
            </div>
            {form.errors.status && (
              <span className={styles.error}>{form.errors.status}</span>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={`${t('common.delete')} ${t('common.transaction')}`}
        message={t('contabilidad.deleteConfirm')}
        confirmLabel={t('common.confirmDeleteAction')}
        cancelLabel={t('common.cancel')}
        context={
          pendingTransaction
            ? {
                title: `${t('common.transaction')} #${pendingTransaction.code}`,
                subtitle: [
                  pendingTransaction.description,
                  pendingTransaction.category,
                ]
                  .filter(Boolean)
                  .join(' · '),
                amount: money(pendingTransaction.amount),
              }
            : undefined
        }
      />
    </>
  );
}
