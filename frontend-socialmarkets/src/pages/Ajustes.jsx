import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { FiMonitor, FiEye, FiEyeOff } from 'react-icons/fi';
import './Ajustes.css';

const Ajustes = () => {
    const [user, setUser] = useState(null);
    const { showTicker, setShowTicker } = useSettings();

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
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />
                <main className="main-content">
                    <header className="ajustes-header animate-in">
                        <div className="header-info">
                            <h1 className="text-neon-glow">Configuración</h1>
                            <p className="welcome-user">Personaliza tu terminal de SocialMarkets</p>
                        </div>
                    </header>

                    <div className="ajustes-grid animate-in-up">
                        <div className="ajustes-section glass-card">
                            <div className="section-header">
                                <FiMonitor />
                                <h3>Interfaz y Pantalla</h3>
                            </div>
                            
                            <div className="ajustes-list">
                                <div className="ajuste-item">
                                    <div className="ajuste-info">
                                        <div className="ajuste-label">
                                            <span>Cinta de Activos (Ticker)</span>
                                            {showTicker ? <FiEye className="status-icon active" /> : <FiEyeOff className="status-icon" />}
                                        </div>
                                        <p className="ajuste-description">Muestra u oculta la barra de precios en tiempo real en la parte superior.</p>
                                    </div>
                                    <div className="ajuste-action">
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={showTicker}
                                                onChange={(e) => setShowTicker(e.target.checked)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                {/* Aquí se pueden añadir más ajustes en el futuro */}
                            </div>
                        </div>

                        <div className="ajustes-section glass-card info-section">
                            <h3>Sobre la Terminal</h3>
                            <p>SocialMarkets v1.0.4 - Alpha</p>
                            <p className="text-muted">Personalizaciones guardadas localmente en este navegador.</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Ajustes;
