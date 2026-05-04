import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import { FiFileText, FiRss, FiZap, FiTrendingUp } from 'react-icons/fi';
import './Noticias.css';

const Noticias = () => {
    const [user, setUser] = useState(null);
    const timelineContainer = useRef();
    const tickerContainer = useRef();

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

        // Widget de Noticias (Timeline)
        if (timelineContainer.current) {
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

        // Widget de Cinta (Ticker Tape)
        if (tickerContainer.current) {
            tickerContainer.current.innerHTML = '';
            const scriptTicker = document.createElement("script");
            scriptTicker.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
            scriptTicker.type = "text/javascript";
            scriptTicker.async = true;
            scriptTicker.innerHTML = JSON.stringify({
                "symbols": [
                    { "proName": "FOREXCOM:SPX500", "title": "S&P 500" },
                    { "proName": "FOREXCOM:NSXUSD", "title": "Nasdaq 100" },
                    { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
                    { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
                    { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" }
                ],
                "showSymbolLogo": true,
                "colorTheme": "dark",
                "isTransparent": true,
                "displayMode": "adaptive",
                "locale": "es"
            });
            tickerContainer.current.appendChild(scriptTicker);
        }
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <main className="main-content news-page">
                    
                    <div className="ticker-wrapper animate-in">
                        <div ref={tickerContainer}></div>
                    </div>

                    <header className="news-header animate-in" style={{ animationDelay: '0.1s' }}>
                        <div className="header-info">
                            <h1 className="text-neon-glow">Centro de Noticias</h1>
                            <p className="welcome-user">
                                <FiZap className="icon-pulse" style={{ color: '#facc15' }} /> 
                                Análisis fundamental en tiempo real para tus proyecciones
                            </p>
                        </div>
                        <div className="news-status-badge">
                            <span className="live-dot"></span>
                            MERCADO ABIERTO
                        </div>
                    </header>

                    <div className="news-grid animate-in-up">
                        <div className="news-main-card">
                            <div className="card-inner-header">
                                <FiRss /> <span>Últimas Novedades Financieras</span>
                            </div>
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
