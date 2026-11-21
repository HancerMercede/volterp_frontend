import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useVentaStore } from "../../stores/ventaStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { PageHeader, Button, ConfirmModal } from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useClientes } from "../../hooks/useColecciones";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { SaleDto } from "../../domain/types";
import { VentasList } from "./components/VentasList";
import { VentaDetail } from "./components/VentaDetail";
import { money } from "../../utils/currency";

export function Ventas() {
  const { t } = useTranslation();
  const { ventas, totalCount, fetchVentas, deleteVenta } = useVentaStore();
  const { currentCompany, fetchCurrentCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

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

  useClientes();

  const handleVentaClick = (venta: SaleDto) => {
    if (venta.status === "Completed") {
      addToast(t("ventas.completedViewOnly"), "info");
      setViewingSaleId(venta.id);
      return;
    }
    // La venta pendiente se edita en la misma pagina de la venta nueva.
    navigate(`/nueva-venta?venta=${venta.id}`);
  };

  const { showDeleteConfirm, deleteId, handleDelete, confirmDelete, cancelDelete } =
    useDeleteConfirm({
      onDelete: deleteVenta,
      successMessage: t("ventas.saleDeleted"),
    });

  const pendingSale = ventas.find((v) => v.id === deleteId) ?? null;

  // Get sale being viewed for VentaDetail
  const viewingVenta = viewingSaleId
    ? ventas.find((v) => v.id === viewingSaleId)
    : null;

  return (
    <div>
      <PageHeader title={t("ventas.title")} subtitle={t("ventas.subtitle")}>
        <Button onClick={() => navigate("/nueva-venta")}>
          + {t("ventas.newSale")}
        </Button>
      </PageHeader>

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
        title={`${t("common.delete")} ${t("ventas.sale")}`}
        message={t("ventas.deleteConfirm")}
        confirmLabel={t("common.confirmDeleteAction")}
        cancelLabel={t("common.cancel")}
        context={
          pendingSale
            ? {
                title: `${t("ventas.sale")} #${pendingSale.code}`,
                subtitle: [
                  pendingSale.clienteName,
                  `${pendingSale.items.length} ${t("ventas.productCount")}`,
                ]
                  .filter(Boolean)
                  .join(" · "),
                amount: money(pendingSale.total),
              }
            : undefined
        }
      />
    </div>
  );
}
