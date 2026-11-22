import type { SaleDto } from "../domain/types";

/**
 * Que se puede editar de una venta. Una venta completada ya facturo y una
 * cancelada ya devolvio el stock al inventario: las dos se miran, no se
 * tocan. La pendiente es la unica que se sigue editando.
 */
export function esVentaEditable(venta: Pick<SaleDto, "status">): boolean {
  return venta.status === "Pending";
}
