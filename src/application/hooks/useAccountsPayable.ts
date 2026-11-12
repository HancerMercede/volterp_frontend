import { useEffect, useMemo, useState } from "react";
import { purchaseService } from "../../infrastructure/api/purchaseService";
import type { PurchaseDto } from "../../domain/types";

/** A supplier with the purchases it still has to be paid. */
export interface SupplierPayable {
  id: string;
  supplierId: string | null;
  supplierName: string;
  balance: number;
  purchaseCount: number;
  lastPurchaseAmount: number;
  lastPurchaseDate: string;
}

/** The API has no grouped endpoint, so the read-model aggregates one page of purchases. */
const PAGE_SIZE = 100;

function groupBySupplier(purchases: PurchaseDto[]): SupplierPayable[] {
  const bySupplier = new Map<string, SupplierPayable>();

  for (const purchase of purchases) {
    if (purchase.status !== "Pending") continue;

    const id = purchase.supplierId ?? purchase.supplierName;
    const group = bySupplier.get(id);

    if (!group) {
      bySupplier.set(id, {
        id,
        supplierId: purchase.supplierId,
        supplierName: purchase.supplierName || purchase.code,
        balance: purchase.total,
        purchaseCount: 1,
        lastPurchaseAmount: purchase.total,
        lastPurchaseDate: purchase.createdAt,
      });
      continue;
    }

    group.balance += purchase.total;
    group.purchaseCount += 1;

    if (purchase.createdAt > group.lastPurchaseDate) {
      group.lastPurchaseAmount = purchase.total;
      group.lastPurchaseDate = purchase.createdAt;
    }
  }

  return [...bySupplier.values()].sort((a, b) => b.balance - a.balance);
}

export function useAccountsPayable() {
  const [purchases, setPurchases] = useState<PurchaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    purchaseService
      .getPurchases(1, PAGE_SIZE)
      .then((result) => {
        setPurchases(result.items);
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to fetch purchases",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const suppliers = useMemo(() => groupBySupplier(purchases), [purchases]);

  return { suppliers, loading, error };
}
