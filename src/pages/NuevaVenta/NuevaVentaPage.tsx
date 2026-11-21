import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClientes } from "../../hooks/useColecciones";
import { useFiscalReadiness } from "../../application/hooks/useFiscalReadiness";
import { ReadinessChecklist } from "../../components/UI";
import { NuevaVenta } from "../Ventas/components/NuevaVenta";

/**
 * La venta nueva como pagina: el vendedor entra directo a cobrar. El
 * componente es el mismo que antes vivia dentro de un overlay: lo que cambio
 * es que ahora es una ruta. Cuando la ruta trae la venta a editar, el
 * formulario la carga en vez de empezar de cero.
 */
export function NuevaVentaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [intento, setIntento] = useState(0);

  const ventaAEditar = searchParams.get("venta");

  const {
    readiness,
    loading: readinessLoading,
    error: readinessError,
  } = useFiscalReadiness();

  useClientes();

  return (
    <>
      {/*
        El aviso de la caja es un toast que se va solo: el checklist compacto
        no deja banda en el riel del carrito.
      */}
      <ReadinessChecklist
        variant="compact"
        readiness={readiness}
        loading={readinessLoading}
        error={readinessError}
      />
      <NuevaVenta
        key={`nueva-venta-${intento}`}
        editingSaleId={ventaAEditar}
        onSave={() => setIntento((conteo) => conteo + 1)}
        onCancel={() => navigate("/ventas")}
      />
    </>
  );
}
