import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [credenciales, setCredenciales] = useState({
        usuario: '',
        hashClave: ''
    });

    const handleInputChange = (e) => {
        setCredenciales({
            ...credenciales,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Intentando iniciar sesión con:", credenciales);
        
    };

    return (
        <div className="container">
            <h2>SocialMarkets</h2>
            <p className="subtitle">Bienvenido de nuevo</p>
            
            <form className="form-registro" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Nombre de Usuario</label>
                    <input 
                        type="text" 
                        name="usuario" 
                        placeholder="Tu usuario" 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        name="hashClave" 
                        placeholder="••••••••" 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>

                <button type="submit">Iniciar Sesión</button>
                
                <p className="subtitle" style={{ marginTop: '1rem' }}>
                ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Regístrate aquí</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;