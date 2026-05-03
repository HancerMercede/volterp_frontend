import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Ventas } from './pages/Ventas/Ventas';
import { Compras } from './pages/Compras/Compras';
import { Inventario } from './pages/Inventario/Inventario';
import { Clientes } from './pages/Clientes/Clientes';
import { Proveedores } from './pages/Proveedores/Proveedores';
import { Contabilidad } from './pages/Contabilidad/Contabilidad';
import { RRHH } from './pages/RRHH/RRHH';
import { Nomina } from './pages/RRHH/Nomina';
import { Proyectos } from './pages/Proyectos/Proyectos';
import { Reportes } from './pages/Reportes/Reportes';
import { Configuracion } from './pages/Configuracion/Configuracion';
import { Login } from './pages/Login/Login';
import { ERPProvider, UIProvider, AuthProvider, useAuth } from './context';
import { ToastContainer } from './components/UI';
import './styles/variables.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/contabilidad" element={<Contabilidad />} />
        <Route path="/rrhh" element={<RRHH />} />
        <Route path="/rrhh/nomina" element={<Nomina />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <UIProvider>
      <ERPProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <ToastContainer />
          </BrowserRouter>
        </AuthProvider>
      </ERPProvider>
    </UIProvider>
  );
}

export default App;