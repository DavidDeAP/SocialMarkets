import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Comunidad from './pages/Comunidad';
import Clasificacion from './pages/Clasificacion';
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
  // Vigilante de expiración de token
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const timeLeft = expirationTime - Date.now();

        if (timeLeft <= 0) {
          console.warn("Token expirado (App Watcher).");
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          // Programamos el siguiente check justo cuando caduque
          const timer = setTimeout(() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }, timeLeft + 1000); // 1 segundo extra de margen

          return () => clearTimeout(timer);
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    };

    checkToken();
    // También escuchamos cambios en otras pestañas
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<Navigate to="/home" />} 
          />

          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/registro" 
            element={
              <PublicRoute>
                <Registro />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/comunidad" 
            element={
              <PrivateRoute>
                <Comunidad />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/perfil/:username" 
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clasificacion" 
            element={
              <PrivateRoute>
                <Clasificacion />
              </PrivateRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;