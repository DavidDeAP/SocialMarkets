import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import './Topbar.css';

const API_BASE_URL = 'http://localhost:8080';

const Topbar = ({ user }) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();

    const irAMiPerfil = () => {
        navigate(`/perfil/${user.usuario}`);
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getAvatarUrl = () => {
        if (!user?.imagen) return null;
        if (user.imagen.startsWith('http')) return user.imagen;
        return `${API_BASE_URL}${user.imagen}`;
    };

    return (
        <header className="topbar">
            <div className="search-container">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Buscar analistas" className="search-input" />
            </div>

            <div className="user-controls">
                <div className="avatar-container" onClick={irAMiPerfil} style={{cursor: 'pointer'}}>
                    {user?.imagen ? (
                        <img src={getAvatarUrl()} alt="Perfil" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.usuario?.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}
                </div>

                <FiBell className="menu-icon notification-bell" />
                
                <div className="dropdown-container">
                    <FiMenu 
                        className="menu-icon" 
                        onClick={() => setMenuAbierto(!menuAbierto)} 
                    />
                    
                    {menuAbierto && (
                        <div className="dropdown-menu">
                            <button onClick={irAMiPerfil} className="dropdown-item">
                                <FiUser /> Ver Perfil
                            </button>
                            <button onClick={cerrarSesion} className="dropdown-item logout-btn">
                                <FiLogOut /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;