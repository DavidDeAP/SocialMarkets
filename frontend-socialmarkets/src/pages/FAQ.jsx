import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import { FiChevronDown, FiHelpCircle, FiSearch, FiMessageSquare, FiTrendingUp, FiShield, FiUserCheck } from 'react-icons/fi';
import './FAQ.css';

const FAQ = () => {
    const [user, setUser] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const faqData = [
        {
            id: 1,
            icon: <FiHelpCircle />,
            question: "¿Qué es SocialMarkets?",
            answer: "SocialMarkets es una plataforma de validación financiera donde los analistas pueden compartir sus predicciones y el sistema rastrea su precisión automáticamente. Nuestro objetivo es aportar transparencia al mundo de las inversiones.",
            category: "General"
        },
        {
            id: 2,
            icon: <FiTrendingUp />,
            question: "¿Cómo se calcula el índice de acierto?",
            answer: "El índice se calcula basándose en la diferencia porcentual entre el precio de entrada y el precio objetivo (Target) en el tiempo establecido. Si el activo alcanza el target, se cuenta como acierto. Si cae por debajo del Stop Loss, se cuenta como error.",
            category: "Analistas"
        },
        {
            id: 3,
            icon: <FiMessageSquare />,
            question: "¿Cómo puedo publicar mi primer análisis?",
            answer: "Solo tienes que ir a la sección de 'Comunidad' y hacer clic en 'Nuevo Análisis'. Deberás seleccionar un activo, un precio objetivo, un stop loss y una breve explicación de tu tesis.",
            category: "Comunidad"
        },
        {
            id: 4,
            icon: <FiUserCheck />,
            question: "¿Cómo consigo la verificación de analista?",
            answer: "La verificación (check azul) se otorga a usuarios que mantienen un índice de acierto superior al 65% tras al menos 10 análisis publicados, o a profesionales que validen su titulación a través de soporte.",
            category: "Analistas"
        },
        {
            id: 5,
            icon: <FiShield />,
            question: "¿Son los datos del mercado en tiempo real?",
            answer: "Utilizamos la tecnología de TradingView para los gráficos. Los datos son en tiempo real para la mayoría de activos, aunque algunos mercados secundarios pueden tener un ligero retraso de 15 minutos por limitaciones de la API.",
            category: "General"
        },
        {
            id: 6,
            icon: <FiUsers />,
            question: "¿Puedo seguir a otros inversores?",
            answer: "¡Sí! Al entrar en el perfil de cualquier usuario verás un botón de 'Seguir'. Recibirás notificaciones cada vez que publiquen un nuevo análisis para que no te pierdas ninguna oportunidad.",
            category: "Comunidad"
        }
    ];

    const toggleAccordion = (id) => {
        setActiveId(activeId === id ? null : id);
    };

    const filteredFaqs = faqData.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <TickerTape />
                <main className="main-content">
                    <header className="faq-header animate-in">
                        <div className="header-info">
                            <h1 className="text-neon-glow">Centro de Ayuda</h1>
                            <p className="welcome-user">Resuelve tus dudas sobre la terminal y la comunidad</p>
                        </div>
                        <div className="faq-search-wrapper">
                            <FiSearch className="search-icon-faq" />
                            <input 
                                type="text" 
                                placeholder="Busca una pregunta..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="faq-search-input"
                            />
                        </div>
                    </header>

                    <div className="faq-container animate-in-up">
                        <div className="faq-grid">
                            {filteredFaqs.map((faq) => (
                                <div 
                                    key={faq.id} 
                                    className={`faq-item glass-card ${activeId === faq.id ? 'active' : ''}`}
                                    onClick={() => toggleAccordion(faq.id)}
                                >
                                    <div className="faq-question">
                                        <div className="faq-icon-title">
                                            <span className="faq-icon">{faq.icon}</span>
                                            <h3>{faq.question}</h3>
                                        </div>
                                        <FiChevronDown className="faq-arrow" />
                                    </div>
                                    <div className="faq-answer">
                                        <div className="answer-content">
                                            <p>{faq.answer}</p>
                                            <span className="faq-category-tag">{faq.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredFaqs.length === 0 && (
                            <div className="no-results-faq glass-card">
                                <FiHelpCircle className="no-results-icon" />
                                <p>No hemos encontrado nada para "{searchTerm}"</p>
                                <span>Prueba con palabras clave como "acierto", "perfil" o "analista".</span>
                            </div>
                        )}
                        
                        <footer className="faq-footer glass-card">
                            <div className="footer-content">
                                <h3>¿Todavía tienes dudas?</h3>
                                <p>Si no has encontrado lo que buscabas, puedes contactar con nuestro equipo de soporte.</p>
                                <button className="btn-contact-support">Contactar Soporte</button>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Icono extra necesario
import { FiUsers } from 'react-icons/fi';

export default FAQ;
