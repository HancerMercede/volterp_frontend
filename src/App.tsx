import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { useAuthStore } from "./stores/authStore";
import { usePermissionStore } from "./stores/permissionStore";
import { ErrorBoundary, NotificationContainer } from "./components/UI";
import "./i18n";
import "./styles/variables.css";
import { PageLoader } from "./components/UI/PageLoader";

// Lazy-loaded pages — each becomes its own chunk
const Dashboard = lazy(() =>
  import("./pages/Dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Login = lazy(() =>
  import("./pages/Login/Login").then((m) => ({ default: m.Login })),
);
const ForgotPassword = lazy(() =>
  import("./pages/ForgotPassword/ForgotPassword").then((m) => ({
    default: m.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import("./pages/ResetPassword/ResetPassword").then((m) => ({
    default: m.ResetPassword,
  })),
);
const ActivateAccount = lazy(() =>
  import("./pages/ActivateAccount/ActivateAccount").then((m) => ({
    default: m.ActivateAccount,
  })),
);
const InvalidLink = lazy(() =>
  import("./pages/InvalidLink/InvalidLink").then((m) => ({
    default: m.InvalidLink,
  })),
);
const Ventas = lazy(() =>
  import("./pages/Ventas/Ventas").then((m) => ({ default: m.Ventas })),
);
const Pos = lazy(() =>
  import("./pages/POS/Pos").then((m) => ({ default: m.Pos })),
);
const Compras = lazy(() =>
  import("./pages/Compras/Compras").then((m) => ({ default: m.Compras })),
);
const Inventario = lazy(() =>
  import("./pages/Inventario/Inventario").then((m) => ({
    default: m.Inventario,
  })),
);
const Clientes = lazy(() =>
  import("./pages/Clientes/Clientes").then((m) => ({ default: m.Clientes })),
);
const Proveedores = lazy(() =>
  import("./pages/Proveedores/Proveedores").then((m) => ({
    default: m.Proveedores,
  })),
);
const Contabilidad = lazy(() =>
  import("./pages/Contabilidad/Contabilidad").then((m) => ({
    default: m.Contabilidad,
  })),
);
const Accounts = lazy(() =>
  import("./pages/Contabilidad/Accounts/Accounts").then((m) => ({
    default: m.Accounts,
  })),
);
const AccountsReceivable = lazy(() =>
  import("./pages/Contabilidad/AccountsReceivable/AccountsReceivable").then(
    (m) => ({ default: m.AccountsReceivable }),
  ),
);
const AccountsPayable = lazy(() =>
  import("./pages/Contabilidad/AccountsPayable/AccountsPayable").then((m) => ({
    default: m.AccountsPayable,
  })),
);
const RRHH = lazy(() =>
  import("./pages/RRHH/RRHH").then((m) => ({ default: m.RRHH })),
);
const Nomina = lazy(() =>
  import("./pages/RRHH/Nomina").then((m) => ({ default: m.Nomina })),
);
const Asistencia = lazy(() =>
  import("./pages/RRHH/Asistencia").then((m) => ({ default: m.Asistencia })),
);
const Proyectos = lazy(() =>
  import("./pages/Proyectos/Proyectos").then((m) => ({ default: m.Proyectos })),
);
const Reportes = lazy(() =>
  import("./pages/Reportes/Reportes").then((m) => ({ default: m.Reportes })),
);
const Configuracion = lazy(() =>
  import("./pages/Configuracion/Configuracion").then((m) => ({
    default: m.Configuracion,
  })),
);
const Soporte = lazy(() =>
  import("./pages/Soporte/Soporte").then((m) => ({ default: m.Soporte })),
);
const FacturacionElectronica = lazy(() =>
  import("./pages/FacturacionElectronica/FacturacionElectronica").then((m) => ({
    default: m.FacturacionElectronica,
  })),
);
const EcfIssuers = lazy(() =>
  import("./pages/FacturacionElectronica/Issuers/Issuers").then((m) => ({
    default: m.Issuers,
  })),
);
const EcfRanges = lazy(() =>
  import("./pages/FacturacionElectronica/Ranges/Ranges").then((m) => ({
    default: m.Ranges,
  })),
);
const EcfCertificates = lazy(() =>
  import("./pages/FacturacionElectronica/Certificates/Certificates").then(
    (m) => ({ default: m.Certificates }),
  ),
);
const EcfInvoices = lazy(() =>
  import("./pages/FacturacionElectronica/Invoices/Invoices").then((m) => ({
    default: m.Invoices,
  })),
);
const EcfReception = lazy(() =>
  import("./pages/FacturacionElectronica/Reception/Reception").then((m) => ({
    default: m.Reception,
  })),
);
const EcfSettings = lazy(() =>
  import("./pages/FacturacionElectronica/Settings/Settings").then((m) => ({
    default: m.Settings,
  })),
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const permissionStatus = usePermissionStore((state) => state.status);
  const loadPermissions = usePermissionStore((state) => state.load);

  // The permissions of the caller are asked once per session: the login
  // already asks them, and a session that comes back from the storage has to
  // ask for them again.
  useEffect(() => {
    if (isAuthenticated && permissionStatus === 'idle') {
      void loadPermissions();
    }
  }, [isAuthenticated, permissionStatus, loadPermissions]);

  if (!hasHydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/invalid-link" element={<InvalidLink />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/pos" element={<Pos />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/contabilidad" element={<Contabilidad />} />
          <Route path="/contabilidad/cuentas" element={<Accounts />} />
          <Route path="/contabilidad/cxc" element={<AccountsReceivable />} />
          <Route path="/contabilidad/cxp" element={<AccountsPayable />} />
          <Route path="/rrhh" element={<RRHH />} />
          <Route path="/rrhh/nomina" element={<Nomina />} />
          <Route path="/rrhh/asistencia" element={<Asistencia />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/facturacion" element={<FacturacionElectronica />} />
          <Route path="/facturacion/emisores" element={<EcfIssuers />} />
          <Route path="/facturacion/rangos" element={<EcfRanges />} />
          <Route path="/facturacion/certificados" element={<EcfCertificates />} />
          <Route path="/facturacion/comprobantes" element={<EcfInvoices />} />
          <Route path="/facturacion/recepcion" element={<EcfReception />} />
          <Route path="/facturacion/configuracion" element={<EcfSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary level="global">
        <AppRoutes />
      </ErrorBoundary>
      <NotificationContainer />
    </BrowserRouter>
  );
}

export default App;
