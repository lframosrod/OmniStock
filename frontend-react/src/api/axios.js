import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de peticiones
api.interceptors.request.use(config => {
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
    return Promise.reject(error);
});

export default api;