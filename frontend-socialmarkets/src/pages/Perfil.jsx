import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultUser from '../assets/defaultuser.png';
import { 
    FiEdit2, FiBarChart2, FiCheckCircle, FiXCircle, 
    FiCalendar, FiUsers, FiTrendingUp, FiTarget, 
    FiTrash2
} from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import './Perfil.css';

const Perfil = () => {
    const { username } = useParams(); 
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [cargando, setCargando] = useState(true);

    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
    const [tempBio, setTempBio] = useState('');
    const [tempFoto, setTempFoto] = useState(null);
    const [borrarFoto, setBorrarFoto] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [editando, setEditando] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarTodo = async () => {
            setCargando(true);
            try {
                const meRes = await api.get('/usuarios/perfil');
                setUser(meRes.data);

                const perfilRes = await api.get(`/usuarios/publico/${username}`);
                setUserProfile(perfilRes.data);
                setTempBio(perfilRes.data.biografia || '');
                
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
        }
    }, [username, navigate]);

    if (cargando) return <div className="loading-screen">Cargando perfil de analista...</div>;
    if (!user || !userProfile) return null;

    const esMiPerfil = user.usuario === userProfile.usuario;

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

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                
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
                                    <h1>{userProfile.usuario}</h1>
                                    {esMiPerfil && !editando && (
                                        <button className="btn-edit-profile" onClick={() => setEditando(true)}>
                                            <FiEdit2 /> Editar Perfil
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
                            <div className="stat-card">
                                <div className="stat-icon followers"><FiUsers /></div>
                                <div className="stat-data">
                                    <span className="stat-value">{userProfile.seguidores || 0}</span>
                                    <span className="stat-label">Seguidores</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon predictions"><FiTrendingUp /></div>
                                <div className="stat-data">
                                    <span className="stat-value">{userProfile.numeroPredicciones || 0}</span>
                                    <span className="stat-label">Predicciones</span>
                                </div>
                            </div>

                            <div className="stat-card highlight">
                                <div className="stat-icon success"><FiTarget /></div>
                                <div className="stat-data">
                                    <div className="success-header">
                                        <span className="stat-value">{(userProfile.indiceAcierto || 0).toFixed(1)}%</span>
                                        <span className="stat-label">Efectividad</span>
                                    </div>
                                    <div className="success-progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${userProfile.indiceAcierto || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {editando && (
                            <div className="action-bar-profile">
                                <button className="btn-secondary" onClick={descartarCambios}>Descartar</button>
                                <button className="btn-primary" onClick={guardarCambios}>Guardar Cambios</button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Perfil;