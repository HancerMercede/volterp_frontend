# UX12 — El RNC del comprador en la caja

**Objetivo**: que la caja pida el RNC del comprador y lo deje en la venta, y que avise antes de firmar cuando el comprobante tiene que nombrar a su comprador.
**Rama**: `feature/ux12-receptor-rnc` (repo `erp-mvp`, base `development`)
**Delivery**: ask-on-risk
**Runner**: `npm test` (Vitest)

> El back ya está cerrado y commiteado (repo `Volterp` ✓ rama `feature/ux12-receptor-rnc` ✓): la venta lleva `receptorTaxId` ✓ (`CreateSaleRequest`/`UpdateSaleRequest` ✓) y el readiness dice desde qué monto el comprobante tiene que nombrar a su comprador (`buyerTaxIdRequiredFrom` ✓). **Esta es la fase 2**: el front consume ese contrato, no lo inventa.

## Specs

### S1 — "si yo quiero facturar con comprobante fiscal uso un NCF si el clente no exite le pido su RNC y le hago la venta"

El RNC que el cajero pide en el mostrador **queda en la venta**: la caja lo pide, lo envía en el create/update y la venta lo lleva. El padrón de clientes **no se toca** (el cliente solo queda registrado si el cajero lo marca ✓).

- El campo viaja en el cuerpo de `POST /api/sales` y de `PUT /api/sales/{id}` (`receptorTaxId` ✓).
- Al editar una venta pendiente, la caja muestra el RNC que la venta ya traía (`SaleDto.receptorTaxId` ✓).
- Al guardar el borrador y al completar, **la caja se limpia** → el RNC se limpia con ella (es del comprador de esa venta ✓).
- El **crédito fiscal (E31)** se puede elegir con el RNC escrito en la caja, aunque el cliente no tenga RNC en su ficha: la regla es "la venta nombra a su comprador" ✓.

### S2 — "osea nuestro sistema debe hacer eso, pero valida todo"

La regla la dice el back (una sola fuente ✓) y la caja la **dice antes de firmar** ✓:

| Documento | RNC del comprador |
|---|---|
| **E31 / B01** (crédito fiscal) | **siempre obligatorio** |
| **E32 / B02** (consumo) | obligatorio **desde RD$250,000**; por debajo el comprador es el consumidor final y no se nombra |

- El umbral **no está escrito en el front**: lo dice el readiness (`buyerTaxIdRequiredFrom` ✓).
- El back **falla cerrado** al completar si el comprobante tiene que nombrar a su comprador y no lo tiene → la caja no tiene que adivinar: muestra el aviso y, si el back rechaza, el mensaje del back viaja ✓.

### S3 — "Exacto asi seria lo correcto a menos que el cliente quiera que lo registren"

La venta manda **su** RNC; la ficha del cliente solo rellena el hueco cuando la venta no trae uno (eso lo resuelve el back ✓ → el front no lo decide ✓).

## Tasks

**Cerrado**: las tareas de esta tabla están hechas (ver “Tareas cerradas” y el Log).

## Log

### L1 — 2026-11-24 — el dueño abre la fase 2

### L3 — 2026-11-25 — reconciliación: la tabla de tareas queda solo con lo que falta

**T1 y T2 cerradas** → la tabla queda vacía. `c4c2ac1` (la caja lleva el RNC del comprador) + `7900f9b` (merge a development) + `9b17188` (este plan). El L2 que decía 'sin correr: el node_modules del front está roto' quedó obsoleto: la suite y el build corren. El RNC viaja en create y en update, se limpia con la caja y el aviso del consumo usa el umbral del readiness (`NuevaVentaPage.tsx:42`).

## Tareas cerradas

Filas que salen de la tabla de tareas: el trabajo ya está hecho. El commit de cada una está en el Log.

| ID | Detalle |
|---|---|
| T1 | S1, S2 · inline (parent) · DONE · Los tipos llevan `receptorTaxId` ✓ · la caja lo pide, lo envía, lo carga al editar y lo limpia ✓ · el crédito fiscal (E31) se puede elegir con el RNC escrito ✓ · el consumo (E32) avisa antes de completar con el umbral del readiness ✓ · i18n `ventas.*` en `es`/`en` ✓ · 7 tests nuevos + 1 actualizado ✓ · el snippet de la caja en el `FRONTEND-SKELETON-TEMPLATE.md` al día ✓ |
| T2 | S1-S3 · handoff (owner) · PENDING · **La suite y el build los corre el dueño**: el `node_modules` del front estaba roto (`node_modules/vitest` vacío y `.bin` sin binarios → la config `vitest/config` no cargaba) → el dueño reinstala y corre `npx vitest run` + `npm run build` ✓ |


> (el dueño: *"Ok comencemos pero no hagas trabajo paralelo si es el backend primero y luego el front o viceversa"* · *"lee el template tambien no solo el readme"* · *"no hagas nada que no siga el patron del proyecto recuerdalo"*)

- **El orden se respeta** ✓: el back primero (cerrado ✓) → ahora el front ✓ → **nada en paralelo** ✓.
- **El front tiene su propio patrón** ✓: `FRONTEND-SKELETON-TEMPLATE.md` (5039 líneas ✓) → capas `pages → components → application → infrastructure` ✓ · los tipos en `src/domain/types/index.ts` ✓ · la copia en `src/i18n/locales/{es,en}.json` ✓ (español **neutro**, sin voseo ✓) · CSS Modules con tokens ✓ · sin `any` ✓ · sin `useEffect` para estado derivado ✓.
- **La regla de mantenimiento del template** ✓: si se toca un archivo que tiene snippet en el template, el snippet se actualiza **en el mismo commit** ✓ (el `limpiarLaCaja` de la caja está en el §2.9 ✓ → ese snippet cambia ✓).
- **Lo que el front NO decide** ✓: el umbral (lo dice el readiness ✓) · quién es el comprador cuando la venta no trae RNC (lo resuelve el back ✓) · si el RNC es válido (el back lo valida con el VO `Rnc` ✓).
- **El total de la caja** ✓: el front muestra el total **con ITBIS** (`calculateSaleTotals` ✓) y el back lo recalcula ✓ → el aviso usa el total que la pantalla muestra ✓ (UX10 —el body que se manda— sigue pendiente y no se toca acá ✓).
- **Riesgo**: item 3 (contrato) — el front consume un campo nuevo del API ✓ → el back ya está ✓ → **el front después** ✓.

### L2 — 2026-11-24 — la caja alineada con el back

- **Qué viaja** ✓: `receptorTaxId` en el create y en el update ✓ → **solo lo que el cajero escribió** ✓ (`receptorTaxId.trim() || undefined` ✓) → si no escribió nada el front no opina ✓ → el back lo resuelve con la ficha ✓ (que ya viene normalizada ✓ → y así una ficha vieja con un RNC inválido no rompe la venta ✓).
- **El campo** ✓: vive en la sección del cliente del riel ✓ → su *placeholder* es el RNC de la ficha (el cajero ve lo que ya viaja sin que el front lo mande ✓) → y se limpia con la caja ✓ (es del comprador de esa venta ✓).
- **El crédito fiscal (E31)** ✓: la guarda de "necesita el RNC" ahora mira **al comprador de la venta** (lo escrito o lo de la ficha ✓) → el cajero puede escribir el RNC de un comprador que no está registrado ✓ → y el mensaje pasó de "del cliente" a "del comprador" ✓ (el test que lo fijaba se actualizó ✓).
- **El consumo (E32)** ✓: avisa **antes de completar** cuando el total de la pantalla (el que **incluye** el ITBIS ✓ = el que recalcula el back ✓) llega al umbral ✓ → el umbral **lo dice el readiness** (`buyerTaxIdRequiredFrom` ✓) y llega **por prop** ✓ (la página ya lo tiene ✓ → el hook no se llama dos veces ✓) → el front **no lleva el número** ✓.
- **El borrador no avisa** ✓: el back valida al emitir ✓ → la caja puede guardar el borrador y pedir el RNC al completar ✓ (igual que la regla del back ✓).
- **El template al día** ✓: el snippet de `limpiarLaCaja` y las reglas de §2.9 (la caja) se actualizaron en el mismo cambio ✓ (la regla de mantenimiento del template ✓).
- **Tests** ✓: 7 nuevos (el RNC viaja en el create ✓ · en el update ✓ · el crédito fiscal se acepta con el RNC escrito ✓ · la caja lo limpia ✓ · la venta muestra el RNC que ya traía ✓ · avisa en el consumo desde el umbral ✓ · no avisa por debajo ✓) + el existente del mensaje del crédito fiscal actualizado ✓ → **sin correr**: el `node_modules` del front está roto (vitest vacío ✓) → los corre el dueño ✓.
- **Riesgo**: none ✓ (el front consume un campo que el back ya expone ✓ · la copia y el comportamiento anterior siguen en pie ✓ · no cambia ningún dato guardado ✓).

## Relevant Files

- `src/pages/Ventas/components/NuevaVenta.tsx` — la caja: pide el RNC, lo envía, lo carga al editar y lo limpia.
- `src/pages/NuevaVenta/NuevaVentaPage.tsx` — la ruta de la caja: ya tiene el readiness, de ahí sale el umbral.
- `src/domain/types/index.ts` — `CreateSaleRequest`, `UpdateSaleRequest` (el campo nuevo) y `SaleDto` (ya trae `receptorTaxId` ✓).
- `src/i18n/locales/es.json`, `src/i18n/locales/en.json` — la copia de la caja (namespace `ventas`).
- `src/test/components/NuevaVenta.test.tsx` — los tests de la caja.
- `src/test/pages/ventasI18nKeys.test.ts` — el guard de las claves `ventas.*` (cubre las nuevas solo ✓).
- `FRONTEND-SKELETON-TEMPLATE.md` — el patrón del front (y el snippet de la caja que hay que actualizar).
