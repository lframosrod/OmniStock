import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Inventory from './pages/Inventory';

const Layout = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <header>
      <h1>📦 OmniStock</h1>
      <hr />
    </header>
    <main style={{ marginTop: '20px' }}>
      {/* Aquí se renderizará el componente Inventory */}
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
    </BrowserRouter>
  );
}

export default App;