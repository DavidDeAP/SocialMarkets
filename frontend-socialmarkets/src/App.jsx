import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* La página principal será el Login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* La página de registro */}
          <Route path="/registro" element={<Registro />} />

          {/* Pagina home de prueba */}
          <Route path="/home" element={<Home />} />

          {/* Si alguien escribe cualquier otra cosa, lo mandamos al login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;