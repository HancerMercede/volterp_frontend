import { useCallback, useEffect, useState } from "react";
import { saleService } from "../../infrastructure/api/saleService";
import type { FiscalReadinessDto } from "../../domain/types";

/**
 * Whether the taxpayer can bill right now. The sale never waits for it: when
 * the call fails the screen keeps selling and the error says it is unverified.
 */
export function useFiscalReadiness() {
  const [readiness, setReadiness] = useState<FiscalReadinessDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      saleService
        .getReadiness()
        .then((result) => {
          setReadiness(result);
          setError(null);
        })
        .catch((err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch the fiscal readiness",
          );
        })
        .finally(() => {
          setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // The refresh is asked by the user (a button), never by the screen on its own.
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  return { readiness, loading, error, refresh };
}
