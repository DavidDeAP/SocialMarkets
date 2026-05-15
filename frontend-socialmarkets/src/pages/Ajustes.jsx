import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { FiMonitor, FiBell, FiEye, FiEyeOff, FiLock, FiUnlock, FiSliders, FiCheckCircle, FiXCircle, FiLogOut, FiTrash2, FiAlertTriangle, FiRotateCcw, FiKey, FiSave } from 'react-icons/fi';
import './Ajustes.css';

/**
 * Página principal de configuración donde el usuario gestiona su terminal, privacidad y cuenta
 */
const Ajustes = () => {
    const [user, setUser] = useState(null);
    const { showTicker, setShowTicker } = useSettings(); // Ajuste local de la interfaz
    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

    // Estados para controlar qué partes del perfil son visibles para otros usuarios
    const [privacidad, setPrivacidad] = useState('PUBLICO');
    const [ocultarSeguidores, setOcultarSeguidores] = useState(false);
    const [ocultarPredicciones, setOcultarPredicciones] = useState(false);
    const [ocultarIndice, setOcultarIndice] = useState(false);
    const [ocultarPublicaciones, setOcultarPublicaciones] = useState(false);

    // Estados para notificaciones
    const [notificarSeguidores, setNotificarSeguidores] = useState(true);
    const [notificarPublicaciones, setNotificarPublicaciones] = useState(true);
    const [notificarReacciones, setNotificarReacciones] = useState(true);

    // Al cargar la página, traemos los ajustes actuales del usuario desde el servidor
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/usuarios/perfil');
                const d = res.data;
                setUser(d);
                setPrivacidad(d.privacidadPerfil || 'PUBLICO');
                setOcultarSeguidores(d.ocultarSeguidores || false);
                setOcultarPredicciones(d.ocultarPredicciones || false);
                setOcultarIndice(d.ocultarIndiceAcierto || false);
                setOcultarPublicaciones(d.ocultarPublicaciones || false);
                
                // Cargar preferencias de notificación
                setNotificarSeguidores(d.notificarSeguidores !== false);
                setNotificarPublicaciones(d.notificarPublicaciones !== false);
                setNotificarReacciones(d.notificarReacciones !== false);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, []);

    // Función para salir de la aplicación borrando el token de seguridad
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // Gestión del cambio de contraseña
    const [passActual, setPassActual] = useState('');
    const [passNueva, setPassNueva] = useState('');
    const [passRepetida, setPassRepetida] = useState('');
    const [cambiandoPass, setCambiandoPass] = useState(false);
    const [mostrarFormPass, setMostrarFormPass] = useState(false);

    const handleCambiarPassword = async (e) => {
        e.preventDefault();

        if (passNueva !== passRepetida) {
            setNotificacion({ mostrar: true, mensaje: 'Las nuevas contraseñas no coinciden', tipo: 'error' });
            return;
        }

        if (passNueva.length < 6) {
            setNotificacion({ mostrar: true, mensaje: 'La contraseña debe tener al menos 6 caracteres', tipo: 'error' });
            return;
        }

        setCambiandoPass(true);
        try {
            const params = new URLSearchParams();
            params.append('actual', passActual);
            params.append('nueva', passNueva);

            await api.put('/usuarios/cambiar-password', params);

            setNotificacion({ mostrar: true, mensaje: 'Contraseña actualizada correctamente', tipo: 'exito' });
            setPassActual('');
            setPassNueva('');
            setPassRepetida('');
        } catch (err) {
            setNotificacion({
                mostrar: true,
                mensaje: err.response?.data || 'Error al cambiar la contraseña',
                tipo: 'error'
            });
        } finally {
            setCambiandoPass(false);
            setTimeout(() => setNotificacion(p => ({ ...p, mostrar: false })), 2000);
        }
    };

    // Lógica para borrar la cuenta con una cuenta atrás de seguridad
    const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
    const [segundosRestantes, setSegundosRestantes] = useState(0);
    const [timerIniciado, setTimerIniciado] = useState(false);

    const iniciarCuentaAtras = () => {
        setSegundosRestantes(3);
        setTimerIniciado(true);
    };

    const cancelarBorrado = () => {
        setConfirmandoBorrado(false);
        setSegundosRestantes(0);
        setTimerIniciado(false);
    };

    // Efecto que maneja el reloj de la cuenta atrás antes de borrar la cuenta definitivamente
    useEffect(() => {
        let interval = null;
        if (segundosRestantes > 0 && timerIniciado) {
            interval = setInterval(() => {
                setSegundosRestantes(prev => prev - 1);
            }, 1000);
        } else if (segundosRestantes === 0 && timerIniciado) {
            const borrarCuenta = async () => {
                try {
                    await api.post('/usuarios/eliminar');
                    handleLogout();
                } catch (err) {
                    console.error("Error al borrar cuenta", err);
                    setNotificacion({ mostrar: true, mensaje: 'Error al borrar cuenta', tipo: 'error' });
                    cancelarBorrado();
                }
            };
            borrarCuenta();
        }
        return () => { if (interval) clearInterval(interval); };
    }, [segundosRestantes, timerIniciado]);

    // Envía los cambios de privacidad al servidor
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
            setTimeout(() => setNotificacion(p => ({ ...p, mostrar: false })), 2000);
        }
    };

    const guardarNotificaciones = async (tipo, valor) => {
        try {
            const nSeg = tipo === 'seguidores' ? valor : notificarSeguidores;
            const nPub = tipo === 'publicaciones' ? valor : notificarPublicaciones;
            const nReac = tipo === 'reacciones' ? valor : notificarReacciones;

            await api.put(`/usuarios/preferencias-notificaciones?seguidores=${nSeg}&publicaciones=${nPub}&reacciones=${nReac}`);
            setNotificacion({ mostrar: true, mensaje: 'Preferencias de avisos actualizadas', tipo: 'exito' });
        } catch (err) {
            setNotificacion({ mostrar: true, mensaje: 'Error al actualizar avisos', tipo: 'error' });
        } finally {
            setTimeout(() => setNotificacion(p => ({ ...p, mostrar: false })), 2000);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />
                <main className="main-content">
                    {/* Avisos flotantes de éxito o error */}
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

                        {/* SECCIÓN INTERFAZ: Controla cómo se ve la aplicación */}
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

                        {/* SECCIÓN NOTIFICACIONES: Controla qué avisos recibes */}
                        <div className="ajustes-section">
                            <div className="section-header">
                                <FiBell />
                                <h3>Notificaciones</h3>
                            </div>
                            <div className="ajustes-grid">
                                <div className="ajuste-card glass-card">
                                    <div className="ajuste-info">
                                        <div className="ajuste-label">
                                            <span>Nuevos Seguidores</span>
                                        </div>
                                        <p className="ajuste-description">Recibe un aviso cuando alguien comience a seguirte.</p>
                                    </div>
                                    <div className="ajuste-action">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={notificarSeguidores}
                                                onChange={(e) => { setNotificarSeguidores(e.target.checked); guardarNotificaciones('seguidores', e.target.checked); }}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="ajuste-card glass-card">
                                    <div className="ajuste-info">
                                        <div className="ajuste-label">
                                            <span>Nuevas Publicaciones</span>
                                        </div>
                                        <p className="ajuste-description">Recibe un aviso cuando un analista al que sigues publique algo.</p>
                                    </div>
                                    <div className="ajuste-action">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={notificarPublicaciones}
                                                onChange={(e) => { setNotificarPublicaciones(e.target.checked); guardarNotificaciones('publicaciones', e.target.checked); }}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="ajuste-card glass-card">
                                    <div className="ajuste-info">
                                        <div className="ajuste-label">
                                            <span>Reacciones (Likes)</span>
                                        </div>
                                        <p className="ajuste-description">Recibe un aviso cuando alguien reaccione a tus análisis.</p>
                                    </div>
                                    <div className="ajuste-action">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={notificarReacciones}
                                                onChange={(e) => { setNotificarReacciones(e.target.checked); guardarNotificaciones('reacciones', e.target.checked); }}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN PRIVACIDAD: Elige quién puede ver tus datos */}
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

                            {/* Opciones detalladas solo si el modo es Personalizado */}
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

                        {/* SECCIÓN CUENTA Y SEGURIDAD */}
                        <div className="ajustes-section logout-section animate-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="section-header danger">
                                <FiLogOut />
                                <h3>Cuenta</h3>
                            </div>

                            {/* Formulario para cambiar la clave de acceso */}
                            <div className="ajuste-card password-card glass-card">
                                <div className="ajuste-info full-width">
                                    <div className="ajuste-label"><FiKey /> Seguridad de Acceso</div>
                                    <p className="ajuste-description">Gestiona tu contraseña.</p>

                                    {!mostrarFormPass ? (
                                        <button className="btn-toggle-pass" onClick={() => setMostrarFormPass(true)}>
                                            <FiKey /> Cambiar Contraseña
                                        </button>
                                    ) : (
                                        <form className="password-form animate-fade-in" onSubmit={handleCambiarPassword}>
                                            <div className="password-grid">
                                                <div className="input-group-modern">
                                                    <label>Contraseña Actual</label>
                                                    <input
                                                        type="password"
                                                        value={passActual}
                                                        onChange={(e) => setPassActual(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group-modern">
                                                    <label>Nueva Contraseña</label>
                                                    <input
                                                        type="password"
                                                        value={passNueva}
                                                        onChange={(e) => setPassNueva(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group-modern">
                                                    <label>Repetir Nueva Contraseña</label>
                                                    <input
                                                        type="password"
                                                        value={passRepetida}
                                                        onChange={(e) => setPassRepetida(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="password-form-actions">
                                                <button type="submit" className="btn-save-pass" disabled={cambiandoPass}>
                                                    {cambiandoPass ? 'Actualizando...' : <><FiSave /> Guardar</>}
                                                </button>
                                                <button type="button" className="btn-cancel-pass" onClick={() => setMostrarFormPass(false)}>
                                                    Cancelar
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Botón para salir de la cuenta */}
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

                            {/* Zona de peligro: Eliminación de cuenta */}
                            <div className="ajuste-card delete-account-card glass-card">
                                <div className="ajuste-info">
                                    <div className="ajuste-label danger-text">Borrar Cuenta</div>
                                    <p className="ajuste-description">Elimina permanentemente tu cuenta y todos tus datos.</p>
                                </div>
                                <div className="ajuste-action">
                                    {!confirmandoBorrado ? (
                                        <button className="btn-delete-account" onClick={() => setConfirmandoBorrado(true)}>
                                            <FiTrash2 /> Borrar Cuenta
                                        </button>
                                    ) : timerIniciado && segundosRestantes === 0 ? (
                                        <div className="delete-processing-wrapper">
                                            <div className="spinner-danger"></div>
                                            <span>Eliminando cuenta permanentemente...</span>
                                        </div>
                                    ) : segundosRestantes > 0 ? (
                                        <div className="delete-countdown-wrapper">
                                            <div className="countdown-circle">
                                                <svg>
                                                    <circle r="18" cx="20" cy="20"></circle>
                                                </svg>
                                                <span className="countdown-number">{segundosRestantes}</span>
                                            </div>
                                            <div className="countdown-info">
                                                <span className="countdown-text">Borrando datos...</span>
                                                <button className="btn-cancel-delete" onClick={cancelarBorrado}>
                                                    <FiRotateCcw /> Cancelar ahora
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="delete-confirm-wrapper animate-in">
                                            <span className="confirm-warning">
                                                <FiAlertTriangle /> ¿Estás seguro? Esta acción es irreversible.
                                            </span>
                                            <div className="confirm-actions">
                                                <button className="btn-confirm-delete" onClick={iniciarCuentaAtras}>
                                                    Sí, eliminar definitivamente
                                                </button>
                                                <button className="btn-cancel-simple" onClick={() => setConfirmandoBorrado(false)}>
                                                    No, volver
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
