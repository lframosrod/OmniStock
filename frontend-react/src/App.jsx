import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Inventory from './pages/Inventory';
import api from './api/axios'; // Importamos Axios para la petición

const Layout = () => {

  // Función para exportar el Kardex global
  const exportGlobalKardex = async () => {
    try {
      const response = await api.get('/movements/all');
      const movements = response.data.data;

      if (movements.length === 0) {
        alert("No hay movimientos registrados en el sistema.");
        return;
      }

      // Columnas adicionales para el producto y SKU
      const headers = ["Fecha y Hora", "Producto", "SKU", "Tipo", "Cantidad", "Notas / Justificación"];

      const rows = movements.map(mov => {
        const date = new Date(mov.created_at).toLocaleString().replace(/,/g, '');
        const product = `"${mov.product_name.replace(/"/g, '""')}"`; // Escapar comillas
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* Navbar con Flexbox para separar el logo del botón */}
      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '14px 32px',
        display: 'flex',
        justifyContent: 'space-between', /* Separa los elementos a los extremos */
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Sección Izquierda: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.svg" alt="OmniStock Logo" style={{ width: '32px', height: '32px' }} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', letterSpacing: '0.5px' }}>
            Omni<span style={{ color: '#3b82f6' }}>Stock</span>
          </h1>
        </div>

        {/* Sección Derecha: Botón de Reporte */}
        <button
          onClick={exportGlobalKardex}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #475569',
            color: '#cbd5e1',
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
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
        >
          📥 Reporte Global
        </button>
      </header>

      {/* Contenedor Principal Fluid */}
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/inventario" replace />} />
          <Route path="inventario" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;