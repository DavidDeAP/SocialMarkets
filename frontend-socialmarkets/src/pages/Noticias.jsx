import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import { FiRss } from 'react-icons/fi';
import './Noticias.css';

/**
 * Página de noticias financieras en tiempo real
 */
const Noticias = () => {
    // Estado para guardar la información del usuario conectado
    const [user, setUser] = useState(null);
    // Referencia al contenedor donde se insertará el widget de noticias
    const timelineContainer = useRef();

    useEffect(() => {
        // Obtenemos los datos del perfil del usuario al cargar la página
        const fetchUser = async () => {
            try {
                const res = await api.get('/usuarios/perfil');
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();

        // Inyectamos el widget de noticias de TradingView de forma dinámica
        if (timelineContainer.current) {
            // Limpiamos el contenedor por si hay algún script previo
            timelineContainer.current.innerHTML = '';
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                "feedMode": "all_symbols",
                "isTransparent": true,
                "displayMode": "regular",
                "width": "100%",
                "height": "100%",
                "colorTheme": "dark",
                "locale": "es"
            });
            timelineContainer.current.appendChild(script);
        }
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />
                <main className="main-content news-page">
                    {/* Cabecera con título y descripción del centro de noticias */}
                    <header className="news-header animate-in" style={{ animationDelay: '0.1s' }}>
                        <div className="header-info">
                            <h1 className="text-neon-glow">Centro de Noticias</h1>
                            <p className="welcome-user">
                                Análisis fundamental para tus proyecciones
                            </p>
                        </div>
                    </header>

                    {/* Contenedor principal donde se muestra el feed de noticias financieras */}
                    <div className="news-grid animate-in-up">
                        <div className="news-main-card">
                            <div className="card-inner-header">
                                <FiRss /> <span>Últimas Novedades Financieras</span>
                            </div>
                            {/* Aquí es donde el script de TradingView renderiza las noticias */}
                            <div className="news-widget-frame" ref={timelineContainer}>
                                <div className="tradingview-widget-container__widget"></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Noticias;
