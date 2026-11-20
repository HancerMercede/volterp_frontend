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

### S11 — El template del frontend es la autoridad

> "lee el template del front no reinventes"

`FRONTEND-SKELETON-TEMPLATE.md` es el esqueleto y la plantilla oficiales del proyecto: la forma de las carpetas (§1.1 ✓), la regla de dependencias entre capas (§1.2 ✓), el `fetchWithAuth` y los services (§2.1 ✓), el store canónico (§2.2 ✓), los hooks genéricos (§2.3 ✓), los primitivos de UI (§2.5 ✓), el routing (§2.9 ✓) y el **workflow de 7 pasos para agregar una entidad/página** (§3.2 ✓). Ninguna pantalla de e-CF se diseña desde cero: se sigue ese workflow (tipos → service → store → hook si hace falta → page → routing → i18n ✓).

Su **maintenance rule** también obliga: si el módulo cambia un archivo que tiene snippet en el template (`config.ts` con los `ENDPOINTS` ✓, `fetchWithAuth` ✓, los services ✓, los stores ✓, los primitivos ✓, `App.tsx` ✓), el snippet se actualiza **en el mismo commit** ✓.

## Contrato de API (backend → frontend)

Fuente: `Volterp.Api/Controllers/**` y `Volterp.Application/DTOs/**` del backend. El backend manda en el contrato ✓ (S1 ✓).

### Reglas globales

- JSON **camelCase** ✓ · enums como **string** (`JsonStringEnumConverter` global ✓ → parseo case-insensitive ✓) · sin envoltura: el body es el DTO pelado ✓.
- Errores: `{ "error": "...", "details": null }` (`ErrorResponse` ✓ → ya tipado en el front como `ApiError` ✓).
- Listas: `PagedResult<T>` = `{rowCount, pageNumber, pageSize, pageCount, items}` ✓ (ya tipado en el front ✓) con query `?pageNumber=1&pageSize=10` ✓.
- `companyId` **sale del token** ✓ → los requests **no** lo mandan ✓ (S6 ✓).
- `[Authorize]` de clase acepta **JWT Bearer** ✓ y `ApiKey` ✓ → el front usa **JWT** ✓ (S2 ✓); los endpoints con `[Authorize(Roles=…)]` son Admin/SuperAdmin ✓.
- Los endpoints `/fe/*` de recepción exigen **certificado cliente TLS (mTLS)** ✓ → **no son del navegador** ✓ (S3 ✓).

### Enums (nombre exacto en el wire)

| Enum | Valores |
|------|---------|
| `EcfDocumentType` | FiscalCredit · Consumer · DebitNote · CreditNote · Purchase · MinorExpenses · SpecialRegimes · Governmental · Exportation · ExternalPayments |
| `EcfStatus` | Draft · Signed · Sent · InProcess · Accepted · AcceptedConditionally · Rejected · Annulled |
| `EcfFiscalState` | PendingEmission · InProcess · Rejected · RequiresReview |
| `EntityStatus` | Active · Inactive · Pending · Completed · OnLeave · Cancelled |
| `CompanyEmissionMode` | Electronic · Normal |
| `CompanyContingencyStatus` | None · Total · Partial |
| `NormalFiscalDocumentType` | FiscalCredit · Consumer · DebitNote · CreditNote |
| `ReceivedElectronicInvoiceApprovalStatus` | Received · Approved · Rejected |

### Endpoints

| Verbo + ruta | Request | Response |
|---|---|---|
| `GET /api/company-issuers` (paged) | — | `PagedResult<CompanyIssuerDto>` |
| `GET /api/company-issuers/{id}` | — | `CompanyIssuerDto` |
| `POST /api/company-issuers` (roles) | `{taxId, legalName}` | `CompanyIssuerDto` (201) |
| `PUT /api/company-issuers/{id}` (roles) | `{legalName, isActive}` | `CompanyIssuerDto` |
| `GET /api/electronic-invoices/state?limit=50` | — | `ElectronicInvoiceStateSurfaceDto` |
| `POST /api/electronic-invoices/{id}/retry` | — | `ElectronicInvoiceDto` |
| `GET /api/electronic-invoices/{id}/qr.svg` | — | `image/svg+xml` (blob) |
| `GET /api/electronic-invoices/{id}/qr.png` | — | `image/png` (blob) |
| `GET /api/electronic-invoice-sequences` (paged) | — | `PagedResult<ElectronicInvoiceSequenceDto>` |
| `GET /api/electronic-invoice-sequences/{id}` | — | `ElectronicInvoiceSequenceDto` |
| `POST /api/electronic-invoice-sequences` (roles) | `{issuerTaxId, documentType, from, to, expiresAt, position}` | `ElectronicInvoiceSequenceDto` (201) |
| `PUT /api/electronic-invoice-sequences/{id}` (roles) | ídem | `ElectronicInvoiceSequenceDto` |
| `POST /api/electronic-invoice-sequences/{id}/annul` (roles) | — | `RangeAnnulmentResult` |
| `GET /api/electronic-invoice-print/{id}` | — | `text/html` (blob) |
| `GET /api/company-certificates` (paged) | — | `PagedResult<CompanyCertificateDto>` |
| `GET /api/company-certificates/{id}` | — | `CompanyCertificateDto` |
| `POST /api/company-certificates` (roles) | `{name, taxId, expiresAt, credential}` | `CompanyCertificateDto` (201) |
| `GET /api/company-emission-mode` | — | `CompanyEmissionModeDto` |
| `PUT /api/company-emission-mode/contingency` (roles) | `{status, startsAt, endsAt}` | `CompanyEmissionModeDto` |
| `PUT /api/company-emission-mode` (roles) | `{emissionMode}` | `CompanyEmissionModeDto` |
| `GET /api/api-credentials` (paged, roles) | — | `PagedResult<ApiCredentialDto>` |
| `POST /api/api-credentials` (roles) | `{name, expiresAt}` | `IssuedApiCredentialDto` (**el `secret` viaja una sola vez** ✓) |
| `DELETE /api/api-credentials/{id}` (roles) | — | **204** ✓ |
| `GET /api/normal-fiscal-sequences` (paged) | — | `PagedResult<NormalFiscalSequenceDto>` |
| `GET /api/normal-fiscal-sequences/{id}` | — | `NormalFiscalSequenceDto` |
| `POST /api/normal-fiscal-sequences` (roles) | `{issuerTaxId, documentType, from, to, expiresAt, position}` | `NormalFiscalSequenceDto` (201) |
| `PUT /api/normal-fiscal-sequences/{id}` (roles) | ídem | `NormalFiscalSequenceDto` |
| `POST /api/ElectronicInvoiceReception/{id}/commercial-approval` | `{approved, reason}` | `ReceivedElectronicInvoiceDto` |

### DTOs (campos exactos)

- `CompanyIssuerDto`: `id, companyId: Guid` · `taxId, legalName: string` · `isActive: boolean` ✓
- `ElectronicInvoiceStateSurfaceDto`: `counts: ElectronicInvoiceStateCounts` · `invoices: ElectronicInvoiceStateDto[]` ✓
- `ElectronicInvoiceStateCounts`: `pendingEmission, inProcess, rejected, requiresReview, total: number` ✓ (`total` calculada ✓)
- `ElectronicInvoiceStateDto`: `id, saleId: Guid` · `encf: string` · `documentType: EcfDocumentType` · `fiscalState: EcfFiscalState | null` · `status: EcfStatus` · `verdictNote, rawResponse, lastError: string | null` · `requiresReview: boolean` · `sentAt, nextCheckAt, receivedAt: Date | null` · `statusCheckCount: number` · `sequenceConsumed: boolean | null` ✓
- `ElectronicInvoiceDto`: `id, companyId, saleId: Guid` · `encf: string` · `documentType: EcfDocumentType` · `issuerTaxId: string` · `receiverTaxId: string | null` · `subtotal, itbis, total: number` · `status: EcfStatus` · `trackId, securityCode, qrUrl, verdictNote: string | null` · `requiresReview: boolean` · `signedAt, sentAt: Date | null` ✓
- `ElectronicInvoiceSequenceDto`: `id, companyId: Guid` · `issuerTaxId: string` · `documentType: EcfDocumentType` · `from, to, currentSequence: number` · `expiresAt: Date | null` · `hasRoom: boolean` ✓
- `SaveElectronicInvoiceSequenceDto`: `issuerTaxId: string` · `documentType: EcfDocumentType` · `from, to, position: number` · `expiresAt: Date | null` (+ `requiresExpiry: boolean` **calculada y de solo lectura** ✓ → viene en la respuesta ✓)
- `RangeAnnulmentResult`: `code, name: string | null` · `messages: string[]` · `annulledAt: Date | null` ✓
- `CompanyCertificateDto`: `id, companyId: Guid` · `name, taxId: string` · `expiresAt: Date` · `status: EntityStatus` · `isExpired: boolean` ✓
- `CreateCompanyCertificateDto`: `name, taxId: string` · `expiresAt: Date` · `credential: string` (credencial opaca ✓ → se cifra server-side ✓) ✓
- `CompanyEmissionModeDto`: `emissionMode: CompanyEmissionMode` · `contingencyStatus: CompanyContingencyStatus` · `contingencyStartsAt, contingencyEndsAt: Date | null` ✓
- `UpdateCompanyContingencyDto`: `status: CompanyContingencyStatus` · `startsAt, endsAt: Date | null` ✓
- `UpdateCompanyEmissionModeDto`: `emissionMode: CompanyEmissionMode` ✓
- `ApiCredentialDto`: `id: Guid` · `name, keyId: string` · `status: EntityStatus` · `expiresAt, updatedAt: Date | null` · `isExpired: boolean` · `createdAt: Date` ✓
- `IssuedApiCredentialDto`: `id: Guid` · `name, keyId, secret: string` · `expiresAt: Date | null` ✓
- `NormalFiscalSequenceDto`: `id, companyId: Guid` · `issuerTaxId: string` · `documentType: NormalFiscalDocumentType` · `from, to, currentSequence: number` · `expiresAt: Date | null` · `hasRoom: boolean` ✓
- `SaveNormalFiscalSequenceDto`: `issuerTaxId: string` · `documentType: NormalFiscalDocumentType` · `from, to, position: number` · `expiresAt: Date | null` ✓
- `ReceivedElectronicInvoiceDto`: `id: Guid` · `issuerTaxId, receiverTaxId, encf: string` · `documentType: EcfDocumentType` · `signedAt, receivedAt: Date` · `approvalStatus: ReceivedElectronicInvoiceApprovalStatus` · `approvalDecidedBy: string | null` · `approvalDecidedAt: Date | null` · `approvalReason: string | null` · `alreadyReceived: boolean` ✓ (`companyId` es `[JsonIgnore]` ✓)
- `CommercialApprovalDecisionRequest`: `approved: boolean` · `reason: string` ✓

### Notas del contrato que el front tiene que respetar

1. `fetchWithAuth` fuerza `Content-Type: application/json` en la **request** ✓ → si algún día hay FormData hay que overridear el header ✓.
2. No existe helper de `response.blob()` en el front ✓ → hay que agregarlo para el QR y la representación impresa ✓.
3. Los DTOs sin `[Required]` no son "required" en el binder ✓ → si falta un `string` llega `null` ✓, un `bool` llega `false` ✓ y un enum llega `0` (valor **inválido** en `EcfDocumentType` ✓) → el front no debe asumir que un enum recibido es válido ✓.

## Tasks

| ID | Specs | Ruta | Commit |
|----|-------|------|--------|
| T1 | S4, S11 | writer — tipos de dominio de e-CF (§3.2 paso 1 ✓) | `TBD` |
| T2 | S4, S11 | writer — services de e-CF + `ENDPOINTS` (§3.2 paso 2 ✓) | `TBD` |
| T3 | S4, S11 | writer — stores de e-CF (§3.2 paso 3 ✓) | `TBD` |
| T4 | S5 | writer — la venta muestra su estado fiscal | `TBD` |
| T5 | S3, S6, S7, S11 | writer — emisores del tenant (§3.2 pasos 4-7 ✓) | `TBD` |
| T6 | S3, S6, S11 | writer — rangos de e-NCF (§3.2 pasos 4-7 ✓) | `TBD` |
| T7 | S3, S6, S11 | writer — certificados del emisor (§3.2 pasos 4-7 ✓) | `TBD` |
| T8 | S3, S7, S8, S9, S11 | writer — comprobantes: lista, veredicto, QR, retry, print (§3.2 pasos 4-7 ✓) | `TBD` |
| T9 | S3, S6, S11 | writer — recepción de comprobantes de terceros (§3.2 pasos 4-7 ✓) | `TBD` |
| T10 | S3, S6, S11 | writer — modo de emisión, credenciales y secuencias normales (§3.2 pasos 4-7 ✓) | `TBD` |
| T11 | S6 | inline (parent) — permisos del módulo en `MATRIZ_PERMISOS` | `TBD` |
| T12 | S1, S4 | inline (parent) — huecos reales del backend, documentados y no maquetados | `TBD` |
| T13 | S11 | inline (parent) — snippets del template actualizados en el mismo commit | `TBD` |

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

### L4 — 2026-11-19 — el template del frontend es la autoridad

> "lee el template del front no reinventes"

`FRONTEND-SKELETON-TEMPLATE.md` (4270 líneas ✓) manda sobre cualquier criterio propio: estructura de carpetas (§1.1 ✓) · `fetchWithAuth` + `API_CONFIG`/`ENDPOINTS` (§2.1 ✓) · store canónico (§2.2 ✓) · hooks genéricos (§2.3 ✓) · primitivos de UI (§2.5 ✓) · routing (§2.9 ✓) · y el **workflow de 7 pasos** para agregar una entidad/página (§3.2 ✓) → cada pantalla de e-CF se arma con esos 7 pasos ✓ (tipos → service → store → hook si hace falta → page → routing → i18n ✓).

Su **maintenance rule** también obliga: si se toca un archivo con snippet (p. ej. `config.ts` con los `ENDPOINTS` ✓), el snippet se actualiza en el **mismo commit** ✓ (T13 ✓).

**Ojo**: `MEMORY.md` está **desactualizado** ✓ (habla de React 18 ✓, React Router v6 ✓, Context ✓ y `src/api/` ✓ → el código real es React 19 ✓, Router v7 ✓, Zustand 5 ✓ y `src/infrastructure/api/` ✓) → **no es fuente** ✓.
