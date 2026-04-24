import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import './Topbar.css';

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

    return (
        <header className="topbar">
            <div className="search-container">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Buscar analistas" className="search-input" />
            </div>

            <div className="user-controls">
                {/* Foto de perfil que lleva al perfil al hacer click */}
                <div className="avatar-container" onClick={irAMiPerfil} style={{cursor: 'pointer'}}>
                    {user?.imagen ? (
                        <img src={user.imagen} alt="Perfil" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder">{user?.usuario?.charAt(0).toUpperCase()}</div>
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