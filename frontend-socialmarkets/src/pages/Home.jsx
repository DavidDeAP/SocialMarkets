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
            <p className="loading-text">Cargando Panel...</p>
        </div>
    );

    if (!user) return null;

    const indiceAcierto = (user.indiceAcierto || 0).toFixed(1);
    const proyeccionesActivas = user.resumenProyecciones?.activas || 0;
    const proyeccionesTotales = user.numeroPredicciones || 0;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <main className="main-content">
                    
                    <header className="dashboard-header animate-in">
                        <div className="header-info">
                            <h1 className="text-neon-glow">Panel de Control</h1>
                            <p className="welcome-user">Bienvenido, <span className="username-neon">{user.usuario}</span>.</p>
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
                                    <span className="trend positive"><FiArrowUpRight /> +2.4% este mes</span>
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
                                        <div className="split-item win">{user.resumenProyecciones?.enVerde || 0} Ganadoras</div>
                                        <div className="split-item loss">{user.resumenProyecciones?.enRojo || 0} Perdedoras</div>
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
                                   <tr className="row-hover">
                                       <td><div className="asset-tag">BTC/USDT</div></td>
                                       <td><span className="order-badge long">LONG</span></td>
                                       <td className="mono">$62,100</td>
                                       <td className="mono green-text">$68,000</td>
                                       <td><div className="status-pill waiting">Pendiente</div></td>
                                   </tr>
                                   <tr className="row-hover">
                                       <td><div className="asset-tag">EUR/USD</div></td>
                                       <td><span className="order-badge short">SHORT</span></td>
                                       <td className="mono">$1.0950</td>
                                       <td className="mono green-text">$1.0800</td>
                                       <td><div className="status-pill done">Acierto</div></td>
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