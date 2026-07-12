import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { useAuthStore } from "./stores/authStore";
import { ErrorBoundary, NotificationContainer } from "./components/UI";
import "./i18n";
import "./styles/variables.css";

// Lazy-loaded pages — each becomes its own chunk
const Dashboard = lazy(() =>
  import("./pages/Dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Login = lazy(() =>
  import("./pages/Login/Login").then((m) => ({ default: m.Login })),
);
const Register = lazy(() =>
  import("./pages/Register/Register").then((m) => ({ default: m.Register })),
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

function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "#6B7280",
        fontSize: "0.95rem",
      }}
    >
      <span>Loading...</span>
    </div>
  );
}

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
        <Route path="/register" element={<Register />} />
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
