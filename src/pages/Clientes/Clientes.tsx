import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useClienteStore } from "../../stores/clienteStore";
import {
  Table,
  Button,
  PageHeader,
  ImageCell,
  ActionButtons,
  Pagination,
  SearchInput,
  Modal,
  ConfirmModal,
  DynamicFormFields,
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { Client, ClientRequest } from "../../domain/types";
import styles from "./Clientes.module.css";
import { useFilter } from "../../hooks/useFilter";
import { useCrudForm, type FormField } from "../../hooks/useCrudForm";

export function Clientes() {
  const { t } = useTranslation();
  const {
    clientes,
    totalCount,
    fetchClientes,
    addCliente,
    updateCliente,
    deleteCliente,
  } = useClienteStore();

  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const fetchData = useCallback(() => {
    fetchClientes(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchClientes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const CLIENTE_FIELDS: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: t("clientes.clientName"),
        type: "text",
        required: true,
      },
      {
        name: "email",
        label: t("clientes.clientEmail"),
        type: "email",
        required: true,
      },
      {
        name: "phone",
        label: t("clientes.clientPhone"),
        type: "tel",
        required: true,
        placeholder: "809-XXX-XXXX",
      },
      { name: "address", label: t("common.address"), type: "text" },
      {
        name: "imageUrl",
        label: t("common.image"),
        type: "file",
        accept: "image/*",
      },
      {
        name: "isActive",
        label: t("common.status"),
        type: "checkbox",
        showOnEdit: true,
        placeholder: t("common.active"),
      },
    ],
    [t],
  );

  const form = useCrudForm({
    fields: CLIENTE_FIELDS,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      imageUrl: "",
      isActive: true,
    },
    onCreate: (data) => addCliente(data as ClientRequest),
    onUpdate: (id, data) => updateCliente(id, data as ClientRequest),
    onSuccess: () => {
      setShowForm(false);
      fetchClientes(pageNumber, ITEMS_PER_PAGE);
    },
  });

  const filteredClientes = useFilter({
    data: clientes,
    searchTerm,
    searchFields: (c) => [c.name, c.email, c.phone, c.code],
  });

  const paginationInfo = getInfo(totalCount);

  const handleEdit = (cliente: Client) => {
    form.handleEdit(cliente, cliente.id);
    setShowForm(true);
  };

  const { showDeleteConfirm, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: deleteCliente,
      successMessage: t("clientes.clientDeleted"),
    });

  const columns = [
    { key: "code", header: t("common.code") },
    {
      key: "name",
      header: t("clientes.client"),
      render: (c: Client) => (
        <ImageCell
          src={
            c.imageUrl || c.avatar || `https://i.pravatar.cc/150?img=${c.id}`
          }
          name={c.name}
          subtext={c.empresa}
          type="avatar"
        />
      ),
    },
    { key: "email", header: t("common.email") },
    { key: "phone", header: t("common.phone") },
    {
      key: "isActive",
      header: t("common.status"),
      render: (c: Client) => (
        <span style={{ color: c.isActive ? "green" : "red" }}>
          {c.isActive ? t("common.active") : t("common.inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (c: Client) => (
        <ActionButtons
          onEdit={() => handleEdit(c)}
          onDelete={() => handleDelete(c.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("clientes.title")} subtitle={t("clientes.subtitle")}>
        <Button
          onClick={() => {
            form.reset();
            setShowForm(true);
          }}
        >
          + {t("clientes.newClient")}
        </Button>
      </PageHeader>
      <div className={styles.searchBar}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            goToPage(1);
          }}
          placeholder={t("clientes.searchClient")}
          width="240px"
        />
      </div>
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        title={
          form.editingId ? t("clientes.editClient") : t("clientes.newClient")
        }
        onSubmit={form.handleSubmit}
        submitLabel={form.editingId ? t("common.update") : t("common.create")}
      >
        <DynamicFormFields
          fields={CLIENTE_FIELDS}
          values={form.values}
          errors={form.errors}
          editingId={form.editingId}
          onChange={form.setFieldValue}
        />
      </Modal>

      <Table data={filteredClientes} columns={columns} />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={t("common.confirmDeleteTitle")}
        message={t("clientes.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
