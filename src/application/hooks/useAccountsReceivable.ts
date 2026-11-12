import { useEffect, useMemo, useState } from 'react';
import { saleService } from '../../infrastructure/api/saleService';
import type { SaleDto } from '../../domain/types';

/** A client with the sales it still owes. */
export interface ClientReceivable {
  id: string;
  clientName: string;
  balance: number;
  saleCount: number;
  lastSaleAmount: number;
  lastSaleDate: string;
}

/** The API has no grouped endpoint, so the read-model aggregates one page of sales. */
const PAGE_SIZE = 100;

function groupByClient(sales: SaleDto[]): ClientReceivable[] {
  const byClient = new Map<string, ClientReceivable>();

  for (const sale of sales) {
    if (sale.status !== 'Pending') continue;

    const id = sale.clienteId ?? sale.clienteName ?? sale.code;
    const group = byClient.get(id);

    if (!group) {
      byClient.set(id, {
        id,
        clientName: sale.clienteName ?? sale.code,
        balance: sale.total,
        saleCount: 1,
        lastSaleAmount: sale.total,
        lastSaleDate: sale.createdAt,
      });
      continue;
    }

    group.balance += sale.total;
    group.saleCount += 1;

    if (sale.createdAt > group.lastSaleDate) {
      group.lastSaleAmount = sale.total;
      group.lastSaleDate = sale.createdAt;
    }
  }

  return [...byClient.values()].sort((a, b) => b.balance - a.balance);
}

export function useAccountsReceivable() {
  const [sales, setSales] = useState<SaleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saleService
      .getSales(1, PAGE_SIZE)
      .then((result) => {
        setSales(result.items);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch sales');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const clients = useMemo(() => groupByClient(sales), [sales]);

  return { clients, loading, error };
}
