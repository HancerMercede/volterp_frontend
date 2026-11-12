import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, PageHeader } from '../../components/UI';
import { TransactionsPanel } from './components/TransactionsPanel';
import styles from './Contabilidad.module.css';

export function Contabilidad() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigateAccounts = useCallback(() => {
    navigate('/contabilidad/cuentas');
  }, [navigate]);

  const handleNavigateAccountsReceivable = useCallback(() => {
    navigate('/contabilidad/cxc');
  }, [navigate]);

  const handleNavigateAccountsPayable = useCallback(() => {
    navigate('/contabilidad/cxp');
  }, [navigate]);

  return (
    <div className={styles.container}>
      <PageHeader
        title={t('contabilidad.title')}
        subtitle={t('contabilidad.subtitle')}
      >
        <Button variant='secondary' onClick={handleNavigateAccounts}>
          {t('contabilidad.navAccounts')}
        </Button>
        <Button variant='secondary' onClick={handleNavigateAccountsReceivable}>
          {t('contabilidad.navAccountsReceivable')}
        </Button>
        <Button variant='secondary' onClick={handleNavigateAccountsPayable}>
          {t('contabilidad.navAccountsPayable')}
        </Button>
      </PageHeader>

      <TransactionsPanel />
    </div>
  );
}
