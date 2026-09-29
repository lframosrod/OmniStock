import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Inventory from './pages/Inventory';

const Layout = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

    {/* Navbar Profesional ajustada al ancho total con padding simétrico */}
    <header style={{
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <img src="/logo.svg" alt="OmniStock Logo" style={{ width: '32px', height: '32px' }} />
      <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', letterSpacing: '0.5px' }}>
        Omni<span style={{ color: '#3b82f6' }}>Stock</span>
      </h1>
    </header>

    {/* Contenedor Principal Fluid (Ancho completo con márgenes limpios de 32px) */}
    <main style={{ padding: '24px 32px', width: '100%', boxSizing: 'border-box' }}>
      <Outlet />
    </main>

  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/inventario" replace />} />
          <Route path="inventario" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter >
  );
}

export default App;