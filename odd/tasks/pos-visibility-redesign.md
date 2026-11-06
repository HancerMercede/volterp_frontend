# POS de Ventas — rediseño de visibilidad según la referencia

Rediseño visual del punto de venta para acercarlo a la referencia compartida por el usuario: catálogo a la izquierda y **un único panel derecho** "Venta actual" en lugar de tres columnas. Cambia únicamente cómo se ve la información: no toca reglas de negocio, cálculos ni persistencia.

**Rama**: `feature/pos-visibility-redesign` (base: `development`) · **Entrega**: commits de unidad de trabajo en la rama de la feature (sin PR por ahora) · **Runner**: `npx vitest run --reporter=dot` + `npx tsc -b --noEmit` + `npx eslint src --ext .ts,.tsx`

## Specs

### S1 — Alcance: visibilidad, no lógica de negocio

> "Ojo esto es un cambio de visibilidad no de logica de negocio"

**Alcance**: cómo el POS muestra la información. **No** cambia el cálculo de `subtotal` / `itbis` (18%) / `total`, ni el comportamiento del carrito (agregar, cambiar cantidad, quitar, vaciar), ni lo que se persiste al crear o actualizar una venta.

**Criterios**: sin cambios en `NuevaVenta.tsx:56-93` (cálculo de totales y `validateAndSubmit`); la suite existente sigue verde.

**Checks**: `tsc`, `eslint`, suite completa.

### S2 — Panel de catálogo

> "Productos" · "Buscar o escanear código..." · "F2" · "Todos"

**Alcance**: el panel izquierdo del POS.

- La carga del catálogo **no se toca**: el POS sigue mostrando lo que hay en el `productoStore` (decisión del usuario, L8). Solo se rediseña cómo se ve.
- El buscador muestra el placeholder **"Buscar o escanear código..."** y un badge **"F2"**. El filtrado por `code` ya existe (`SelectorProducto.tsx:40`), así que un escáner funciona sin tocar la búsqueda: solo hay que enfocar el input y mostrar el atajo.
- Los chips de categoría arrancan en **"Todos"**.
- Cada card muestra el placeholder de iniciales, el nombre, la categoría, el precio y un botón **(+)** redondo con el color de acento.

**Criterios**: con N productos cargados se renderizan N cards; el input tiene el placeholder exacto; el badge "F2" está visible.

**Checks**: test del POS (RED → GREEN) + suite.

### S3 — Panel derecho único "Venta actual"

> "Venta actual" · "Vaciar" · "c/u" · "Subtotal" · "ITBIS (18%)" · "TOTAL" · "Cobrar RD$ 1,085.60" · "Guardar borrador"

**Alcance**: el rail derecho. Hoy el POS es de tres columnas (`NuevaVenta.tsx:96-107`: productos | carrito | resumen de 300px).

- **Un solo panel derecho**: encabezado **"Venta actual"**, badge con la cantidad de artículos y la acción **"Vaciar"**.
- Las líneas muestran nombre, precio unitario **"c/u"**, stepper `− n +` y el total de línea.
- Bloque de totales **"Subtotal"**, **"ITBIS (18%)"**, **"TOTAL"**.
- Acciones: **"Cobrar RD$ 1,085.60"** (el monto va en la etiqueta) y **"Guardar borrador"**.

**Criterios**: el POS renderiza dos columnas; existe un único bloque de totales; el botón de cobrar incluye el total formateado.

**Checks**: test del POS (RED → GREEN) + suite.

### S4 — Formato del dinero

> "RD$ 1,085.60"

**Alcance**: el POS no tiene una moneda propia. Los tres `formatCurrency` duplicados (`SelectorProducto.tsx:18`, `Carrito.tsx:13`, `ResumenVenta.tsx:18`) usan `` `$${amount.toLocaleString()}` `` y muestran **"$32"** / **"$1,085.6"**, mientras `VentaDetail` usa `money()` de `src/utils/currency.ts` y muestra "RD$ 1,085.60".

**Criterios**: ningún componente del POS muestra `"$"`; todo monto sale de `money()`.

**Checks**: test del POS (RED → GREEN) + suite.

### S5 — Bloque de cliente

> "Supermercado La Providencia" · "809-555-1201" · "Cambiar"

**Alcance**: dentro del rail derecho. Hoy es un `label` + input + `<select>` (`ClienteSelector.tsx:76-99`).

Con cliente seleccionado se muestran sus iniciales en un avatar, su nombre, su teléfono y la acción **"Cambiar"** que abre el selector. El selector deja de estar limitado a `clientes.slice(0, 50)` sobre la página cargada (`ClienteSelector.tsx:25-31`).

**Criterios**: con cliente seleccionado se ven iniciales, nombre y teléfono; "Cambiar" abre el selector.

**Checks**: test del POS (RED → GREEN) + suite.

## Tasks

| ID | Specs | Route | Commit | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S4 | inline | — | en curso | RED: el POS no muestra "RD$ 1,085.60" |
| T2 | S2 | — | — | cancelado | El usuario decidió no cambiar la carga del catálogo (L8) |
| T3 | S3 | inline | — | pendiente | RED: el POS no tiene panel "Venta actual" |
| T4 | S5 | inline | — | pendiente | RED: el cliente no muestra teléfono ni "Cambiar" |
| T5 | S3 | inline | — | pendiente | RED: la línea no muestra "c/u" ni hay bloque de totales único |
| T6 | S3 | inline | — | pendiente | RED: el botón de cobrar no incluye el monto |
| T7 | S2 | inline | — | en curso | RED: falta el placeholder "Buscar o escanear código..." y el badge "F2" |

**Orden**: T1 → T7 → T3 → T4 → T5 → T6 (T2 cancelado, L8). T1 y T7 van juntos: son el panel izquierdo (la moneda y el catálogo).

**Tests**: cada tarea abre con su test en RED (el POS hoy no tiene ninguno: `src/test/components/` no cubre `NuevaVenta`, `SelectorProducto`, `Carrito`, `ResumenVenta` ni `ClienteSelector`), cierra en GREEN y deja la suite verde.

**Riesgo por tarea**: `Risk: none` en todas — el cambio es de presentación. T2 toca la carga de datos del store (no una regla de negocio: el POS debe poder mostrar lo que vende).

**Pronóstico**: ~550 líneas authored (CSS ~300, TSX ~120, tests ~180) → 2 commits (~400 líneas cada uno).

## Fuera de alcance (decisiones)

| Ítem | Motivo |
|---|---|
| Método de pago ("Efectivo", "Tarjeta", "Transferencia") | `SaleDto` no tiene campo de pago (`id, code, companyId, clienteId, clienteName, status, total, notes, createdAt, updatedAt, items`): agregarlo es lógica de negocio y exige backend. Un control que no se persiste le miente al cajero. |
| "+ Agregar nota" | Escribe `notes`, que hoy va hardcoded en `null` (`NuevaVenta.tsx:86,88`): cambia lo que se persiste. |
| Paleta de la referencia (crema, verde lima, casi negro) | No es la identidad de Volterp (navy `#0B1A33` + ámbar `#FBBF24`, el favicon y el `VolterpMark`). Se adopta la estructura; los acentos usan los tokens del proyecto. |
| POS como pantalla dedicada | El nuestro es un overlay fullscreen (`NuevaVenta.module.css:1-12`), adecuado para un ERP. En la referencia no hay "Cancelar" en el rail, solo la X. |

## Log

- **L1 — 2026-11-06**: "mira analiza esta imagen del POS y valida si podemos mejorar lo que ya tenemos con esta referencia la ventana de ventas el pos. dejame saber no edites nada"
- **L2 — 2026-11-06**: "armemos el plan para mejorarla / Ojo esto es un cambio de visibilidad no de logica de negocio"
- **L3 — Análisis**: el POS actual es de tres columnas (`NuevaVenta.tsx:96-107`, `NuevaVenta.module.css:14-32`); el catálogo está truncado a la última página cargada (`productoStore.ts:38-42` + `config/pagination.ts:1` + `SelectorProducto.tsx:45-53`); la moneda está triplicada y sin `RD$` ni decimales; no hay método de pago; `notes` va hardcoded a `null`; el POS no tiene tests.
- **L4 — Decisión**: el fix de carga del catálogo entra (es un bug de visibilidad, no una regla); el método de pago y la nota salen (persisten datos); la paleta se mantiene.
- **L5 — Siguiente paso**: implementar T1 (RED → GREEN) sobre `development` y encadenar el resto.
- **L6 — 2026-11-06**: "El panel de productos ya muestra el total de los productos y si hay mas los pagina no veo problemas explicame" / "Lo respeta siempre lo respeta". Verificado: la API sí respeta `pageSize` (`PaginationExtensions.cs:9-11` → `CountAsync` + `Skip/Take(pageSize)`), pero el único llamador en toda la app es `Inventario.tsx:52` con `ITEMS_PER_PAGE = 10`, y `fetchProductos` reemplaza el array (`productoStore.ts:38-42`): el store nunca pasa de 10 productos. Por eso la paginación del panel del POS es inalcanzable (`SelectorProducto.tsx:30` pagina de 50 sobre 10 → `totalProductPages = 1` → el `<Pagination>` de la línea 103 nunca renderiza) y su `total` sería `filteredProducts.length` (la página cargada), no el `totalCount` real. La página de Inventario sí está bien (`Inventario.tsx:218` → `getInfo(totalCount)`).
- **L7 — Decisión de requisito (L6)**: S2 se reescribe: el panel debe mostrar el **total real** y **paginar si hay más**. Queda abierto cómo se sirve el catálogo en el POS (paginación server-side como Inventario vs. catálogo completo en memoria para la grilla continua de la referencia).
