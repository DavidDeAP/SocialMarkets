import { useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiTrendingUp, FiUsers, FiAward, FiFileText } from 'react-icons/fi';
import logoApp from '../assets/logo.png';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Función para saber si el botón debe estar "activo" visualmente
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar">
            <div className="sidebar-header" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
                <img src={logoApp} alt="Logo" className="sidebar-logo-large" />
                <div className="brand-text">
                    <h2><span className="brand-blue">Social</span><span className="brand-green">Markets.</span></h2>
                    <span className="brand-subtitle">VALIDACIÓN FINANCIERA</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <button className={`nav-item ${isActive('/home')}`} onClick={() => navigate('/home')}>
                    <FiGrid className="nav-icon" /> Panel
                </button>
                
                <button 
                    className={`nav-item ${isActive('/mercados')}`} 
                    onClick={() => navigate('/mercados')}
                >
                    <FiTrendingUp className="nav-icon" /> Mercados
                </button>
                <button 
                    className={`nav-item ${isActive('/comunidad')}`} 
                    onClick={() => navigate('/comunidad')}
                >
                    <FiUsers className="nav-icon" /> Comunidad
                </button>

                <button 
                    className={`nav-item ${isActive('/clasificacion')}`}
                    onClick={() => navigate('/clasificacion')}
                >
                    <FiAward className="nav-icon" /> Clasificación
                </button>
                
                <button 
                    className={`nav-item ${isActive('/noticias')}`}
                    onClick={() => navigate('/noticias')}
                >
                    <FiFileText className="nav-icon" /> Noticias
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;