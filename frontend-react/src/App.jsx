import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Inventory from './pages/Inventory';

const Layout = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
      <img src="/logo.svg" alt="OmniStock Logo" style={{ width: '40px', height: '40px' }} />
      <h1 style={{ margin: 0 }}>OmniStock</h1>
    </header>
    <hr style={{ borderColor: '#374151', marginBottom: '20px' }} />
    <main>
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