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
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

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
            <p>Cargando ecosistema...</p>
        </div>
    );

    if (!user) return null;

    // Formateo de datos consistente con Perfil.jsx
    const indiceAcierto = (user.indiceAcierto || 0).toFixed(1);
    const proyeccionesActivas = user.resumenProyecciones?.activas || 0;
    const proyeccionesTotales = user.numeroPredicciones || 0;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <main className="main-content">
                    
                    <header className="dashboard-header">
                        <div className="header-titles">
                            <span className="welcome-back">Bienvenido de nuevo, {user.usuario}</span>
                            <h1>Panel de Control</h1>
                        </div>
                        <button className="btn-new-projection" onClick={() => navigate('/comunidad')}>
                            <div className="btn-icon-circle"><FiPlus /></div>
                            <span>Nueva Proyección</span>
                        </button>
                    </header>

                    <div className="stats-dashboard-grid">
                        <div className="glass-card stat-card-modern success-glow">
                            <div className="card-info">
                                <span className="card-label">Eficiencia de Análisis</span>
                                <h2 className="card-value">{indiceAcierto}%</h2>
                                <div className="card-progress-container">
                                    <div className="card-progress-bar">
                                        <div className="progress-fill" style={{ width: `${indiceAcierto}%` }}></div>
                                    </div>
                                    <span className="card-subtext trend-up">
                                        <FiArrowUpRight /> +2.4% <small>este mes</small>
                                    </span>
                                </div>
                            </div>
                            <div className="card-icon-wrapper success">
                                <FiTarget />
                            </div>
                        </div>

                        {/* CARD 2: PROYECCIONES TOTALES */}
                        <div className="glass-card stat-card-modern primary-glow">
                            <div className="card-info">
                                <span className="card-label">Total Proyecciones</span>
                                <h2 className="card-value">{proyeccionesTotales}</h2>
                                <span className="card-subtext">
                                    Rango: <strong className="rank-badge">{user.nivel || 'Analista'}</strong>
                                </span>
                            </div>
                            <div className="card-icon-wrapper total">
                                <FiTrendingUp />
                            </div>
                        </div>

                        {/* CARD 3: PROYECCIONES ACTIVAS */}
                        <div className="glass-card stat-card-modern warning-glow">
                            <div className="card-info">
                                <span className="card-label">Operaciones Activas</span>
                                <h2 className="card-value">{proyeccionesActivas}</h2>
                                <div className="active-split">
                                    <span className="text-green">{user.resumenProyecciones?.enVerde || 0} Ganadoras</span>
                                    <span className="separator">|</span>
                                    <span className="text-red">{user.resumenProyecciones?.enRojo || 0} Perdedoras</span>
                                </div>
                            </div>
                            <div className="card-icon-wrapper active">
                                <FiActivity />
                            </div>
                        </div>
                    </div>

                    <section className="recent-projections-section">
                        <div className="section-header">
                            <h3><FiClock />Proyecciones Recientes</h3>
                            <button className="btn-text-only">Ver todas</button>
                        </div>
                        
                        <div className="glass-card table-container-modern">
                            <table className="modern-table">
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
                                   {/* Ejemplo estático que se sustituirá por map de proyecciones */}
                                   <tr>
                                       <td className="asset-cell">
                                           <div className="asset-info">
                                               <span className="asset-name">BTC/USDT</span>
                                           </div>
                                       </td>
                                       <td><span className="badge badge-long">LONG</span></td>
                                       <td className="price-cell">$62,100</td>
                                       <td className="text-green font-bold">$68,000</td>
                                       <td>
                                           <span className="status-indicator pending">
                                               <span className="dot"></span> Pendiente
                                           </span>
                                       </td>
                                   </tr>
                                   <tr>
                                       <td className="asset-cell">
                                           <div className="asset-info">
                                               <span className="asset-name">EUR/USD</span>
                                           </div>
                                       </td>
                                       <td><span className="badge badge-short">SHORT</span></td>
                                       <td className="price-cell">1.0950</td>
                                       <td className="text-green font-bold">1.0800</td>
                                       <td>
                                           <span className="status-indicator success">
                                               <span className="dot"></span> Completado
                                           </span>
                                       </td>
                                   </tr>
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