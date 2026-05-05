# Volterp - ERP System

## Project Overview
ERP (Enterprise Resource Planning) system built with React + TypeScript + Vite.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules, CSS Variables
- **Routing**: React Router v6
- **State**: React Context (ERPContext, UIContext)
- **Build**: Yarn

## Project Structure
```
src/
├── api/                 # API layer (for .NET backend)
│   ├── config/          # API configuration
│   ├── client.ts       # HTTP client
│   ├── types/          # TypeScript interfaces
│   └── services/       # API services
├── components/         # Reusable components
│   ├── UI/             # Button, Table, Pagination, Toast, etc.
│   ├── Layout/         # Sidebar, Layout
│   └── Dashboard/      # Dashboard components
├── context/            # React Context providers
│   ├── ERPContext.ts   # Business data state
│   └── UIContext.ts    # UI state (toasts, loading)
├── data/               # Mock data
├── domain/             # Domain layer (Clean Architecture)
│   └── dashboard/      # Dashboard types & constants
├── hooks/              # Custom hooks
├── pages/              # Page components
│   ├── Dashboard/
│   ├── Ventas/
│   ├── Compras/
│   ├── Inventario/
│   ├── Clientes/
│   ├── Proveedores/    # NEW
│   ├── Contabilidad/   # NEW
│   ├── RRHH/           # NEW
│   ├── Proyectos/      # NEW
│   ├── Reportes/
│   └── Configuracion/
├── utils/              # Utilities (pagination)
└── styles/             # Global styles & variables
```

## Modules
1. **Dashboard** - KPIs, charts, recent activities
2. **Ventas** - Sales management with CRUD
3. **Compras** - Purchase management
4. **Inventario** - Product inventory
5. **Clientes** - Customer management
6. **Proveedores** - Supplier management
7. **Contabilidad** - Financial transactions
8. **RRHH** - Employee management
9. **Proyectos** - Project tracking
10. **Reportes** - Reports
11. **Configuración** - Settings

## Design System
- **Colors**:
  - Primary: #FACC15 (yellow)
  - Sidebar: #1F2937 (dark)
  - Background: #F9FAFB
  - Cards: white with #E5E7EB border
- **Typography**: Plus Jakarta Sans
- **Components**: 40x40px circular avatars

## Features
- CRUD operations for all modules
- Table with pagination
- Toast notifications
- Search and filters
- Image cells for products/avatars

## Git
- **main**: Production branch
- **development**: Development branch

## To Do
- Connect to .NET API
- Implement authentication
- Add unit tests