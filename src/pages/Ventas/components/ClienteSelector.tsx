import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchableSelect } from "../../../components/UI";
import { initialsOf } from "../../../utils/initials";
import type { Client } from "../../../domain/types";
import styles from "./ClienteSelector.module.css";

interface Props {
  clientes: Client[];
  selectedClienteId: string | null;
  onClienteSelect: (clienteId: string | null) => void;
}

export function ClienteSelector({
  clientes,
  selectedClienteId,
  onClienteSelect,
}: Props) {
  const { t } = useTranslation();
  const [isPicking, setIsPicking] = useState(false);

  const selectedCliente = useMemo(
    () => clientes.find((c) => c.id === selectedClienteId) ?? null,
    [clientes, selectedClienteId],
  );

  const options = useMemo(
    () =>
      [...clientes]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((client) => ({
          value: client.id,
          label: client.name,
          description: client.email,
          keywords: [client.code],
        })),
    [clientes],
  );

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
        <SearchableSelect
          id="cliente-picker"
          label={t("ventas.client")}
          options={options}
          value={selectedClienteId ?? ""}
          placeholder={t("ventas.searchClient")}
          emptyLabel={t("ventas.noClientsFound")}
          autoFocus={isPicking}
          onChange={(value) => {
            onClienteSelect(value || null);
            if (value) setIsPicking(false);
          }}
        />
      </div>
    </div>
  );
}