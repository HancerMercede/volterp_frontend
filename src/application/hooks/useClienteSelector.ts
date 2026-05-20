import { useMemo } from "react";
import { useFilter } from "../../hooks/useFilter";
import type { Client } from "../../domain/types";

export function useClienteSelector(
  clientes: Client[],
  selectedClienteId: number | null,
  clienteSearch: string,
) {
  const dropdownClientes = useMemo(() => {
    const top50 = clientes.slice(0, 50);
    if (selectedClienteId && !top50.find((c) => c.id === selectedClienteId)) {
      const selected = clientes.find((c) => c.id === selectedClienteId);
      if (selected) return [selected, ...top50];
    }
    return top50;
  }, [clientes, selectedClienteId]);

  const searchFilteredClientes = useFilter({
    data: dropdownClientes,
    searchTerm: clienteSearch,
    searchFields: (c) => [c.nombre, c.email, c.empresa ?? ""],
  });

  const match = useMemo(() => {
    if (!clienteSearch.trim()) return null;
    const search = clienteSearch.toLowerCase();
    return clientes.find(
      (c) =>
        c.nombre.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.empresa && c.empresa.toLowerCase().includes(search)),
    );
  }, [clienteSearch, clientes]);

  return {
    dropdownClientes,
    searchFilteredClientes,
    match,
  };
}