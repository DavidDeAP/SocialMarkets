import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { FiMonitor, FiEye, FiEyeOff, FiLock, FiUnlock, FiSliders, FiCheckCircle, FiXCircle, FiLogOut } from 'react-icons/fi';
import './Ajustes.css';

const Ajustes = () => {
    const [user, setUser] = useState(null);
    const { showTicker, setShowTicker } = useSettings();
    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

    // Estados de privacidad (Backend)
    const [privacidad, setPrivacidad] = useState('PUBLICO');
    const [ocultarSeguidores, setOcultarSeguidores] = useState(false);
    const [ocultarPredicciones, setOcultarPredicciones] = useState(false);
    const [ocultarIndice, setOcultarIndice] = useState(false);
    const [ocultarPublicaciones, setOcultarPublicaciones] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/usuarios/perfil');
                setUser(res.data);
                setPrivacidad(res.data.privacidadPerfil || 'PUBLICO');
                setOcultarSeguidores(res.data.ocultarSeguidores || false);
                setOcultarPredicciones(res.data.ocultarPredicciones || false);
                setOcultarIndice(res.data.ocultarIndiceAcierto || false);
                setOcultarPublicaciones(res.data.ocultarPublicaciones || false);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const guardarPrivacidad = async (nuevosDatos) => {
        try {
            const params = new URLSearchParams({
                privacidad: nuevosDatos.privacidad ?? privacidad,
                ocultarSeguidores: nuevosDatos.ocultarSeguidores ?? ocultarSeguidores,
                ocultarPredicciones: nuevosDatos.ocultarPredicciones ?? ocultarPredicciones,
                ocultarIndice: nuevosDatos.ocultarIndice ?? ocultarIndice,
                ocultarPublicaciones: nuevosDatos.ocultarPublicaciones ?? ocultarPublicaciones
            });

            const res = await api.put(`/usuarios/privacidad?${params.toString()}`);
            setUser(res.data);
            setNotificacion({ mostrar: true, mensaje: 'Privacidad actualizada', tipo: 'exito' });
        } catch (err) {
            setNotificacion({ mostrar: true, mensaje: 'Error al actualizar', tipo: 'error' });
        } finally {
            setTimeout(() => setNotificacion(p => ({ ...p, mostrar: false })), 3000);
        }
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

                    <header className="ajustes-header animate-in">
                        <div className="header-info">
                            <h1 className="text-neon-glow">Configuración</h1>
                            <p className="welcome-user">Gestiona tu terminal y privacidad</p>
                        </div>
                    </header>

                    <div className="ajustes-container animate-in-up">

                        {/* SECCIÓN INTERFAZ */}
                        <div className="ajustes-section">
                            <div className="section-header">
                                <FiMonitor />
                                <h3>Interfaz y Pantalla</h3>
                            </div>
                            <div className="ajustes-grid">
                                <div className="ajuste-card glass-card">
                                    <div className="ajuste-info">
                                        <div className="ajuste-label">
                                            <span>Cinta de Activos (Ticker)</span>
                                            {showTicker ? <FiEye className="status-icon active" /> : <FiEyeOff className="status-icon" />}
                                        </div>
                                        <p className="ajuste-description">Muestra u oculta la barra de precios en tiempo real en la parte superior.</p>
                                    </div>
                                    <div className="ajuste-action">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={showTicker}
                                                onChange={(e) => setShowTicker(e.target.checked)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN PRIVACIDAD */}
                        <div className="ajustes-section">
                            <div className="section-header">
                                <FiLock />
                                <h3>Privacidad del Perfil</h3>
                            </div>

                            <div className="privacy-modes-grid">
                                <button
                                    className={`privacy-mode-card ${privacidad === 'PUBLICO' ? 'active' : ''}`}
                                    onClick={() => { setPrivacidad('PUBLICO'); guardarPrivacidad({ privacidad: 'PUBLICO' }); }}
                                >
                                    <FiUnlock className="mode-icon" />
                                    <div className="mode-text">
                                        <h4>Público</h4>
                                        <p>Todos pueden ver tus estadísticas y publicaciones.</p>
                                    </div>
                                </button>

                                <button
                                    className={`privacy-mode-card ${privacidad === 'PRIVADO' ? 'active' : ''}`}
                                    onClick={() => { setPrivacidad('PRIVADO'); guardarPrivacidad({ privacidad: 'PRIVADO' }); }}
                                >
                                    <FiLock className="mode-icon" />
                                    <div className="mode-text">
                                        <h4>Privado</h4>
                                        <p>Solo tú puedes ver el contenido de tu perfil.</p>
                                    </div>
                                </button>

                                <button
                                    className={`privacy-mode-card ${privacidad === 'PERSONALIZADO' ? 'active' : ''}`}
                                    onClick={() => { setPrivacidad('PERSONALIZADO'); guardarPrivacidad({ privacidad: 'PERSONALIZADO' }); }}
                                >
                                    <FiSliders className="mode-icon" />
                                    <div className="mode-text">
                                        <h4>Personalizado</h4>
                                        <p>Elige exactamente qué quieres ocultar a los demás.</p>
                                    </div>
                                </button>
                            </div>

                            {privacidad === 'PERSONALIZADO' && (
                                <div className="custom-privacy-options animate-fade-in">
                                    <div className="ajustes-grid">
                                        <div className="ajuste-card glass-card mini">
                                            <div className="ajuste-info">
                                                <div className="ajuste-label">Ocultar Seguidores</div>
                                            </div>
                                            <div className="ajuste-action">
                                                <label className="switch small">
                                                    <input
                                                        type="checkbox"
                                                        checked={ocultarSeguidores}
                                                        onChange={(e) => { setOcultarSeguidores(e.target.checked); guardarPrivacidad({ ocultarSeguidores: e.target.checked }); }}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="ajuste-card glass-card mini">
                                            <div className="ajuste-info">
                                                <div className="ajuste-label">Ocultar Predicciones</div>
                                            </div>
                                            <div className="ajuste-action">
                                                <label className="switch small">
                                                    <input
                                                        type="checkbox"
                                                        checked={ocultarPredicciones}
                                                        onChange={(e) => { setOcultarPredicciones(e.target.checked); guardarPrivacidad({ ocultarPredicciones: e.target.checked }); }}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="ajuste-card glass-card mini">
                                            <div className="ajuste-info">
                                                <div className="ajuste-label">Ocultar Índice de Acierto</div>
                                            </div>
                                            <div className="ajuste-action">
                                                <label className="switch small">
                                                    <input
                                                        type="checkbox"
                                                        checked={ocultarIndice}
                                                        onChange={(e) => { setOcultarIndice(e.target.checked); guardarPrivacidad({ ocultarIndice: e.target.checked }); }}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="ajuste-card glass-card mini">
                                            <div className="ajuste-info">
                                                <div className="ajuste-label">Ocultar Publicaciones</div>
                                            </div>
                                            <div className="ajuste-action">
                                                <label className="switch small">
                                                    <input
                                                        type="checkbox"
                                                        checked={ocultarPublicaciones}
                                                        onChange={(e) => { setOcultarPublicaciones(e.target.checked); guardarPrivacidad({ ocultarPublicaciones: e.target.checked }); }}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECCIÓN CUENTA / SESIÓN */}
                        <div className="ajustes-section logout-section animate-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="section-header danger">
                                <FiLogOut />
                                <h3>Cuenta</h3>
                            </div>
                            <div className="ajuste-card logout-card glass-card">
                                <div className="ajuste-info">
                                    <div className="ajuste-label danger-text">Cerrar Sesión</div>
                                    <p className="ajuste-description">Finaliza tu sesión actual.</p>
                                </div>
                                <div className="ajuste-action">
                                    <button className="btn-logout-modern" onClick={handleLogout}>
                                        <FiLogOut /> Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Ajustes;
