import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, PageHeader } from '../../../components/UI';
import { TransactionsPanel } from '../components/TransactionsPanel';
import styles from './Transactions.module.css';

export function Transactions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBackToAccounting = useCallback(() => {
    navigate('/contabilidad');
  }, [navigate]);

  return (
    <div className={styles.container}>
      <PageHeader
        title={t('contabilidad.transactionsTitle')}
        subtitle={t('contabilidad.transactionsSubtitle')}
      >
        <Button variant='secondary' onClick={handleBackToAccounting}>
          {t('contabilidad.backToAccounting')}
        </Button>
      </PageHeader>

      <TransactionsPanel />
    </div>
  );
}
