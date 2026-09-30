import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        movementsToday: 0,
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard/summary');
                setStats(response.data.data);
            } catch (error) {
                console.error("Error al cargar los datos del dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Cargando panel analítico...</div>;
    }

    return (
        <>
            <style>{`
        .dashboard-container { display: flex; flexDirection: column; gap: 24px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .metric-card { background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .metric-title { font-size: 14px; color: #94a3b8; font-weight: 500; margin-bottom: 8px; }
        .metric-value { font-size: 32px; color: #f8fafc; font-weight: 700; }
        .chart-card { background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 10px; }
      `}</style>

            <div className="dashboard-container">
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>Dashboard Analítico</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Resumen general de las operaciones de inventario.</p>
                </div>

                {/* Tarjetas de KPIs (Indicadores Clave) */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-title">Total de Productos</div>
                        <div className="metric-value">{stats.totalProducts}</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-title">Movimientos Registrados Hoy</div>
                        <div className="metric-value" style={{ color: '#34d399' }}>{stats.movementsToday}</div>
                    </div>
                </div>

                {/* Gráfica de Actividad */}
                <div className="chart-card">
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
                        Top 5 Productos con Mayor Actividad
                    </h3>

                    {stats.chartData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No hay suficientes movimientos registrados para mostrar la gráfica.
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
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