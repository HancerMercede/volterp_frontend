import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientes } from "../../hooks/useColecciones";
import { NuevaVenta } from "../Ventas/components/NuevaVenta";

/**
 * El POS como pagina completa: el vendedor entra directo a cobrar. El cuerpo
 * es el mismo que monta el overlay de "/ventas" (NuevaVenta): lo unico que
 * cambia es el marco y lo que pasa al guardar (el POS queda limpio).
 */
export function Pos() {
  const navigate = useNavigate();
  const [intento, setIntento] = useState(0);

  useClientes();

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NuevaVenta
        key={`pos-${intento}`}
        variant="page"
        editingSaleId={null}
        onSave={() => setIntento((conteo) => conteo + 1)}
        onCancel={() => navigate("/ventas")}
      />
    </div>
  );
}
