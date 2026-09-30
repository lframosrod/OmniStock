import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        movementsToday: 0,
        lowStockCount: 0, // <-- Nuevo indicador
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Obtener datos analíticos generales
            const summaryRes = await api.get('/dashboard/summary');

            // 2. Obtener productos para calcular el stock bajo (<= 5 unidades)
            const productsRes = await api.get('/products?limit=100');
            const lowStockItems = productsRes.data.data.filter(p => p.current_stock <= 5).length;

            setStats({
                ...summaryRes.data.data,
                lowStockCount: lowStockItems
            });
        } catch (error) {
            console.error("Error al cargar los datos del dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Cargando panel analítico...</div>;
    }

    return (
        <>
            <style>{`
        .dashboard-container { display: flex; flex-direction: column; gap: 24px; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .metric-card { background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .metric-title { font-size: 14px; color: #94a3b8; font-weight: 500; margin-bottom: 8px; }
        .metric-value { font-size: 32px; color: #f8fafc; font-weight: 700; }
        .chart-card { background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 10px; }
        .btn-refresh { background-color: #334155; color: #f8fafc; border: 1px solid #475569; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
        .btn-refresh:hover { background-color: #475569; }
      `}</style>

            <div className="dashboard-container">

                {/* Encabezado con Botón de Refrescar */}
                <div className="dashboard-header">
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>Dashboard Analítico</h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Resumen general y métricas en tiempo real de operaciones.</p>
                    </div>
                    <button onClick={fetchDashboardData} className="btn-refresh">
                        🔄 Actualizar Datos
                    </button>
                </div>

                {/* Tarjetas de KPIs (Indicadores Clave con Stock Bajo integrado) */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-title">Total de Productos</div>
                        <div className="metric-value">{stats.totalProducts}</div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-title">Movimientos Registrados Hoy</div>
                        <div className="metric-value" style={{ color: '#34d399' }}>{stats.movementsToday}</div>
                    </div>

                    <div className="metric-card" style={{ borderColor: stats.lowStockCount > 0 ? 'rgba(239, 68, 68, 0.4)' : '#334155' }}>
                        <div className="metric-title">Alertas de Stock Bajo (≤ 5)</div>
                        <div className="metric-value" style={{ color: stats.lowStockCount > 0 ? '#ef4444' : '#34d399' }}>
                            {stats.lowStockCount}
                        </div>
                    </div>
                </div>

                {/* Gráfica de Actividad con Eje X optimizado */}
                <div className="chart-card">
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
                        Top 5 Productos con Mayor Actividad
                    </h3>

                    {stats.chartData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No hay suficientes movimientos registrados para mostrar la gráfica.
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '380px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        interval={0}
                                        angle={-20}
                                        textAnchor="end"
                                        height={50}
                                    />
                                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="movimientos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}