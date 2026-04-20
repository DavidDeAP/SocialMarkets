import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Registro = () => {
    const navigate = useNavigate();
    const [datos, setDatos] = useState({ usuario: '', hashClave: '', biografia: '' });
    const [foto, setFoto] = useState(null);
    const [cargando, setCargando] = useState(false);
    
    const [mensajeGlobal, setMensajeGlobal] = useState({ texto: '', tipo: '' }); // tipo: 'exito' o 'error'
    const [errorUsuario, setErrorUsuario] = useState(''); // Específico para el nombre de usuario

    const handleInputChange = (e) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });

        if (e.target.name === 'usuario') setErrorUsuario('');
    };

    const handleFileChange = (e) => setFoto(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensajeGlobal({ texto: '', tipo: '' });
        setErrorUsuario('');

        const formData = new FormData();
        formData.append('usuario', JSON.stringify(datos));
        if (foto) formData.append('foto', foto);

        try {
            const respuesta = await axios.post('http://localhost:8080/api/usuarios/registrar', formData);
            
            setMensajeGlobal({ texto: "¡Cuenta creada con éxito!", tipo: 'exito' });
            
            navigate('/login', { 
                state: { mensajeExito: "¡Cuenta creada con éxito!" } 
            }); 

        } catch (error) {
            if (error.response) {
                const msg = error.response.data;
                
                // Lógica para error de "Usuario ya existe"
                if (typeof msg === 'string' && msg.toLowerCase().includes("existe")) {
                    setErrorUsuario("Este nombre de usuario ya está en uso");
                } else {
                    setMensajeGlobal({ texto: "Error: " + (typeof msg === 'string' ? msg : "Datos inválidos"), tipo: 'error' });
                }
            } else {
                setMensajeGlobal({ texto: "Error de conexión con el servidor", tipo: 'error' });
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container container-small">
            <h2>SocialMarkets</h2>
            <p className="subtitle">Crea tu cuenta de analista</p>

            {/* Panel de Mensaje Global */}
            {mensajeGlobal.texto && (
                <div className={`alert-panel ${mensajeGlobal.tipo}`}>
                    {mensajeGlobal.texto}
                </div>
            )}
            
            <form className="form-registro" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Nombre de Usuario</label>
                    <input 
                        type="text" 
                        name="usuario" 
                        className={errorUsuario ? 'input-error' : ''} 
                        onChange={handleInputChange} 
                        required 
                    />
                    {/* Error debajo del campo */}
                    {errorUsuario && <span className="error-text">{errorUsuario}</span>}
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input type="password" name="hashClave" onChange={handleInputChange} required />
                </div>

                <div className="input-group">
                    <label>Biografía (Opcional)</label>
                    <textarea name="biografia" rows="2" onChange={handleInputChange} />
                </div>
                
                <div className="input-group">
                    <label>Foto de Perfil</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <button type="submit" disabled={cargando} className="btn-main">
                    {cargando ? 'Registrando...' : 'Crear Cuenta'}
                </button>

                <p className="subtitle" style={{ marginTop: '1rem' }}>
                ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Iniciar sesión</Link>
                </p>
            </form>
        </div>
    );
};

export default Registro;