import React, { useEffect, useRef } from 'react';

/**
 * Componente que muestra un gráfico avanzado de TradingView
 */
const TradingViewChart = ({ symbol, exchange }) => {
    const containerId = "tv_chart_main_container";
    const widgetRef = useRef(null);

    useEffect(() => {
        const initWidget = () => {
            if (typeof window.TradingView !== 'undefined' && document.getElementById(containerId)) {
                
                let formattedSymbol = symbol;
                
                // Mapeo manual de símbolos para que coincidan las etiquetas de Yahoo con las de TradingView
                const symbolMapping = {
                    '^GSPC': 'SPX',
                    '^IBEX': 'IBEX35',
                    '^IXIC': 'IXIC',
                    '^DJI': 'DJI',
                    '^GDAXI': 'DAX',
                    '^FCHI': 'PX1',
                    'GC=F': 'GOLD',
                    'CL=F': 'USOIL',
                    'SI=F': 'SILVER'
                };

                // Lógica para formatear el símbolo (ej: añadir el mercado como NASDAQ: o BINANCE:)
                if (symbolMapping[symbol]) {
                    formattedSymbol = symbolMapping[symbol];
                } else if (!symbol.includes(':')) {
                    if (exchange === 'NMS' || exchange === 'NASDAQ') {
                        formattedSymbol = `NASDAQ:${symbol}`;
                    } else if (exchange === 'NYQ' || exchange === 'NYSE') {
                        formattedSymbol = `NYSE:${symbol}`;
                    } else if (exchange === 'CCC' || symbol.includes('-')) {
                        const cleanSym = symbol.replace('-USD', '').replace('-', '');
                        formattedSymbol = `BINANCE:${cleanSym}USDT`;
                    } else if (exchange === 'CCY') {
                        const cleanForex = symbol.replace('=X', '');
                        formattedSymbol = `FX:${cleanForex}`;
                    }
                }

                // Si el símbolo es el mismo que ya está cargado, no hacemos nada para evitar parpadeos
                if (widgetRef.current && widgetRef.current.options?.symbol === formattedSymbol) {
                    return;
                }

                // Configuración visual del widget (colores, idioma, herramientas)
                widgetRef.current = new window.TradingView.widget({
                    "autosize": true,
                    "symbol": formattedSymbol,
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "es",
                    "toolbar_bg": "#0f172a",
                    "enable_publishing": false,
                    "withdateranges": true,
                    "hide_side_toolbar": true, // Ocultamos herramientas de dibujo para que el gráfico esté limpio
                    "allow_symbol_change": false,
                    "container_id": containerId,
                    "save_image": false,
                    "details": false,
                    "hotlist": false,
                    "calendar": false,
                    "overrides": {
                        "paneProperties.background": "#0f172a",
                        "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.02)",
                        "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.02)",
                    }
                });
            }
        };

        // Carga dinámica del SDK de TradingView si no está ya en el documento
        if (!document.getElementById('tradingview-sdk')) {
            const script = document.createElement("script");
            script.id = 'tradingview-sdk';
            script.src = "https://s3.tradingview.com/tv.js";
            script.type = "text/javascript";
            script.async = true;
            script.onload = initWidget;
            document.head.appendChild(script);
        } else {
            const timer = setTimeout(initWidget, 100);
            return () => clearTimeout(timer);
        }

    }, [symbol, exchange]); // Recarga el gráfico si el usuario cambia de activo

    return (
        <div id={containerId} style={{ height: "100%", width: "100%" }} />
    );
};

export default TradingViewChart;
