import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useVentaStore } from "../../stores/ventaStore";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { PageHeader, Button, ConfirmModal } from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { SaleDto } from "../../domain/types";
import { VentasList } from "./components/VentasList";
import { NuevaVenta } from "./components/NuevaVenta";
import { VentaDetail } from "./components/VentaDetail";

export function Ventas() {
  const { t } = useTranslation();
  const { ventas, totalCount, fetchVentas, deleteVenta } = useVentaStore();
  const { fetchClientes } = useClienteStore();
  const { currentCompany, fetchCurrentCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [viewingSaleId, setViewingSaleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { pageNumber, goToPage } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    if (!currentCompany && user?.companyId) fetchCurrentCompany(user.companyId);
  }, [currentCompany, user, fetchCurrentCompany]);

  useEffect(() => {
    fetchVentas(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchVentas]);

  useEffect(() => {
    fetchClientes(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchClientes]);

  const handleVentaClick = (venta: SaleDto) => {
    if (venta.status === "Completed") {
      addToast(t("ventas.completedViewOnly"), "info");
      setViewingSaleId(venta.id);
    } else {
      setEditingSaleId(venta.id);
      setShowForm(true);
    }
  };

  const { showDeleteConfirm, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: deleteVenta,
      successMessage: t("ventas.saleDeleted"),
    });

  const handleNewVenta = () => {
    setEditingSaleId(null);
    setShowForm(true);
  };
  const handleFormSave = () => {
    setShowForm(false);
    setEditingSaleId(null);
    fetchVentas(pageNumber, ITEMS_PER_PAGE);
  };
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSaleId(null);
  };

  // Get sale being viewed for VentaDetail
  const viewingVenta = viewingSaleId
    ? ventas.find((v) => v.id === viewingSaleId)
    : null;

  return (
    <div>
      <PageHeader title={t("ventas.title")} subtitle={t("ventas.subtitle")}>
        <Button onClick={handleNewVenta}>+ {t("ventas.newSale")}</Button>
      </PageHeader>

      {showForm && (
        <NuevaVenta
          key={editingSaleId ?? "new"}
          editingSaleId={editingSaleId}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
      {viewingVenta && (
        <VentaDetail
          venta={viewingVenta}
          clienteId={viewingVenta.clienteId ?? null}
          onClose={() => setViewingSaleId(null)}
        />
      )}
      <VentasList
        ventas={ventas}
        totalCount={totalCount}
        onVentaClick={handleVentaClick}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pageNumber={pageNumber}
        onPageChange={goToPage}
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={t("common.confirmDeleteTitle")}
        message={t("ventas.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
