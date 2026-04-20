import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const location = useLocation(); // Recibe el estado
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate(); 
    
    const [credenciales, setCredenciales] = useState({
        usuario: '',
        hashClave: ''
    });

    useEffect(() => {
        if (location.state?.mensajeExito) {
            setMensaje(location.state.mensajeExito);
            const timer = setTimeout(() => setMensaje(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const handleInputChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const params = new URLSearchParams();
        params.append('usuario', credenciales.usuario);
        params.append('password', credenciales.hashClave);

        try {
            const respuesta = await axios.post('http://localhost:8080/api/usuarios/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            
            localStorage.setItem('token', respuesta.data);
        
            navigate('/home');
            
        } catch (error) {

            console.error("Error completo:", error);

            
            let mensajeError = "Error desconocido";
            
            if (error.response) {
                
                mensajeError = typeof error.response.data === 'string' 
                    ? error.response.data 
                    : "Credenciales inválidas";
            } else if (error.request) {
                
                mensajeError = "No se puede conectar con el servidor";
            }
            
            alert("Error en el login: " + mensajeError);
        }
    };

    return (
        <div className="container">
            <h2>SocialMarkets</h2>
            <p className="subtitle">Bienvenido de nuevo</p>
            
            {/* El Pop-up de éxito */}
            {mensaje && (
                <div className="alert-panel exito" style={{ marginBottom: '1rem' }}>
                    {mensaje}
                </div>
            )}
            
            <form className="form-registro" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Nombre de Usuario</label>
                    <input type="text" name="usuario" onChange={handleInputChange} required />
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input type="password" name="hashClave" onChange={handleInputChange} required />
                </div>

                <button type="submit" className="btn-main">Iniciar Sesión</button>
                
                <p className="subtitle" style={{ marginTop: '1rem' }}>
                    ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Regístrate aquí</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;