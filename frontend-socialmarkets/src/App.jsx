import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Comunidad from './pages/Comunidad';
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

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;