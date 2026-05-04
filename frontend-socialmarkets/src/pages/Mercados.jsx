import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import MarketSearch from '../components/MarketSearch';
import TradingViewChart from '../components/TradingViewChart';
import api from '../services/api';
import './Mercados.css';

const Mercados = () => {
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [assetInfo, setAssetInfo] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/usuarios/perfil');
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user for Mercados:", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleSelectSymbol = (symbolData) => {
        setSelectedSymbol(symbolData.symbol);
        setAssetInfo(symbolData);
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Cargando Mercados...</p>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />

                <main className={`main-content-no-scroll ${!selectedSymbol ? 'initial-state' : 'active-state'}`}>

                    <div className="search-section-wrapper animate-transition">
                        {!selectedSymbol && (
                            <div className="market-welcome-text">
                                <h1 className="text-neon-glow">Explora el Mercado</h1>
                                <p>Visualiza cualquier activo con datos profesionales en tiempo real.</p>
                            </div>
                        )}
                        <div className="search-bar-container">
                            <MarketSearch onSelect={handleSelectSymbol} />
                        </div>
                    </div>

                    {selectedSymbol && (
                        <div className="market-full-view animate-fade-in">
                            <div className="asset-info-header-compact">
                                <div className="asset-titles">
                                    <span className="asset-ticker-tag">{selectedSymbol}</span>
                                    <h2 className="asset-main-name">{assetInfo?.name}</h2>
                                </div>
                                <div className="asset-details-meta">
                                    <span className="meta-item">{assetInfo?.exchange}</span>
                                    <span className="meta-item type">{assetInfo?.type}</span>
                                </div>
                            </div>

                            <div className="chart-flex-container">
                                <TradingViewChart
                                    symbol={selectedSymbol}
                                    exchange={assetInfo?.exchange}
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Mercados;
