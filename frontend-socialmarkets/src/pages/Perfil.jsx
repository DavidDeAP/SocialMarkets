import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiBarChart2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

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
                const respuesta = await axios.get('http://localhost:8080/api/usuarios/perfil', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(respuesta.data);
                setTempBio(respuesta.data.biografia || '');
            } catch (err) {
                navigate('/login');
            }
        };
        fetchPerfil();
    }, [navigate]);

    const handleFotoClick = () => fileInputRef.current.click();

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTempFoto(file);
            setPreviewUrl(URL.createObjectURL(file));
            setEditando(true);
        }
    };

    const descartarCambios = () => {
        setTempBio(user.biografia || '');
        setTempFoto(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setEditando(false);
    };

    const mostrarAviso = (msg, tipo) => {
        setNotificacion({ mostrar: true, mensaje: msg, tipo: tipo });
        setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 4000);
    };

    const guardarCambios = async () => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('biografia', tempBio);
        if (tempFoto) formData.append('foto', tempFoto);

        try {
            const respuesta = await axios.put('http://localhost:8080/api/usuarios/actualizar', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(respuesta.data); 
            setEditando(false);
            setTempFoto(null);
            setPreviewUrl(null);
            mostrarAviso("¡Perfil actualizado!", "exito");
        } catch (err) {
            mostrarAviso("Error al guardar cambios", "error");
        }
    };

    if (!user) return <div className="cargando-pantalla">Cargando...</div>;

    return (
        <div className="dashboard-layout">
            {/* SIDEBAR COMÚN */}
            <Sidebar />

            <div className="main-wrapper">
                {/* TOPBAR COMÚN (Pasándole el usuario) */}
                <Topbar user={user} />

                <main className="main-content">
                    {/* Notificación flotante */}
                    {notificacion.mostrar && (
                        <div className={`notification-toast ${notificacion.tipo}`}>
                            {notificacion.tipo === 'exito' ? <FiCheckCircle /> : <FiXCircle />}
                            {notificacion.mensaje}
                        </div>
                    )}

                    <div className="profile-container content-card">
                        <div className="profile-header">
                            <div className="profile-photo-section">
                                <div className="profile-avatar-wrapper">
                                    <img 
                                        src={previewUrl || user.imagen || 'https://via.placeholder.com/150'} 
                                        alt="Avatar" 
                                        className="profile-avatar-large"
                                    />
                                    <div className="edit-overlay" onClick={handleFotoClick}>
                                        <FiEdit2 />
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        style={{display: 'none'}} 
                                        onChange={handleFotoChange}
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="profile-info-section">
                                <h1 className="profile-username">{user.usuario}</h1>
                                <p className="profile-date">Miembro desde: {new Date(user.fechaCreacion).toLocaleDateString()}</p>
                                
                                <div className="profile-bio-edit">
                                    <textarea 
                                        className="bio-textarea"
                                        value={tempBio}
                                        onChange={(e) => {setTempBio(e.target.value); setEditando(true);}}
                                        placeholder="Escribe algo sobre ti..."
                                    />
                                </div>

                                <div className="profile-stats-row">
                                    <div className="stat-item">
                                        <span className="stat-value">{user.seguidores || 0}</span>
                                        <span className="stat-label">Seguidores</span>
                                    </div>
                                    <button className="btn-stats-green" onClick={() => navigate('/panel-usuario')}>
                                        <FiBarChart2 /> Ver Estadísticas
                                    </button>
                                </div>
                            </div>
                        </div>

                        {editando && (
                            <div className="profile-actions animate-fade-in">
                                <button className="btn-discard" onClick={descartarCambios}>
                                    <FiXCircle /> Cancelar
                                </button>
                                <button className="btn-save" onClick={guardarCambios}>
                                    <FiCheckCircle /> Guardar Cambios
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Perfil;