import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMenu, FiUser, FiLogOut, FiX } from 'react-icons/fi';
import api from '../services/api';
import './Topbar.css';

const API_BASE_URL = 'http://localhost:8080';

const Topbar = ({ user }) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [panelNotisAbierto, setPanelNotisAbierto] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [hayNuevas, setHayNuevas] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [buscando, setBuscando] = useState(false);
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

    // Polling de notificaciones no leídas
    useEffect(() => {
        if (!user?.identificador) return;

        const checkNuevas = async () => {
            try {
                const res = await api.get(`/notificaciones/noleidas/${user.identificador}`);
                setHayNuevas(res.data.length > 0);
            } catch (err) {
                console.error("Error check notis:", err);
            }
        };

        checkNuevas();
        const interval = setInterval(checkNuevas, 30000);
        return () => clearInterval(interval);
    }, [user?.identificador]);

    // Cargar las últimas 10 al abrir el panel
    const togglePanelNotis = async () => {
        if (!panelNotisAbierto && user?.identificador) {
            try {
                const res = await api.get(`/notificaciones/ultimas10/${user.identificador}`);
                setNotificaciones(res.data);
                // Si había nuevas, las marcamos todas como leídas al abrir
                if (hayNuevas) {
                    await api.put(`/notificaciones/leertodas/${user.identificador}`);
                    setHayNuevas(false);
                }
            } catch (err) {
                console.error("Error cargando notis:", err);
            }
        }
        setPanelNotisAbierto(!panelNotisAbierto);
        setMenuAbierto(false);
    };

    const manejarClickNotificacion = (noti) => {
        setPanelNotisAbierto(false);
        if (noti.enlace) {
            navigate(noti.enlace);
        }
    };

    useEffect(() => {
        const fetchUsuarios = async () => {
            if (searchQuery.length >= 2) {
                setBuscando(true);
                try {
                    const res = await api.get(`/usuarios/buscar?q=${searchQuery}`);
                    setSugerencias(res.data.slice(0, 5));
                } catch (err) {
                    console.error("Error en búsqueda topbar:", err);
                } finally {
                    setBuscando(false);
                }
            } else {
                setSugerencias([]);
            }
        };

        const timeoutId = setTimeout(fetchUsuarios, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSelectUser = (username) => {
        setSearchQuery('');
        setSugerencias([]);
        navigate(`/perfil/${username}`);
    };

    const formatearFecha = (fechaStr) => {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMin / 60);

        if (diffMin < 60) return `hace ${diffMin} min`;
        if (diffHoras < 24) return `hace ${diffHoras} h`;
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <header className="topbar">
            <div className="search-container">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar analistas..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && <FiX className="clear-search-top" onClick={() => setSearchQuery('')} />}

                {sugerencias.length > 0 && (
                    <div className="topbar-suggestions-dropdown">
                        {sugerencias.map(u => (
                            <div
                                key={u.identificador}
                                className="topbar-suggestion-item"
                                onClick={() => handleSelectUser(u.usuario)}
                            >
                                {u.imagen ? (
                                    <img src={u.imagen.startsWith('http') ? u.imagen : `${API_BASE_URL}${u.imagen}`} alt={u.usuario} />
                                ) : (
                                    <div className="avatar-placeholder-small">
                                        {u.usuario?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="sugg-info">
                                    <span className="sugg-name">{u.usuario}</span>
                                    <div className="sugg-stats">
                                        <span className="acierto-val">{u.indiceAcierto?.toFixed(1) || 0}% acierto</span>
                                        <span className="sep">•</span>
                                        <span className={`rendimiento-val ${u.rendimientoMes >= 0 ? 'pos' : 'neg'}`}>
                                            {u.rendimientoMes >= 0 ? '+' : ''}{u.rendimientoMes?.toFixed(1) || 0}% mes
                                        </span>
                                        <span className="sep">•</span>
                                        <span>{u.numeroPredicciones || 0} predicciones</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="user-controls">
                <div className="avatar-container" onClick={irAMiPerfil} style={{ cursor: 'pointer' }}>
                    {user?.imagen ? (
                        <img src={getAvatarUrl()} alt="Perfil" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.usuario?.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}
                </div>

                <div className="notification-wrapper">
                    <FiBell
                        className={`menu-icon notification-bell ${hayNuevas ? 'has-new' : ''}`}
                        onClick={togglePanelNotis}
                    />
                    {hayNuevas && <span className="notification-dot"></span>}

                    {panelNotisAbierto && (
                        <div className="notification-panel">
                            <div className="noti-header">
                                <h3>Notificaciones</h3>
                            </div>
                            <div className="noti-list">
                                {notificaciones.length > 0 ? (
                                    notificaciones.map(noti => {
                                        const imagenUrl = noti.autor?.imagen;

                                        return (
                                            <div 
                                                key={noti.identificador} 
                                                className={`noti-item ${!noti.leida ? 'unread' : ''}`}
                                                onClick={() => manejarClickNotificacion(noti)}
                                            >
                                                <div className="noti-content-wrapper">
                                                    <div className="noti-avatar">
                                                        {imagenUrl && (
                                                            <img 
                                                                src={imagenUrl.startsWith('http') ? imagenUrl : `${API_BASE_URL}${imagenUrl}`} 
                                                                alt="Autor" 
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="noti-info">
                                                        <p className="noti-text">{noti.texto}</p>
                                                        <span className="noti-date">{formatearFecha(noti.fecha)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="noti-empty">No tienes notificaciones</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="dropdown-container">
                    <FiMenu
                        className="menu-icon"
                        onClick={() => {
                            setMenuAbierto(!menuAbierto);
                            setPanelNotisAbierto(false);
                        }}
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