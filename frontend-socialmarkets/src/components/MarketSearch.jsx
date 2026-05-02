import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiActivity, FiGlobe, FiBriefcase, FiDollarSign, FiZap } from 'react-icons/fi';
import './MarketSearch.css';

const MarketSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Usamos el endpoint de Yahoo Finance para búsqueda
                const response = await fetch(`https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=8&newsCount=0`);
                
                if (response.ok) {
                    const data = await response.json();
                    const filtered = data.quotes.map(q => ({
                        symbol: q.symbol,
                        name: q.shortname || q.longname || q.symbol,
                        exchange: q.exchange,
                        type: q.quoteType,
                        typeDisp: q.typeDisp || q.quoteType
                    }));
                    setResults(filtered);
                } else {
                    throw new Error('API error');
                }
            } catch (error) {
                console.error("Search error:", error);
                // Mocks de alta calidad para fallos locales/CORS
                const mocks = [
                    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'EQUITY', typeDisp: 'Acción' },
                    { symbol: 'BTC-USD', name: 'Bitcoin USD', exchange: 'CRYPTO', type: 'CRYPTO', typeDisp: 'Cripto' },
                    { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'EQUITY', typeDisp: 'Acción' },
                    { symbol: 'EURUSD=X', name: 'Euro / US Dollar', exchange: 'FX', type: 'CURRENCY', typeDisp: 'Forex' },
                    { symbol: 'ETH-USD', name: 'Ethereum USD', exchange: 'CRYPTO', type: 'CRYPTO', typeDisp: 'Cripto' },
                    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'EQUITY', typeDisp: 'Acción' },
                    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'EQUITY', typeDisp: 'Acción' }
                ].filter(m => m.symbol.includes(query.toUpperCase()) || m.name.toUpperCase().includes(query.toUpperCase()));
                setResults(mocks);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (item) => {
        onSelect(item);
        setQuery(item.symbol);
        setShowResults(false);
    };

    const getTypeIcon = (type) => {
        const t = type?.toUpperCase();
        if (t === 'CRYPTO') return <FiActivity className="icon-crypto" />;
        if (t === 'CURRENCY' || t === 'FOREX') return <FiDollarSign className="icon-forex" />;
        if (t === 'EQUITY' || t === 'ACCION') return <FiZap className="icon-equity" />;
        if (t === 'ETF') return <FiBriefcase className="icon-etf" />;
        return <FiGlobe className="icon-default" />;
    };

    return (
        <div className="market-search-container" ref={searchRef}>
            <div className={`search-input-group ${showResults && query.length >= 2 ? 'has-results' : ''}`}>
                <FiSearch className="search-icon-main" />
                <input
                    type="text"
                    placeholder="Buscar activo (Ej: BTC, AAPL, EURUSD...)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                />
                {isLoading && (
                    <div className="search-loader-container">
                        <div className="loader-dot"></div>
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="search-results-panel modern-scroll">
                    <div className="search-results-header">Resultados Sugeridos</div>
                    {results.map((item, index) => (
                        <div 
                            key={index} 
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
