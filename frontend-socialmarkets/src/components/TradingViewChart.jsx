import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ symbol }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const containerId = "tradingview_chart_id";
        
        // Función para cargar el widget
        const loadWidget = () => {
            if (typeof window.TradingView !== 'undefined' && document.getElementById(containerId)) {
                new window.TradingView.widget({
                    "autosize": true,
                    "symbol": symbol.includes(':') ? symbol : (symbol.includes('-') ? `BINANCE:${symbol.replace('-', '')}` : `BINANCE:${symbol}USDT`),
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "es",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": containerId,
                    "save_image": true,
                    "details": true,
                    "hotlist": true,
                    "calendar": true,
                    "studies": [
                        "RSI@tv-basicstudies",
                        "MASimple@tv-basicstudies"
                    ],
                    "show_popup_button": true,
                    "popup_width": "1000",
                    "popup_height": "650"
                });
            }
        };

        // Si el script ya existe
        if (document.getElementById('tradingview-sdk')) {
            loadWidget();
        } else {
            // Cargar el script
            const script = document.createElement("script");
            script.id = 'tradingview-sdk';
            script.src = "https://s3.tradingview.com/tv.js";
            script.type = "text/javascript";
            script.async = true;
            script.onload = loadWidget;
            document.head.appendChild(script);
        }

        return () => {
            // Opcional: limpiar si es necesario
        };
    }, [symbol]);

    return (
        <div className='tradingview-widget-container' style={{ height: "100%", width: "100%" }}>
            <div id='tradingview_chart_id' style={{ height: "100%", width: "100%" }} />
        </div>
    );
};

export default TradingViewChart;
