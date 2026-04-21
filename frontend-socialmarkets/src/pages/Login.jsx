import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const location = useLocation();
    const [mensaje, setMensaje] = useState('');
    const [errorLogin, setErrorLogin] = useState(false);
    const [errores, setErrores] = useState({});
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
        setErrorLogin(false);
        setErrores({ ...errores, [e.target.name]: false });
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorLogin(false);

        let nuevosErrores = {};
        if (!credenciales.usuario.trim()) nuevosErrores.usuario = true;
        if (!credenciales.hashClave.trim()) nuevosErrores.hashClave = true;

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        
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
            setErrorLogin(true);
        }
    };

    return (
        <div className="container">
            <h2>SocialMarkets</h2>
            <p className="subtitle">Bienvenido de nuevo</p>
            
            {mensaje && (
                <div className="alert-panel exito" style={{ marginBottom: '1rem' }}>
                    {mensaje}
                </div>
            )}
            
            <form className="form-registro" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Nombre de Usuario</label>
                    <input 
                        type="text" 
                        name="usuario" 
                        className={errorLogin || errores.usuario ? 'input-error' : ''}
                        onChange={handleInputChange}
                    />
                    {errores.usuario && <span className="error-text-login">El usuario es obligatorio</span>}
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        name="hashClave" 
                        className={errorLogin || errores.hashClave ? 'input-error' : ''} 
                        onChange={handleInputChange} 
                    />
                    {errores.hashClave && <span className="error-text-login">La contraseña es obligatoria</span>}
                    {errorLogin && (
                        <span className="error-text-login">
                            Nombre de usuario o contraseña incorrectos
                        </span>
                    )}
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