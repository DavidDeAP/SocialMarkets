import { useState } from 'react';

const Registro = () => {
    const [datos, setDatos] = useState({ usuario: '', hashClave: '', biografia: '' });
    const [foto, setFoto] = useState(null);

    const handleInputChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFoto(e.target.files[0]);

    return (
        <div className="container">
            <h2>SocialMarkets</h2>
            <p className="subtitle">Crea tu cuenta de SocialMarkets hoy</p>
            
            <form className="form-registro">
                <div className="input-group">
                    <label>Nombre de Usuario</label>
                    <input type="text" name="usuario" placeholder="Ej: usuario123" onChange={handleInputChange} />
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input type="password" name="hashClave" placeholder="password123" onChange={handleInputChange} />
                </div>

                <div className="input-group">
                    <label>Biografía</label>
                    <textarea name="biografia" rows="3" placeholder="Tu experiencia en mercados..." onChange={handleInputChange} />
                </div>
                
                <div className="input-group">
                    <label>Foto de Perfil</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <button type="button">Crear Cuenta</button>
            </form>
        </div>
    );
};

export default Registro;