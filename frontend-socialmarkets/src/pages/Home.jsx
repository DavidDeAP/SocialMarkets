import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiGrid, FiTrendingUp, FiUsers, FiAward, FiFileText, FiUser, FiLogOut, FiBell } from 'react-icons/fi';
import logoApp from '../assets/logo.png'; 

const Home = () => {
    const [user, setUser] = useState(null);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const respuesta = await axios.get('http://localhost:8080/api/usuarios/perfil', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(respuesta.data);
            } catch (err) {
                console.error("Error cargando perfil", err);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchPerfil();
    }, [navigate]);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const irAPerfil = () => {
        navigate('/perfil'); 
    };

    if (!user) return <div className="cargando-pantalla">Cargando panel...</div>;

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    {/* Logo grande y centrado */}
                    <img src={logoApp} alt="Logo SocialMarkets" className="sidebar-logo-large" />
                    
                    <div className="brand-text">
                        <h2>
                            <span className="brand-blue">Social</span>
                            <span className="brand-green">Markets.</span>
                        </h2>
                        <span className="brand-subtitle">VALIDACIÓN FINANCIERA</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button className="nav-item active"><FiGrid className="nav-icon" /> Panel</button>
                    <button className="nav-item"><FiTrendingUp className="nav-icon" /> Mercados</button>
                    <button className="nav-item"><FiUsers className="nav-icon" /> Comunidad</button>
                    <button className="nav-item"><FiAward className="nav-icon" /> Clasificación</button>
                    <button className="nav-item"><FiFileText className="nav-icon" /> Noticias</button>
                </nav>
            </aside>

            <div className="main-wrapper">
                
                <header className="topbar">
                    <div className="search-container">
                        <FiSearch className="search-icon" />
                        <input type="text" placeholder="Buscar mercados, analistas..." className="search-input" />
                    </div>

                    <div className="user-controls">
                        {/* Foto de perfil */}
                        <div className="avatar-container" onClick={irAPerfil}>
                            {user.imagen ? (
                                <img src={user.imagen} alt="Perfil" className="avatar-img" />
                            ) : (
                                <div className="avatar-placeholder">{user.usuario.charAt(0).toUpperCase()}</div>
                            )}
                        </div>

                        {/* Campana de notificaciones */}
                        <FiBell className="menu-icon notification-bell" />
                        
                        {/* Menú de 3 rayas */}
                        <div className="dropdown-container">
                            <FiMenu 
                                className="menu-icon" 
                                onClick={() => setMenuAbierto(!menuAbierto)} 
                            />
                            
                            {menuAbierto && (
                                <div className="dropdown-menu">
                                    <button onClick={irAPerfil} className="dropdown-item">
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

                <main className="main-content">
                    <div className="content-card">
                        <h1>Hola, {user.usuario}</h1>
                        
                        <div className="stats-grid">
                            <div className="stat-box">Operaciones activas: 0</div>
                            <div className="stat-box">Rendimiento: 0.00%</div>
                            <div className="stat-box">Seguidores: 0</div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;