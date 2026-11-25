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

**Cerrado**: las tareas de esta tabla están hechas (ver “Tareas cerradas” y el Log).

## Slices de entrega (PRs encadenados)

El owner eligió **PRs encadenados por módulo** (2026-11-19) → cada slice se abre como un PR propio y encadenado sobre el anterior, con el bootstrap en el primero.

| Slice | Contenido | Tasks | Estado |
|-------|-----------|-------|--------|
| PR 1 — base | tipos, services, stores, permisos, i18n, hub, rutas y snippets | T1, T2, T3, T11, T12, T13 | listo (`b0fab79`…`6aa4fa2`) |
| PR 2 — emisores y rangos | las dos pantallas de configuración del emisor | T5, T6 | listo (`e40b414`) |
| PR 3 — certificados, comprobantes y ventas | firma del emisor, cola de emisión y estado fiscal de la venta | T7, T8, T4 | listo (`adbbe83`, `544ce22`, `474c19c`) |
| PR 4 — recepción y configuración fiscal | comprobantes de terceros, modo de emisión, credenciales y secuencias normales | T9, T10 | listo (mismos dos commits de arriba) |

- El work-unit commit vive **dentro** del slice: ningún PR es un commit gigante.
- `push`, apertura de PR y merge siguen siendo decisiones del owner.


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

### L5 — 2026-11-19 — decisiones de entrega y de permisos

> "PRs encadenados por módulo"

> "El role ventas por el momento, sera quien haga uso de la facturacion electronica y normal, tambien los admins y el superadmin lo hara, en un futuro vamos a implementar el role de cajero o cajera el cual vivira bajo el mismo permiso de ventas."

- **Entrega**: PRs encadenados por módulo (PR 1 base · PR 2 emisores y rangos · PR 3 certificados, comprobantes y ventas · PR 4 recepción y configuración fiscal) ✓ → los límites de slice están en la sección **Slices de entrega** ✓.
- **Permisos**: el módulo `facturacion` existe para `SUPER_ADMIN`, `ADMIN` y `VENTAS` con `read`/`write`/`delete` ✓; `INVENTARIO`, `CONTABILIDAD` y `RRHH` quedan afuera ✓.
- El rol **cajero** que se viene implementará vivirá bajo el mismo permiso que `VENTAS` ✓ → el módulo no debe hardcodear el rol, se apoya en `MATRIZ_PERMISOS` ✓.

### L6 — 2026-11-19 — avance: el contrato ya está en código

- `b0fab79` — enums del contrato con parseo case-insensitive (`src/domain/constants/electronicInvoicing.ts`) ✓ → un enum fuera de rango llega como ordinal y el parser devuelve `null` en vez de inventar un valor ✓.
- `3503e79` — DTOs del contrato (`src/domain/types/electronicInvoicing.ts`) ✓ → se re-exportan desde `src/domain/types/index.ts` para no cambiar la superficie de import de ningún módulo ✓.
- `f8d08ff` — los 8 services + `fetchWithAuthBlob` ✓ → el snippet de `config.ts` y el de `fetchWithAuth` se actualizaron en el mismo commit (maintenance rule ✓) → de paso se resincronizó el snippet de `fetchWithAuth` con el archivo vivo (el del template tiraba `Error` pelado y el real usa `ApiRequestError` con `status`) ✓.
- `dbd7a86` / `d40a103` — los 8 stores ✓ (4 de configuración fiscal + 4 de operación) ✓ → los lectores dejan el error en el estado y las mutaciones lo re-tiran ✓.
- `6252b03` — el módulo en `MATRIZ_PERMISOS` + el namespace `facturacion` en `es.json`/`en.json` ✓.

**Decisiones de diseño que quedan registradas**:
1. Las fechas viajan como **string ISO 8601** (la representación JSON del `Date` del backend y la que ya usa el resto del front) ✓.
2. El veredicto y el estado se muestran con el **valor crudo del backend**, con el parser como guarda contra enums inválidos → S7 (no se traduce el significado de la DGII) ✓.
3. Los tipos del contrato se quedan en un módulo propio (`domain/types/electronicInvoicing.ts`) re-exportado desde el barrel → una sola razón para cambiar ✓ y el diff se puede revisar por partes ✓.
4. `fetchWithAuthBlob` se suma al wrapper porque el QR y la representación impresa son respuestas binarias y no había helper ✓.

### L7 — 2026-11-19 — hueco real del backend detectado al tipar

Al implementarlo contra el contrato aparecen dos huecos que **no se maquetan** (S1):

1. **No hay `GET /api/electronic-invoices/{id}`**: el detalle de un comprobante se resuelve con la superficie de estado (`GET /api/electronic-invoices/state?limit=50`) + los artefactos (`qr.svg`, `qr.png`, `electronicinvoiceprint`). Los campos `subtotal`/`itbis`/`total`/`trackId`/`securityCode` de un comprobante sólo vuelven en la respuesta del **reintento**; el resto de los datos los trae la venta (`SaleDto.subtotal`, `SaleDto.itbis`) ✓ → la UI no inventa un endpoint ✓.
2. **No hay listado de comprobantes recibidos accesible desde el navegador**: la recepción real (`/fe/*`) exige certificado cliente TLS (mTLS) y el único endpoint de navegador es `POST /api/ElectronicInvoiceReception/{id}/commercial-approval` → la pantalla de recepción (T9) registra la decisión sobre el **id** que el usuario trae, y muestra el DTO que devuelve el backend ✓; no se finge una lista ✓.
3. El backend **no expone DELETE** de emisores, rangos ni certificados → esas pantallas sólo ofrecen crear/editar (y anular, en el caso del rango) ✓; el único DELETE es el de credenciales ✓.

### L8 — 2026-11-19 — el módulo armado de punta a punta

**Commits de la feature** (rama `feature/electronic-invoicing`):

| Commit | Task | Qué |
|--------|------|-----|
| `b0fab79` | T1 | Enums del contrato con parseo case-insensitive (`null` ante enum inválido) |
| `3503e79` | T1 | DTOs del contrato e-CF (`domain/types/electronicInvoicing.ts`) |
| `f8d08ff` | T2 | Los 8 services + `fetchWithAuthBlob` + snippets de `config.ts` y `fetchWithAuth` |
| `dbd7a86` | T3 | Stores de configuración fiscal (emisores, rangos, certificados, secuencias normales) |
| `d40a103` | T3 | Stores de operación (comprobantes, modo de emisión, credenciales, recepción) |
| `6252b03` | T11 | Módulo en `MATRIZ_PERMISOS` + namespace `facturacion` en es/en |
| `b513fd3` | T11 | Guard: la matriz tiene una fila por módulo para cada rol |
| `e348ebe` | — | `MEMORY.md` con el stack real (ya no era fuente) |
| `6aa4fa2` | T5-T10 | Hub del módulo + las 7 rutas en `App.tsx` + guard de claves i18n + README |
| `e40b414` | T5, T6 | Emisores y rangos de e-NCF |
| `474c19c` | T4 | La venta muestra su estado fiscal |
| `adbbe83` | T7, T9 | Certificados y recepción de comprobantes de terceros |
| `544ce22` | T8, T10 | Comprobantes (veredicto, QR, reintento, print) y configuración fiscal |
| `79b380c` | T8, T10 | Correcciones de la revisión: el backend manda en la fila y en el reintento |

**Huecos del backend que aparecieron al implementar** (documentados, **no maquillados**):

1. **Los endpoints de escritura exigen `Admin`/`SuperAdmin`**: el backend protege `POST`/`PUT` de emisores y rangos y el `annul` con `[Authorize(Roles = "Admin,SuperAdmin")]`. La matriz del front da `write` al rol `VENTAS` (decisión del owner) → un usuario de Ventas ve los botones y recibe **403**. El front muestra el error del backend tal cual; **el contrato de roles entre front y back queda para que lo definan** (S1).
2. **`ElectronicInvoiceSequenceDto` no expone el estado "anulado"**: el dominio tiene `IsAnnulled` y el listado no lo filtra → después de anular, el backend sigue devolviendo el rango. La UI no puede distinguir uno anulado de uno vivo (no se refetchea tras anular para no volver a ofrecerlo).
3. **`RequiresExpiry` sólo viene en la respuesta del save**: el front no puede saber si un tipo de comprobante exige fecha de vencimiento → manda `expiresAt: null` cuando el campo está vacío y deja que el error del backend aparezca en el modal.
4. **El `PUT` de un rango no puede cambiar emisor, tipo ni `from`, y la posición no puede retroceder** → en edición esos campos van deshabilitados y `position` se inicializa con `currentSequence`.
5. **La venta no carga el e-NCF, el `trackId` ni el `securityCode`**: en ventas sólo se puede mostrar el estado fiscal y el enlace al módulo de comprobantes.
6. **`EcfFiscalState` no es el veredicto de la DGII**: `SaleDto.fiscalState` sólo puede ser `PendingEmission | InProcess | Rejected | RequiresReview`; "Accepted" es de `EcfStatus` y vive en la superficie de estado de e-CF → el veredicto literal se muestra en el módulo de comprobantes (S7 ✓).
7. **El `SaleDto` real del backend no está en el contrato escrito** de este plan: los campos fiscales se tomaron del tipo del front. Queda como verificación pendiente contra el backend.
8. **Copy hardcodeado en componentes compartidos**: `ActionButtons` ("Eliminar", "Activar/Desactivar") y `DynamicFormFields` ("Seleccionar …") están en español y fuera de i18n. No se tocaron (son compartidos y ajenos a la feature); las pantallas de e-CF los esquivan pasando su propio label.
9. **Landmine de `useCrudForm`**: el hook valida **todos** los campos declarados, incluidos los que `DynamicFormFields` oculta por `showOnEdit`/`showOnCreate` → un campo required oculto bloquea el submit. Hoy sólo lo sufrirían páginas con `showOnCreate` + required (las de e-CF lo evitan declarando los campos por modo). **No se cambió el hook compartido** en esta feature (sería código compartido con riesgo de regresión): queda como deuda técnica con el test que la destapa.
10. **Rutas del módulo duplicadas**: la venta enlaza a `/facturacion/comprobantes` mediante `src/pages/Ventas/components/comprobantesRoute.ts` y el `App.tsx` la declara por su cuenta → si la ruta cambia, hay que tocar los dos lados.



### L9 — 2026-11-25 — reconciliación: la tabla de tareas queda solo con lo que falta

**T1-T13 cerradas** → la tabla queda vacía. El módulo está mergeado en `development` (`570e5f7` + `e62f616`): 8 services, 8 stores, 6 páginas (`src/pages/FacturacionElectronica/*`), rutas (`App.tsx:196-201`) y sus tests. El Goal que decía 'el frontend no consume ninguno de los diez endpoints de e-CF' quedó obsoleto. La evidencia de T11 ('permisos del módulo en MATRIZ_PERMISOS') quedó vieja: la matriz ya no vive en el front (`permisos.ts:40-42`; los permisos salen de la API, `3907340`). Los 'slices de entrega (PRs encadenados)' no aplican: no hay PRs que abrir. Del L8 quedan dos huecos sin fila: el back exige Admin/SuperAdmin en 6 escrituras y `ElectronicInvoiceSequenceDto` no expone 'anulado' (`RequiresExpiry` solo vuelve en la respuesta del save, y el PUT del rango no cambia emisor/tipo/from); y la mina de `useCrudForm` (valida `required` sin mirar `showOnEdit/showOnCreate` → un campo required oculto bloquea el submit).

## Tareas cerradas

Filas que salen de la tabla de tareas: el trabajo ya está hecho. El commit de cada una está en el Log.

| ID | Detalle |
|---|---|
| T1 | S4, S11 · writer — tipos de dominio de e-CF (§3.2 paso 1 ✓) · `b0fab79` (enums) · `3503e79` (DTOs) |
| T2 | S4, S11 · writer — services de e-CF + `ENDPOINTS` (§3.2 paso 2 ✓) · `f8d08ff` |
| T3 | S4, S11 · writer — stores de e-CF (§3.2 paso 3 ✓) · `dbd7a86` (configuración fiscal) · `d40a103` (operación) |
| T4 | S5 · writer — la venta muestra su estado fiscal · `474c19c` |
| T5 | S3, S6, S7, S11 · writer — emisores del tenant (§3.2 pasos 4-7 ✓) · `e40b414` |
| T6 | S3, S6, S11 · writer — rangos de e-NCF (§3.2 pasos 4-7 ✓) · `e40b414` |
| T7 | S3, S6, S11 · writer — certificados del emisor (§3.2 pasos 4-7 ✓) · `adbbe83` |
| T8 | S3, S7, S8, S9, S11 · writer — comprobantes: lista, veredicto, QR, retry, print (§3.2 pasos 4-7 ✓) · `544ce22` |
| T9 | S3, S6, S11 · writer — recepción de comprobantes de terceros (§3.2 pasos 4-7 ✓) · `adbbe83` |
| T10 | S3, S6, S11 · writer — modo de emisión, credenciales y secuencias normales (§3.2 pasos 4-7 ✓) · `544ce22` |
| T11 | S6 · inline (parent) — permisos del módulo en `MATRIZ_PERMISOS` · `6252b03` · `b513fd3` · `79b380c` |
| T12 | S1, S4 · inline (parent) — huecos reales del backend, documentados y no maquetados · Log L7 y L8 |
| T13 | S11 · inline (parent) — snippets del template actualizados en el mismo commit · `f8d08ff` (config.ts + fetchWithAuth) · `6aa4fa2` (App.tsx) |

