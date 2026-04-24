import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState('');
    const [errorLogin, setErrorLogin] = useState(false);
    const [errores, setErrores] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [credenciales, setCredenciales] = useState({ usuario: '', hashClave: '' });

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
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            localStorage.setItem('token', respuesta.data);
            navigate('/home');
        } catch (error) {
            setErrorLogin(true);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container-auth"
        >
            <div className="auth-header">
                <h2 className="brand-logo">Social<span className="brand-green">Markets</span></h2>
                <p className="subtitle">Conecta, analiza e invierte mejor</p>
            </div>

            <AnimatePresence>
                {mensaje && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="alert-panel exito">
                        {mensaje}
                    </motion.div>
                )}
            </AnimatePresence>

            <form className="form-auth" onSubmit={handleSubmit}>
                <div className={`input-group-modern ${errores.usuario || errorLogin ? 'error' : ''}`}>
                    <label><User size={16} /> Usuario</label>
                    <input type="text" name="usuario" onChange={handleInputChange} />
                </div>

                <div className={`input-group-modern ${errores.hashClave || errorLogin ? 'error' : ''}`}>
                    <label><Lock size={16} /> Contraseña</label>
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="hashClave" 
                            onChange={handleInputChange} 
                        />
                        <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {errorLogin && <span className="error-text-main">Credenciales no válidas</span>}

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="btn-gradient"
                    style={{ margin: '1.5rem auto 0', width: '100%' }}
                >
                    Iniciar Sesión <ArrowRight size={18} />
                </motion.button>

                <p className="auth-footer">
                    ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                </p>
            </form>
        </motion.div>
    );
};

export default Login;