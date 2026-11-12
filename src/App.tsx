import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { useAuthStore } from "./stores/authStore";
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
const Transactions = lazy(() =>
  import("./pages/Contabilidad/Transactions/Transactions").then((m) => ({
    default: m.Transactions,
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated } = useAuthStore();

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
          <Route path="/compras" element={<Compras />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/contabilidad" element={<Contabilidad />} />
          <Route
            path="/contabilidad/transacciones"
            element={<Transactions />}
          />
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
