import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Comunidad from './pages/Comunidad';
import Clasificacion from './pages/Clasificacion';
import Mercados from './pages/Mercados';
import Noticias from './pages/Noticias';
import FAQ from './pages/FAQ';
import Ajustes from './pages/Ajustes';
import { SettingsProvider } from './context/SettingsContext';
import './App.css';

/**
 * Componente para proteger rutas que requieren estar logueado
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

/**
 * Componente para rutas públicas que no deben verse si ya estás logueado
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/home" /> : children;
};

/**
 * Componente principal que gestiona la navegación y la sesión del usuario
 */
function App() {
  useEffect(() => {
    // Función para comprobar si el token ha caducado y cerrar sesión automáticamente
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Decodificamos el token para ver cuándo expira
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const timeLeft = expirationTime - Date.now();

        // Si ya ha caducado, limpiamos el almacenamiento y redirigimos al login
        if (timeLeft <= 0) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          // Si todavía es válido, ponemos un temporizador para que caduque cuando toque
          const timer = setTimeout(() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }, timeLeft + 1000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        // Si hay algún error con el token, lo borramos por seguridad
        localStorage.removeItem('token');
      }
    };

    checkToken();
    // Escuchamos cambios en otras pestañas para mantener la sesión sincronizada
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  return (
    <SettingsProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Definición de todas las páginas y sus accesos (públicos o privados) */}
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />
            
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/comunidad" element={<PrivateRoute><Comunidad /></PrivateRoute>} />
            <Route path="/perfil/:username" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route path="/clasificacion" element={<PrivateRoute><Clasificacion /></PrivateRoute>} />
            <Route path="/mercados" element={<PrivateRoute><Mercados /></PrivateRoute>} />
            <Route path="/noticias" element={<PrivateRoute><Noticias /></PrivateRoute>} />
            <Route path="/faq" element={<PrivateRoute><FAQ /></PrivateRoute>} />
            <Route path="/ajustes" element={<PrivateRoute><Ajustes /></PrivateRoute>} />
            
            {/* Cualquier otra ruta nos devuelve al inicio */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;