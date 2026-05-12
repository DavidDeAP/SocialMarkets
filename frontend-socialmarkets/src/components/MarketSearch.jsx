import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiActivity, FiGlobe, FiBriefcase, FiDollarSign, FiZap, FiPieChart } from 'react-icons/fi';
import api from '../services/api';
import './MarketSearch.css';

/**
 * Componente de búsqueda para encontrar activos financieros
 */
const MarketSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null); // Referencia para detectar clicks fuera del buscador

    // Efecto para cerrar los resultados si el usuario hace click en cualquier otro sitio de la pantalla
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lógica de búsqueda que espera un poco antes de disparar la petición para no saturar el servidor
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Consultamos a nuestro backend, que es quien habla con las APIs de mercado
                const response = await api.get(`/mercados/buscar?q=${encodeURIComponent(query)}`);
                setResults(response.data);
                setShowResults(true);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 350); // Espera 350ms después de que el usuario deje de escribir

        return () => clearTimeout(timer);
    }, [query]);

    // Al seleccionar un activo de la lista
    const handleSelect = (item) => {
        onSelect(item); // Notificamos al componente padre
        setQuery(item.symbol);
        setShowResults(false);
    };

    // Devuelve un icono visual diferente según si es cripto, acción, índice, etc.
    const getTypeIcon = (type) => {
        const t = type?.toUpperCase();
        if (t === 'CRYPTO') return <FiActivity className="icon-crypto" />;
        if (t === 'CURRENCY' || t === 'FOREX') return <FiDollarSign className="icon-forex" />;
        if (t === 'EQUITY' || t === 'ACCION') return <FiZap className="icon-equity" />;
        if (t === 'ETF') return <FiBriefcase className="icon-etf" />;
        if (t === 'INDEX' || t === 'INDICE' || t === 'COMMODITY') return <FiPieChart className="icon-index" />;
        return <FiGlobe className="icon-default" />;
    };

    return (
        <div className="market-search-container" ref={searchRef}>
            {/* Barra de entrada de texto */}
            <div className={`search-input-group ${showResults && results.length > 0 ? 'has-results' : ''}`}>
                <FiSearch className="search-icon-main" />
                <input
                    type="text"
                    placeholder="Busca por nombre o ticker (Ej: S&P 500, Oro, Apple, BTC...)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                />
                {/* Animación de carga */}
                {isLoading && (
                    <div className="search-loader-container">
                        <div className="loader-dot"></div>
                    </div>
                )}
            </div>

            {/* Panel desplegable con los resultados encontrados */}
            {showResults && results.length > 0 && (
                <div className="search-results-panel modern-scroll">
                    <div className="search-results-header">Activos Encontrados</div>
                    {results.map((item, index) => (
                        <div
                            key={`${item.symbol}-${index}`}
                            className="search-result-item-premium"
                            onClick={() => handleSelect(item)}
                        >
                            <div className="result-main-info">
                                <div className={`result-type-icon ${item.type?.toLowerCase()}`}>
                                    {getTypeIcon(item.type)}
                                </div>
                                <div className="result-text-group">
                                    <div className="result-symbol-row">
                                        <span className="result-symbol-name">{item.symbol}</span>
                                        <span className="result-exchange-badge">{item.exchange}</span>
                                    </div>
                                    <span className="result-full-name">{item.name}</span>
                                </div>
                            </div>
                            {/* Etiqueta descriptiva del tipo de activo */}
                            <div className="result-type-tag">
                                {item.typeDisp}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketSearch;
