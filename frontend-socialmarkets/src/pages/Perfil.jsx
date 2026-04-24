import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiBarChart2, FiCheckCircle, FiXCircle, FiCalendar, FiUsers, FiTrendingUp, FiTarget } from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import './Perfil.css';

const Perfil = () => {
    const [user, setUser] = useState(null);
    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
    const [tempBio, setTempBio] = useState('');
    const [tempFoto, setTempFoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [editando, setEditando] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const respuesta = await api.get('/usuarios/perfil');
                setUser(respuesta.data);
                setTempBio(respuesta.data.biografia || '');
            } catch (err) {
                navigate('/login');
            }
        };
        fetchPerfil();
    }, [navigate]);

    const handleFotoClick = () => { if (editando) fileInputRef.current.click(); };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTempFoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const guardarCambios = async () => {
        const formData = new FormData();
        formData.append('biografia', tempBio);
        if (tempFoto) formData.append('foto', tempFoto);

        try {
            const res = await api.put('/usuarios/actualizar', formData);

            setUser(res.data);
            setEditando(false);
            setTempFoto(null);
            setPreviewUrl(null);
            
            setNotificacion({ mostrar: true, mensaje: 'Perfil actualizado con éxito', tipo: 'exito' });
            setTimeout(() => setNotificacion(prev => ({ ...prev, mostrar: false })), 3000);
        } catch (err) {
            setNotificacion({ mostrar: true, mensaje: 'Error al actualizar', tipo: 'error' });
        }
    };

    const descartarCambios = () => {
        setTempBio(user.biografia || '');
        setTempFoto(null);
        setPreviewUrl(null);
        setEditando(false);
    };

    if (!user) return <div className="loading-screen">Cargando analista...</div>;

    const fechaRegistro = user?.fechaCreacion 
    ? new Date(user.fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
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
                        {/* Header del Perfil */}
                        <div className="profile-hero">
                            <div className={`profile-avatar-container ${editando ? 'mode-edit' : ''}`} onClick={handleFotoClick}>
                                <img 
                                    src={previewUrl || user.imagen || 'https://via.placeholder.com/150'} 
                                    alt="Avatar" 
                                    className="profile-avatar-img"
                                />
                                {editando && (
                                    <div className="avatar-overlay">
                                        <FiEdit2 />
                                        <span>Cambiar</span>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                            </div>

                            <div className="profile-main-info">
                                <div className="name-row">
                                    <h1>{user.usuario}</h1>
                                    {!editando && (
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
                                            placeholder="Escribe tu biografía como analista..."
                                            maxLength="160"
                                        />
                                    ) : (
                                        <p className="bio-text">{user.biografia || "Sin biografía profesional todavía."}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="stats-dashboard-grid">
                            <div className="stat-card">
                                <div className="stat-icon followers"><FiUsers /></div>
                                <div className="stat-data">
                                    <span className="stat-value">{user.seguidores || 0}</span>
                                    <span className="stat-label">Seguidores</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon predictions"><FiTrendingUp /></div>
                                <div className="stat-data">
                                    <span className="stat-value">{user.numeroPredicciones || 0}</span>
                                    <span className="stat-label">Predicciones</span>
                                </div>
                            </div>

                            <div className="stat-card highlight">
                                <div className="stat-icon success"><FiTarget /></div>
                                <div className="stat-data">
                                    <div className="success-header">
                                        <span className="stat-value">{(user.indiceAcierto || 0).toFixed(1)}%</span>
                                        <span className="stat-label">Efectividad</span>
                                    </div>
                                    <div className="success-progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${user.indiceAcierto || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones de Acción */}
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