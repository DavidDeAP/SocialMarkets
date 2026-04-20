import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Login = () => {
    const location = useLocation(); // Recibe el estado
    const [mensaje, setMensaje] = useState('');
    
    const [credenciales, setCredenciales] = useState({
        usuario: '',
        hashClave: ''
    });

    // Detecta si venimos de un registro exitoso
    useEffect(() => {
        if (location.state?.mensajeExito) {
            setMensaje(location.state.mensajeExito);
            
            // Limpia el mensaje después de 5 segundos
            const timer = setTimeout(() => setMensaje(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const handleInputChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Intentando iniciar sesión con:", credenciales);
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