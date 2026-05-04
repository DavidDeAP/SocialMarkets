import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import { FiSettings } from 'react-icons/fi';
import './Ajustes.css';

const Ajustes = () => {
    const [user, setUser] = useState(null);

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
                            <h1 className="text-neon-glow">Ajustes</h1>
                            <p className="welcome-user">Personaliza tu experiencia en SocialMarkets</p>
                        </div>
                    </header>

                    <div className="ajustes-container glass-card animate-in-up">
                        <div className="placeholder-ajustes">
                            <FiSettings size={48} className="icon-pulse" />
                            <h3>Próximamente</h3>
                            <p>Estamos trabajando en nuevas opciones de personalización para tu terminal.</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Ajustes;
