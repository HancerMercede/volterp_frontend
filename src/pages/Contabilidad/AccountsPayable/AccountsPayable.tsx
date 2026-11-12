import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, PageHeader, Pagination, SearchInput, Table } from '../../../components/UI';
import {
  useAccountsPayable,
  type SupplierPayable,
} from '../../../application/hooks/useAccountsPayable';
import { useFilter } from '../../../hooks/useFilter';
import { usePagination } from '../../../hooks/usePagination';
import { paginate } from '../../../utils/pagination';
import { money } from '../../../utils/currency';
import { ITEMS_PER_PAGE } from '../../../config/pagination';
import styles from './AccountsPayable.module.css';

export function AccountsPayable() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { suppliers, loading, error } = useAccountsPayable();
  const [searchTerm, setSearchTerm] = useState('');
  const { pageNumber, pageSize, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const searchFields = useCallback(
    (supplier: SupplierPayable) => [supplier.supplierName, supplier.id],
    [],
  );

  const filtered = useFilter({ data: suppliers, searchTerm, searchFields });
  const visible = useMemo(
    () => paginate(filtered, pageNumber, pageSize),
    [filtered, pageNumber, pageSize],
  );

  const handleBack = useCallback(() => {
    navigate('/contabilidad');
  }, [navigate]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      goToPage(1);
    },
    [goToPage],
  );

  const columns = [
    {
      key: 'supplierName',
      header: t('contabilidad.accountsPayable.supplier'),
    },
    {
      key: 'purchaseCount',
      header: t('contabilidad.accountsPayable.purchases'),
      render: (supplier: SupplierPayable) => supplier.purchaseCount,
    },
    {
      key: 'lastPurchaseAmount',
      header: t('contabilidad.accountsPayable.amount'),
      render: (supplier: SupplierPayable) => (
        <span className={styles.amount}>{money(supplier.lastPurchaseAmount)}</span>
      ),
    },
    {
      key: 'lastPurchaseDate',
      header: t('contabilidad.accountsPayable.date'),
      render: (supplier: SupplierPayable) =>
        new Date(supplier.lastPurchaseDate).toLocaleDateString('es-DO'),
    },
    {
      key: 'balance',
      header: t('contabilidad.accountsPayable.balance'),
      render: (supplier: SupplierPayable) => (
        <span className={styles.balance}>{money(supplier.balance)}</span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t('contabilidad.accountsPayable.title')}
        subtitle={t('contabilidad.accountsPayable.subtitle')}
      >
        <Button variant='secondary' onClick={handleBack}>
          {t('contabilidad.backToAccounting')}
        </Button>
      </PageHeader>

      <div className={styles.toolbar}>
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('common.search')}
          width='240px'
        />
      </div>

      {loading ? (
        <p className={styles.status}>{t('common.loading')}</p>
      ) : error ? (
        <p className={styles.error} data-testid='accounts-payable-error'>
          {error}
        </p>
      ) : suppliers.length === 0 ? (
        <p className={styles.status} data-testid='accounts-payable-empty'>
          {t('contabilidad.accountsPayable.empty')}
        </p>
      ) : (
        <Table columns={columns} data={visible} />
      )}

      <Pagination pagination={getInfo(filtered.length)} onPageChange={goToPage} />
    </div>
  );
}
