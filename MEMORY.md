# Volterp - ERP System

## Project Overview

ERP (Enterprise Resource Planning) system built with React + TypeScript + Vite.

> La referencia oficial de estructura y convenciones es `FRONTEND-SKELETON-TEMPLATE.md`.
> Este archivo es un resumen: cuando discrepen, manda el template y el código vivo.

## Tech Stack

- **Frontend**: React 19, TypeScript 6, Vite 8
- **Styling**: CSS Modules + CSS Variables (sin Tailwind)
- **Routing**: React Router v7
- **State**: Zustand 5 (stores globales) + estado local de React por página
- **HTTP**: `fetch` nativo envuelto en `fetchWithAuth` (JWT Bearer del tenant)
- **i18n**: react-i18next (`src/i18n/locales/es.json` y `en.json`)
- **Tests**: Vitest 4 + @testing-library/react
- **Build**: Vite (`yarn build` = `tsc -b` + `vite build`)

## Project Structure

```
src/
├── application/hooks/   # hooks de caso de uso (useNominaCalculator, useEmpleadoForm...)
├── assets/              # logo e imágenes
├── components/          # UI/, Layout/, Dashboard/, RRHH/, UserManagement/...
├── config/              # pagination.ts (ITEMS_PER_PAGE)
├── domain/              # capa de dominio
│   ├── constants/       # permisos, roles y enums del contrato
│   ├── entities/        # entidades de dominio (Asistencia, Beneficio, Nomina)
│   └── types/           # DTOs y tipos compartidos
├── hooks/               # useCrudForm, useFilter, usePagination, usePermission...
├── i18n/                # init + locales/es.json + locales/en.json
├── infrastructure/api/  # config.ts (API_CONFIG/ENDPOINTS), fetchWithAuth.ts, *Service.ts
├── pages/               # una carpeta por módulo
├── stores/              # un store Zustand por entidad
├── styles/              # variables.css y estilos globales
├── test/                # espejo de src/ (components, domain, hooks, infrastructure, pages, stores, utils)
└── utils/               # helpers (apiError, pagination, name...)
```

## Modules

1. **Dashboard** - KPIs, charts, recent activities
2. **Ventas** - Sales management with CRUD
3. **Compras** - Purchase management
4. **Inventario** - Product inventory
5. **Clientes** - Customer management
6. **Proveedores** - Supplier management
7. **Contabilidad** - Cuentas, CxC, CxP y transacciones
8. **RRHH** - Nómina y asistencia
9. **Proyectos** - Project tracking
10. **Reportes** - Reports
11. **Configuración** - Settings
12. **Facturación electrónica** - Emisores, rangos de e-NCF, certificados, comprobantes, recepción y configuración fiscal

## Design System

- **Colors**:
  - Primary: #FACC15 (yellow)
  - Sidebar: #1F2937 (dark)
  - Background: #F9FAFB
  - Cards: white with #E5E7EB border
- **Typography**: Plus Jakarta Sans
- **Components**: 40x40px circular avatars
- Los tokens viven en `src/styles/variables.css`: el código usa `var(--token)`, nunca hex literales.

## Features

- CRUD operations for all modules
- Table with pagination
- Toast notifications
- Search and filters
- Image cells for products/avatars
- Permisos por módulo y rol en `src/domain/constants/permisos.ts` (`MATRIZ_PERMISOS`)
- Autenticación con JWT del tenant; el backend resuelve la empresa desde el token

## Git

- **main**: Production branch
- **development**: Development branch
- Las features viven en `feature/*` y se entregan como PRs encadenados.

## To Do

- Conectar los módulos que todavía no tienen backend (cuentas, proyectos, invitaciones de usuario)
- Roles de caja bajo el permiso de Ventas
