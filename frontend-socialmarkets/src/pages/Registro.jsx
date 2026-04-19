import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Importamos Axios

const Registro = () => {
    const [datos, setDatos] = useState({ usuario: '', hashClave: '', biografia: '' });
    const [foto, setFoto] = useState(null);
    const [cargando, setCargando] = useState(false); // Para mostrar que está trabajando

    const handleInputChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFoto(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append('usuario', JSON.stringify(datos));

        if (foto) {
            formData.append('foto', foto);
        }

        try {
            const respuesta = await axios.post('http://localhost:8080/api/usuarios/registrar', formData); 
            
            alert("¡Registro exitoso!");
            console.log("Respuesta del servidor:", respuesta.data);
        } catch (error) {
            if (error.response) {
                console.error("Detalle del error:", error.response.data);
                alert("Error del servidor: " + (typeof error.response.data === 'string' ? error.response.data : "Datos inválidos"));
            } else {
                // Error de red o CORS
                console.error("Error de conexión:", error.message);
                alert("No se pudo conectar con el servidor");
            }
        }
    };

    return (
        <div className="container container-small">
            <h2>SocialMarkets</h2>
            <p className="subtitle">Crea tu cuenta de analista</p>
            
            <form className="form-registro" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Nombre de Usuario</label>
                    <input type="text" name="usuario" placeholder="Ej: usuario123" onChange={handleInputChange} required />
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input type="password" name="hashClave" placeholder="password123" onChange={handleInputChange} required />
                </div>

                <div className="input-group">
                    <label>Biografía (Opcional)</label>
                    <textarea name="biografia" rows="2" placeholder="Tu experiencia..." onChange={handleInputChange} />
                </div>
                
                <div className="input-group">
                    <label>Foto de Perfil</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Procesando...' : 'Crear Cuenta'}
                </button>

                <p className="subtitle" style={{ marginTop: '0.5rem' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicia sesión</Link>
                </p>
            </form>
        </div>
    );
};

export default Registro;