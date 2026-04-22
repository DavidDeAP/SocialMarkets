import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import Perfil from './pages/Perfil'; // Asegúrate de tenerlo importado
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Si hay token va a Home, si no a Login */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} 
          />

          {/* Si ya está logueado y trata de entrar, va al Home */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
          />
          <Route 
            path="/registro" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Registro />} 
          />
          
          {/* 3. Contenido para usuarios logueados */}
          <Route path="/home" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;