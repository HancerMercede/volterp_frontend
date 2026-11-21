import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientes } from "../../hooks/useColecciones";
import { NuevaVenta } from "../Ventas/components/NuevaVenta";

/**
 * El POS como pagina completa: el vendedor entra directo a cobrar, sin
 * pasar por la lista de ventas.
 *
 * El cuerpo es el mismo que monta el overlay de "/ventas" (NuevaVenta): lo
 * unico que cambia es el marco (aqui no hay overlay) y lo que se hace
 * cuando se guarda la venta (aqui el POS queda limpio para la siguiente).
 */
export function Pos() {
  const navigate = useNavigate();
  const [intento, setIntento] = useState(0);

  // El POS cobra: necesita la lista de clientes, como en la pantalla de
  // ventas.
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
        // Cada venta cobrada deja el POS limpio para la siguiente.
        key={`pos-${intento}`}
        variant="page"
        editingSaleId={null}
        onSave={() => setIntento((conteo) => conteo + 1)}
        onCancel={() => navigate("/ventas")}
      />
    </div>
  );
}
