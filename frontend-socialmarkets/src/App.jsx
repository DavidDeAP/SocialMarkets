import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Comunidad from './pages/Comunidad';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
          />
          <Route 
            path="/registro" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Registro />} 
          />
          
          <Route 
            path="/home" 
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/comunidad" 
            element={isAuthenticated ? <Comunidad /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/perfil/:username" 
            element={isAuthenticated ? <Perfil /> : <Navigate to="/login" />} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;