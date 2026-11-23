import type { SaleDto } from "../../domain/types";

/** Los estados de un comprobante que todavia no salio hacia la DGII. */
const SIN_ENVIAR: string[] = ["Draft", "Signed"];

/**
 * Si el comprobante fiscal de la venta ya salio hacia la DGII. Uno en
 * borrador o firmado todavia no salio: la venta se puede borrar. Uno enviado
 * no: el back la rechaza y el cajero necesita el motivo.
 */
export function elComprobanteYaEnviado(
  venta: Pick<SaleDto, "fiscalStatus" | "fiscalState"> | null | undefined,
): boolean {
  if (!venta) return false;
  if (venta.fiscalStatus) return !SIN_ENVIAR.includes(venta.fiscalStatus);
  if (venta.fiscalState) return venta.fiscalState !== "PendingEmission";
  return false;
}
