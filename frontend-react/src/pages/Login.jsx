import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isRegistering) {
                // Crear usuario
                await api.post('/auth/register', { ...formData, role: 'ADMIN' });
                alert("Administrador creado con éxito. Ahora puedes iniciar sesión.");
                setIsRegistering(false);
                setFormData({ username: '', password: '' });
            } else {
                // Iniciar sesión
                const response = await api.post('/auth/login', formData);

                // Guardar el token y datos del usuario en el navegador
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.user.username);

                // Redirigir al inventario
                navigate('/inventario');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Ocurrió un error en el servidor");
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #334155' }}>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                    <img src="/logo.svg" alt="Logo" style={{ width: '40px', height: '40px' }} />
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#f8fafc' }}>
                        Omni<span style={{ color: '#3b82f6' }}>Stock</span>
                    </h1>
                </div>

                <h2 style={{ color: '#f8fafc', fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>
                    {isRegistering ? 'Crear Administrador' : 'Iniciar Sesión'}
                </h2>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Usuario</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Contraseña</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                    >
                        {isRegistering ? 'Registrar Usuario' : 'Acceder al Sistema'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        type="button"
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isRegistering ? 'Ya tengo una cuenta' : 'Crear el primer administrador'}
                    </button>
                </div>
            </div>
        </div>
    );
}