import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useVentaStore } from "../../stores/ventaStore";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { PageHeader, Button, ConfirmModal } from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { SaleDto } from "../../domain/types";
import { VentasList } from "./components/VentasList";
import { NuevaVenta } from "./components/NuevaVenta";
import styles from "./Ventas.module.css";

export function Ventas() {
  const { t } = useTranslation();
  const { ventas, fetchVentas, deleteVenta, loading } = useVentaStore();
  const { clientes } = useClienteStore();
  const { currentCompany, fetchCurrentCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { pageNumber, goToPage } = usePagination({ initialPageSize: ITEMS_PER_PAGE });

  useEffect(() => {
    if (!currentCompany && user?.companyId) fetchCurrentCompany(user.companyId);
  }, [currentCompany, user, fetchCurrentCompany]);

  useEffect(() => {
    fetchVentas(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchVentas]);

  const handleVentaClick = (venta: SaleDto) => { setEditingSaleId(venta.id); setShowForm(true); };
  const handleDelete = (id: number) => { setDeleteId(id); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (deleteId) {
      try { await deleteVenta(deleteId); addToast(t("ventas.saleDeleted"), "success"); }
      catch (err) { addToast((err as Error).message, "error"); }
    }
    setDeleteId(null);
  };

  const handleNewVenta = () => { setEditingSaleId(null); setShowForm(true); };
  const handleFormSave = () => { setShowForm(false); setEditingSaleId(null); fetchVentas(pageNumber, ITEMS_PER_PAGE); };
  const handleFormCancel = () => { setShowForm(false); setEditingSaleId(null); };

  return (
    <div>
      <PageHeader title={t("ventas.title")} subtitle={t("ventas.subtitle")}>
        <div className={styles.headerActions}><Button onClick={handleNewVenta}>+ {t("ventas.newSale")}</Button></div>
      </PageHeader>
      {loading && <p>Cargando...</p>}
      {showForm && <NuevaVenta key={editingSaleId ?? "new"} editingSaleId={editingSaleId} onSave={handleFormSave} onCancel={handleFormCancel} />}
      <VentasList ventas={ventas} clientes={clientes} onVentaClick={handleVentaClick} onDelete={handleDelete}
        searchTerm={searchTerm} onSearchChange={setSearchTerm} pageNumber={pageNumber} onPageChange={goToPage} />
      <ConfirmModal isOpen={showDeleteConfirm} onConfirm={confirmDelete} onCancel={() => { setShowDeleteConfirm(false); setDeleteId(null); }}
        title={t("common.confirmDeleteTitle")} message={t("ventas.deleteConfirm")} confirmLabel={t("common.delete")} cancelLabel={t("common.cancel")} />
    </div>
  );
}