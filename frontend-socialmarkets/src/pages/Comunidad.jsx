import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FiPlus, FiMessageSquare, FiImage, FiTarget,
    FiCalendar, FiBarChart2, FiX, FiActivity, FiDollarSign,
    FiXCircle, FiCheckCircle, FiArrowUpRight, FiArrowDownRight
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import './Comunidad.css';

const Comunidad = () => {
    const [preciosVivos, setPreciosVivos] = useState({});
    
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
    const [precioActual, setPrecioActual] = useState(null);
    const [cuentaAtras, setCuentaAtras] = useState(10);
    
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

    const fetchPrecioActual = async (symbol) => {
        try {
            const respuesta = await api.get(`/market/price?symbol=${symbol}`);
            const data = typeof respuesta.data === 'string' ? JSON.parse(respuesta.data) : respuesta.data;
            
            console.log(`Precio obtenido para ${symbol}:`, data);

            if (data.chart?.result?.length > 0) {
                const meta = data.chart.result[0].meta;
                const price = meta.regularMarketPrice;
                const prevClose = meta.chartPreviousClose || price;
                const changePercent = ((price - prevClose) / prevClose) * 100;

                setPrecioActual({
                    price: price,
                    currency: meta.currency || 'USD',
                    change: changePercent || 0,
                    symbol: meta.symbol,
                    loading: false
                });
            } else {
                throw new Error("No hay resultados en la respuesta del chart");
            }
        } catch (err) {
            console.error("Error obteniendo precio:", err);
            setPrecioActual({ 
                error: true, 
                message: "No se pudo obtener el precio en vivo",
                loading: false 
            });
        }
    };

    useEffect(() => {
        let timerId;

        if (activoSeleccionado) {
            setCuentaAtras(10);
            fetchPrecioActual(activoSeleccionado.symbol);
            
            timerId = setInterval(() => {
                setCuentaAtras(prev => {
                    if (prev === 1) {
                        fetchPrecioActual(activoSeleccionado.symbol);
                        return 10;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setPrecioActual(null);
            setCuentaAtras(10);
        }

        return () => clearInterval(timerId);
    }, [activoSeleccionado]);

    const handleSeleccionarActivo = (item) => {
        setActivo(`${item.symbol} - ${item.shortname}`);
        setPrecioActual({ loading: true }); // Estado de carga inmediato
        setActivoSeleccionado(item);
        setMostrarSugerencias(false);
    };

    const getTipoLegible = (type) => {
        const types = {
            'EQUITY': 'Acción',
            'INDEX': 'Índice',
            'CRYPTOCURRENCY': 'Crypto',
            'CURRENCY': 'Divisa',
            'ETF': 'ETF',
            'FUTURE': 'Futuro'
        };
        return types[type] || type;
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

    // Polling de precios para el feed (Cada 10 segundos)
    useEffect(() => {
        if (listaAnalisis.length === 0) return;

        const actualizarPreciosFeed = async () => {
            const simbolosRaw = listaAnalisis.map(a => a.activo?.nombre).filter(Boolean);
            const simbolosUnicos = [...new Set(simbolosRaw.map(s => s.trim().toUpperCase()))];
            
            if (simbolosUnicos.length === 0) return;

            try {
                console.log(`[${new Date().toLocaleTimeString()}] Actualizando precios del feed...`);
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
                            listaAnalisis.map((analisis) => {
                                const precioActual = preciosVivos[analisis.activo?.nombre?.toUpperCase()]?.price;
                                let statusClass = "";
                                
                                if (precioActual && analisis.precioEntrada && analisis.precioObjetivo) {
                                    const isBullish = analisis.precioObjetivo > analisis.precioEntrada;
                                    if (isBullish) {
                                        statusClass = precioActual >= analisis.precioEntrada ? "status-winning" : "status-losing";
                                    } else {
                                        statusClass = precioActual <= analisis.precioEntrada ? "status-winning" : "status-losing";
                                    }
                                }

                                return (
                                    <article key={analisis.identificador} className={`analisis-card glass-card ${statusClass}`}>
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
                                        </div>
                                    </div>

                                    <div className="card-market-info-new">
                                        <div className="market-row-top">
                                            <div className="market-item">
                                                <label>Activo</label>
                                                <span className="market-value activo-name">{analisis.activo?.nombre}</span>
                                            </div>
                                            <div className="market-item">
                                                <label>Vencimiento</label>
                                                <span className="market-value date">{formatFecha(analisis.fechaVencimiento)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="market-row-bottom">
                                            <div className="market-item">
                                                <label>Entrada</label>
                                                <span className="market-value price-entry">${analisis.precioEntrada?.toLocaleString()}</span>
                                            </div>
                                            <div className="market-item">
                                                <label>Actual</label>
                                                <span className="market-value price-live">
                                                    {preciosVivos[analisis.activo?.nombre?.toUpperCase()] 
                                                        ? `$${preciosVivos[analisis.activo?.nombre?.toUpperCase()].price.toLocaleString()}`
                                                        : 'Cargando...'}
                                                </span>
                                            </div>
                                            <div className="market-item">
                                                <label>Objetivo</label>
                                                <span className="market-value price-target">${analisis.precioObjetivo?.toLocaleString()}</span>
                                            </div>
                                            <div className="market-item">
                                                <label>Rendimiento</label>
                                                <span className={`market-value price-performance ${statusClass}`}>
                                                    {precioActual && analisis.precioEntrada && analisis.precioObjetivo
                                                        ? (() => {
                                                            const isBullish = analisis.precioObjetivo > analisis.precioEntrada;
                                                            let perf;
                                                            if (isBullish) {
                                                                perf = ((precioActual - analisis.precioEntrada) / analisis.precioEntrada * 100);
                                                            } else {
                                                                perf = ((analisis.precioEntrada - precioActual) / analisis.precioEntrada * 100);
                                                            }
                                                            return `${perf >= 0 ? '+' : ''}${perf.toFixed(2)}%`;
                                                          })()
                                                        : '0.00%'}
                                                </span>
                                            </div>
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
                            );
                        })
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
                            if (!activoSeleccionado) {
                                setToast({ mostrar: true, mensaje: "Por favor, selecciona un activo válido de la lista de sugerencias", tipo: "error" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 5000);
                                return;
                            }
                            if (!precioObjetivo || !fechaVencimiento || !contenido) {
                                setToast({ mostrar: true, mensaje: "Por favor, completa todos los campos (Precio Objetivo, Fecha y Contenido)", tipo: "error" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 5000);
                                return;
                            }

                            // Validación de fecha de vencimiento (debe ser futura)
                            const ahora = new Date();
                            const venci = new Date(fechaVencimiento);
                            if (venci <= ahora) {
                                setToast({ mostrar: true, mensaje: "La fecha de vencimiento debe ser posterior al momento actual", tipo: "error" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 5000);
                                return;
                            }
                            if (contenido.length > MAX_CARACTERES) {
                                setToast({ mostrar: true, mensaje: `El contenido excede el límite de ${MAX_CARACTERES} caracteres`, tipo: "error" });
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 5000);
                                return;
                            }

                            setPublicando(true);
                            try {
                                const formData = new FormData();
                                const analisisData = {
                                    contenido,
                                    tipo: tipoAnalisis,
                                    precioObjetivo: parseFloat(precioObjetivo),
                                    precioEntrada: precioActual?.price || 0,
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
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 5000);
                                
                                // Resetear form
                                setContenido('');
                                setActivo('');
                                setActivoSeleccionado(null);
                                setCuentaAtras(10);
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
                                setTimeout(() => setToast({ mostrar: false, mensaje: '', tipo: '' }), 5000);
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
                                                <li key={idx} onClick={() => handleSeleccionarActivo(item)} className="dropdown-item">
                                                    <div className="item-main">
                                                        <span className="item-symbol">{item.symbol}</span>
                                                        <span className={`item-badge ${item.quoteType.toLowerCase()}`}>
                                                            {getTipoLegible(item.quoteType)}
                                                        </span>
                                                    </div>
                                                    <div className="item-details">
                                                        <span className="item-name">{item.shortname}</span>
                                                        <span className="item-exchange">Mercado: {item.exchDisp}</span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : !cargandoSugerencias && (
                                            <li className="no-results">No se encontraron activos</li>
                                        )}
                                    </ul>
                                )}
                            </div>

                            {(activoSeleccionado || precioActual) && (
                                <div className="live-price-badge glass-card">
                                    {precioActual?.loading ? (
                                        <div className="price-loading">
                                            <div className="loader-small"></div>
                                            <span>Obteniendo cotización real de {activoSeleccionado?.symbol}...</span>
                                        </div>
                                    ) : precioActual?.error ? (
                                        <div className="price-error">
                                            <span>{precioActual.message}</span>
                                            <button type="button" onClick={() => fetchPrecioActual(activoSeleccionado?.symbol)}>Reintentar</button>
                                        </div>
                                    ) : precioActual ? (
                                        <>
                                            <div className="price-container">
                                                <div className="price-main">
                                                    <span className="price-label">Precio Actual</span>
                                                    <span className="price-value">
                                                        {precioActual.price?.toLocaleString('es-ES', { style: 'currency', currency: precioActual.currency || 'USD' })}
                                                    </span>
                                                </div>
                                                <div className={`price-badge ${precioActual.change >= 0 ? 'up' : 'down'}`}>
                                                    <span className="change-arrow">{precioActual.change >= 0 ? '▲' : '▼'}</span>
                                                    <span className="change-percent">{Math.abs(precioActual.change).toFixed(2)}%</span>
                                                </div>
                                            </div>
                                            <div className="live-indicator">
                                                <div className="dot"></div>
                                                EN VIVO
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            )}

                            {precioActual && !precioActual.loading && !precioActual.error && (
                                <div className="price-countdown">
                                    Próxima actualización en: <span>{cuentaAtras}s</span>
                                </div>
                            )}

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
                                    {precioObjetivo && precioActual?.price && (
                                        <div className={`sentiment-indicator ${parseFloat(precioObjetivo) >= precioActual.price ? 'bullish' : 'bearish'}`}>
                                            <div className="sentiment-text">
                                                {parseFloat(precioObjetivo) >= precioActual.price ? (
                                                    <><FiArrowUpRight /> Análisis Alcista</>
                                                ) : (
                                                    <><FiArrowDownRight /> Análisis Bajista</>
                                                )}
                                            </div>
                                            <div className="sentiment-percentage">
                                                {(() => {
                                                    const diff = ((parseFloat(precioObjetivo) - precioActual.price) / precioActual.price) * 100;
                                                    return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
                                                })()}
                                            </div>
                                        </div>
                                    )}
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