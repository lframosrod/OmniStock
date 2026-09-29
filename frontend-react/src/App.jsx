import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, NavLink } from 'react-router-dom';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Users from './pages/Users';
import api from './api/axios';

// Componente para proteger las rutas privadas (validación de rol)
const PrivateRoute = ({ children, requireAdmin }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Si no hay sesión, al Login
  if (!token) return <Navigate to="/login" replace />;

  // Si la ruta requiere ser ADMIN y el usuario no lo es, regresarlo al inventario
  if (requireAdmin && role !== 'ADMIN') return <Navigate to="/inventario" replace />;

  return children;
};

const Layout = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role'); // <-- Recuperar el rol guardado

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role'); // <-- Limpiar el rol al salir
    navigate('/login');
  };

  const exportGlobalKardex = async () => {
    try {
      const response = await api.get('/movements/all');
      const movements = response.data.data;

      if (movements.length === 0) {
        alert("No hay movimientos registrados en el sistema.");
        return;
      }

      const headers = ["Fecha y Hora", "Producto", "SKU", "Tipo", "Cantidad", "Notas / Justificación"];

      const rows = movements.map(mov => {
        const date = new Date(mov.created_at).toLocaleString().replace(/,/g, '');
        const product = `"${mov.product_name.replace(/"/g, '""')}"`;
        const sku = mov.sku;
        const type = mov.movement_type;
        const qty = mov.quantity;
        const notes = mov.notes ? `"${mov.notes.replace(/"/g, '""')}"` : "";

        return [date, product, sku, type, qty, notes].join(",");
      });

      const csvContent = ["\uFEFF" + headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `kardex_global_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar el Kardex global:", error);
      alert("Ocurrió un error al generar el reporte.");
    }
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#f8fafc' : '#94a3b8',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: isActive ? '#334155' : 'transparent',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '14px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.svg" alt="OmniStock Logo" style={{ width: '32px', height: '32px' }} />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', letterSpacing: '0.5px' }}>
              Omni<span style={{ color: '#3b82f6' }}>Stock</span>
            </h1>
          </div>

          <nav style={{ display: 'flex', gap: '10px' }}>
            <NavLink to="/inventario" style={navLinkStyle}>Inventario</NavLink>

            {/* Solo mostrar la pestaña de Usuarios si es ADMIN */}
            {role === 'ADMIN' && (
              <NavLink to="/usuarios" style={navLinkStyle}>Usuarios</NavLink>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          <span style={{ color: '#94a3b8', fontSize: '14px' }}>
            Hola, <strong style={{ color: '#f8fafc' }}>{username}</strong>
          </span>

          {/* Solo mostrar el botón de Reporte Global si es ADMIN */}
          {role === 'ADMIN' && (
            <button
              onClick={exportGlobalKardex}
              style={{
                backgroundColor: '#3b82f6',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
            >
              📥 Reporte Global
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ef4444',
              color: '#ef4444',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Cerrar Sesión
          </button>

        </div>
      </header>

      <main style={{ padding: '24px 32px', width: '100%', boxSizing: 'border-box' }}>
        <Outlet />
      </main>

    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/inventario" replace />} />
          <Route path="inventario" element={<Inventory />} />

          {/* Proteger la ruta de usuarios con requireAdmin={true} */}
          <Route path="usuarios" element={
            <PrivateRoute requireAdmin={true}>
              <Users />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;