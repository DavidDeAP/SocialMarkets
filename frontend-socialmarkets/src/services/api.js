import axios from 'axios';

// Creamos una instancia de Axios
const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

// Añade el token automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Captura errores globales
api.interceptors.response.use(
    (response) => response, 
    (error) => {
        // Si el servidor responde 401 (No autorizado), significa que el token es inválido o ha expirado
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada. Redirigiendo al login...");
            localStorage.removeItem('token'); // Limpiamos el token antiguo
            window.location.href = '/login';   // Redirección al login
        }
        return Promise.reject(error);
    }
);

export default api;