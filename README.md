# Volterp ERP — Frontend (erp-mvp)

ERP frontend built with React 19, TypeScript 6, and Vite. Consumes the [Volterp Backend API](https://github.com/HancerMercede/volterp_backend).

## Documentation

- **[Guía del frontend (PDF)](docs/guia-frontend.pdf)** — la guía de cómo se construye este front: los módulos, el código, los patrones y cómo trabajamos. La produce el template (`FRONTEND-SKELETON-TEMPLATE.md`) y se regenera de ahí, no se edita a mano.
- **[Manual del usuario (PDF)](docs/manual-usuario.pdf)** — cada pantalla del sistema y cómo se hace cada cosa, paso a paso. La fuente vive en [`docs/manual-usuario.md`](docs/manual-usuario.md).
- El template vivo: [`FRONTEND-SKELETON-TEMPLATE.md`](FRONTEND-SKELETON-TEMPLATE.md).
- Lo que el sistema ofrece, en palabras: [`docs/QUE-OFRECEMOS.md`](docs/QUE-OFRECEMOS.md) · [`docs/SISTEMA-INVENTARIO.md`](docs/SISTEMA-INVENTARIO.md).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Bundler | Vite 8 |
| State Management | Zustand 5 |
| Routing | React Router 7 |
| i18n | i18next + react-i18next |
| Charts | Recharts |
| Styling | CSS Modules + global design tokens (CSS variables) |
| Testing | Vitest 4, @testing-library/react, jsdom |
| HTTP | Native fetch (custom wrapper: `fetchWithAuth`) |

## Architecture

```
src/
├── domain/          — Types, constants, domain logic
│   ├── types/       — DTOs and shared type definitions
│   ├── constants/   — Roles, permissions, enums
│   ├── entities/    — Domain entity definitions
│   └── dashboard/   — Dashboard data and helpers
├── infrastructure/  — API layer
│   ├── api/         — fetchWithAuth wrapper, endpoint config, per-resource services
├── application/     — Application-level read models and orchestration hooks
│   └── hooks/       — useDashboard, useAccountsReceivable/Payable, useNominaCalculator, useEmpleadoForm
├── stores/          — Zustand stores (one per domain entity)
├── components/      — Reusable UI components (container/presentational)
├── pages/           — Route-level page components
├── hooks/           — Custom React hooks
├── i18n/            — Internationalization translations (locales/es.json, locales/en.json)
├── config/          — App configuration (pagination, etc.)
├── utils/           — Shared utilities (JWT, currency, initials, search normalization)
├── styles/          — Global design tokens (variables.css)
├── data/            — Static/mock data
└── test/            — Test utilities, setup and test suites
```

### State Management

Each domain entity has a dedicated Zustand store in `src/stores/`. Stores own the API call, loading state and error state for that entity.

**Stores (17):** `authStore`, `accountStore`, `clienteStore`, `proveedorStore`, `productoStore`, `ventaStore`, `compraStore`, `empleadoStore`, `categoryStore`, `companyStore`, `proyectoStore`, `transaccionStore`, `dashboardStore`, `uiStore`, `languageStore`, `asistenciaStore`, `chatStore`

**Persisted to `localStorage` (8):** `authStore`, `companyStore`, `languageStore`, `productoStore`, `categoryStore`, `proveedorStore`, `ventaStore`, `asistenciaStore`

### Data Flow

```
Pages → Stores (Zustand) → API Services → fetchWithAuth → Backend API
        ↕
  Domain Types (DTOs)
```

Most CRUD pages go through a store. Three deliberate exceptions exist:

- Auth pages (`Login`, `ForgotPassword`, `ResetPassword`, `ActivateAccount`) and `UserManagement` call the services directly.
- CxC / CxP are read models: application hooks aggregate `saleService` / `purchaseService` results without going through a store.
- State is applied **after** the awaited service call resolves — there is no optimistic update layer.

### Authentication & Permissions

- Six roles: `superadmin`, `admin`, `ventas`, `inventario`, `contabilidad`, `rrhh` (`src/domain/constants/roles.ts`).
- A per-module matrix grants `read` / `write` / `delete` over 11 modules (`src/domain/constants/permisos.ts`).
- The sidebar hides modules the role cannot read, and `ProtectedRoute` only enforces authentication.
- **The backend is the permission authority.** The frontend gate is a UX layer on top of it.
- Exception: the Accounts page derives its write gate from the **role** (admin / superadmin) instead of the matrix, and enforces it in the write path, not only in the DOM.
- `fetchWithAuth` injects the bearer token and handles `401` by logging out with an expired-session notice; a proactive JWT expiry hook covers the case where the token dies mid-session.
- "Remember me" chooses `localStorage` (persistent) or `sessionStorage` (per-tab) for the session.

### Internationalization

- i18next + react-i18next, single `translation` namespace, resources in `src/i18n/locales/es.json` and `en.json`.
- Initial language: the saved preference, else the browser locale, falling back to Spanish.
- The switch lives in **Configuración → General** and updates both i18next and `localStorage`.
- User-facing copy — including the login panel branding — is translated, not hardcoded.

### Design System

- Global tokens (color, spacing, radius, shadow, typography) live in `src/styles/variables.css`.
- Components and pages use CSS Modules for layout; there is no dark-mode variant.
- Typography is Plus Jakarta Sans, loaded from Google Fonts in `index.html`.

### Pages

| Route | Page | Data |
|-------|------|------|
| `/login` | Login | API (`authService`) |
| `/forgot-password` | Forgot password | API (`authService`) |
| `/reset-password` | Reset password | API (`authService`) |
| `/activate-account` | Activate account | API (`authService`) |
| `/invalid-link` | Invalid link | Static |
| `/` | Dashboard with metrics and charts | API (`dashboardService`, read-only) |
| `/ventas` | Sales management + embedded POS | API (`saleService`, CRUD) |
| `/compras` | Purchases management + line-item editor | API (`purchaseService`, CRUD) |
| `/inventario` | Inventory / Products | API (`productService`, CRUD) |
| `/clientes` | Clients | API (`clientService`, CRUD) |
| `/proveedores` | Suppliers | API (`supplierService`, CRUD) |
| `/contabilidad` | Accounting transactions | API (`accountingTransactionService`, CRUD) |
| `/contabilidad/cuentas` | Chart of accounts | API (`accountService`, CRUD, role-gated) |
| `/contabilidad/cxc` | Accounts receivable | Read model over `saleService` |
| `/contabilidad/cxp` | Accounts payable | Read model over `purchaseService` |
| `/rrhh` | Employees (HR) | API (`employeeService`, CRUD) |
| `/rrhh/nomina` | Payroll | Local calculation over employee data |
| `/rrhh/asistencia` | Attendance | Local, persisted |
| `/proyectos` | Projects | API (`projectService`, CRUD) |
| `/reportes` | Reports | Local projection of current stores |
| `/configuracion` | Settings / Company config | API (`companyService`, `userService`) |
| `/facturacion` | Hub de facturación electrónica | API (8 services de e-CF) |
| `/facturacion/emisores` | Emisores del tenant | API (`companyIssuerService`) |
| `/facturacion/rangos` | Rangos de e-NCF | API (`electronicInvoiceSequenceService`) |
| `/facturacion/certificados` | Certificados de firma | API (`companyCertificateService`) |
| `/facturacion/comprobantes` | Comprobantes emitidos, veredicto, QR y reintento | API (`electronicInvoiceService`) |
| `/facturacion/recepcion` | Decisión comercial de comprobantes recibidos | API (`receivedElectronicInvoiceService`) |
| `/facturacion/configuracion` | Modo de emisión, contingencia, credenciales y secuencias normales | API (`companyEmissionModeService`, `apiCredentialService`, `normalFiscalSequenceService`) |
| `/soporte` | Support / Chat | Local, no backend |

The POS is an overlay inside `/ventas` (full-screen catalog, cart, ITBIS/total, draft and checkout), not a separate route.

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/HancerMercede/erp-mvp.git
   cd erp-mvp
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure the environment in `.env`:
   ```env
   VITE_API_URL=http://localhost:5106
   ```
   The endpoint paths already include the `/api` prefix (`src/infrastructure/api/config.ts`), so the base URL must **not** add it again.

4. Start the dev server:
   ```bash
   yarn dev
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview production build |
| `yarn test` | Run tests (Vitest, watch mode) |
| `yarn test -- --run` | Run the suite once and exit |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn lint` | Run ESLint |

## Testing

Uses Vitest with Testing Library. Tests follow AAA (Arrange-Act-Assert) pattern.

```bash
# Run the whole suite once
yarn test -- --run

# With coverage
yarn test:coverage
```

- Configured in `vite.config.ts`: `jsdom` environment, globals enabled, setup file `src/test/setup.ts`, pattern `src/**/*.{test,spec}.*`.
- 50 test files live under `src/test/` (components, pages, stores, hooks, utils), covering auth flows, UI primitives, Dashboard, Ventas/POS, Compras, Inventario, Configuración and the Contabilidad pages.
- Tests are excluded from `tsc -b`, so `yarn build` does not type-check them.
- **Windows caveat:** the default `forks` pool times out on this machine — run with `--pool=threads` and do not run two Vitest instances at the same time.

## Current Status

The frontend is API-backed for most modules, but a few areas are still local or incomplete:

- `Reportes` projects the current store arrays and issues **no fetch on mount**, so it can render empty or stale data.
- `Soporte` is a local keyword bot; there is no support API.
- `Asistencia` is mock data persisted in `localStorage`; `Nómina` is calculated locally from employee data.
- In `Configuración`, IVA, currency and timezone are local-only and their Save button has no handler.
- POS checkout follows the status dropdown, so it can submit a sale as `Pending`.
- CxC / CxP aggregate the first 100 sales / purchases; Accounts loads 200 records and paginates the tree in memory.
- The Accounts write gate is derived from the role, not from the shared permission matrix.
- There is no frontend multi-tenancy: company scoping is enforced by the backend.
- **Facturación electrónica** consume el contrato e-CF del backend con el JWT del tenant. Dos huecos del backend quedan visibles en la UI y no se maquillan: no existe `GET /api/electronic-invoices/{id}` (el detalle sale de la superficie de estado `GET /api/electronic-invoices/state`) ni listado de comprobantes recibidos para navegador (la recepción real exige mTLS, sólo hay `POST /api/ElectronicInvoiceReception/{id}/commercial-approval`). El backend tampoco expone DELETE de emisores, rangos ni certificados.

Detail and evidence live in [`docs/audit/multi-tenancy-frontend-investigation.md`](docs/audit/multi-tenancy-frontend-investigation.md).

## Related

- [Backend API (volterp_backend)](https://github.com/HancerMercede/volterp_backend) — .NET 10 Clean Architecture API
- [MapFlow](https://github.com/HancerMercede/MapFlow) — DTO mapping library used by the backend
- [`FRONTEND-SKELETON-TEMPLATE.md`](FRONTEND-SKELETON-TEMPLATE.md) — original skeleton specification
- [`odd/tasks/`](odd/tasks/) — feature plans and their task-level status
- [`docs/audit/`](docs/audit/) — audits and investigation notes
