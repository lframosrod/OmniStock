import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Inventory from './pages/Inventory';
import api from './api/axios';

const Layout = () => {

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.svg" alt="OmniStock Logo" style={{ width: '32px', height: '32px' }} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', letterSpacing: '0.5px' }}>
            Omni<span style={{ color: '#3b82f6' }}>Stock</span>
          </h1>
        </div>

        {/* Botón actualizado al color azul sólido (Primary) */}
        <button
          onClick={exportGlobalKardex}
          style={{
            backgroundColor: '#3b82f6', // Azul sólido
            border: 'none',             // Sin borde
            color: 'white',             // Texto blanco
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
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }} // Azul más oscuro en Hover
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}  // Vuelve al color original
        >
          📥 Reporte Global
        </button>
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/inventario" replace />} />
          <Route path="inventario" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;