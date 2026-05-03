import { useState, useMemo } from "react";
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
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { Cliente } from "../../data/mockData";
import styles from "./Clientes.module.css";

export function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useClienteStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { page, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    totalCompras: 0,
    empresa: "",
  });

  const filteredClientes = useMemo(() => {
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefono.includes(searchTerm),
    );
  }, [clientes, searchTerm]);

  const paginatedClientes = useMemo(() => {
    return paginate(filteredClientes, page, ITEMS_PER_PAGE);
  }, [filteredClientes, page]);

  const paginationInfo = getInfo(filteredClientes.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCliente(editingId, formData);
      setEditingId(null);
    } else {
      const newCliente: Cliente = {
        ...formData,
        id: `CL${String(clientes.length + 1).padStart(3, "0")}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      addCliente(newCliente);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      totalCompras: 0,
      empresa: "",
    });
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      totalCompras: cliente.totalCompras,
      empresa: cliente.empresa || "",
    });
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este cliente?")) {
      deleteCliente(id);
    }
  };

  const columns = [
    { key: "id", header: "ID" },
    {
      key: "nombre",
      header: "Cliente",
      render: (c: Cliente) => (
        <ImageCell
          src={c.avatar}
          name={c.nombre}
          subtext={c.empresa}
          type="avatar"
        />
      ),
    },
    { key: "email", header: "Email" },
    { key: "telefono", header: "Teléfono" },
    {
      key: "totalCompras",
      header: "Total Compras",
      render: (c: Cliente) =>
        `$${c.totalCompras.toLocaleString()}`,
    },
    {
      key: "actions",
      header: "Acciones",
      render: (c: Cliente) => (
        <ActionButtons
          onEdit={() => handleEdit(c)}
          onDelete={() => handleDelete(c.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Gestión de clientes y contactos">
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              goToPage(1);
            }}
            placeholder="Buscar cliente..."
            width="240px"
          />
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Nuevo Cliente
          </Button>
        </div>
      </PageHeader>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        title={editingId ? "Editar Cliente" : "Nuevo Cliente"}
        onSubmit={handleSubmit}
        submitLabel={editingId ? "Actualizar" : "Crear"}
      >
        <div className={styles.formGroup}>
          <label>Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Teléfono</label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            placeholder="809-XXX-XXXX"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Dirección</label>
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
          />
        </div>
        {!editingId && (
          <div className={styles.formGroup}>
            <label>Total Compras</label>
            <input
              type="number"
              min="0"
              value={formData.totalCompras}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalCompras: parseInt(e.target.value),
                })
              }
            />
          </div>
        )}
      </Modal>

      <Table data={paginatedClientes} columns={columns} />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />
    </div>
  );
}