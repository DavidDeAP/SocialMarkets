import axios from 'axios';

// Creamos una instancia de Axios
const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

// Función para verificar si el token ha expirado
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        // exp está en segundos, Date.now() en milisegundos
        return (exp * 1000) < Date.now();
    } catch (e) {
        return true;
    }
};

// Añade el token automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    if (token && isTokenExpired(token)) {
        console.warn("Token detectado como expirado antes de la petición.");
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error("Token expirado"));
    }

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
        // Si el servidor responde 401 o el token ya no es válido
        if (error.response && error.response.status === 401) {
            console.warn("Sesión no autorizada o expirada.");
            localStorage.removeItem('token');
            // Evitamos bucles si ya estamos en login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;