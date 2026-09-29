import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de peticiones: Inyectamos el Token JWT si existe
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor de respuestas
api.interceptors.response.use(response => {
    // Apagar spinner global
    return response;
}, error => {
    // Apagar spinner global y registrar errores
    console.error('Error de API:', error.response?.data || error.message);

    // Si el token expira o es inválido, forzar cierre de sesión
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    return Promise.reject(error);
});

export default api;