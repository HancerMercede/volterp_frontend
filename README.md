# Volterp ERP — Frontend (erp-mvp)

ERP frontend built with React 19, TypeScript 6, and Vite. Consumes the [Volterp Backend API](https://github.com/HancerMercede/volterp_backend).

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
| Testing | Vitest 4, @testing-library/react |
| HTTP | Native fetch (custom wrapper) |

## Architecture

```
src/
├── domain/          — Types, constants, domain logic
│   ├── types/       — DTOs and shared type definitions
│   ├── constants/   — Roles, permissions, enums
│   ├── entities/    — Domain entity definitions
│   └── dashboard/   — Dashboard data and helpers
├── infrastructure/  — API services, repository abstractions
│   └── api/         — fetchWithAuth wrapper + per-resource services
├── stores/          — Zustand stores (one per domain entity)
├── components/      — Reusable UI components (container/presentational)
├── pages/           — Route-level page components
├── hooks/           — Custom React hooks
├── i18n/            — Internationalization translations
├── config/          — App configuration (pagination, etc.)
├── utils/           — Shared utilities (JWT helpers, etc.)
├── styles/          — Global styles
├── data/            — Static/mock data
└── test/            — Test utilities and setup
```

### State Management

Each domain entity has a dedicated Zustand store in `src/stores/`. Stores handle API calls, loading state, and optimistic updates.

**Stores:** `authStore`, `clienteStore`, `proveedorStore`, `productoStore`, `ventaStore`, `compraStore`, `empleadoStore`, `categoryStore`, `companyStore`, `transaccionStore`, `dashboardStore`, `uiStore`, `languageStore`, `asistenciaStore`, `chatStore`, `proyectoStore`

### Data Flow

```
Pages → Stores (Zustand) → API Services → fetchWithAuth → Backend API
                              ↕
                        Domain Types (DTOs)
```

### Pages

| Route | Page |
|-------|------|
| `/login` | Login / Register |
| `/dashboard` | Dashboard with metrics and charts |
| `/ventas` | Sales management |
| `/compras` | Purchases management |
| `/inventario` | Inventory / Products |
| `/clientes` | Clients |
| `/proveedores` | Suppliers |
| `/rrhh` | Employees (HR) |
| `/contabilidad` | Accounting transactions |
| `/proyectos` | Projects |
| `/reportes` | Reports |
| `/configuracion` | Settings / Company config |
| `/soporte` | Support / Chat |

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
   VITE_API_URL=http://localhost:5000/api
   ```

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
| `yarn test` | Run tests (Vitest) |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn lint` | Run ESLint |

## Testing

Uses Vitest with Testing Library. Tests follow AAA (Arrange-Act-Assert) pattern.

```bash
# Run all tests
yarn test

# With coverage
yarn test:coverage
```

## Related

- [Backend API (volterp_backend)](https://github.com/HancerMercede/volterp_backend) — .NET 10 Clean Architecture API
- [MapFlow](https://github.com/HancerMercede/MapFlow) — DTO mapping library used by the backend
