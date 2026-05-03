import { useState, useMemo } from "react";
import { useProveedorStore } from "../../stores/proveedorStore";
import { Table, Button, PageHeader, ImageCell, Pagination, SearchInput, Modal } from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { Proveedor } from "../../data/mockData";
import styles from "./Proveedores.module.css";

export function Proveedores() {
  const { proveedores, addProveedor, updateProveedor, deleteProveedor } = useProveedorStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    categoria: "",
    totalOrdenes: 0,
  });

  const filteredProveedores = useMemo(() => {
    return proveedores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [proveedores, searchTerm]);

  const paginatedProveedores = useMemo(() => {
    return paginate(filteredProveedores, page, ITEMS_PER_PAGE);
  }, [filteredProveedores, page]);

  const paginationInfo = getInfo(filteredProveedores.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProveedor(editingId, formData);
      setEditingId(null);
    } else {
      const newProveedor = {
        ...formData,
        id: `PRV${String(proveedores.length + 1).padStart(3, "0")}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      addProveedor(newProveedor);
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
      categoria: "",
      totalOrdenes: 0,
    });
  };

  const handleEdit = (proveedor: Proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      email: proveedor.email,
      telefono: proveedor.telefono,
      direccion: proveedor.direccion,
      categoria: proveedor.categoria,
      totalOrdenes: proveedor.totalOrdenes,
    });
    setEditingId(proveedor.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar proveedor?")) {
      deleteProveedor(id);
    }
  };

  const columns = [
    {
      key: "avatar",
      header: "",
      render: (p: Proveedor) => <ImageCell src={p.avatar} name={p.nombre} />,
    },
    { key: "nombre", header: "Nombre" },
    { key: "email", header: "Email" },
    { key: "telefono", header: "Teléfono" },
    { key: "categoria", header: "Categoría" },
    {
      key: "totalOrdenes",
      header: "Órdenes",
      render: (p: Proveedor) => p.totalOrdenes.toString(),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="Proveedores" subtitle="Gestiona tus proveedores">
        <Button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Nuevo Proveedor
        </Button>
      </PageHeader>

      <div className={styles.searchBar}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => { setSearchTerm(value); goToPage(1); }}
          placeholder="Buscar proveedores..."
          width="300px"
        />
      </div>

      <Table
        columns={columns}
        data={paginatedProveedores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Editar Proveedor" : "Nuevo Proveedor"}
        onSubmit={handleSubmit}
        submitLabel={editingId ? "Guardar" : "Crear"}
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
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Categoría</label>
          <input
            type="text"
            value={formData.categoria}
            onChange={(e) =>
              setFormData({ ...formData, categoria: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Total Órdenes</label>
          <input
            type="number"
            value={formData.totalOrdenes}
            onChange={(e) =>
              setFormData({
                ...formData,
                totalOrdenes: Number(e.target.value),
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
}