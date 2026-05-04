import { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import './TickerTape.css';

const TickerTape = () => {
    const container = useRef();
    const { showTicker } = useSettings();

    useEffect(() => {
        if (showTicker && container.current) {
            container.current.innerHTML = '';
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
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
            container.current.appendChild(script);
        }
    }, [showTicker]);

    if (!showTicker) return null;

    return (
        <div className="global-ticker-wrapper">
            <div ref={container}></div>
        </div>
    );
};

export default TickerTape;
