import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Enviamos el token en los headers para que Spring nos deje pasar
                const respuesta = await axios.get('http://localhost:8080/api/usuarios/perfil', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(respuesta.data);
            } catch (err) {
                console.error("Error cargando perfil", err);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchPerfil();
    }, [navigate]);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return <div className="container">Cargando panel...</div>;

    // Formatear la fecha para que se vea bonita
    const fecha = new Date(user.fechaRegistro).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
            <div className="card-perfil">
                {user.imagen && (
                    <img 
                        src={user.imagen} 
                        alt="Perfil" 
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} 
                    />
                )}
                <h1>Bienvenido, {user.usuario}</h1>
                <p className="subtitle">Miembro desde el {fecha}</p>
                
                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>Tu Bio:</h3>
                    <p>{user.biografia || "No has añadido ninguna biografía todavía."}</p>
                </div>

                <button 
                    onClick={cerrarSesion} 
                    className="btn-main" 
                    style={{ marginTop: '2rem', backgroundColor: '#e74c3c' }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Home;