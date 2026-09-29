import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'ADMIN' });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', newUser);
            setNewUser({ username: '', password: '', role: 'ADMIN' });
            setShowForm(false);
            fetchUsers();
        } catch (error) {
            alert("Error al crear usuario. Revisa que el nombre no esté duplicado.");
        }
    };

    return (
        <>
            <style>{`
        .card { background-color: #1e293b; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #334155; padding: 24px; }
        .os-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .os-table th { background-color: #0f172a; color: #94a3b8; text-transform: uppercase; font-size: 12px; font-weight: 600; padding: 16px; text-align: left; border-bottom: 1px solid #334155; }
        .os-table td { padding: 16px; border-bottom: 1px solid #334155; color: #cbd5e1; font-size: 14px; }
        .os-table tbody tr:hover { background-color: #0f172a; transition: background-color 0.2s ease; }
        .badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; }
        .badge-admin { background-color: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
        .badge-operador { background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .btn { border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background-color: #3b82f6; color: white; }
        .btn-primary:hover { background-color: #2563eb; }
        .btn-success { background-color: #10b981; color: white; }
        .btn-success:hover { background-color: #059669; }
        .btn-secondary { background-color: #475569; color: white; }
        .btn-secondary:hover { background-color: #334155; }
        .input-field { width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid #475569; background-color: #0f172a; color: white; font-size: 14px; }
        .input-field:focus { outline: none; border-color: #3b82f6; }
      `}</style>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Gestión de Usuarios</h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Administra el acceso al sistema.</p>
                    </div>
                    <button
                        className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? '✕ Cancelar' : '+ Nuevo Usuario'}
                    </button>
                </div>

                {showForm && (
                    <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #334155' }}>
                        <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flexGrow: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Usuario</label>
                                <input type="text" required className="input-field" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Contraseña</label>
                                <input type="password" required className="input-field" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Rol</label>
                                <select className="input-field" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="OPERADOR">Operador</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-success" style={{ padding: '10px 20px' }}>Guardar</button>
                        </form>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table className="os-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre de Usuario</th>
                                <th>Rol del Sistema</th>
                                <th>Fecha de Creación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td style={{ color: '#94a3b8' }}>#{user.id}</td>
                                    <td style={{ fontWeight: '600', color: '#f8fafc' }}>{user.username}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-operador'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No hay usuarios registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}