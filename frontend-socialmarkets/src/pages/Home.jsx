import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiTrendingUp, FiTarget, FiClock, FiPlus, FiArrowUpRight, FiActivity 
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import './Home.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [preciosVivos, setPreciosVivos] = useState({});
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const [perfilRes, resumenRes] = await Promise.all([
                    api.get('/usuarios/perfil'),
                    api.get('/analisis/resumen')
                ]);
                setUser(perfilRes.data);
                setResumen(resumenRes.data);

                // Si hay activos, pedir precios
                if (resumenRes.data.activos?.length > 0) {
                    const symbols = [...new Set(resumenRes.data.activos.map(a => a.activo.nombre.toUpperCase()))].join(',');
                    const pRes = await api.get(`/market/prices?symbols=${symbols}`);
                    const mapPrecios = {};
                    pRes.data.quoteResponse.result.forEach(q => {
                        mapPrecios[q.symbol] = q.regularMarketPrice;
                    });
                    setPreciosVivos(mapPrecios);
                }
            } catch (err) {
                console.error("Error al obtener datos:", err);
                navigate('/login');
            } finally {
                setCargando(false);
            }
        };
        fetchDatos();
    }, [navigate]);

    // Calcular cuantas van ganando/perdiendo en vivo
    const calculateLiveStats = () => {
        if (!resumen || !resumen.activos) return { wins: 0, losses: 0 };
        let wins = 0;
        let losses = 0;
        resumen.activos.forEach(a => {
            const precioActual = preciosVivos[a.activo.nombre.toUpperCase()];
            if (precioActual) {
                const isBullish = a.precioObjetivo > a.precioEntrada;
                if ((isBullish && precioActual >= a.precioEntrada) || (!isBullish && precioActual <= a.precioEntrada)) {
                    wins++;
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
                            <div className="card-info-left">
                                <div className="card-header-v2">
                                    <div className="icon-box target"><FiTarget /></div>
                                    <span className="label">Eficiencia</span>
                                </div>
                                <div className="card-footer-v2">
                                    <span className={`trend ${aumentoMes >= 0 ? 'positive' : 'negative'}`}>
                                        <FiArrowUpRight /> {aumentoMes >= 0 ? '+' : ''}{aumentoMes.toFixed(1)}% este mes
                                    </span>
                                    <div className="progress-track-v2">
                                        <div className="progress-bar-fill" style={{ width: `${indiceAcierto}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-value-right">
                                <div className="main-value-v2 success-glow">{indiceAcierto}<span>%</span></div>
                            </div>
                        </div>

                        <div className="stat-card animate-card" style={{"--delay": "0.2s"}}>
                            <div className="card-info-left">
                                <div className="card-header-v2">
                                    <div className="icon-box total"><FiTrendingUp /></div>
                                    <span className="label">Proyecciones</span>
                                </div>
                                <div className="card-footer-v2">
                                    <div className="badge-rank-v2">
                                        Nivel: <span>{user.nivel || 'Analista'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-value-right">
                                <div className="main-value-v2 primary-glow">{proyeccionesTotales}</div>
                            </div>
                        </div>

                        <div className="stat-card animate-card" style={{"--delay": "0.3s"}}>
                            <div className="card-info-left">
                                <div className="card-header-v2">
                                    <div className="icon-box active"><FiActivity /></div>
                                    <span className="label">En Curso</span>
                                </div>
                                <div className="card-footer-v2">
                                    <div className="status-split-v2">
                                        <div className="split-item win">{liveStats.wins} Ganadoras</div>
                                        <div className="split-item loss">{liveStats.losses} Perdedoras</div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-value-right">
                                <div className="main-value-v2 warning-glow">{proyeccionesActivas}</div>
                            </div>
                        </div>
                    </div>

                    <section className="table-section-modern animate-in-up">
                        <div className="section-title-bar">
                            <h3><FiClock /> Actividad Reciente</h3>
                        </div>
                        
                        <div className="table-container-glass">
                            <table className="custom-table">
                               <thead>
                                   <tr>
                                       <th>Activo</th>
                                       <th>Dirección</th>
                                       <th>Entrada</th>
                                       <th>Objetivo</th>
                                       <th>Estado</th>
                                   </tr>
                               </thead>
                               <tbody>
                                    {(resumen?.activos || []).slice(0, 5).map((a) => {
                                        const precioActual = preciosVivos[a.activo.nombre.toUpperCase()];
                                        const isWinning = precioActual ? (
                                            (a.precioObjetivo > a.precioEntrada && precioActual >= a.precioEntrada) ||
                                            (a.precioObjetivo < a.precioEntrada && precioActual <= a.precioEntrada)
                                        ) : false;

                                        return (
                                            <tr key={a.identificador} className="row-hover">
                                                <td><div className="asset-tag">{a.activo.nombre}</div></td>
                                                <td>
                                                    <span className={`order-badge ${a.precioObjetivo > a.precioEntrada ? 'long' : 'short'}`}>
                                                        {a.precioObjetivo > a.precioEntrada ? 'LONG' : 'SHORT'}
                                                    </span>
                                                </td>
                                                <td className="mono">${a.precioEntrada?.toLocaleString()}</td>
                                                <td className="mono green-text">${a.precioObjetivo?.toLocaleString()}</td>
                                                <td>
                                                    <div className={`status-pill ${isWinning ? 'done' : 'waiting'}`}>
                                                        {isWinning ? 'Ganando' : 'Perdiendo'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!resumen?.activos || resumen?.activos?.length === 0) && (
                                        <tr>
                                            <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
                                                No tienes proyecciones activas. ¡Publica una!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Home;