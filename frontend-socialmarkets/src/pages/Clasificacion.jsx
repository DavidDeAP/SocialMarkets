import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiAward, FiTarget, FiTrendingUp, FiCheckCircle, FiChevronRight, FiUsers
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import './Clasificacion.css';

const Clasificacion = () => {
    const [ranking, setRanking] = useState([]);
    const [filtro, setFiltro] = useState('indice'); // 'indice', 'predicciones', 'acertadas'
    const [user, setUser] = useState(null);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setCargando(true);
                const [perfilRes, rankingRes] = await Promise.all([
                    api.get('/usuarios/perfil'),
                    api.get(`/usuarios/ranking?filtro=${filtro}`)
                ]);
                setUser(perfilRes.data);
                setRanking(rankingRes.data);
            } catch (err) {
                console.error("Error al obtener datos:", err);
                // Si falla el perfil, redirigir a login
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setCargando(false);
            }
        };
        fetchData();
    }, [filtro, navigate]);

    const getPodiumClass = (index) => {
        if (index === 0) return 'first';
        if (index === 1) return 'second';
        if (index === 2) return 'third';
        return '';
    };

    const getCrownIcon = (index) => {
        if (index === 0) return '👑';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return null;
    };

    if (cargando && ranking.length === 0) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p className="loading-text">Preparando el Ranking...</p>
            </div>
        );
    }

    const podium = ranking.slice(0, 3);
    const restOfRanking = ranking.slice(3);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <main className="main-content">
                    <div className="ranking-container">

                        <header className="ranking-header">
                            <div className="trophy-wrapper">
                                <FiAward className="trophy-main-icon" />
                            </div>
                            <h1 className="ranking-title">Clasificación</h1>
                            <p className="ranking-subtitle">Los analistas más precisos de la comunidad de SocialMarkets</p>
                        </header>

                        <div className="ranking-filters">
                            <button
                                className={`filter-btn ${filtro === 'indice' ? 'active' : ''}`}
                                onClick={() => setFiltro('indice')}
                            >
                                <FiTarget /> Índice de Acierto
                            </button>
                            <button
                                className={`filter-btn ${filtro === 'predicciones' ? 'active' : ''}`}
                                onClick={() => setFiltro('predicciones')}
                            >
                                <FiTrendingUp /> Más Predicciones
                            </button>
                            <button
                                className={`filter-btn ${filtro === 'acertadas' ? 'active' : ''}`}
                                onClick={() => setFiltro('acertadas')}
                            >
                                <FiCheckCircle /> Más Acertadas
                            </button>
                        </div>

                        <div className="podium-container">
                            {podium.map((u, index) => (
                                <motion.div
                                    key={u.identificador}
                                    className={`podium-item ${getPodiumClass(index)}`}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2, duration: 0.5 }}
                                    onClick={() => navigate(`/perfil/${u.usuario}`)}
                                >
                                    <span className="crown">{getCrownIcon(index)}</span>
                                    <div className="podium-avatar-wrapper">
                                        <img
                                            src={u.imagen || `https://ui-avatars.com/api/?name=${u.usuario}&background=random`}
                                            alt={u.usuario}
                                            className="podium-avatar"
                                        />
                                        <div className="rank-badge">#{index + 1}</div>
                                    </div>
                                    <h3 className="podium-name">{u.usuario}</h3>

                                    <div className="podium-stats">
                                        <div className="p-stat highlight">
                                            <span>Éxito</span>
                                            <span>{(u.indiceAcierto || 0).toFixed(1)}%</span>
                                        </div>
                                        <div className="p-stat">
                                            <span>Predicciones</span>
                                            <span>{u.numeroPredicciones}</span>
                                        </div>
                                        <div className="p-stat">
                                            <span>Acertadas</span>
                                            <span>{u.resumenProyecciones?.acertadas || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="ranking-list">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={filtro}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {restOfRanking.map((u, index) => (
                                        <div
                                            key={u.identificador}
                                            className="rank-row"
                                            onClick={() => navigate(`/perfil/${u.usuario}`)}
                                        >
                                            <div className="r-pos">#{index + 4}</div>
                                            <div className="r-user">
                                                <img
                                                    src={u.imagen || `https://ui-avatars.com/api/?name=${u.usuario}&background=random`}
                                                    alt={u.usuario}
                                                    className="r-avatar"
                                                />
                                                <span className="r-name">{u.usuario}</span>
                                            </div>
                                            <div className="r-stat-val acierto">{(u.indiceAcierto || 0).toFixed(1)}%</div>
                                            <div className="r-stat-val">{u.numeroPredicciones} <small style={{ color: '#666' }}>preds</small></div>
                                            <div className="r-stat-val">{u.resumenProyecciones?.acertadas || 0} <small style={{ color: '#666' }}>ok</small></div>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Clasificacion;
