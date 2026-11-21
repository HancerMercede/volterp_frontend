import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { useApiCredentialStore } from "../../../stores/apiCredentialStore";
import { useCompanyEmissionModeStore } from "../../../stores/companyEmissionModeStore";
import { useNormalFiscalSequenceStore } from "../../../stores/normalFiscalSequenceStore";
import { useUIStore } from "../../../stores/uiStore";
import {
  Button,
  ConfirmModal,
  DynamicFormFields,
  Modal,
  PageHeader,
  Pagination,
  ReadinessChecklist,
  SearchInput,
  Table,
} from "../../../components/UI";
import { useFiscalReadiness } from "../../../application/hooks/useFiscalReadiness";
import { useCrudForm, type FormField } from "../../../hooks/useCrudForm";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { useFilter } from "../../../hooks/useFilter";
import { usePagination } from "../../../hooks/usePagination";
import { usePermission } from "../../../hooks/usePermission";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import {
  ECF_COMPANY_CONTINGENCY_STATUSES,
  ECF_COMPANY_EMISSION_MODES,
  ECF_NORMAL_FISCAL_DOCUMENT_TYPES,
  parseCompanyContingencyStatus,
  parseCompanyEmissionMode,
  parseNormalFiscalDocumentType,
  type CompanyEmissionMode,
} from "../../../domain/constants/electronicInvoicing";
import type {
  ApiCredential,
  CompanyEmissionModeDto,
  IssuedApiCredentialDto,
  NormalFiscalSequence,
  SaveNormalFiscalSequenceRequest,
  UpdateCompanyContingencyRequest,
} from "../../../domain/types";
import styles from "./Settings.module.css";

/** The backend leaves a cell empty; the UI never invents a value for it. */
const EMPTY_CELL = "—";

/**
 * Type aliases (not interfaces) so they keep the implicit index signature
 * `useCrudForm` and `DynamicFormFields` require.
 */
type CredentialForm = {
  name: string;
  expiresAt: string;
};

type NormalSequenceForm = {
  issuerTaxId: string;
  documentType: string;
  from: number | string;
  to: number | string;
  position: number | string;
  expiresAt: string;
};

/** ISO instant → the `datetime-local` format the browser inputs expect. */
function toDateTimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoInstant(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { canWrite, canDelete } = usePermission();
  const { addToast } = useUIStore();

  // Si el contribuyente puede facturar hoy: es la pantalla donde se declara
  // el modo de emision, asi que es donde se mira que falta para facturar.
  const {
    readiness,
    loading: readinessLoading,
    error: readinessError,
  } = useFiscalReadiness();

  const {
    emissionMode,
    error: emissionError,
    fetchEmissionMode,
    updateEmissionMode,
    updateContingency,
  } = useCompanyEmissionModeStore();

  const {
    credentials,
    totalCount: credentialsTotal,
    error: credentialsError,
    fetchCredentials,
    createCredential,
    deleteCredential,
  } = useApiCredentialStore();

  const {
    normalSequences,
    totalCount: sequencesTotal,
    error: sequencesError,
    fetchNormalSequences,
    addNormalSequence,
    updateNormalSequence,
  } = useNormalFiscalSequenceStore();

  const credentialsPagination = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const sequencesPagination = usePagination({ initialPageSize: ITEMS_PER_PAGE });

  const [credentialsSearch, setCredentialsSearch] = useState<string>("");
  const [sequencesSearch, setSequencesSearch] = useState<string>("");
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [credentialValues, setCredentialValues] = useState<CredentialForm>({
    name: "",
    expiresAt: "",
  });
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [issuedCredential, setIssuedCredential] =
    useState<IssuedApiCredentialDto | null>(null);
  const [showSequenceForm, setShowSequenceForm] = useState(false);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      await fetchEmissionMode();
      if (ignore) return;
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [fetchEmissionMode]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      await fetchCredentials(credentialsPagination.pageNumber, ITEMS_PER_PAGE);
      if (ignore) return;
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [credentialsPagination.pageNumber, fetchCredentials]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      await fetchNormalSequences(sequencesPagination.pageNumber, ITEMS_PER_PAGE);
      if (ignore) return;
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [sequencesPagination.pageNumber, fetchNormalSequences]);

  const CREDENTIAL_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: t("facturacion.common.name"),
        type: "text",
        required: true,
        span: 6,
      },
      {
        name: "expiresAt",
        label: t("facturacion.common.expiresAt"),
        type: "date",
        span: 6,
      },
    ],
    [t],
  );

  const NORMAL_SEQUENCE_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "issuerTaxId",
        label: t("facturacion.common.issuerTaxId"),
        type: "text",
        required: true,
        span: 6,
      },
      {
        name: "documentType",
        label: t("facturacion.common.documentType"),
        type: "select",
        required: true,
        span: 6,
        options: ECF_NORMAL_FISCAL_DOCUMENT_TYPES.map((documentType) => ({
          value: documentType,
          label: documentType,
        })),
      },
      {
        name: "from",
        label: t("facturacion.common.from"),
        type: "number",
        required: true,
        span: 3,
      },
      {
        name: "to",
        label: t("facturacion.common.to"),
        type: "number",
        required: true,
        span: 3,
      },
      {
        name: "position",
        label: t("facturacion.common.position"),
        type: "number",
        required: true,
        span: 3,
      },
      {
        name: "expiresAt",
        label: t("facturacion.common.expiresAt"),
        type: "date",
        span: 3,
      },
    ],
    [t],
  );

  const mapSequenceToForm = useCallback(
    (entity: Record<string, unknown>): NormalSequenceForm => {
      const sequence = entity as unknown as NormalFiscalSequence;
      return {
        issuerTaxId: sequence.issuerTaxId,
        documentType: sequence.documentType,
        from: sequence.from,
        to: sequence.to,
        position: sequence.currentSequence,
        expiresAt: sequence.expiresAt ? sequence.expiresAt.slice(0, 10) : "",
      };
    },
    [],
  );

  const toSequenceRequest = useCallback(
    (values: NormalSequenceForm): SaveNormalFiscalSequenceRequest => {
      const documentType = parseNormalFiscalDocumentType(values.documentType);
      if (!documentType) {
        throw new Error("Invalid normal fiscal document type");
      }
      return {
        issuerTaxId: values.issuerTaxId.trim(),
        documentType,
        from: Number(values.from),
        to: Number(values.to),
        position: Number(values.position),
        expiresAt: toIsoInstant(values.expiresAt),
      };
    },
    [],
  );

  const sequenceForm = useCrudForm<NormalSequenceForm>({
    fields: NORMAL_SEQUENCE_FIELDS,
    defaultValues: {
      issuerTaxId: "",
      documentType: "",
      from: "",
      to: "",
      position: "",
      expiresAt: "",
    },
    mapEntityToForm: mapSequenceToForm,
    onCreate: async (values) => {
      const created = await addNormalSequence(toSequenceRequest(values));
      addToast(t("facturacion.settings.normalSequenceCreated"), "success");
      return created;
    },
    onUpdate: async (id, values) => {
      const updated = await updateNormalSequence(id, toSequenceRequest(values));
      addToast(t("facturacion.settings.normalSequenceUpdated"), "success");
      return updated;
    },
    onSuccess: () => {
      setShowSequenceForm(false);
      void fetchNormalSequences(sequencesPagination.pageNumber, ITEMS_PER_PAGE);
    },
  });

  const {
    showDeleteConfirm,
    deleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
  } = useDeleteConfirm({
    onDelete: deleteCredential,
    successMessage: t("facturacion.settings.credentialRevoked"),
  });

  const credentialToRevoke =
    credentials.find((credential) => credential.id === deleteId) ?? null;

  const filteredCredentials = useFilter({
    data: credentials,
    searchTerm: credentialsSearch,
    searchFields: (credential: ApiCredential) => [
      credential.name,
      credential.keyId,
      credential.status,
    ],
  });

  const filteredSequences = useFilter({
    data: normalSequences,
    searchTerm: sequencesSearch,
    searchFields: (sequence: NormalFiscalSequence) => [
      sequence.issuerTaxId,
      sequence.documentType,
    ],
  });

  const handleSaveEmissionMode = useCallback(
    async (mode: CompanyEmissionMode) => {
      try {
        await updateEmissionMode({ emissionMode: mode });
        addToast(t("facturacion.settings.emissionModeUpdated"), "success");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : t("facturacion.messages.saveError"),
          "error",
        );
      }
    },
    [updateEmissionMode, addToast, t],
  );

  const handleSaveContingency = useCallback(
    async (payload: UpdateCompanyContingencyRequest) => {
      try {
        await updateContingency(payload);
        addToast(t("facturacion.settings.contingencyUpdated"), "success");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : t("facturacion.messages.saveError"),
          "error",
        );
      }
    },
    [updateContingency, addToast, t],
  );

  const handleCreateCredential = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const name = credentialValues.name.trim();
      if (!name) {
        setCredentialError(t("validation.required"));
        return;
      }
      setCredentialError(null);
      try {
        const issued = await createCredential(
          name,
          toIsoInstant(credentialValues.expiresAt),
        );
        setCredentialValues({ name: "", expiresAt: "" });
        setShowCredentialForm(false);
        setIssuedCredential(issued);
        addToast(t("facturacion.settings.credentialCreated"), "success");
        void fetchCredentials(
          credentialsPagination.pageNumber,
          ITEMS_PER_PAGE,
        );
      } catch (err) {
        setCredentialError(
          err instanceof Error ? err.message : t("facturacion.messages.saveError"),
        );
      }
    },
    [
      credentialValues,
      createCredential,
      addToast,
      t,
      credentialsPagination.pageNumber,
      fetchCredentials,
    ],
  );

  const handleEditSequence = useCallback(
    (sequence: NormalFiscalSequence) => {
      sequenceForm.handleEdit(sequence, sequence.id);
      setShowSequenceForm(true);
    },
    [sequenceForm],
  );

  const credentialColumns = [
    { key: "name", header: t("facturacion.common.name") },
    { key: "keyId", header: t("facturacion.common.keyId") },
    { key: "status", header: t("facturacion.common.status") },
    {
      key: "expiresAt",
      header: t("facturacion.common.expiresAt"),
      render: (credential: ApiCredential) => credential.expiresAt ?? EMPTY_CELL,
    },
    {
      key: "isExpired",
      header: t("facturacion.settings.isExpired"),
      render: (credential: ApiCredential) =>
        credential.isExpired ? t("common.yes") : t("common.no"),
    },
    {
      key: "createdAt",
      header: t("facturacion.settings.createdAt"),
      render: (credential: ApiCredential) => credential.createdAt ?? EMPTY_CELL,
    },
    {
      key: "actions",
      header: t("facturacion.common.actions"),
      render: (credential: ApiCredential) =>
        canDelete("facturacion") ? (
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(credential.id)}
          >
            {t("facturacion.settings.revoke")}
          </Button>
        ) : null,
    },
  ];

  const sequenceColumns = [
    { key: "issuerTaxId", header: t("facturacion.common.issuerTaxId") },
    { key: "documentType", header: t("facturacion.common.documentType") },
    { key: "from", header: t("facturacion.common.from") },
    { key: "to", header: t("facturacion.common.to") },
    {
      key: "currentSequence",
      header: t("facturacion.common.currentSequence"),
    },
    {
      key: "expiresAt",
      header: t("facturacion.common.expiresAt"),
      render: (sequence: NormalFiscalSequence) =>
        sequence.expiresAt ?? EMPTY_CELL,
    },
    {
      key: "hasRoom",
      header: t("facturacion.common.hasRoom"),
      render: (sequence: NormalFiscalSequence) =>
        sequence.hasRoom ? t("common.yes") : t("common.no"),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("facturacion.settings.title")}
        subtitle={t("facturacion.settings.subtitle")}
      />

      {(emissionError || credentialsError || sequencesError) && (
        <div className={styles.error} role="alert">
          {emissionError ?? credentialsError ?? sequencesError}
        </div>
      )}

      <div className={styles.fiscalGrid}>
        <EmissionModeCard
          key={`emission-${emissionMode?.emissionMode ?? "pending"}`}
          emissionMode={emissionMode}
          canWrite={canWrite("facturacion")}
          onSave={handleSaveEmissionMode}
        />
        <ContingencyCard
          key={`contingency-${emissionMode?.contingencyStatus ?? "pending"}`}
          emissionMode={emissionMode}
          canWrite={canWrite("facturacion")}
          onSave={handleSaveContingency}
        />
      </div>

      <ReadinessChecklist
        variant="full"
        readiness={readiness}
        loading={readinessLoading}
        error={readinessError}
      />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              {t("facturacion.settings.credentials")}
            </h3>
            <p className={styles.sectionSubtitle}>
              {t("facturacion.settings.credentialsSubtitle")}
            </p>
          </div>
          {canWrite("facturacion") && (
            <Button
              onClick={() => {
                setCredentialValues({ name: "", expiresAt: "" });
                setCredentialError(null);
                setShowCredentialForm(true);
              }}
            >
              + {t("facturacion.settings.newCredential")}
            </Button>
          )}
        </div>

        <div className={styles.searchBar}>
          <SearchInput
            value={credentialsSearch}
            onChange={(value) => {
              setCredentialsSearch(value);
              credentialsPagination.goToPage(1);
            }}
            placeholder={t("common.search")}
            width="240px"
          />
        </div>

        {filteredCredentials.length === 0 ? (
          <p className={styles.empty}>
            {t("facturacion.settings.credentialsEmpty")}
          </p>
        ) : (
          <Table columns={credentialColumns} data={filteredCredentials} />
        )}

        <Pagination
          pagination={credentialsPagination.getInfo(credentialsTotal)}
          onPageChange={credentialsPagination.goToPage}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              {t("facturacion.settings.normalSequences")}
            </h3>
            <p className={styles.sectionSubtitle}>
              {t("facturacion.settings.normalSequencesSubtitle")}
            </p>
          </div>
          {canWrite("facturacion") && (
            <Button
              onClick={() => {
                sequenceForm.reset();
                setShowSequenceForm(true);
              }}
            >
              + {t("facturacion.settings.newNormalSequence")}
            </Button>
          )}
        </div>

        <div className={styles.searchBar}>
          <SearchInput
            value={sequencesSearch}
            onChange={(value) => {
              setSequencesSearch(value);
              sequencesPagination.goToPage(1);
            }}
            placeholder={t("common.search")}
            width="240px"
          />
        </div>

        {filteredSequences.length === 0 ? (
          <p className={styles.empty}>
            {t("facturacion.settings.normalSequencesEmpty")}
          </p>
        ) : (
          <Table
            columns={sequenceColumns}
            data={filteredSequences}
            onEdit={handleEditSequence}
          />
        )}

        <Pagination
          pagination={sequencesPagination.getInfo(sequencesTotal)}
          onPageChange={sequencesPagination.goToPage}
        />
      </section>

      <Modal
        isOpen={showCredentialForm}
        onClose={() => {
          setShowCredentialForm(false);
          setCredentialError(null);
        }}
        title={t("facturacion.settings.newCredential")}
        subtitle={t("common.newRecordSubtitle")}
        footerStatus={
          credentialValues.name
            ? t("common.unsavedChanges")
            : t("common.noPendingChanges")
        }
        dirty={Boolean(credentialValues.name)}
        error={credentialError}
        noValidate
        onSubmit={handleCreateCredential}
        submitLabel={t("common.create")}
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <DynamicFormFields
          fields={CREDENTIAL_FIELDS}
          values={credentialValues}
          errors={{}}
          editingId={null}
          onChange={(name, value) =>
            setCredentialValues((current) => ({ ...current, [name]: value }))
          }
        />
      </Modal>

      <Modal
        isOpen={showSequenceForm}
        onClose={() => {
          setShowSequenceForm(false);
          sequenceForm.reset();
        }}
        size="lg"
        title={
          sequenceForm.editingId
            ? t("common.edit")
            : t("facturacion.settings.newNormalSequence")
        }
        subtitle={t("common.newRecordSubtitle")}
        footerStatus={
          sequenceForm.isDirty
            ? t("common.unsavedChanges")
            : t("common.noPendingChanges")
        }
        dirty={sequenceForm.isDirty}
        error={sequenceForm.submitError}
        noValidate
        onSubmit={sequenceForm.handleSubmit}
        submitLabel={
          sequenceForm.editingId ? t("common.saveChanges") : t("common.create")
        }
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <DynamicFormFields
          fields={NORMAL_SEQUENCE_FIELDS}
          values={sequenceForm.values}
          errors={sequenceForm.errors}
          editingId={sequenceForm.editingId}
          onChange={sequenceForm.setFieldValue}
        />
      </Modal>

      <Modal
        isOpen={issuedCredential !== null}
        onClose={() => setIssuedCredential(null)}
        title={t("facturacion.settings.credentialCreated")}
        subtitle={issuedCredential?.name}
        cancelLabel={t("common.close")}
        closeLabel={t("common.close")}
      >
        {issuedCredential && (
          <div className={styles.secretBox}>
            <p className={styles.warning}>
              {t("facturacion.settings.credentialSecretWarning")}
            </p>
            <dl className={styles.secretList}>
              <dt>{t("facturacion.common.keyId")}</dt>
              <dd>{issuedCredential.keyId}</dd>
              <dt>{t("facturacion.common.secret")}</dt>
              <dd>
                <code className={styles.secret}>{issuedCredential.secret}</code>
              </dd>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={t("facturacion.settings.revoke")}
        message={t("facturacion.settings.revokeConfirm", {
          name: credentialToRevoke?.name ?? "",
        })}
        confirmLabel={t("facturacion.settings.revoke")}
        cancelLabel={t("common.cancel")}
        variant="warning"
        context={
          credentialToRevoke
            ? {
                title: credentialToRevoke.name,
                subtitle: credentialToRevoke.keyId,
              }
            : undefined
        }
      />
    </div>
  );
};

interface EmissionModeCardProps {
  emissionMode: CompanyEmissionModeDto | null;
  canWrite: boolean;
  onSave: (mode: CompanyEmissionMode) => Promise<void>;
}

function EmissionModeCard({
  emissionMode,
  canWrite,
  onSave,
}: EmissionModeCardProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>(
    emissionMode?.emissionMode ?? "",
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const mode = parseCompanyEmissionMode(selected);
    if (!mode) return;
    setSaving(true);
    try {
      await onSave(mode);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.card}>
      <h3 className={styles.cardTitle}>
        {t("facturacion.settings.emissionMode")}
      </h3>
      <p className={styles.currentValue}>
        {emissionMode?.emissionMode ?? EMPTY_CELL}
      </p>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="emission-mode">
          {t("facturacion.common.emissionMode")}
        </label>
        <select
          id="emission-mode"
          className={styles.select}
          value={selected}
          disabled={!canWrite}
          onChange={(event) => setSelected(event.target.value)}
        >
          <option value="">{EMPTY_CELL}</option>
          {ECF_COMPANY_EMISSION_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>
      {canWrite && (
        <Button
          disabled={saving || selected === ""}
          onClick={() => void handleSave()}
        >
          {t("facturacion.settings.updateEmissionMode")}
        </Button>
      )}
    </section>
  );
}

interface ContingencyCardProps {
  emissionMode: CompanyEmissionModeDto | null;
  canWrite: boolean;
  onSave: (payload: UpdateCompanyContingencyRequest) => Promise<void>;
}

function ContingencyCard({
  emissionMode,
  canWrite,
  onSave,
}: ContingencyCardProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>(
    emissionMode?.contingencyStatus ?? "",
  );
  const [startsAt, setStartsAt] = useState<string>(
    toDateTimeLocal(emissionMode?.contingencyStartsAt ?? null),
  );
  const [endsAt, setEndsAt] = useState<string>(
    toDateTimeLocal(emissionMode?.contingencyEndsAt ?? null),
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const contingencyStatus = parseCompanyContingencyStatus(status);
    if (!contingencyStatus) return;
    setSaving(true);
    try {
      await onSave({
        status: contingencyStatus,
        startsAt: toIsoInstant(startsAt),
        endsAt: toIsoInstant(endsAt),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.card}>
      <h3 className={styles.cardTitle}>
        {t("facturacion.settings.contingency")}
      </h3>
      <p className={styles.currentValue}>
        {emissionMode?.contingencyStatus ?? EMPTY_CELL}
      </p>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="contingency-status">
          {t("facturacion.common.contingencyStatus")}
        </label>
        <select
          id="contingency-status"
          className={styles.select}
          value={status}
          disabled={!canWrite}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">{EMPTY_CELL}</option>
          {ECF_COMPANY_CONTINGENCY_STATUSES.map((contingencyStatus) => (
            <option key={contingencyStatus} value={contingencyStatus}>
              {contingencyStatus}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="contingency-starts-at">
          {t("facturacion.common.contingencyStartsAt")}
        </label>
        <input
          id="contingency-starts-at"
          type="datetime-local"
          className={styles.input}
          value={startsAt}
          disabled={!canWrite}
          onChange={(event) => setStartsAt(event.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="contingency-ends-at">
          {t("facturacion.common.contingencyEndsAt")}
        </label>
        <input
          id="contingency-ends-at"
          type="datetime-local"
          className={styles.input}
          value={endsAt}
          disabled={!canWrite}
          onChange={(event) => setEndsAt(event.target.value)}
        />
      </div>
      {canWrite && (
        <Button
          disabled={saving || status === ""}
          onClick={() => void handleSave()}
        >
          {t("facturacion.settings.updateContingency")}
        </Button>
      )}
    </section>
  );
}
