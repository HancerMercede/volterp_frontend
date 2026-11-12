import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ConfirmModal,
  DynamicFormFields,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Table,
  VolterpMark,
} from "../../../components/UI";
import { useCrudForm, type FormField } from "../../../hooks/useCrudForm";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { useFilter } from "../../../hooks/useFilter";
import { usePagination } from "../../../hooks/usePagination";
import { usePermission } from "../../../hooks/usePermission";
import { Rol } from "../../../domain/constants/roles";
import { useAccountStore } from "../../../stores/accountStore";
import { ITEMS_PER_PAGE } from "../../../config/pagination";
import { paginate } from "../../../utils/pagination";
import type { AccountDto, AccountRequest, AccountType } from "../../../domain/types";
import styles from "./Accounts.module.css";

const ACCOUNT_TYPES: AccountType[] = [
  "Asset",
  "Liability",
  "Equity",
  "Income",
  "Expense",
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  Asset: "contabilidad.accounts.typeAsset",
  Liability: "contabilidad.accounts.typeLiability",
  Equity: "contabilidad.accounts.typeEquity",
  Income: "contabilidad.accounts.typeIncome",
  Expense: "contabilidad.accounts.typeExpense",
};

// The chart is a tree: it is fetched whole and paginated in memory.
const CATALOG_PAGE_SIZE = 200;

type AccountFormValues = {
  code: string;
  name: string;
  accountType: AccountType;
  parentId: string;
  isPostable: boolean;
  isActive: boolean;
  notes: string;
};

const DEFAULT_VALUES: AccountFormValues = {
  code: "",
  name: "",
  accountType: "Asset",
  parentId: "",
  isPostable: true,
  isActive: true,
  notes: "",
};

function toAccountRequest(data: AccountFormValues): AccountRequest {
  return {
    code: data.code,
    name: data.name,
    accountType: data.accountType,
    parentId: data.parentId || null,
    isPostable: data.isPostable,
    isActive: data.isActive,
    notes: data.notes || null,
  };
}

interface AccountRow {
  id: string;
  account: AccountDto;
  depth: number;
}

function buildAccountRows(accounts: AccountDto[]): AccountRow[] {
  const sorted = [...accounts].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true }),
  );
  const known = new Set(sorted.map((account) => account.id));
  const children = new Map<string, AccountDto[]>();
  const roots: AccountDto[] = [];

  for (const account of sorted) {
    const parentId =
      account.parentId &&
      account.parentId !== account.id &&
      known.has(account.parentId)
        ? account.parentId
        : null;

    if (!parentId) {
      roots.push(account);
      continue;
    }

    const siblings = children.get(parentId) ?? [];
    siblings.push(account);
    children.set(parentId, siblings);
  }

  const rows: AccountRow[] = [];
  const visited = new Set<string>();

  const walk = (account: AccountDto, depth: number) => {
    if (visited.has(account.id)) return;
    visited.add(account.id);
    rows.push({ id: account.id, account, depth });
    for (const child of children.get(account.id) ?? []) walk(child, depth + 1);
  };

  for (const root of roots) walk(root, 0);
  // A parent cycle leaves its accounts unreachable from the roots.
  for (const account of sorted) {
    if (!visited.has(account.id)) walk(account, 0);
  }

  return rows;
}

export function Accounts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useAccountStore();
  const { userRole } = usePermission();
  // The accounts endpoints only accept Admin and SuperAdmin; the "contabilidad" role writes the module but not the accounts.
  const canManageAccounts =
    userRole === Rol.ADMIN || userRole === Rol.SUPER_ADMIN;
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "all">("all");
  const { pageNumber, pageSize, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    fetchAccounts(1, CATALOG_PAGE_SIZE);
  }, [fetchAccounts]);

  const fields: FormField[] = useMemo(
    () => [
      {
        name: "code",
        label: t("contabilidad.accounts.code"),
        type: "text",
        required: true,
        span: 3,
        validate: (value, values) => {
          const parent = accounts.find(
            (account) => account.id === String(values.parentId ?? ""),
          );
          if (!parent) return undefined;
          return String(value ?? "").startsWith(parent.code)
            ? undefined
            : t("contabilidad.accounts.errorChildCodePrefix");
        },
      },
      {
        name: "name",
        label: t("contabilidad.accounts.name"),
        type: "text",
        required: true,
        span: 3,
      },
      {
        name: "accountType",
        label: t("contabilidad.accounts.type"),
        type: "select",
        required: true,
        span: 3,
        options: ACCOUNT_TYPES.map((type) => ({
          value: type,
          label: t(ACCOUNT_TYPE_LABELS[type]),
        })),
      },
      {
        name: "parentId",
        label: t("contabilidad.accounts.parent"),
        type: "combobox",
        span: 6,
        placeholder: t("contabilidad.accounts.parentRoot"),
        emptyLabel: t("contabilidad.accounts.parentRoot"),
        options: [
          { value: "", label: t("contabilidad.accounts.parentRoot") },
          ...accounts.map((account) => ({
            value: account.id,
            label: account.name,
            description: account.code,
          })),
        ],
      },
      {
        name: "isPostable",
        label: t("contabilidad.accounts.postable"),
        type: "checkbox",
        span: 3,
      },
      {
        name: "isActive",
        label: t("contabilidad.accounts.active"),
        type: "checkbox",
        span: 3,
      },
      {
        name: "notes",
        label: t("common.notes"),
        type: "textarea",
        span: 6,
      },
    ],
    [t, accounts],
  );

  const mapEntityToForm = useCallback(
    (entity: Record<string, unknown>): AccountFormValues => {
      const account = entity as unknown as AccountDto;
      return {
        code: account.code ?? "",
        name: account.name ?? "",
        accountType: account.accountType,
        parentId: account.parentId ?? "",
        isPostable: account.isPostable ?? true,
        isActive: account.isActive ?? true,
        notes: account.notes ?? "",
      };
    },
    [],
  );

  const form = useCrudForm<AccountFormValues>({
    fields,
    defaultValues: DEFAULT_VALUES,
    mapEntityToForm,
    onCreate: async (data) => {
      if (!canManageAccounts)
        throw new Error(t("contabilidad.accounts.noPermission"));
      return addAccount(toAccountRequest(data));
    },
    onUpdate: async (id, data) => {
      if (!canManageAccounts)
        throw new Error(t("contabilidad.accounts.noPermission"));
      if (data.parentId === id) {
        throw new Error(t("contabilidad.accounts.errorSelfParent"));
      }
      return updateAccount(id, toAccountRequest(data));
    },
    onSuccess: () => {
      setShowForm(false);
    },
  });

  // An account cannot be its own parent, so the edited one leaves the parent options.
  const visibleFields = useMemo(
    () =>
      form.editingId === null
        ? fields
        : fields.map((field) =>
            field.name === "parentId"
              ? {
                  ...field,
                  options: field.options?.filter(
                    (option) => option.value !== form.editingId,
                  ),
                }
              : field,
          ),
    [fields, form.editingId],
  );

  const searchFields = useCallback(
    (account: AccountDto) => [account.code, account.name],
    [],
  );

  const matchesType = useCallback(
    (account: AccountDto) =>
      typeFilter === "all" || account.accountType === typeFilter,
    [typeFilter],
  );

  const filteredAccounts = useFilter({
    data: accounts,
    searchTerm,
    searchFields,
    filter: matchesType,
  });

  const rows = useMemo(() => buildAccountRows(filteredAccounts), [filteredAccounts]);
  const pageRows = useMemo(
    () => paginate(rows, pageNumber, pageSize),
    [rows, pageNumber, pageSize],
  );

  const childCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const account of accounts) {
      if (!account.parentId) continue;
      counts.set(account.parentId, (counts.get(account.parentId) ?? 0) + 1);
    }
    return counts;
  }, [accounts]);

  const parentCode = useCallback(
    (account: AccountDto) => {
      if (!account.parentId) return t("contabilidad.accounts.parentRoot");
      const parent = accounts.find((item) => item.id === account.parentId);
      return parent ? parent.code : t("contabilidad.accounts.parentRoot");
    },
    [accounts, t],
  );

  const columns = [
    {
      key: "code",
      header: t("contabilidad.accounts.code"),
      render: (row: AccountRow) => row.account.code,
    },
    {
      key: "name",
      header: t("contabilidad.accounts.name"),
      render: (row: AccountRow) => (
        <span
          className={styles.nodeName}
          style={{ paddingLeft: row.depth * 20 }}
          data-depth={row.depth}
          data-active={String(row.account.isActive)}
        >
          {row.account.name}
        </span>
      ),
    },
    {
      key: "accountType",
      header: t("contabilidad.accounts.type"),
      render: (row: AccountRow) => t(ACCOUNT_TYPE_LABELS[row.account.accountType]),
    },
    {
      key: "parent",
      header: t("contabilidad.accounts.parent"),
      render: (row: AccountRow) => parentCode(row.account),
    },
    {
      key: "children",
      header: t("contabilidad.accounts.children"),
      render: (row: AccountRow) => childCounts.get(row.account.id) ?? 0,
    },
    {
      key: "isPostable",
      header: t("contabilidad.accounts.postable"),
      render: (row: AccountRow) =>
        row.account.isPostable ? t("common.yes") : t("common.no"),
    },
    {
      key: "isActive",
      header: t("contabilidad.accounts.active"),
      render: (row: AccountRow) => (
        <span
          className={`${styles.badge} ${
            row.account.isActive ? styles.badgeActive : styles.badgeInactive
          }`}
        >
          {row.account.isActive
            ? t("contabilidad.accounts.activeYes")
            : t("contabilidad.accounts.activeNo")}
        </span>
      ),
    },
  ];

  const paginationInfo = getInfo(rows.length);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      goToPage(1);
    },
    [goToPage],
  );

  const handleTypeFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTypeFilter(event.target.value as AccountType | "all");
      goToPage(1);
    },
    [goToPage],
  );

  const { handleEdit: handleEditForm } = form;

  const handleEdit = useCallback(
    (row: AccountRow) => {
      handleEditForm(row.account, row.account.id);
      setShowForm(true);
    },
    [handleEditForm],
  );

  const {
    showDeleteConfirm,
    deleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
  } = useDeleteConfirm({
    onDelete: async (id: string) => {
      if (!canManageAccounts)
        throw new Error(t("contabilidad.accounts.noPermission"));
      if ((childCounts.get(id) ?? 0) > 0) {
        throw new Error(t("contabilidad.accounts.errorHasChildren"));
      }
      await deleteAccount(id);
    },
    successMessage: t("contabilidad.accounts.deleted"),
  });

  const pendingAccount = accounts.find((account) => account.id === deleteId) ?? null;

  const handleBackToAccounting = useCallback(() => {
    navigate("/contabilidad");
  }, [navigate]);

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("contabilidad.accounts.title")}
        subtitle={t("contabilidad.accounts.subtitle")}
      >
        <Button variant="secondary" onClick={handleBackToAccounting}>
          {t("contabilidad.backToAccounting")}
        </Button>
        {canManageAccounts && (
          <Button
            onClick={() => {
              form.reset();
              setShowForm(true);
            }}
          >
            + {t("contabilidad.accounts.new")}
          </Button>
        )}
      </PageHeader>

      <div className={styles.filters}>
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t("contabilidad.accounts.search")}
          width="240px"
        />
        <select
          className={styles.filter}
          value={typeFilter}
          onChange={handleTypeFilterChange}
        >
          <option value="all">{t("contabilidad.accounts.filterType")}</option>
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(ACCOUNT_TYPE_LABELS[type])}
            </option>
          ))}
        </select>
      </div>

      {/* The modal shows the save errors inline: repeating them here would duplicate the message. */}
      {error && !showForm && <p className={styles.error}>{error}</p>}

      {rows.length === 0 ? (
        <p className={styles.empty}>
          {loading ? t("common.loading") : t("contabilidad.accounts.empty")}
        </p>
      ) : (
        <Table
          data={pageRows}
          columns={columns}
          onEdit={canManageAccounts ? handleEdit : undefined}
          onDelete={canManageAccounts ? handleDelete : undefined}
        />
      )}

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        size="lg"
        icon={<VolterpMark size={40} />}
        title={
          form.editingId
            ? t("contabilidad.accounts.edit")
            : t("contabilidad.accounts.new")
        }
        subtitle={
          form.editingId
            ? form.values.name || t("common.newRecordSubtitle")
            : t("common.newRecordSubtitle")
        }
        footerStatus={
          form.isDirty
            ? t("common.unsavedChanges")
            : t("common.noPendingChanges")
        }
        dirty={form.isDirty}
        error={form.submitError}
        noValidate
        onSubmit={form.handleSubmit}
        submitLabel={
          form.editingId ? t("common.saveChanges") : t("common.create")
        }
        submitVariant="dark"
        cancelLabel={t("common.cancel")}
        closeLabel={t("common.close")}
      >
        <DynamicFormFields
          fields={visibleFields}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={t("common.confirmDeleteTitle")}
        message={t("contabilidad.accounts.deleteConfirm")}
        confirmLabel={t("common.confirmDeleteAction")}
        cancelLabel={t("common.cancel")}
        context={
          pendingAccount
            ? {
                title: `${pendingAccount.code} · ${pendingAccount.name}`,
                subtitle: t(ACCOUNT_TYPE_LABELS[pendingAccount.accountType]),
              }
            : undefined
        }
      />
    </div>
  );
}
