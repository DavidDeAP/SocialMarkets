import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TickerTape from '../components/TickerTape';
import api from '../services/api';
import { FiChevronDown, FiHelpCircle, FiSearch, FiMessageSquare, FiTrendingUp, FiAward, FiMonitor, FiUsers } from 'react-icons/fi';
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
            answer: "SocialMarkets es una plataforma de validación financiera diseñada para que los usuarios compartan sus tesis de inversión y demuestren su habilidad. El sistema rastrea cada análisis para generar estadísticas de rendimiento reales.",
            category: "General"
        },
        {
            id: 2,
            icon: <FiTrendingUp />,
            question: "¿Cómo se calcula el índice de acierto?",
            answer: "El índice de acierto es el porcentaje de tus predicciones que han finalizado con éxito (alcanzando el precio objetivo) sobre el total de análisis que has publicado.",
            category: "Estadísticas"
        },
        {
            id: 3,
            icon: <FiAward />,
            question: "¿Cómo funciona la Clasificación?",
            answer: "La sección de Clasificación ordena a los usuarios basándose en su precisión y actividad. Cuanto mayor sea tu índice de acierto y más análisis validados tengas, más arriba aparecerás en el ranking global.",
            category: "Comunidad"
        },
        {
            id: 4,
            icon: <FiSearch />,
            question: "¿Puedo buscar analistas específicos?",
            answer: "Sí, puedes usar la barra de búsqueda en la parte superior de la pantalla para encontrar a cualquier usuario por su nombre y ver su historial completo de análisis.",
            category: "General"
        },
        {
            id: 5,
            icon: <FiMonitor />,
            question: "¿Puedo personalizar mi panel?",
            answer: "¡Por supuesto! En la sección de Ajustes puedes ocultar el Ticker de precios superior o cambiar tus preferencias de privacidad para ocultar tus estadísticas a otros usuarios si lo deseas.",
            category: "Interfaz"
        },
        {
            id: 6,
            icon: <FiMessageSquare />,
            question: "¿Qué debo incluir en un nuevo análisis?",
            answer: "Para que tu análisis sea válido, debes seleccionar un activo, definir un precio objetivo (Target) y explicar los motivos técnicos o fundamentales de tu predicción.",
            category: "Analistas"
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
                            <p className="welcome-user">Resuelve tus dudas sobre el panel y la comunidad</p>
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

                    </div>
                </main>
            </div>
        </div>
    );
};


export default FAQ;
