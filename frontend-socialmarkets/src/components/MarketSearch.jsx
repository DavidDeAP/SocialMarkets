import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiTrendingUp, FiBarChart2, FiActivity } from 'react-icons/fi';
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
                // Usamos el endpoint de Yahoo Finance para búsqueda (es muy completo)
                const response = await fetch(`https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=10&newsCount=0`);
                // Nota: En producción esto debería pasar por el backend para evitar CORS
                // Por ahora, si falla el fetch directo por CORS, usaremos una simulación o un proxy
                
                let data;
                if (response.ok) {
                    data = await response.json();
                    const filtered = data.quotes.map(q => ({
                        symbol: q.symbol,
                        name: q.shortname || q.longname || q.symbol,
                        exchange: q.exchange,
                        type: q.quoteType,
                        typeDisp: q.typeDisp
                    }));
                    setResults(filtered);
                } else {
                    // Fallback fallback simple si falla el proxy/cors
                    throw new Error('CORS issue or API error');
                }
            } catch (error) {
                console.error("Search error:", error);
                // Mock de resultados si la API falla por CORS en el entorno local
                const mocks = [
                    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
                    { symbol: 'BTC-USD', name: 'Bitcoin USD', exchange: 'CCC', type: 'CRYPTO' },
                    { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
                    { symbol: 'EURUSD=X', name: 'EUR/USD', exchange: 'CCY', type: 'CURRENCY' },
                    { symbol: 'ETH-USD', name: 'Ethereum USD', exchange: 'CCC', type: 'CRYPTO' }
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

    return (
        <div className="market-search-container" ref={searchRef}>
            <div className={`search-input-group ${showResults ? 'focused' : ''}`}>
                <FiSearch className="search-icon" />
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
                {isLoading && <div className="search-loader"></div>}
            </div>

            {showResults && results.length > 0 && (
                <div className="search-results-panel animate-slide-up">
                    {results.map((item, index) => (
                        <div 
                            key={index} 
                            className="search-result-item"
                            onClick={() => handleSelect(item)}
                        >
                            <div className="result-icon">
                                {item.type === 'CRYPTO' ? <FiActivity /> : <FiBarChart2 />}
                            </div>
                            <div className="result-details">
                                <span className="result-symbol">{item.symbol}</span>
                                <span className="result-name">{item.name}</span>
                            </div>
                            <div className="result-meta">
                                <span className="result-exchange">{item.exchange}</span>
                                <span className="result-type">{item.typeDisp || item.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketSearch;
