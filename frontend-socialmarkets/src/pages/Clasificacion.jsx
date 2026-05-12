import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiAward, FiTarget, FiTrendingUp, FiCheckCircle, FiUsers, FiLoader
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import './Clasificacion.css';

/**
 * Página de clasificación que muestra a los mejores analistas basados en su éxito y actividad
 */
const Clasificacion = () => {
    const [ranking, setRanking] = useState([]);
    const [filtro, setFiltro] = useState('indice'); // Puede ser por acierto, cantidad de predicciones o totales acertadas
    const [user, setUser] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [cargandoFiltro, setCargandoFiltro] = useState(false);
    const navigate = useNavigate();

    // Al entrar a la página, cargamos los datos del usuario logueado y el primer listado del ranking
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setCargando(true);
                const [perfilRes, rankingRes] = await Promise.all([
                    api.get('/usuarios/perfil'),
                    api.get(`/usuarios/ranking?filtro=${filtro}`)
                ]);
                setUser(perfilRes.data);
                setRanking(rankingRes.data);
            } catch (err) {
                console.error("Error al obtener datos iniciales:", err);
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setCargando(false);
            }
        };
        fetchInitialData();
    }, [navigate]);

    // Cada vez que el usuario cambia el filtro, pedimos los nuevos datos al servidor
    useEffect(() => {
        if (cargando) return; 

        const fetchFilteredData = async () => {
            try {
                setCargandoFiltro(true);
                // Subimos la pantalla suavemente para que se vea el podio actualizado
                window.scrollTo({ top: 0, behavior: 'smooth' });

                const res = await api.get(`/usuarios/ranking?filtro=${filtro}`);
                setRanking(res.data);
            } catch (err) {
                console.error("Error al filtrar ranking:", err);
            } finally {
                setCargandoFiltro(false);
            }
        };
        fetchFilteredData();
    }, [filtro]);

    // Devuelve la clase CSS correspondiente según la posición en el podio
    const getPodiumClass = (index) => {
        if (index === 0) return 'first';
        if (index === 1) return 'second';
        if (index === 2) return 'third';
        return '';
    };

    // Devuelve el icono o emoji decorativo para los 3 primeros
    const getCrownIcon = (index) => {
        if (index === 0) return '👑';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return null;
    };

    // Traduce el código del filtro a un nombre legible para el cargador
    const getFiltroNombre = () => {
        if (filtro === 'indice') return 'Índice de Acierto';
        if (filtro === 'predicciones') return 'Más Predicciones';
        return 'Más Acertadas';
    };

    // Pantalla de carga inicial mientras se traen los primeros datos
    if (cargando) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p className="loading-text">Preparando el Ranking...</p>
            </div>
        );
    }

    // Dividimos la lista: los 3 primeros van al podio visual y el resto a la tabla inferior
    const podium = ranking.slice(0, 3);
    const restOfRanking = ranking.slice(3);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />
                <main className="main-content">
                    <div className="ranking-container">

                        <header className="ranking-header">
                            <div className="trophy-wrapper">
                                <FiAward className="trophy-main-icon" />
                            </div>
                            <h1 className="ranking-title">Clasificación</h1>
                            <p className="ranking-subtitle">Los analistas más precisos de la comunidad de SocialMarkets</p>
                        </header>

                        {/* Botones para cambiar el criterio de ordenación del ranking */}
                        <div className="ranking-filters">
                            <button
                                className={`filter-btn ${filtro === 'indice' ? 'active' : ''}`}
                                onClick={() => setFiltro('indice')}
                                disabled={cargandoFiltro}
                            >
                                <FiTarget /> Índice de Acierto
                            </button>
                            <button
                                className={`filter-btn ${filtro === 'predicciones' ? 'active' : ''}`}
                                onClick={() => setFiltro('predicciones')}
                                disabled={cargandoFiltro}
                            >
                                <FiTrendingUp /> Más Predicciones
                            </button>
                            <button
                                className={`filter-btn ${filtro === 'acertadas' ? 'active' : ''}`}
                                onClick={() => setFiltro('acertadas')}
                                disabled={cargandoFiltro}
                            >
                                <FiCheckCircle /> Más Acertadas
                            </button>
                        </div>

                        <div className="ranking-content-wrapper">
                            {/* Pantalla de carga semi-transparente que aparece al cambiar de filtro */}
                            <AnimatePresence>
                                {cargandoFiltro && (
                                    <motion.div
                                        className="ranking-loader-overlay"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="loader-inner">
                                            <FiLoader className="spinning-icon" />
                                            <span>Actualizando {getFiltroNombre()}...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={`ranking-data-view ${cargandoFiltro ? 'blur-content' : ''}`}>
                                {/* El Podio: visualización destacada de los 3 mejores analistas */}
                                <div className="podium-container">
                                    {podium.map((u, index) => (
                                        <motion.div
                                            key={u.identificador}
                                            className={`podium-item ${getPodiumClass(index)}`}
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{
                                                y: -20,
                                                transition: { type: "spring", stiffness: 400, damping: 10 }
                                            }}
                                            transition={{
                                                delay: index * 0.1,
                                                duration: 0.5,
                                                y: { type: "spring", stiffness: 400, damping: 10 }
                                            }}
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

                                {/* Tabla inferior: lista detallada a partir del cuarto puesto */}
                                <div className="ranking-list">
                                    <AnimatePresence mode='wait'>
                                        <motion.div
                                            key={filtro}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.2 }}
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
                                                    <div className="r-stat-val">{u.numeroPredicciones} <small style={{ color: '#888', fontSize: '0.8rem' }}>Predicciones</small></div>
                                                    <div className="r-stat-val">{u.resumenProyecciones?.acertadas || 0} <small style={{ color: '#888', fontSize: '0.8rem' }}>Acertadas</small></div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Clasificacion;
