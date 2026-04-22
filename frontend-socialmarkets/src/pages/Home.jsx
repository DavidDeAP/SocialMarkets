import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiGrid, FiTrendingUp, FiUsers, FiAward, FiFileText, FiUser, FiLogOut, FiBell } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import logoApp from '../assets/logo.png'; 

const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const respuesta = await axios.get('http://localhost:8080/api/usuarios/perfil', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(respuesta.data);
            } catch (err) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        fetchPerfil();
    }, [navigate]);

    if (!user) return <div className="cargando-pantalla">Cargando panel...</div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <main className="main-content">
                    <div className="content-card">
                        <h1>Hola, {user.usuario}</h1>
                        <div className="stats-grid">
                            <div className="stat-box">Operaciones activas: 0</div>
                            <div className="stat-box">Rendimiento: 0.00%</div>
                            <div className="stat-box">Seguidores: 0</div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;