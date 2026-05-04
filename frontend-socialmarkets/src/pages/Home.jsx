import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiTrendingUp, FiTarget, FiClock, FiPlus, FiArrowUpRight, FiActivity, FiXCircle, FiCheckCircle, FiCalendar 
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import './Home.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [preciosVivos, setPreciosVivos] = useState({});
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    // Helper para calcular rendimiento
    const calculatePerformance = (entry, current) => {
        if (!entry || !current) return 0;
        return (((current - entry) / entry) * 100).toFixed(2);
    };

    const fetchPrices = useCallback(async (activos) => {
        if (!activos || activos.length === 0) return;
        try {
            const symbols = [...new Set(activos.map(a => a.activo.nombre.toUpperCase()))].join(',');
            const pRes = await api.get(`/market/prices?symbols=${symbols}`);
            const mapPrecios = {};
            pRes.data.quoteResponse.result.forEach(q => {
                mapPrecios[q.symbol] = q.regularMarketPrice;
            });
            setPreciosVivos(mapPrecios);
        } catch (err) {
            console.error("Error actualizando precios:", err);
        }
    }, []);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const [perfilRes, resumenRes] = await Promise.all([
                    api.get('/usuarios/perfil'),
                    api.get('/analisis/resumen')
                ]);
                setUser(perfilRes.data);
                setResumen(resumenRes.data);

                // Primera carga de precios
                const activosParaPrecio = resumenRes.data.recientes
                    ?.filter(a => a.estado === 'PENDIENTE') || [];
                
                if (activosParaPrecio.length > 0) {
                    await fetchPrices(activosParaPrecio);
                }
            } catch (err) {
                console.error("Error al obtener datos:", err);
                navigate('/login');
            } finally {
                setCargando(false);
            }
        };
        fetchDatos();

        // Polling de precios cada 30 segundos
        const interval = setInterval(() => {
            if (resumen?.recientes) {
                const activosParaPrecio = resumen.recientes.filter(a => a.estado === 'PENDIENTE');
                fetchPrices(activosParaPrecio);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [navigate, fetchPrices, resumen?.recientes]);

    const calculateLiveStats = () => {
        if (!resumen || !resumen.activos) return { wins: 0, losses: 0 };
        let wins = 0;
        let losses = 0;
        resumen.activos.forEach(a => {
            const precioActual = preciosVivos[a.activo.nombre.toUpperCase()];
            if (precioActual) {
                const isBullish = a.precioObjetivo > a.precioEntrada;
                const perf = parseFloat(calculatePerformance(a.precioEntrada, precioActual));
                if ((isBullish && perf >= 0) || (!isBullish && perf >= 0)) {
                    // En mi sistema, el rendimiento es relativo a la direccion.
                    // Pero para simplificar, si el precio actual favorece la direccion:
                    if (isBullish ? precioActual >= a.precioEntrada : precioActual <= a.precioEntrada) {
                        wins++;
                    } else {
                        losses++;
                    }
                } else {
                    losses++;
                }
            }
        });
        return { wins, losses };
    };

    const liveStats = calculateLiveStats();

    if (cargando) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Cargando Panel...</p>
        </div>
    );

    if (!user) return null;

    const indiceAcierto = (user.indiceAcierto || 0).toFixed(1);
    const proyeccionesActivas = resumen?.activos?.length || 0;
    const proyeccionesTotales = resumen?.total || 0;
    const aumentoMes = resumen?.aumentoMes || 0;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />
                <main className="main-content">
                    
                    <header className="dashboard-header animate-in">
                        <div className="header-info">
                            <h1 className="text-neon-glow">Panel de Control</h1>
                            <p className="welcome-user">Bienvenido, <span className="username-neon">{user.usuario}</span></p>
                        </div>
                        <button className="btn-primary-modern" onClick={() => navigate('/comunidad', { state: { abrirModal: true } })}>
                            <FiPlus />
                            <span>Nuevo Análisis</span>
                        </button>
                    </header>

                    <div className="stats-grid-modern">
                        <div className="stat-card animate-card" style={{"--delay": "0.1s"}}>
                            <div className="card-header-v2">
                                <div className="icon-box target"><FiTarget /></div>
                                <span className="label">Eficiencia</span>
                            </div>
                            <div className="main-value-v2 success-glow">{indiceAcierto}<span>%</span></div>
                            <div className="card-footer-v2">
                                <div className="progress-track-v2">
                                    <div className="progress-bar-fill" style={{ width: `${indiceAcierto}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card animate-card" style={{"--delay": "0.2s"}}>
                            <div className="card-header-v2">
                                <div className="icon-box total"><FiTrendingUp /></div>
                                <span className="label">Proyecciones Totales</span>
                            </div>
                            <div className="main-value-v2 primary-glow">{proyeccionesTotales}</div>
                            <div className="card-footer-v2">
                                <div className="badge-rank-v2">
                                    Nivel: <span>{user.nivel || 'Analista'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card animate-card" style={{"--delay": "0.3s"}}>
                            <div className="card-header-v2">
                                <div className="icon-box active"><FiActivity /></div>
                                <span className="label">Análisis en Curso</span>
                            </div>
                            <div className="main-value-v2 warning-glow">{proyeccionesActivas}</div>
                            <div className="card-footer-v2">
                                <div className="status-split-v2">
                                    <div className="split-item win">{liveStats.wins} Ganadoras</div>
                                    <div className="split-item loss">{liveStats.losses} Perdedoras</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="table-section-modern animate-in-up">
                        <div className="section-title-bar">
                            <h3><FiClock /> Actividad Reciente</h3>
                        </div>
                        
                        <div className="activity-feed-modern">
                            {(resumen?.recientes || []).map((a) => {
                                const isPending = a.estado === 'PENDIENTE';
                                const precioActual = preciosVivos[a.activo.nombre.toUpperCase()];
                                const precioComparar = isPending ? precioActual : a.precioCierre;
                                
                                const isBullish = a.precioObjetivo > a.precioEntrada;
                                const perf = precioComparar ? (
                                    isBullish 
                                        ? calculatePerformance(a.precioEntrada, precioComparar)
                                        : calculatePerformance(precioComparar, a.precioEntrada)
                                ) : 0;

                                let statusClass = "";
                                if (isPending) {
                                    statusClass = parseFloat(perf) >= 0 ? "status-winning" : "status-losing";
                                } else {
                                    statusClass = a.estado === 'ACERTADO' ? "status-winning" : "status-losing";
                                }

                                return (
                                    <div key={a.identificador} className={`activity-row-card ${statusClass}`}>
                                        <div className="activity-main-info">
                                            <div className="asset-info-dash">
                                                <span className="asset-dash-name">{a.activo.nombre}</span>
                                                <div className="dash-tags-row">
                                                    <span className={`order-badge-dash ${isBullish ? 'long' : 'short'}`}>
                                                        {isBullish ? 'COMPRA' : 'VENTA'}
                                                    </span>
                                                    <span className="expiry-dash-tag">
                                                        <FiCalendar /> {new Date(a.fechaVencimiento).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="prices-row-dash">
                                                <div className="price-item-dash">
                                                    <label>Entrada</label>
                                                    <span>${a.precioEntrada?.toLocaleString()}</span>
                                                </div>
                                                
                                                <div className="price-item-dash highlight">
                                                    <label>{isPending ? 'Actual' : 'Cierre'}</label>
                                                    <span className="live-val">
                                                        {isPending 
                                                            ? (precioActual ? `$${precioActual.toLocaleString()}` : '---')
                                                            : `$${a.precioCierre?.toLocaleString()}`}
                                                    </span>
                                                </div>

                                                <div className="price-item-dash">
                                                    <label>Objetivo</label>
                                                    <span>${a.precioObjetivo?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="activity-performance-section">
                                            <div className={`perf-value-dash ${parseFloat(perf) >= 0 ? 'plus' : 'minus'}`}>
                                                {parseFloat(perf) >= 0 ? '+' : ''}{perf}%
                                            </div>
                                            <div className={`status-dash-badge ${a.estado.toLowerCase()}`}>
                                                {a.estado === 'PENDIENTE' ? (
                                                    <><FiActivity className="icon-pulse" /> ACTIVA</>
                                                ) : a.estado === 'ACERTADO' ? (
                                                    <><FiCheckCircle /> ACERTADA</>
                                                ) : (
                                                    <><FiXCircle /> FALLIDA</>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {(!resumen?.recientes || resumen?.recientes.length === 0) && (
                                <div className="no-activity-message">
                                    Todavía no has publicado ningún análisis.
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Home;