import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFilter } from "../../../hooks/useFilter";
import { initialsOf } from "../../../utils/initials";
import type { Client } from "../../../domain/types";
import styles from "./ClienteSelector.module.css";

interface Props {
  clientes: Client[];
  selectedClienteId: string | null;
  onClienteSelect: (clienteId: string | null) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function ClienteSelector({
  clientes,
  selectedClienteId,
  onClienteSelect,
  searchValue,
  onSearchChange,
}: Props) {
  const { t } = useTranslation();
  const [isPicking, setIsPicking] = useState(false);

  const selectedCliente = useMemo(
    () => clientes.find((c) => c.id === selectedClienteId) ?? null,
    [clientes, selectedClienteId],
  );

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
    searchTerm: searchValue,
    searchFields: (c) => [c.name, c.email, c.code],
  });

  const match = useMemo(() => {
    if (!searchValue.trim()) return null;
    const search = searchValue.toLowerCase();
    return clientes.find(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search),
    );
  }, [searchValue, clientes]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      onClienteSelect(null);
    } else {
      const clienteId = value;
      onClienteSelect(clienteId);
      const cliente = clientes.find((c) => c.id === clienteId);
      if (cliente) onSearchChange(cliente.name);
      setIsPicking(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleBlur = () => {
    if (match && !selectedClienteId) {
      onClienteSelect(match.id);
      onSearchChange(match.name);
    }
  };

  const displayValue =
    match?.id?.toString() || selectedClienteId?.toString() || "";

  if (selectedCliente && !isPicking) {
    return (
      <div className={styles.clientCard}>
        <span className={styles.clientAvatar}>
          {initialsOf(selectedCliente.name)}
        </span>
        <div className={styles.clientInfo}>
          <span className={styles.clientName}>{selectedCliente.name}</span>
          {selectedCliente.phone && (
            <span className={styles.clientPhone}>{selectedCliente.phone}</span>
          )}
        </div>
        <button
          className={styles.changeClient}
          onClick={() => setIsPicking(true)}
        >
          {t("ventas.changeClient")}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formGroup}>
        <label>{t("ventas.client")}</label>
        <input
          type="text"
          placeholder={t("ventas.selectClient")}
          className={styles.searchInput}
          value={searchValue}
          onChange={handleSearchChange}
          onBlur={handleBlur}
        />
        <select
          value={displayValue}
          onChange={handleSelectChange}
          className={styles.select}
          aria-label={t("ventas.client")}
        >
          <option value="">{t("ventas.selectClient")}</option>
          {searchFilteredClientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.email && `(${c.email})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}