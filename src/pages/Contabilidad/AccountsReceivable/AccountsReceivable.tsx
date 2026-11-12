import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, PageHeader, Pagination, SearchInput, Table } from '../../../components/UI';
import {
  useAccountsReceivable,
  type ClientReceivable,
} from '../../../application/hooks/useAccountsReceivable';
import { useFilter } from '../../../hooks/useFilter';
import { usePagination } from '../../../hooks/usePagination';
import { paginate } from '../../../utils/pagination';
import { money } from '../../../utils/currency';
import { ITEMS_PER_PAGE } from '../../../config/pagination';
import styles from './AccountsReceivable.module.css';

export function AccountsReceivable() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clients, loading, error } = useAccountsReceivable();
  const [searchTerm, setSearchTerm] = useState('');
  const { pageNumber, pageSize, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const searchFields = useCallback(
    (client: ClientReceivable) => [client.clientName, client.id],
    [],
  );

  const filtered = useFilter({ data: clients, searchTerm, searchFields });
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
      key: 'clientName',
      header: t('contabilidad.accountsReceivable.client'),
    },
    {
      key: 'saleCount',
      header: t('contabilidad.accountsReceivable.sales'),
      render: (client: ClientReceivable) => client.saleCount,
    },
    {
      key: 'lastSaleAmount',
      header: t('contabilidad.accountsReceivable.amount'),
      render: (client: ClientReceivable) => (
        <span className={styles.amount}>{money(client.lastSaleAmount)}</span>
      ),
    },
    {
      key: 'lastSaleDate',
      header: t('contabilidad.accountsReceivable.date'),
      render: (client: ClientReceivable) =>
        new Date(client.lastSaleDate).toLocaleDateString('es-DO'),
    },
    {
      key: 'balance',
      header: t('contabilidad.accountsReceivable.balance'),
      render: (client: ClientReceivable) => (
        <span className={styles.balance}>{money(client.balance)}</span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t('contabilidad.accountsReceivable.title')}
        subtitle={t('contabilidad.accountsReceivable.subtitle')}
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
        <p className={styles.error} data-testid='accounts-receivable-error'>
          {error}
        </p>
      ) : clients.length === 0 ? (
        <p className={styles.status} data-testid='accounts-receivable-empty'>
          {t('contabilidad.accountsReceivable.empty')}
        </p>
      ) : (
        <Table columns={columns} data={visible} />
      )}

      <Pagination pagination={getInfo(filtered.length)} onPageChange={goToPage} />
    </div>
  );
}
