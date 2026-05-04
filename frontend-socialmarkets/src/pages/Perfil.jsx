import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultUser from '../assets/defaultuser.png';
import { 
    FiEdit2, FiBarChart2, FiCheckCircle, FiXCircle, 
    FiCalendar, FiUsers, FiTrendingUp, FiTarget, 
    FiTrash2, FiUserPlus, FiUserMinus, FiHeart,
    FiArrowUpRight, FiArrowDownRight, FiActivity,
    FiChevronLeft, FiChevronRight, FiMessageSquare
} from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import './Perfil.css';
import './Comunidad.css'; // Reutilizamos estilos de la comunidad para los posts

const Perfil = () => {
    const { username } = useParams(); 
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [cargando, setCargando] = useState(true);

    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
    const [tempBio, setTempBio] = useState('');
    const [tempFoto, setTempFoto] = useState(null);
    const [borrarFoto, setBorrarFoto] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [editando, setEditando] = useState(false);
    
    // Estados para el feed de análisis del usuario
    const [listaAnalisis, setListaAnalisis] = useState([]);
    const [cargandoFeed, setCargandoFeed] = useState(true);
    const [preciosVivos, setPreciosVivos] = useState({});
    const [lightbox, setLightbox] = useState({
        isOpen: false,
        images: [],
        currentIndex: 0
    });
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarTodo = async () => {
            setCargando(true);

            setIsFollowing(false); 
            setBorrarFoto(false);
            setPreviewUrl(null);
            
            try {
                const [meRes, perfilRes] = await Promise.all([
                    api.get('/usuarios/perfil'),
                    api.get(`/usuarios/publico/${username}`)
                ]);

                setUser(meRes.data);
                setUserProfile(perfilRes.data);
                setTempBio(perfilRes.data.biografia || '');
                
                if (meRes.data.usuario !== username) {
                    try {
                        const resSigue = await api.get(`/usuarios/${username}/siguiendo`);
                        setIsFollowing(resSigue.data);
                    } catch (e) {
                        console.error("Error al verificar seguimiento", e);
                    }
                }

                setEditando(false);
            } catch (err) {
                console.error("Error cargando perfil", err);
                if (err.response?.status === 401) navigate('/login');
                else navigate('/home'); 
            } finally {
                setCargando(false);
            }
        };
        
        if (username) {
            cargarTodo();
            fetchAnalisisUsuario(true);
        }
    }, [username, navigate]);

    const [pagina, setPagina] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false);

    const fetchAnalisisUsuario = async (reset = false) => {
        if (!reset && (!hasMore || cargandoMas)) return;

        const pageToFetch = reset ? 0 : pagina;
        if (reset) {
            setCargandoFeed(true);
            setPagina(0);
            setHasMore(true);
        } else {
            setCargandoMas(true);
        }

        try {
            const res = await api.get(`/analisis/usuario/${username}?page=${pageToFetch}&size=5`);
            const data = res.data;
            const nuevosAnalisis = data.content;

            if (reset) {
                setListaAnalisis(nuevosAnalisis);
                setPagina(1);
            } else {
                setListaAnalisis(prev => [...prev, ...nuevosAnalisis]);
                setPagina(prev => prev + 1);
            }
            setHasMore(!data.last);
        } catch (err) {
            console.error("Error al obtener análisis del usuario:", err);
        } finally {
            setCargandoFeed(false);
            setCargandoMas(false);
        }
    };

    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !cargandoMas && !cargandoFeed) {
                    fetchAnalisisUsuario();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) observer.unobserve(observerTarget.current);
        };
    }, [hasMore, cargandoMas, cargandoFeed, pagina, username]);

    // Polling de precios para los análisis del perfil
    useEffect(() => {
        if (listaAnalisis.length === 0) return;

        const actualizarPreciosFeed = async () => {
            const simbolosRaw = listaAnalisis.map(a => a.activo?.nombre).filter(Boolean);
            const simbolosUnicos = [...new Set(simbolosRaw.map(s => s.trim().toUpperCase()))];

            if (simbolosUnicos.length === 0) return;

            try {
                const url = `/market/prices?symbols=${simbolosUnicos.join(',')}`;
                const res = await api.get(url);
                const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                const resultados = data.quoteResponse?.result || data.finance?.result || [];

                if (resultados.length > 0) {
                    const nuevosPrecios = {};
                    resultados.forEach(quote => {
                        const simbolo = quote.symbol?.toUpperCase();
                        if (simbolo) {
                            nuevosPrecios[simbolo] = {
                                price: quote.regularMarketPrice || quote.price || quote.ask || 0,
                                currency: quote.currency,
                                lastUpdate: new Date().getTime()
                            };
                        }
                    });
                    setPreciosVivos(prev => ({ ...prev, ...nuevosPrecios }));
                }
            } catch (err) {
                console.error("Error en polling de precios:", err);
            }
        };

        actualizarPreciosFeed();
        const interval = setInterval(actualizarPreciosFeed, 10000);
        return () => clearInterval(interval);
    }, [listaAnalisis]);

    const handleVotar = async (analisisId) => {
        try {
            await api.post(`/analisis/${analisisId}/votar`);
            setListaAnalisis(prev => prev.map(a => {
                if (a.identificador === analisisId) {
                    const yaVotado = a.votos?.some(v => v.usuario?.usuario === user?.usuario);
                    const nuevosVotos = yaVotado
                        ? a.votos.filter(v => v.usuario?.usuario !== user?.usuario)
                        : [...(a.votos || []), { usuario: { usuario: user?.usuario } }];
                    return { ...a, votos: nuevosVotos };
                }
                return a;
            }));
        } catch (err) {
            console.error("Error al votar:", err);
        }
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const calculatePerformance = (entrada, actual) => {
        if (!entrada || !actual) return '0.00';
        return (((actual - entrada) / entrada) * 100).toFixed(2);
    };

    // Funciones del Lightbox
    const openLightbox = (images, index) => {
        setLightbox({ isOpen: true, images, currentIndex: index });
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightbox(prev => ({ ...prev, isOpen: false }));
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }));
    };

    const handleFollow = async () => {
        try {
            const response = await api.post(`/usuarios/${username}/follow`);
            const siguiendo = response.data; // El backend devuelve true o false
            
            setIsFollowing(siguiendo);
            
            // Actualizamos visualmente el número de seguidores sin recargar
            setUserProfile(prev => ({
                ...prev,
                seguidores: siguiendo ? prev.seguidores + 1 : prev.seguidores - 1
            }));

        } catch (error) {
            console.error("Error al seguir/dejar de seguir", error);
        }
    };

    if (cargando) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Cargando perfil de analista...</p>
        </div>
    );
    if (!user || !userProfile) return null;

    const esMiPerfil = user.usuario === userProfile.usuario;

    // Lógica de Privacidad
    const shouldShow = (type) => {
        if (esMiPerfil) return true;
        const privacidad = userProfile.privacidadPerfil || 'PUBLICO';
        
        if (privacidad === 'PRIVADO') return false;
        if (privacidad === 'PERSONALIZADO') {
            if (type === 'FOLLOWERS') return !userProfile.ocultarSeguidores;
            if (type === 'PREDICTIONS') return !userProfile.ocultarPredicciones;
            if (type === 'SUCCESS_RATE') return !userProfile.ocultarIndiceAcierto;
            if (type === 'POSTS') return !userProfile.ocultarPublicaciones;
        }
        return true; // PUBLICO por defecto
    };

    // --- FUNCIONES DE ACCIÓN ---
    const handleFotoClick = () => { if (editando && esMiPerfil) fileInputRef.current.click(); };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTempFoto(file);
            setPreviewUrl(URL.createObjectURL(file));
            setBorrarFoto(false);
        }
    };

    // NUEVA FUNCIÓN: Maneja la eliminación visual y prepara el estado para el backend
    const handleEliminarFoto = (e) => {
        e.stopPropagation(); // Evita que se dispare el click del contenedor (abrir archivo)
        setTempFoto(null);
        setPreviewUrl(null);
        setBorrarFoto(true);
    };

    const guardarCambios = async () => {
        const formData = new FormData();
        formData.append('biografia', tempBio);
        
        if (tempFoto) {
            formData.append('foto', tempFoto);
        } else if (borrarFoto) {
            formData.append('eliminarFoto', 'true'); // Enviamos la señal al backend
        }

        try {
            const res = await api.put('/usuarios/actualizar', formData);
            setUser(res.data);
            setUserProfile(res.data); 
            setEditando(false);
            setBorrarFoto(false);
            setTempFoto(null);
            setPreviewUrl(null);
            setNotificacion({ mostrar: true, mensaje: 'Perfil actualizado', tipo: 'exito' });
        } catch (err) {
            setNotificacion({ mostrar: true, mensaje: 'Error al actualizar', tipo: 'error' });
        } finally {
            setTimeout(() => setNotificacion(p => ({ ...p, mostrar: false })), 3000);
        }
    };

    const descartarCambios = () => {
        setTempBio(userProfile.biografia || '');
        setTempFoto(null);
        setPreviewUrl(null);
        setBorrarFoto(false);
        setEditando(false);
    };

    const fechaRegistro = userProfile?.fechaCreacion 
        ? new Date(userProfile.fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        : "---";

    // Cálculos para el popup de predicciones (Desglose Total desde el Backend)
    const resumen = userProfile?.resumenProyecciones || {};
    const statsPreds = {
        activas: resumen.activas || 0,
        ganando: resumen.ganando || 0,
        perdiendo: resumen.perdiendo || 0,
        acertadas: resumen.acertadas || 0,
        fallidas: resumen.fallidas || 0
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />
                
                <main className="main-content">
                    {notificacion.mostrar && (
                        <div className={`notification-toast ${notificacion.tipo}`}>
                            {notificacion.tipo === 'exito' ? <FiCheckCircle /> : <FiXCircle />}
                            {notificacion.mensaje}
                        </div>
                    )}

                    <div className="profile-glass-card">
                        <div className="profile-hero">
                            <div className={`profile-avatar-container ${editando ? 'mode-edit' : ''}`} onClick={handleFotoClick}>
                                <img 
                                    src={previewUrl || (!borrarFoto && userProfile.imagen ? userProfile.imagen : defaultUser)} 
                                    alt="Avatar" 
                                    className="profile-avatar-img"
                                />
                                {editando && (
                                    <>
                                        <div className="avatar-overlay"><FiEdit2 /><span>Cambiar</span></div>
                                        
                                        {/* BOTÓN DE ELIMINAR INTEGRADO */}
                                        {(previewUrl || (userProfile.imagen && !borrarFoto)) && (
                                            <button 
                                                className="delete-photo-btn" 
                                                onClick={handleEliminarFoto}
                                                title="Eliminar foto"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                            </div>

                            <div className="profile-main-info">
                                <div className="name-row">
                                    <h1 className="text-neon-green">{userProfile.usuario}</h1>
                                    
                                    {esMiPerfil ? (
                                        !editando && (
                                            <button className="btn-edit-profile" onClick={() => setEditando(true)}>
                                                <FiEdit2 /> Editar Perfil
                                            </button>
                                        )
                                    ) : (
                                        <button 
                                            className={`btn-follow ${isFollowing ? 'is-following' : ''}`} 
                                            onClick={handleFollow}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <FiUserMinus style={{ fontSize: '1.1rem' }} /> 
                                                    <span>Siguiendo</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUserPlus style={{ fontSize: '1.1rem' }} /> 
                                                    <span>Seguir</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <p className="member-since">
                                    <FiCalendar /> Analista desde {fechaRegistro}
                                </p>
                                
                                <div className="bio-section">
                                    {editando ? (
                                        <textarea 
                                            className="bio-editor"
                                            value={tempBio}
                                            onChange={(e) => setTempBio(e.target.value)}
                                            maxLength="160"
                                        />
                                    ) : (
                                        <p className="bio-text">{userProfile.biografia || "Sin biografía profesional todavía."}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ESTADÍSTICAS */}
                        <div className="stats-dashboard-grid">
                            {shouldShow('FOLLOWERS') && (
                                <div className="stat-card">
                                    <div className="stat-icon followers"><FiUsers /></div>
                                    <div className="stat-data">
                                        <span className="stat-value">{userProfile.seguidores || 0}</span>
                                        <span className="stat-label">Seguidores</span>
                                    </div>
                                </div>
                            )}

                            {shouldShow('PREDICTIONS') && (
                                <div className="stat-card predictions-hover-box">
                                    <div className="stat-icon predictions"><FiTrendingUp /></div>
                                    <div className="stat-data">
                                        <span className="stat-value">{userProfile.numeroPredicciones || 0}</span>
                                        <span className="stat-label">Predicciones</span>
                                    </div>

                                    {/* Popup de estadísticas en vivo */}
                                    <div className="stat-popup detailed">
                                        <div className="popup-group">
                                            <label className="group-label">En Vivo ({statsPreds.activas})</label>
                                            <div className="popup-item">
                                                <span className="dot success pulse"></span>
                                                <span className="label">Ganadoras:</span>
                                                <span className="value">{statsPreds.ganando}</span>
                                            </div>
                                            <div className="popup-item">
                                                <span className="dot danger pulse"></span>
                                                <span className="label">Perdedoras:</span>
                                                <span className="value">{statsPreds.perdiendo}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {shouldShow('SUCCESS_RATE') && (
                                <div className="stat-card highlight success-hover-box">
                                    <div className="stat-icon success"><FiTarget /></div>
                                    <div className="stat-data">
                                        <div className="success-header">
                                            <span className="stat-value">{(userProfile.indiceAcierto || 0).toFixed(1)}%</span>
                                            <span className="stat-label">Índice de Acierto</span>
                                        </div>
                                        <div className="success-progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${userProfile.indiceAcierto || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Popup de estadísticas históricas */}
                                    <div className="stat-popup">
                                        <div className="popup-group">
                                            <label className="group-label">Historial Total</label>
                                            <div className="popup-item">
                                                <span className="dot success"></span>
                                                <span className="label">Acertadas:</span>
                                                <span className="value">{statsPreds.acertadas}</span>
                                            </div>
                                            <div className="popup-item">
                                                <span className="dot danger"></span>
                                                <span className="label">Fallidas:</span>
                                                <span className="value">{statsPreds.fallidas}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {editando && (
                            <div className="action-bar-profile">
                                <button className="btn-secondary" onClick={descartarCambios}>Descartar</button>
                                <button className="btn-primary" onClick={guardarCambios}>Guardar Cambios</button>
                            </div>
                        )}
                    </div>

                    {/* FEED DE ANÁLISIS DEL USUARIO */}
                    {shouldShow('POSTS') ? (
                        <div className="profile-feed-section">
                            <div className="section-title-row">
                                <FiBarChart2 />
                                <h2>Historial de Análisis</h2>
                            </div>

                            <div className="feed-analisis profile-mode">
                                {cargandoFeed ? (
                                    <div className="loader-container-feed">
                                        <div className="loader-small"></div>
                                        <p>Cargando análisis...</p>
                                    </div>
                                ) : listaAnalisis.length === 0 ? (
                                    <div className="placeholder-feed glass-card">
                                        <FiMessageSquare size={40} />
                                        <p>Este analista aún no ha publicado ninguna predicción.</p>
                                    </div>
                                ) : (
                                    listaAnalisis.map((analisis) => {
                                        const precioActual = analisis.estado === 'PENDIENTE'
                                            ? preciosVivos[analisis.activo?.nombre?.toUpperCase()]?.price
                                            : analisis.precioCierre;

                                        let statusClass = "";
                                        if (analisis.estado === 'ACERTADO') statusClass = "status-winning settled";
                                        else if (analisis.estado === 'FALLIDO') statusClass = "status-losing settled";
                                        else if (precioActual && analisis.precioEntrada && analisis.precioObjetivo) {
                                            const isBullish = analisis.precioObjetivo > analisis.precioEntrada;
                                            if (isBullish) {
                                                statusClass = precioActual >= analisis.precioEntrada ? "status-winning" : "status-losing";
                                            } else {
                                                statusClass = precioActual <= analisis.precioEntrada ? "status-winning" : "status-losing";
                                            }
                                        }

                                        const isSettled = analisis.estado !== 'PENDIENTE';

                                        return (
                                            <article key={analisis.identificador} className={`analisis-card glass-card ${statusClass}`}>
                                                <div className="card-header">
                                                    <div className="user-info-section">
                                                        <img
                                                            src={userProfile.imagen || defaultUser}
                                                            alt={userProfile.usuario}
                                                            className="user-avatar-small"
                                                        />
                                                        <div className="user-meta">
                                                            <span className="username">{userProfile.usuario}</span>
                                                            <div className="user-stats-small">
                                                                <span className="stat-item acierto">
                                                                    {userProfile.indiceAcierto?.toFixed(1) || 0}% acierto
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card-badges">
                                                        <div className={`tipo-badge ${analisis.tipo?.toLowerCase()}`}>
                                                            {analisis.tipo === 'TECNICO' ? 'Técnico' : 'Fundamental'}
                                                        </div>
                                                        <div className={`sentiment-badge ${analisis.precioObjetivo > analisis.precioEntrada ? 'bullish' : 'bearish'}`}>
                                                            {analisis.precioObjetivo > analisis.precioEntrada ? (
                                                                <><FiArrowUpRight /> Alcista</>
                                                            ) : (
                                                                <><FiArrowDownRight /> Bajista</>
                                                            )}
                                                        </div>
                                                        {isSettled && (
                                                            <div className={`status-badge-settled ${analisis.estado.toLowerCase()}`}>
                                                                {analisis.estado === 'ACERTADO' ? 'ACERTADO' : 'FALLIDO'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="card-market-info-new">
                                                    <div className="market-header-compact">
                                                        <div className="header-left-tags">
                                                            <div className="asset-tag">
                                                                <FiActivity className="icon-pulse" />
                                                                <span>{analisis.activo?.nombre}</span>
                                                            </div>
                                                            <div className="expiry-tag">
                                                                <FiCalendar />
                                                                <span>Vence: {formatFecha(analisis.fechaVencimiento)}</span>
                                                            </div>
                                                        </div>
                                                        <div className={`perf-badge ${statusClass}`}>
                                                            {calculatePerformance(analisis.precioEntrada, precioActual) >= 0 ? '+' : ''}
                                                            {calculatePerformance(analisis.precioEntrada, precioActual)}%
                                                        </div>
                                                    </div>

                                                    <div className="prices-dashboard">
                                                        <div className="price-card entry">
                                                            <div className="p-icon"><FiArrowUpRight /></div>
                                                            <div className="p-data">
                                                                <label>Entrada</label>
                                                                <span className="p-val">${analisis.precioEntrada?.toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        <div className={`price-card ${isSettled ? 'settled' : 'live'}`}>
                                                            <div className="p-icon">{isSettled ? <FiXCircle /> : <FiActivity />}</div>
                                                            <div className="p-data">
                                                                <label>{isSettled ? 'Cierre' : 'Actual'}</label>
                                                                <span className="p-val">
                                                                    {isSettled
                                                                        ? `$${analisis.precioCierre?.toLocaleString()}`
                                                                        : preciosVivos[analisis.activo?.nombre?.toUpperCase()]
                                                                            ? `$${preciosVivos[analisis.activo?.nombre?.toUpperCase()].price.toLocaleString()}`
                                                                            : '...'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="price-card target">
                                                            <div className="p-icon"><FiTarget /></div>
                                                            <div className="p-data">
                                                                <label>Objetivo</label>
                                                                <span className="p-val">${analisis.precioObjetivo?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-content">
                                                    <p className="analysis-text">{analisis.contenido}</p>
                                                    {analisis.imagenes && analisis.imagenes.length > 0 && (
                                                        <div className="analysis-gallery horizontal-scroll">
                                                            {analisis.imagenes.map((url, idx) => (
                                                                <div key={idx} className="gallery-item">
                                                                    <img
                                                                        src={url}
                                                                        alt={`Análisis ${idx}`}
                                                                        onClick={() => openLightbox(analisis.imagenes, idx)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="card-footer">
                                                    <div className="footer-left">
                                                        <button
                                                            className={`btn-like ${analisis.votos?.some(v => v.usuario?.usuario === user?.usuario) ? 'active' : ''}`}
                                                            onClick={() => handleVotar(analisis.identificador)}
                                                        >
                                                            <FiHeart />
                                                            <span>{analisis.votos?.length || 0}</span>
                                                        </button>
                                                        <span className="post-date">Publicado el {formatFecha(analisis.fechaCreacion)}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })
                                )}

                                {cargandoMas && (
                                    <div className="loader-container-more">
                                        <div className="loader-small"></div>
                                        <p>Cargando más análisis...</p>
                                    </div>
                                )}
                                {!hasMore && listaAnalisis.length > 0 && (
                                    <div className="end-of-feed">
                                        <p>Has llegado al final del historial</p>
                                    </div>
                                )}
                                <div ref={observerTarget} style={{ height: '10px' }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="private-profile-placeholder glass-card">
                            <FiLock size={40} />
                            <h3>Publicaciones Privadas</h3>
                            <p>Este analista ha decidido mantener su historial de análisis oculto.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* LIGHTBOX COMPONENT */}
            {lightbox.isOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}><FiXCircle /></button>
                    
                    {lightbox.images.length > 1 && (
                        <>
                            <button className="lightbox-nav prev" onClick={prevImage}><FiChevronLeft /></button>
                            <button className="lightbox-nav next" onClick={nextImage}><FiChevronRight /></button>
                        </>
                    )}

                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <img src={lightbox.images[lightbox.currentIndex]} alt="Fullscreen" />
                        <div className="lightbox-counter">
                            {lightbox.currentIndex + 1} / {lightbox.images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;