import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMenu, FiUser, FiLogOut, FiX, FiSettings } from 'react-icons/fi';
import api from '../services/api';
import './Topbar.css';

const API_BASE_URL = 'http://localhost:8080';

/**
 * Barra superior de la aplicación que contiene el buscador de usuarios, notificaciones y menú de perfil
 */
const Topbar = ({ user }) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [panelNotisAbierto, setPanelNotisAbierto] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [hayNuevas, setHayNuevas] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [showNotiSettings, setShowNotiSettings] = useState(false);
    const [userState, setUserState] = useState(user);
    const navigate = useNavigate();

    useEffect(() => {
        setUserState(user);
    }, [user]);

    // Cambia si el usuario quiere recibir avisos de nuevos seguidores o publicaciones
    const toggleNotiPref = async (tipo) => {
        if (!userState) return;

        const currentSeg = userState.notificarSeguidores !== false;
        const currentPub = userState.notificarPublicaciones !== false;

        const nuevoSeg = tipo === 'seguidores' ? !currentSeg : currentSeg;
        const nuevoPub = tipo === 'publicaciones' ? !currentPub : currentPub;

        // Actualización optimista para que la interfaz responda al instante
        setUserState(prev => ({
            ...prev,
            notificarSeguidores: nuevoSeg,
            notificarPublicaciones: nuevoPub
        }));

        try {
            const res = await api.put(`/usuarios/preferencias-notificaciones?seguidores=${nuevoSeg}&publicaciones=${nuevoPub}`);
            setUserState(res.data);
        } catch (err) {
            console.error("Error actualizando preferencias:", err);
            setUserState(user); // Revertimos si falla la conexión
        }
    };

    const irAMiPerfil = () => {
        navigate(`/perfil/${user.usuario}`);
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const getAvatarUrl = () => {
        if (!user?.imagen) return null;
        if (user.imagen.startsWith('http')) return user.imagen;
        return `${API_BASE_URL}${user.imagen}`;
    };

    // Comprueba periódicamente si hay nuevas notificaciones para encender el puntito rojo
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
        const interval = setInterval(checkNuevas, 30000); // Consulta cada 30 segundos
        return () => clearInterval(interval);
    }, [user?.identificador]);

    const [pagNoti, setPagNoti] = useState(0);
    const [hasMoreNoti, setHasMoreNoti] = useState(true);
    const [cargandoMasNoti, setCargandoMasNoti] = useState(false);

    const notiRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickAfuera = (event) => {
            if (notiRef.current && !notiRef.current.contains(event.target)) {
                setPanelNotisAbierto(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };

        document.addEventListener("mousedown", handleClickAfuera);
        return () => document.removeEventListener("mousedown", handleClickAfuera);
    }, []);

    const loadMoreNotis = async (reset = false) => {
        if (!reset && (!hasMoreNoti || cargandoMasNoti)) return;
        const pageToFetch = reset ? 0 : pagNoti;
        
        if (reset) {
            setPagNoti(0);
            setHasMoreNoti(true);
        } else {
            setCargandoMasNoti(true);
        }

        try {
            const res = await api.get(`/notificaciones/ultimas10/${user.identificador}?page=${pageToFetch}&size=5`);
            const data = res.data;
            const nuevas = data.content;

            if (reset) {
                setNotificaciones(nuevas);
                setPagNoti(1);
            } else {
                setNotificaciones(prev => [...prev, ...nuevas]);
                setPagNoti(prev => prev + 1);
            }
            setHasMoreNoti(!data.last);
        } catch (err) {
            console.error("Error cargando notis:", err);
        } finally {
            setCargandoMasNoti(false);
        }
    };

    // Cargar las primeras 5 al abrir el panel
    const togglePanelNotis = async () => {
        if (!panelNotisAbierto && user?.identificador) {
            loadMoreNotis(true);
            // Si había nuevas, las marcamos todas como leídas al abrir
            if (hayNuevas) {
                try {
                    await api.put(`/notificaciones/leertodas/${user.identificador}`);
                    setHayNuevas(false);
                } catch (err) {
                    console.error("Error marcando leídas:", err);
                }
            }
        }
        setPanelNotisAbierto(!panelNotisAbierto);
        setMenuAbierto(false);
    };

    const [deletingNotis, setDeletingNotis] = useState([]);

    const handleEliminarNotificacion = async (e, id) => {
        e.stopPropagation();
        setDeletingNotis(prev => [...prev, id]);
        
        // Tiempo para la animación de salida
        setTimeout(async () => {
            try {
                await api.delete(`/notificaciones/${id}`);
                setNotificaciones(prev => prev.filter(n => n.identificador !== id));
                setDeletingNotis(prev => prev.filter(d => d !== id));
            } catch (err) {
                console.error("Error eliminando notificacion:", err);
                setDeletingNotis(prev => prev.filter(d => d !== id));
            }
        }, 400);
    };

    const manejarClickNotificacion = (noti) => {
        setPanelNotisAbierto(false);
        if (noti.enlace) {
            navigate(noti.enlace);
        }
    };

    // Lógica del buscador global de analistas con sugerencias en tiempo real
    useEffect(() => {
        const fetchUsuarios = async () => {
            if (searchQuery.length >= 2) {
                setBuscando(true);
                try {
                    const res = await api.get(`/usuarios/buscar?q=${searchQuery}`);
                    setSugerencias(res.data.slice(0, 5)); // Mostramos máximo 5 resultados
                } catch (err) {
                    console.error("Error en búsqueda topbar:", err);
                } finally {
                    setBuscando(false);
                }
            } else {
                setSugerencias([]);
            }
        };

        const timeoutId = setTimeout(fetchUsuarios, 300); // Esperamos 300ms antes de buscar
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

                <div className="notification-wrapper" ref={notiRef}>
                    <FiBell
                        className={`menu-icon notification-bell ${hayNuevas ? 'has-new' : ''}`}
                        onClick={togglePanelNotis}
                    />
                    {hayNuevas && <span className="notification-dot"></span>}

                    {panelNotisAbierto && (
                        <div className="notification-panel">
                            <div className="noti-header">
                                <h3>Notificaciones</h3>
                                <button 
                                    className={`btn-noti-settings ${showNotiSettings ? 'active' : ''}`}
                                    onClick={() => setShowNotiSettings(!showNotiSettings)}
                                    title="Ajustes de notificaciones"
                                >
                                    <FiSettings />
                                </button>
                            </div>

                            {showNotiSettings && (
                                <div className="noti-settings-panel">
                                    <div className="settings-item">
                                        <span>Seguidores</span>
                                        <button 
                                            className={`switch-toggle ${userState?.notificarSeguidores !== false ? 'on' : 'off'}`}
                                            onClick={() => toggleNotiPref('seguidores')}
                                        >
                                            <div className="switch-knob"></div>
                                        </button>
                                    </div>
                                    <div className="settings-item">
                                        <span>Publicaciones</span>
                                        <button 
                                            className={`switch-toggle ${userState?.notificarPublicaciones !== false ? 'on' : 'off'}`}
                                            onClick={() => toggleNotiPref('publicaciones')}
                                        >
                                            <div className="switch-knob"></div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div 
                                className="noti-list"
                                onScroll={(e) => {
                                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                    if (scrollHeight - scrollTop <= clientHeight + 20) {
                                        if (hasMoreNoti && !cargandoMasNoti) {
                                            loadMoreNotis();
                                        }
                                    }
                                }}
                            >
                                {notificaciones.length > 0 ? (
                                    <>
                                        {notificaciones.map(noti => {
                                            const imagenUrl = noti.autor?.imagen;

                                            return (
                                                <div 
                                                    key={noti.identificador} 
                                                    className={`noti-item ${!noti.leida ? 'unread' : ''} ${deletingNotis.includes(noti.identificador) ? 'removing' : ''}`}
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
                                                    <button 
                                                        className="btn-delete-noti"
                                                        onClick={(e) => handleEliminarNotificacion(e, noti.identificador)}
                                                        title="Eliminar notificación"
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        
                                        {cargandoMasNoti && (
                                            <div className="noti-loading-more">
                                                <div className="loader-tiny"></div>
                                            </div>
                                        )}
                                        {!hasMoreNoti && notificaciones.length > 5 && (
                                            <div className="noti-end">Fin de notificaciones</div>
                                        )}
                                    </>
                                ) : (
                                    <div className="noti-empty">No tienes notificaciones</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="dropdown-container" ref={profileRef}>
                    <FiMenu
                        className="menu-icon"
                        onClick={() => {
                            setMenuAbierto(!menuAbierto);
                            setPanelNotisAbierto(false);
                        }}
                    />

                    {menuAbierto && (
                        <div className="dropdown-menu modern-dropdown">
                            <div className="dropdown-items-list">
                                <button onClick={() => { irAMiPerfil(); setMenuAbierto(false); }} className="dropdown-item">
                                    <div className="item-icon-box"><FiUser /></div>
                                    <div className="item-text">
                                        <span className="item-title">Mi Perfil</span>
                                    </div>
                                </button>

                                <button onClick={() => { navigate('/ajustes'); setMenuAbierto(false); }} className="dropdown-item">
                                    <div className="item-icon-box"><FiSettings /></div>
                                    <div className="item-text">
                                        <span className="item-title">Ajustes</span>
                                    </div>
                                </button>
                                
                                <button onClick={cerrarSesion} className="dropdown-item logout-modern">
                                    <div className="item-icon-box logout"><FiLogOut /></div>
                                    <div className="item-text">
                                        <span className="item-title">Cerrar Sesión</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;