import { useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiTrendingUp, FiUsers, FiAward, FiFileText, FiSettings, FiHelpCircle } from 'react-icons/fi';
import logoApp from '../assets/logo.png';
import './Sidebar.css';

/**
 * Menú lateral de navegación principal de la aplicación
 */
const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determina si una ruta es la que el usuario está viendo ahora mismo para resaltarla
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar">
            {/* Cabecera con el logo y nombre de la marca */}
            <div className="sidebar-header" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
                <img src={logoApp} alt="Logo" className="sidebar-logo-large" />
                <div className="brand-text">
                    <h2><span className="brand-blue">Social</span><span className="brand-green">Markets.</span></h2>
                    <span className="brand-subtitle">VALIDACIÓN FINANCIERA</span>
                </div>
            </div>

            {/* Lista de botones de navegación */}
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
                <button 
                    className={`nav-item ${isActive('/faq')}`}
                    onClick={() => navigate('/faq')}
                >
                    <FiHelpCircle className="nav-icon" /> FAQ
                </button>
            </nav>

            {/* Pie del menú con acceso a los ajustes */}
            <div className="sidebar-footer">
                <button 
                    className={`nav-item-icon-only ${isActive('/ajustes')}`}
                    onClick={() => navigate('/ajustes')}
                    title="Ajustes"
                >
                    <FiSettings className="nav-icon" />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;