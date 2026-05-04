import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import { FiFileText, FiRss, FiZap } from 'react-icons/fi';
import './Noticias.css';

const Noticias = () => {
    const [user, setUser] = useState(null);
    const container = useRef();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/usuarios/perfil');
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();

        // Limpiar el contenedor antes de añadir el script (evita duplicados en desarrollo)
        if (container.current) {
            container.current.innerHTML = '';
        }

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
        
        if (container.current) {
            container.current.appendChild(script);
        }
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <main className="main-content">
                    <header className="news-header animate-in">
                        <div className="header-info">
                            <h1 className="text-neon-glow">Noticias Financieras</h1>
                            <p className="welcome-user">
                                <FiZap className="icon-pulse" style={{ color: '#facc15' }} /> 
                                Mantente al día con los últimos movimientos del mercado en tiempo real
                            </p>
                        </div>
                        <div className="news-badge">
                            <FiRss />
                            <span>LIVE FEED</span>
                        </div>
                    </header>

                    <div className="news-container-wrapper animate-in-up">
                        <div className="news-card-glass">
                            <div className="news-widget-container" ref={container}>
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
