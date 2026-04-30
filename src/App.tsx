import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Ventas } from './pages/Ventas/Ventas';
import { Compras } from './pages/Compras/Compras';
import { Inventario } from './pages/Inventario/Inventario';
import { Clientes } from './pages/Clientes/Clientes';
import { Reportes } from './pages/Reportes/Reportes';
import { Configuracion } from './pages/Configuracion/Configuracion';
import { ERPProvider, UIProvider } from './context';
import { ToastContainer } from './components/UI';
import './styles/variables.css';

function App() {
  return (
    <UIProvider>
      <ERPProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/compras" element={<Compras />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/configuracion" element={<Configuracion />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ERPProvider>
    </UIProvider>
  );
}

export default App;