import { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import './TickerTape.css';

/**
 * Barra animada (Ticker) que muestra precios en tiempo real usando el widget de TradingView
 */
const TickerTape = () => {
    const container = useRef();
    const { showTicker } = useSettings(); // Consultamos si el usuario quiere ver la barra o no

    useEffect(() => {
        // Solo cargamos el widget si el usuario tiene activada la visibilidad en ajustes
        if (showTicker && container.current) {
            container.current.innerHTML = ''; // Limpiamos antes de cargar para evitar duplicados
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
            script.type = "text/javascript";
            script.async = true;
            
            // Configuración del widget con los activos elegidos
            script.innerHTML = JSON.stringify({
                "symbols": [
                    { "proName": "FOREXCOM:SPX500", "title": "S&P 500" },
                    { "proName": "FOREXCOM:NSXUSD", "title": "Nasdaq 100" },
                    { "proName": "TVC:GOLD", "title": "Oro" },
                    { "proName": "TVC:SILVER", "title": "Plata" },
                    { "proName": "TVC:USOIL", "title": "Petróleo" },
                    { "proName": "NASDAQ:TSLA", "title": "Tesla" },
                    { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
                    { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
                    { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" }
                ],
                "showSymbolLogo": true,
                "colorTheme": "dark",
                "isTransparent": true,
                "displayMode": "regular",
                "locale": "es"
            });
            container.current.appendChild(script);
        }
    }, [showTicker]); // Si cambia el ajuste de visibilidad, volvemos a ejecutar la lógica

    // Si el usuario ha ocultado la barra, no renderizamos nada
    if (!showTicker) return null;

    return (
        <div className="global-ticker-wrapper">
            <div ref={container}></div>
        </div>
    );
};

export default TickerTape;
