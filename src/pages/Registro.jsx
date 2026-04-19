import { useState } from 'react';
import { Link } from 'react-router-dom';

const Registro = () => {
    const [datos, setDatos] = useState({ usuario: '', hashClave: '', biografia: '' });
    const [foto, setFoto] = useState(null);

    const handleInputChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFoto(e.target.files[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos para registro:", datos, "Foto:", foto);
        // Aquí irá la llamada a tu API de Java
    };

    return (
        <div className="container container-small">
            <h2>SocialMarkets</h2>
            <p className="subtitle">Crea tu cuenta de analista</p>
            
            <form className="form-registro" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Nombre de Usuario</label>
                    <input 
                        type="text" 
                        name="usuario" 
                        placeholder="Ej: usuario123" 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        name="hashClave" 
                        placeholder="password123" 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>Biografía (Opcional)</label>
                    <textarea 
                        name="biografia" 
                        rows="2" 
                        placeholder="Breve descripción..." 
                        onChange={handleInputChange} 
                    />
                </div>
                
                <div className="input-group">
                    <label>Foto de Perfil</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <button type="submit">Crear Cuenta</button>

                <p className="subtitle" style={{ marginTop: '0.5rem' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicia sesión</Link>
                </p>
            </form>
        </div>
    );
};

export default Registro;