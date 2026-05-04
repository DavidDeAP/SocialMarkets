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
import Ajustes from './pages/Ajustes';
import { SettingsProvider } from './context/SettingsContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/home" /> : children;
};

function App() {
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const timeLeft = expirationTime - Date.now();

        if (timeLeft <= 0) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          const timer = setTimeout(() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }, timeLeft + 1000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    };

    checkToken();
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  return (
    <SettingsProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/comunidad" element={<PrivateRoute><Comunidad /></PrivateRoute>} />
            <Route path="/perfil/:username" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route path="/clasificacion" element={<PrivateRoute><Clasificacion /></PrivateRoute>} />
            <Route path="/mercados" element={<PrivateRoute><Mercados /></PrivateRoute>} />
            <Route path="/noticias" element={<PrivateRoute><Noticias /></PrivateRoute>} />
            <Route path="/ajustes" element={<PrivateRoute><Ajustes /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;