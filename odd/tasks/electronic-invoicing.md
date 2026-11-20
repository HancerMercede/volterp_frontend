# Facturación Electrónica — Frontend

## Goal

Que **la facturación electrónica se haga desde el frontend**. Hoy el backend expone los diez endpoints de e-CF (emisores, rangos, certificados, comprobantes, recepción, modo de emisión, credenciales, secuencias fiscales normales) y **el frontend no consume ninguno**: el grep de `electronic|issuer|certificate|sequence|apiCredential|emissionMode|fiscal` sobre `src/` no devuelve una sola llamada. La biblioteca y sus XSD siguen siendo la autoridad del formato; el frontend solo consume el contrato.

- **Branch**: `development` → `feature/electronic-invoicing`
- **Delivery strategy**: `ask-on-risk` (default)
- **Test runner**: `npx vitest run` (unit) · `yarn build` (typecheck + bundle) · `yarn lint`

## Specs

### S1 — El frontend se adapta al backend

> "El frontend se adapta al backend"

El backend es la autoridad del contrato. Ningún endpoint del backend se cambia para acomodar al frontend. Si al tipar contra el contrato real aparece un hueco (un campo que el backend manda y el front necesita, o una ruta que el front llama y el backend no tiene), ese hueco se **documenta** y se decide antes de tocar el backend — no se maquilla en el front.

### S2 — El acceso es con JWT

> "Por el momento vamos a usar las mismas con su JWT en un futuro podemos incluir Klick claud"

La UI del ERP consume la API de e-CF con el **JWT del usuario del tenant** (`Authorization: Bearer`, el mismo `fetchWithAuth` que ya usa ✓). La autenticación de máquina (`ApiKey <keyId>.<secret>`) queda para más adelante: **no** se implementa en esta feature.

### S3 — La facturación electrónica se hace desde el frontend

> "necesitamos alinear al FrontEnd con el backend para que la facturacion electronica se haga desde el frontend"

El ERP debe poder, **desde su interfaz**: registrar los emisores del tenant, habilitar rangos de e-NCF, cargar el certificado del emisor, completar una venta y **ver el comprobante** con su veredicto, recibir comprobantes de terceros, anular rangos y ver el modo de emisión.

### S4 — Los tipos son el contrato, no una aproximación

> "valida que falta para homologar el front con el backend que falta y que tenemos"

Cada DTO de e-CF se tipa en el frontend con los **nombres de campo, tipos y nullability** del backend. Nada de `any`, nada de campos "más o menos". La fuente es el contrato real (los DTO del backend y su `JsonStringEnumConverter` → los enums viajan como texto y se parsean **case-insensitive**).

### S5 — La venta muestra su estado fiscal

> "alinear con el frontend para que la facturacion electronica se haga desde el frontend"

El `SaleDto` del frontend no modela `documentType`, `receptorTaxId`, `issuerTaxId`, `subtotal`, `itbis`, `electronicInvoiceId`, `fiscalState` ni `fiscalNote` → **se pierde el lado fiscal de la venta** y sin eso el usuario no sabe si su venta quedó con comprobante. La pantalla de ventas muestra el estado fiscal y el enlace al comprobante.

### S6 — Todo es del tenant del usuario

> "El frontend se adapta al backend"

Cada endpoint de e-CF se consume contra el tenant del JWT, como el backend ya lo resuelve (el `CompanyId` **no** viaja en el body: sale del token). El frontend **no** manda `companyId` en los requests: si lo manda, el backend lo ignora (es lo que hoy hace `CreateSaleRequest`).

### S7 — El veredicto de la DGII se muestra tal cual

> "para que la facturacion electronica se haga desde el frontend"

El veredicto (`Accepted` / `Aceptado`, `Rechazado`, ...) y sus observaciones se muestran **como los manda la DGII**, con su texto literal. El frontend no reinterpreta ni traduce el significado del veredicto.

### S8 — Rechazo y reintento son parte del flujo

> "para que la facturacion electronica se haga desde el frontend"

La cola durable del backend (`AttemptCount`, `LastError`, `RequiresReview`, `NextAttemptAt`) se refleja en la UI: el comprobante rechazado se ve como rechazado, con su error, y se puede reintentar (`POST /api/electronicinvoices/{id}/retry`).

### S9 — QR y representación impresa

> "para que la facturacion electronica se haga desde el frontend"

Desde el detalle del comprobante se abre el QR (`qr.svg` / `qr.png`) y la representación impresa (`/api/electronicinvoiceprint/{id}`).

### S10 — El módulo no inventa requisitos de la DGII

> "alinear con el frontend para que la facturacion electronica se haga desde el frontend"

El frontend no reimprime reglas de la DGII: el tipo de comprobante, el estado del veredicto y la validez del documento son los que el backend y la biblioteca devuelven. Si la UI necesita un dato que la API no da, es un hueco del backend (S1), no una interpretación del front.

## Tasks

| ID | Specs | Ruta | Commit |
|----|-------|------|--------|
| T1 | S4 | inline (parent) — tipos del dominio de e-CF | `TBD` |
| T2 | S4 | inline (parent) — capa de servicios de e-CF (JWT, multipart, QR/print) | `TBD` |
| T3 | S5 | inline (parent) — la venta muestra su estado fiscal | `TBD` |
| T4 | S3, S6, S7 | inline (parent) — pantalla de emisores del tenant | `TBD` |
| T5 | S3, S6 | inline (parent) — pantalla de rangos de e-NCF (habilitar / anular) | `TBD` |
| T6 | S3, S6 | inline (parent) — pantalla de certificados del emisor | `TBD` |
| T7 | S3, S7, S8, S9 | inline (parent) — comprobantes: lista, veredicto, QR, retry, print | `TBD` |
| T8 | S3, S6 | inline (parent) — recepción de comprobantes de terceros (multipart) | `TBD` |
| T9 | S3, S6 | inline (parent) — modo de emisión, credenciales de API y secuencias fiscales normales | `TBD` |
| T10 | S1, S4 | inline (parent) — huecos reales que el backend no cubre (documentados, no maquetados) | `TBD` |

## Log

### L1 — 2026-11-19 — pedido original

> "ahora necesitamos alinear con el frontend"

### L2 — 2026-11-19 — validación del estado del frontend

> "Valida primero en que estado esta el front la rama si esta todo uptodate y que nos falta para poder tener todo alineado con la facturacion electronica"

**Estado validado**: `development` al día con `origin/development` (0 ahead / 0 behind ✓) · sin commits pendientes ✓ · en el árbol solo el ruido del skill registry (`.atl/*`) que no se toca ✓ · ramas: `development` ✓ · `main` ✓ · `feature/auth-invitation-flow` ✓ · `feature/contabilidad-modulo` ✓.

**Lo que falta**: el frontend **no consume ninguno** de los diez controllers de e-CF ✓ → el módulo es trabajo nuevo ✓, no una adaptación.

### L3 — 2026-11-19 — decisiones

> "El frontend se adapta al backend"

> "Por el momento vamos a usar las mismas con su JWT en un futuro podemos incluir Klick claud"

> "necesitamos alinear al FrontEnd con el backend para que la facturacion electronica se haga desde el frontend"

- El backend es la autoridad del contrato ✓ (S1 ✓).
- El acceso es con **JWT** ✓ (S2 ✓); `ApiKey` queda para después ✓.
- El objetivo es que la e-CF **se haga desde el frontend** ✓ (S3 ✓).
- Los huecos preexistentes del contrato (`/api/accounts`, `/api/projects`, los endpoints públicos de auth, `invite`/`reset-password` de usuarios) **no** son parte de esta feature ✓: los contracted por `odd/tasks/auth-invitation-flow.md` ✓ (su mitad de backend sigue pendiente ✓) y los demás se documentan en T10 ✓.
