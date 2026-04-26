import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FiPlus, FiMessageSquare, FiImage, FiTarget,
    FiCalendar, FiBarChart2, FiX, FiActivity, FiDollarSign,
    FiXCircle, FiCheckCircle
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import './Comunidad.css';

const Comunidad = () => {
    const [user, setUser] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [imagenes, setImagenes] = useState([]);
    const [tipoAnalisis, setTipoAnalisis] = useState('TECNICO');
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.abrirModal) {
            setShowModal(true);
            // Limpiamos el estado para que no se abra cada vez que recarguemos
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const respuesta = await api.get('/usuarios/perfil');
                setUser(respuesta.data);
            } catch (err) {
                console.error("Error al obtener perfil:", err);
                navigate('/login');
            } finally {
                setCargando(false);
            }
        };
        fetchPerfil();
    }, [navigate]);

    if (cargando) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Cargando Comunidad...</p>
        </div>
    );

    const handleImageChange = (e) => {
        if (e.target.files.length + imagenes.length > 4) {
            setToast({ mostrar: true, mensaje: "Máximo 4 imágenes permitidas", tipo: "error" });
            setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 3000);
            return;
        }
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagenes([...imagenes, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImagenes(imagenes.filter((_, i) => i !== index));
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />

                <main className="comunidad-container">
                    <header className="comunidad-header">
                        <h1 className="text-neon-glow">Comunidad</h1>
                        <p>Explora y comparte análisis de mercado con otros analistas.</p>
                    </header>

                    <div className="feed-analisis">
                        <div className="placeholder-feed">
                            <FiMessageSquare size={40} />
                            <p>Aquí aparecerán los análisis de la comunidad...</p>
                        </div>
                    </div>

                    <div className="action-bar-comunidad">
                        <button className="btn-publish" onClick={() => setShowModal(true)}>
                            <FiPlus /> Publicar Nuevo Análisis
                        </button>
                    </div>
                </main>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <div className="modal-header">
                            <h2 className="text-neon-green"><FiActivity /> Crear Análisis</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form className="analisis-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Activo (Ej: BTC/USD, AAPL)</label>
                                <input type="text" placeholder="Escribe el símbolo del activo..." />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Análisis</label>
                                    <div className="tipo-analisis-pills">
                                        <button 
                                            type="button"
                                            className={`pill ${tipoAnalisis === 'TECNICO' ? 'active-tecnico' : ''}`}
                                            onClick={() => setTipoAnalisis('TECNICO')}
                                        >Técnico</button>
                                        <button 
                                            type="button"
                                            className={`pill ${tipoAnalisis === 'FUNDAMENTAL' ? 'active-fundamental' : ''}`}
                                            onClick={() => setTipoAnalisis('FUNDAMENTAL')}
                                        >Fundamental</button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Precio Objetivo</label>
                                    <div className="input-with-icon">
                                        <FiDollarSign />
                                        <input type="number" step="0.01" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Fecha de Vencimiento Estimada</label>
                                <div className="input-with-icon" 
                                     onClick={(e) => {
                                         const input = e.currentTarget.querySelector('input');
                                         if (input && input.showPicker) input.showPicker();
                                     }}
                                     style={{ cursor: 'pointer' }}
                                >
                                    <FiCalendar />
                                    <input type="datetime-local" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Contenido del Análisis</label>
                                <textarea rows="4" placeholder="Explica tu tesis de inversión..."></textarea>
                            </div>

                            <div className="form-group">
                                <label>Imágenes (Máx. 4)</label>
                                <div className="image-upload-container">
                                    <label className="upload-box">
                                        <FiImage />
                                        <span>Subir</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            hidden
                                            disabled={imagenes.length >= 4}
                                        />
                                    </label>

                                    {imagenes.map((img, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={img} alt="Preview" />
                                            <button type="button" onClick={() => removeImage(index)}><FiX /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-analisis">
                                <span>Publicar Análisis</span>
                                <FiCheckCircle />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {toast.mostrar && (
                <div className={`toast-comunidad-alert ${toast.tipo}`}>
                    {toast.tipo === 'error' ? <FiXCircle /> : <FiCheckCircle />}
                    {toast.mensaje}
                </div>
            )}
        </div>
    );
};

export default Comunidad;