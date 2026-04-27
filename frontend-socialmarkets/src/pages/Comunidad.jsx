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
    const [contenido, setContenido] = useState('');
    const [activo, setActivo] = useState('');
    const [precioObjetivo, setPrecioObjetivo] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [intentadoPublicar, setIntentadoPublicar] = useState(false);
    const [listaAnalisis, setListaAnalisis] = useState([]);
    const [publicando, setPublicando] = useState(false);
    const [cargandoFeed, setCargandoFeed] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    
    // Autocompletado de Activos
    const [busquedaActivos, setBusquedaActivos] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
    const [activoSeleccionado, setActivoSeleccionado] = useState(null);
    
    const MAX_CARACTERES = 1000;
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
        const timeoutId = setTimeout(() => {
            if (activo && !activoSeleccionado) {
                buscarActivos(activo);
            } else if (!activo) {
                setBusquedaActivos([]);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [activo]);

    const buscarActivos = async (query) => {
        if (query.length < 2) return;
        setCargandoSugerencias(true);
        try {
            // Llamamos a nuestro propio backend para evitar problemas de CORS
            const respuesta = await api.get(`/market/search?q=${query}`);
            console.log("Respuesta búsqueda activos:", respuesta.data);
            
            const data = typeof respuesta.data === 'string' ? JSON.parse(respuesta.data) : respuesta.data;
            
            if (data.quotes && data.quotes.length > 0) {
                const filtrados = data.quotes.map(q => ({
                    symbol: q.symbol,
                    shortname: q.shortname || q.longname || q.symbol,
                    quoteType: q.quoteType || 'STOCK',
                    exchDisp: q.exchDisp || 'Global'
                }));
                setBusquedaActivos(filtrados);
                setMostrarSugerencias(true);
            } else {
                setBusquedaActivos([]);
                setMostrarSugerencias(true); // Para mostrar el mensaje de "No encontrado"
            }
        } catch (err) {
            console.error("Error buscando activos:", err);
        } finally {
            setCargandoSugerencias(false);
        }
    };

    const handleSeleccionarActivo = (item) => {
        setActivo(`${item.symbol} - ${item.shortname}`);
        setActivoSeleccionado(item);
        setMostrarSugerencias(false);
    };

    const fetchAnalisis = async () => {
        setCargandoFeed(true);
        try {
            const respuesta = await api.get('/analisis');
            console.log("Análisis recibidos:", respuesta.data);
            
            // Ordenar por fecha de creación (más nuevos primero)
            const ordenados = respuesta.data.sort((a, b) => {
                const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
                const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
                return dateB - dateA;
            });
            setListaAnalisis(ordenados);
        } catch (err) {
            console.error("Error al obtener análisis:", err);
        } finally {
            setCargandoFeed(false);
        }
    };

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
        fetchAnalisis();
    }, [navigate]);

    if (cargando) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Cargando Comunidad...</p>
        </div>
    );

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 4) {
            setToast({ mostrar: true, mensaje: "Máximo 4 imágenes permitidas", tipo: "error" });
            setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 3000);
            return;
        }
        
        setSelectedFiles([...selectedFiles, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagenes([...imagenes, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImagenes(imagenes.filter((_, i) => i !== index));
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                        {cargandoFeed ? (
                            <div className="loader-container-feed">
                                <div className="loader-small"></div>
                                <p>Cargando análisis...</p>
                            </div>
                        ) : listaAnalisis.length === 0 ? (
                            <div className="placeholder-feed">
                                <FiMessageSquare size={40} />
                                <p>Aún no hay análisis. ¡Sé el primero en publicar!</p>
                            </div>
                        ) : (
                            listaAnalisis.map((analisis) => (
                                <article key={analisis.identificador} className="analisis-card glass-card">
                                    <div className="card-header">
                                        <div className="user-info-section clickable-profile" onClick={() => navigate(`/perfil/${analisis.usuario?.usuario}`)}>
                                            <img 
                                                src={analisis.usuario?.imagen || 'https://via.placeholder.com/150'} 
                                                alt={analisis.usuario?.usuario} 
                                                className="user-avatar-small"
                                            />
                                            <div className="user-meta">
                                                <span className="username">{analisis.usuario?.usuario}</span>
                                                <div className="user-stats-small">
                                                    <span className="stat-item acierto">
                                                        {analisis.usuario?.indiceAcierto?.toFixed(1) || 0}% acierto
                                                    </span>
                                                    <span className="stat-separator">•</span>
                                                    <span className="stat-item preds">
                                                        {analisis.usuario?.numeroPredicciones || 0} predicciones
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`tipo-badge ${analisis.tipo?.toLowerCase()}`}>
                                            {analisis.tipo === 'TECNICO' ? 'Técnico' : 'Fundamental'}
                                        </div>
                                    </div>

                                    <div className="card-market-info">
                                        <div className="market-item">
                                            <label>Activo</label>
                                            <span className="market-value activo-name">{analisis.activo?.nombre}</span>
                                        </div>
                                        <div className="market-item">
                                            <label>Precio Objetivo</label>
                                            <span className="market-value price">${analisis.precioObjetivo?.toLocaleString()}</span>
                                        </div>
                                        <div className="market-item">
                                            <label>Vencimiento</label>
                                            <span className="market-value date">{formatFecha(analisis.fechaVencimiento)}</span>
                                        </div>
                                    </div>

                                    <div className="card-content">
                                        <p className="analysis-text">{analisis.contenido}</p>
                                        
                                        {analisis.imagenes && analisis.imagenes.length > 0 && (
                                            <div className={`analysis-gallery grid-${Math.min(analisis.imagenes.length, 4)}`}>
                                                {analisis.imagenes.map((url, idx) => (
                                                    <div key={idx} className="gallery-item">
                                                        <img src={url} alt={`Análisis ${idx}`} onClick={() => window.open(url, '_blank')} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-footer">
                                        <span className="post-date">Publicado el {formatFecha(analisis.fechaCreacion)}</span>
                                    </div>
                                </article>
                            ))
                        )}
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

                        <form className="analisis-form" onSubmit={async (e) => {
                            e.preventDefault();
                            setIntentadoPublicar(true);

                            // Validación de campos vacíos
                            if (!activo || !precioObjetivo || !fechaVencimiento || !contenido || !activoSeleccionado) {
                                setToast({ mostrar: true, mensaje: "Por favor, selecciona un activo válido de la lista", tipo: "error" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 3000);
                                return;
                            }

                            // Validación de longitud
                            if (contenido.length > MAX_CARACTERES) {
                                setToast({ mostrar: true, mensaje: `El contenido excede el límite de ${MAX_CARACTERES} caracteres`, tipo: "error" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 3000);
                                return;
                            }

                            setPublicando(true);
                            try {
                                const formData = new FormData();
                                const analisisData = {
                                    contenido,
                                    tipo: tipoAnalisis,
                                    precioObjetivo: parseFloat(precioObjetivo),
                                    fechaVencimiento: fechaVencimiento, // Enviamos el formato local del input (YYYY-MM-DDTHH:mm)
                                    activo: { 
                                        nombre: activoSeleccionado.symbol,
                                        tipo: activoSeleccionado.quoteType
                                    }
                                };

                                formData.append('analisis', new Blob([JSON.stringify(analisisData)], { type: 'application/json' }));
                                
                                selectedFiles.forEach(file => {
                                    formData.append('imagenes', file);
                                });

                                await api.post('/analisis/crear', formData);

                                setToast({ mostrar: true, mensaje: "Análisis publicado con éxito", tipo: "success" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 3000);
                                
                                // Resetear form
                                setContenido('');
                                setActivo('');
                                setActivoSeleccionado(null);
                                setPrecioObjetivo('');
                                setFechaVencimiento('');
                                setImagenes([]);
                                setSelectedFiles([]);
                                setShowModal(false);
                                setIntentadoPublicar(false);
                                
                                // Recargar feed
                                fetchAnalisis();

                            } catch (err) {
                                console.error("Error al publicar:", err);
                                setToast({ mostrar: true, mensaje: "Error al publicar el análisis", tipo: "error" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 3000);
                            } finally {
                                setPublicando(false);
                            }
                        }}>
                            <div className="form-group autocomplete-container">
                                <label>Activo (Busca por símbolo o nombre)</label>
                                <div className="input-with-icon">
                                    <FiActivity />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: BTC, Apple, Tesla..." 
                                        value={activo}
                                        onChange={(e) => {
                                            setActivo(e.target.value);
                                            setActivoSeleccionado(null); // Reseteamos al escribir
                                        }}
                                        onFocus={() => busquedaActivos.length > 0 && setMostrarSugerencias(true)}
                                        className={intentadoPublicar && !activoSeleccionado ? 'input-error' : ''}
                                    />
                                    {cargandoSugerencias && <div className="loader-input"></div>}
                                </div>
                                
                                {mostrarSugerencias && activo.length >= 2 && !activoSeleccionado && (
                                    <ul className="autocomplete-dropdown glass-card">
                                        {busquedaActivos.length > 0 ? (
                                            busquedaActivos.map((item, idx) => (
                                                <li key={idx} onClick={() => handleSeleccionarActivo(item)}>
                                                    <div className="item-symbol">{item.symbol}</div>
                                                    <div className="item-details">
                                                        <span className="item-name">{item.shortname}</span>
                                                        <span className="item-type">{item.quoteType} • {item.exchDisp}</span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : !cargandoSugerencias && (
                                            <li className="no-results">No se encontraron activos</li>
                                        )}
                                    </ul>
                                )}
                                {intentadoPublicar && !activoSeleccionado && (
                                    <p className="error-hint">Debes seleccionar un activo de la lista</p>
                                )}
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
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="0.00" 
                                            value={precioObjetivo}
                                            onChange={(e) => setPrecioObjetivo(e.target.value)}
                                            className={intentadoPublicar && !precioObjetivo ? 'input-error' : ''}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Fecha de Vencimiento Estimada</label>
                                <div className={`input-with-icon clickable-date ${intentadoPublicar && !fechaVencimiento ? 'input-error' : ''}`} 
                                     onClick={(e) => {
                                         const input = e.currentTarget.querySelector('input');
                                         if (input && input.showPicker) input.showPicker();
                                     }}
                                     style={{ cursor: 'pointer' }}
                                >
                                    <FiCalendar />
                                    <input 
                                        type="datetime-local" 
                                        value={fechaVencimiento}
                                        onChange={(e) => setFechaVencimiento(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Contenido del Análisis</label>
                                <textarea 
                                    rows="4" 
                                    placeholder="Explica tu análisis..."
                                    value={contenido}
                                    onChange={(e) => setContenido(e.target.value)}
                                    className={(intentadoPublicar && !contenido) || contenido.length > MAX_CARACTERES ? 'input-error' : ''}
                                ></textarea>
                                <div className="textarea-footer">
                                    <div className={`char-counter ${contenido.length > MAX_CARACTERES ? 'text-error' : ''}`}>
                                        {contenido.length} / {MAX_CARACTERES}
                                    </div>
                                    {contenido.length > MAX_CARACTERES && (
                                        <p className="error-hint">Límite de caracteres excedido</p>
                                    )}
                                </div>
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

                            <button type="submit" className="btn-submit-analisis" disabled={publicando}>
                                {publicando ? (
                                    <>
                                        <span>Publicando...</span>
                                        <div className="loader-small"></div>
                                    </>
                                ) : (
                                    <>
                                        <span>Publicar Análisis</span>
                                        <FiCheckCircle />
                                    </>
                                )}
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